import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ModelId, ModelResponse, AnalysisReport, ComparisonSession } from '../types';
import { fetchAIModelResponse } from './aiService';
import { analyzeResponses } from './consensusAnalyzer';

interface BookmarkItem {
  id: string;
  question: string;
  modelId: ModelId;
  modelName: string;
  answer: string;
  timestamp: number;
}

interface HiveMindContextType {
  question: string;
  setQuestion: (q: string) => void;
  selectedModels: ModelId[];
  setSelectedModels: (models: ModelId[]) => void;
  responses: Record<ModelId, ModelResponse>;
  analysis: AnalysisReport | undefined;
  isLoading: boolean;
  history: ComparisonSession[];
  bookmarks: BookmarkItem[];
  triggerComparison: (customQuestion?: string, customModels?: ModelId[]) => Promise<void>;
  toggleBookmark: (question: string, modelId: ModelId, modelName: string, answer: string) => void;
  isBookmarked: (question: string, modelId: ModelId) => boolean;
  clearAllData: () => void;
  loadSession: (session: ComparisonSession) => void;
  modelHealth: Record<string, { status: 'available' | 'slow' | 'unavailable' | 'unknown'; latency: number }>;
  setModelHealth: (health: Record<string, { status: 'available' | 'slow' | 'unavailable' | 'unknown'; latency: number }>) => void;
}

const HiveMindContext = createContext<HiveMindContextType | undefined>(undefined);

export const HiveMindProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [question, setQuestion] = useState('');
  const [selectedModels, setSelectedModels] = useState<ModelId[]>(['gemini', 'llama', 'deepseek']);
  const [responses, setResponses] = useState<Record<ModelId, ModelResponse>>({} as Record<ModelId, ModelResponse>);
  const [analysis, setAnalysis] = useState<AnalysisReport | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<ComparisonSession[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [modelHealth, setModelHealth] = useState<Record<string, { status: 'available' | 'slow' | 'unavailable' | 'unknown'; latency: number }>>({});

  // Load history & bookmarks on startup
  useEffect(() => {
    const savedHistory = localStorage.getItem('hivemind_history');
    if (savedHistory) {
      try { setHistory(JSON.parse(savedHistory)); } catch (e) { console.error(e); }
    }
    const savedBookmarks = localStorage.getItem('hivemind_bookmarks');
    if (savedBookmarks) {
      try { setBookmarks(JSON.parse(savedBookmarks)); } catch (e) { console.error(e); }
    }
  }, []);

  // Save history & bookmarks when modified
  const saveHistory = (newHistory: ComparisonSession[]) => {
    setHistory(newHistory);
    localStorage.setItem('hivemind_history', JSON.stringify(newHistory));
  };

  const saveBookmarks = (newBookmarks: BookmarkItem[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('hivemind_bookmarks', JSON.stringify(newBookmarks));
  };

  const triggerComparison = async (customQuestion?: string, customModels?: ModelId[]) => {
    const targetQuestion = customQuestion || question;
    const targetModels = customModels || selectedModels;

    if (!targetQuestion.trim()) return;
    if (targetModels.length < 1) return;
    if (isLoading) return;

    setIsLoading(true);
    setAnalysis(undefined);

    // Initial loading states for selected models
    const initialResponses = {} as Record<ModelId, ModelResponse>;
    targetModels.forEach((mId) => {
      initialResponses[mId] = {
        modelId: mId,
        status: 'loading',
        answer: ''
      };
    });
    setResponses(initialResponses);

    // Fetch in parallel
    const fetchPromises = targetModels.map(async (mId) => {
      try {
        const res = await fetchAIModelResponse(mId, targetQuestion, (partialText) => {
          setResponses((prev) => ({
            ...prev,
            [mId]: {
              ...prev[mId],
              answer: partialText
            }
          }));
        });
        setResponses((prev) => ({
          ...prev,
          [mId]: res
        }));
        return res;
      } catch (err: any) {
        const errMsg = err?.message?.toLowerCase() || '';
        const isQuota = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('exhausted') || errMsg.includes('rate limit');
        
        const errRes: ModelResponse = {
          modelId: mId,
          status: 'error',
          answer: isQuota 
            ? "Today's free limit is over for this model. Please try again later." 
            : `An error occurred: ${err.message || 'Unknown error'}`
        };
        setResponses((prev) => ({
          ...prev,
          [mId]: errRes
        }));
        return errRes;
      }
    });

    const finalResponsesList = await Promise.all(fetchPromises);
    
    // Map list to dictionary
    const finalResponses = {} as Record<ModelId, ModelResponse>;
    finalResponsesList.forEach((res) => {
      finalResponses[res.modelId] = res;
    });

    // Run consensus analysis if more than 1 model is selected
    let analysisReport = undefined;
    if (targetModels.length > 1) {
      analysisReport = await analyzeResponses(targetQuestion, finalResponses);
    }
    setAnalysis(analysisReport);
    setIsLoading(false);

    // Add session to history
    const newSession: ComparisonSession = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
      question: targetQuestion,
      selectedModels: targetModels,
      responses: finalResponses,
      analysis: analysisReport,
      timestamp: Date.now()
    };
    saveHistory([newSession, ...history]);
  };

  const toggleBookmark = (q: string, modelId: ModelId, modelName: string, answer: string) => {
    const existingIdx = bookmarks.findIndex(b => b.question === q && b.modelId === modelId);
    if (existingIdx > -1) {
      const updated = bookmarks.filter((_, idx) => idx !== existingIdx);
      saveBookmarks(updated);
    } else {
      const newItem: BookmarkItem = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 11),
        question: q,
        modelId,
        modelName,
        answer,
        timestamp: Date.now()
      };
      saveBookmarks([newItem, ...bookmarks]);
    }
  };

  const isBookmarked = (q: string, modelId: ModelId) => {
    return bookmarks.some(b => b.question === q && b.modelId === modelId);
  };

  const loadSession = (session: ComparisonSession) => {
    setQuestion(session.question);
    setSelectedModels(session.selectedModels);
    setResponses(session.responses);
    setAnalysis(session.analysis);
  };

  const clearAllData = () => {
    setHistory([]);
    setBookmarks([]);
    localStorage.removeItem('hivemind_history');
    localStorage.removeItem('hivemind_bookmarks');
  };

  return (
    <HiveMindContext.Provider value={{
      question,
      setQuestion,
      selectedModels,
      setSelectedModels,
      responses,
      analysis,
      isLoading,
      history,
      bookmarks,
      triggerComparison,
      toggleBookmark,
      isBookmarked,
      clearAllData,
      loadSession,
      modelHealth,
      setModelHealth
    }}>
      {children}
    </HiveMindContext.Provider>
  );
};

export const useHiveMind = () => {
  const context = useContext(HiveMindContext);
  if (!context) throw new Error('useHiveMind must be used within HiveMindProvider');
  return context;
};
export default HiveMindContext;
