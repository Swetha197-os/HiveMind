import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ModelId, ModelResponse, AnalysisReport, ComparisonSession } from '../types';
import { fetchAIModelResponse } from './aiService';
import { analyzeResponses } from './consensusAnalyzer';
import { useAuth } from './AuthContext';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';

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

  const { user } = useAuth();

  // Load history & bookmarks on startup and auth state change
  useEffect(() => {
    // 1. Instantly nuke state on any auth change to prevent UI flickering or stale reads
    setHistory([]);
    
    const loadData = async () => {
      console.log(`[History] Loading history. Auth state: ${user ? 'Authenticated' : 'Guest'}`);
      
      const savedBookmarks = localStorage.getItem('hivemind_bookmarks');
      if (savedBookmarks) {
        try { setBookmarks(JSON.parse(savedBookmarks)); } catch (e) { console.error(e); }
      }

      if (user && db) {
        // Authenticated user: Load ONLY from Firestore
        console.log(`[History] Loading Firestore history for user: ${user.uid}`);
        try {
          const q = query(
            collection(db, 'users', user.uid, 'comparisons'),
            orderBy('timestamp', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const firestoreHistory: ComparisonSession[] = [];
          querySnapshot.forEach((doc) => {
            firestoreHistory.push({ ...doc.data(), id: doc.id } as ComparisonSession);
          });
          
          console.log(`[History] Loaded ${firestoreHistory.length} comparisons from Firestore.`);
          setHistory(firestoreHistory);
        } catch (err) {
          console.error('[History] Failed to load history from Firestore:', err);
          setHistory([]);
        }
      } else {
        // Guest user: Load ONLY from localStorage
        console.log('[History] Loading Guest history from localStorage.');
        const savedHistory = localStorage.getItem('hivemind_guest_history');
        if (savedHistory) {
          try { 
            const parsed = JSON.parse(savedHistory);
            console.log(`[History] Loaded ${parsed.length} comparisons from localStorage.`);
            setHistory(parsed); 
          } catch (e) { 
            console.error(e);
            setHistory([]);
          }
        } else {
          setHistory([]);
        }
      }
    };
    
    loadData();
  }, [user]);

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
        // Fallback for completely unexpected thrown errors that escaped aiService
        console.error(`[Context] Unexpected error fetching ${mId}:`, err);
        const errRes: ModelResponse = {
          modelId: mId,
          status: 'error',
          answer: `An unexpected error occurred: ${err.message || 'Unknown error'}`
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
    const updatedHistory = [newSession, ...history];
    setHistory(updatedHistory);

    if (user && db) {
      // Save to Firestore if authenticated
      try {
        await addDoc(collection(db, 'users', user.uid, 'comparisons'), {
          ...newSession,
          userId: user.uid,
          createdAt: Timestamp.now()
        });
        console.log(`[History] Saved comparison to Firestore for user: ${user.uid}`);
      } catch (err) {
        console.error('[History] Failed to save session to Firestore:', err);
      }
    } else {
      // Save to localStorage if guest
      localStorage.setItem('hivemind_guest_history', JSON.stringify(updatedHistory));
      console.log(`[History] Saved comparison to localStorage for Guest.`);
    }
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
    localStorage.removeItem('hivemind_guest_history');
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
