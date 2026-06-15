import React, { useState } from 'react';
import type { ModelResponse, ModelConfig } from '../types';
import { Copy, Check, Clock, Hash, Maximize2, Minimize2, Bookmark, BookmarkCheck } from 'lucide-react';

interface ResponseCardProps {
  model: ModelConfig;
  response?: ModelResponse;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
}

export const ResponseCard: React.FC<ResponseCardProps> = ({
  model,
  response,
  isBookmarked,
  onToggleBookmark
}) => {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    if (!response?.answer) return;
    try {
      await navigator.clipboard.writeText(response.answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const isLoading = !response || response.status === 'loading';
  const isError = response?.status === 'error';

  return (
    <div 
      className={`rounded-xl glass-card transition-all duration-300 relative overflow-hidden flex flex-col h-full ${
        isLoading ? 'border-dashed border-gray-600' : 'border-butter/10'
      }`}
    >
      {/* Top Accent Color Bar */}
      <div 
        className="h-1.5 w-full" 
        style={{ backgroundColor: model.accentColor }} 
      />

      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
          <div className="flex items-center space-x-3">
            <span 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: model.accentColor }} 
            />
            <div>
              <h4 className="font-semibold text-white text-base">{model.name}</h4>
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-2">
                {model.provider}
                {response?.usedFallback && <span className="text-yellow-500 normal-case bg-yellow-500/10 px-1.5 py-0.5 rounded">Fallback model used</span>}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {/* Bookmark button */}
            <button
              onClick={onToggleBookmark}
              disabled={isLoading || isError}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'text-butter bg-butter/10' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title={isBookmarked ? "Remove Bookmark" : "Bookmark Answer"}
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            </button>

            {/* Expand / Collapse Button */}
            {!isLoading && !isError && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                title={isExpanded ? "Collapse View" : "Expand View"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              disabled={isLoading || isError}
              className={`p-2 rounded-lg transition-colors ${
                copied ? 'text-green-400 bg-green-950/20' : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
              title="Copy to Clipboard"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Card Content Area */}
        <div className="flex-1 flex flex-col justify-start min-h-[140px]">
          {isLoading ? (
            /* Skeleton Loading States */
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-darkgreen-light/40 rounded w-3/4"></div>
              <div className="h-4 bg-darkgreen-light/40 rounded w-5/6"></div>
              <div className="h-4 bg-darkgreen-light/40 rounded w-2/3"></div>
              <div className="h-4 bg-darkgreen-light/40 rounded w-1/2"></div>
            </div>
          ) : isError ? (
            <div className="text-red-400 text-sm py-4 whitespace-pre-wrap">
              {response.answer}
            </div>
          ) : (
            /* Loaded Answer Area */
            <div 
              className={`text-sm text-gray-300 leading-relaxed font-light whitespace-pre-wrap transition-all duration-300 ${
                isExpanded ? 'max-h-[800px] overflow-y-auto' : 'line-clamp-6'
              }`}
            >
              {/* Basic markdown parsing details for pre-built responses */}
              {response.answer.split('\n').map((line, idx) => {
                if (line.startsWith('### ')) {
                  return <h3 key={idx} className="text-butter font-semibold text-lg mt-3 mb-2">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('#### ')) {
                  return <h4 key={idx} className="text-butter/85 font-medium text-base mt-2 mb-1">{line.replace('#### ', '')}</h4>;
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return <li key={idx} className="ml-4 list-disc mb-1">{line.substring(2)}</li>;
                }
                if (line.startsWith('```')) {
                  // Hide raw ticks, just render code segments simply
                  return null;
                }
                return <p key={idx} className="mb-2">{line}</p>;
              })}
            </div>
          )}
        </div>

        {/* Metadata Footer */}
        {!isLoading && !isError && (
          <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{(response.responseTimeMs || 0) / 1000}s</span>
            </div>
            <div className="flex items-center space-x-1">
              <Hash className="w-3.5 h-3.5" />
              <span>{response.tokenCount} tokens</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ResponseCard;
