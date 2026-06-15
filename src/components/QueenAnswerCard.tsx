import React, { useState } from 'react';
import type { QueenAnswer } from '../types';
import { AVAILABLE_MODELS } from '../data/mockData';
import { Crown, Copy, Check, Info } from 'lucide-react';

interface QueenAnswerCardProps {
  queenAnswer: QueenAnswer;
}

export const QueenAnswerCard: React.FC<QueenAnswerCardProps> = ({ queenAnswer }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(queenAnswer.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy Queen Answer: ', err);
    }
  };

  return (
    <div className="rounded-xl glass-card border-butter/30 bg-gradient-to-br from-darkgreen-light/10 to-butter/5 p-6 relative overflow-hidden">
      {/* Absolute Decorative Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-butter/10 rounded-full blur-3xl pointer-events-none" />

      {/* Card Header */}
      <div className="flex items-center justify-between border-b border-butter/25 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-butter text-darkgreen animate-pulse-glow">
            <Crown className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-butter flex items-center gap-2">
              <span>Queen Answer</span>
            </h3>
            <p className="text-xs text-gray-300 font-light">
              Synthesized from the best aspects of all evaluated answers.
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className={`p-2.5 rounded-lg transition-colors border ${
            copied 
              ? 'text-green-400 bg-green-950/20 border-green-500/30' 
              : 'text-butter bg-butter/5 border-butter/10 hover:bg-butter hover:text-darkgreen hover:border-butter'
          }`}
          title="Copy Queen Answer"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Text Content */}
      <div className="text-gray-200 text-sm leading-relaxed font-light whitespace-pre-wrap mb-6 max-h-[500px] overflow-y-auto pr-2">
        {queenAnswer.text.split('\n').map((line, idx) => {
          if (line.startsWith('### ')) {
            return <h3 key={idx} className="text-butter font-semibold text-lg mt-4 mb-2">{line.replace('### ', '')}</h3>;
          }
          if (line.startsWith('#### ')) {
            return <h4 key={idx} className="text-butter/85 font-medium text-base mt-3 mb-1">{line.replace('#### ', '')}</h4>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return <li key={idx} className="ml-4 list-disc mb-1.5">{line.substring(2)}</li>;
          }
          return <p key={idx} className="mb-2.5">{line}</p>;
        })}
      </div>

      {/* Attributions Section */}
      <div className="border-t border-gray-800/80 pt-4">
        <h4 className="text-xs font-semibold text-butter/90 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" />
          <span>Synthesis Sources & Attributions</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {queenAnswer.attributions.map((attr, idx) => {
            const model = AVAILABLE_MODELS.find(m => m.id === attr.modelId);
            return (
              <div 
                key={idx} 
                className="p-3 rounded-lg bg-darkgreen-muted/20 border border-gray-800/60 text-xs flex flex-col justify-between"
              >
                <span className="font-semibold text-white mb-1">
                  {model?.name || attr.modelId}
                </span>
                <span className="text-gray-400 font-light">
                  {attr.contribution}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default QueenAnswerCard;
