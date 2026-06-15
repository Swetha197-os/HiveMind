import React from 'react';
import type { ConsensusGroup } from '../types';
import { AVAILABLE_MODELS } from '../data/mockData';
import { Users, Lightbulb, ShieldAlert, Award } from 'lucide-react';

interface ConsensusGroupCardProps {
  group: ConsensusGroup;
}

export const ConsensusGroupCard: React.FC<ConsensusGroupCardProps> = ({ group }) => {
  return (
    <div className="rounded-xl glass-card border-butter/10 p-6 space-y-5 relative overflow-hidden">
      {/* Background similarity glow */}
      <div 
        className="absolute -top-16 -right-16 w-36 h-36 rounded-full pointer-events-none opacity-5 blur-2xl bg-butter"
        style={{ opacity: group.similarityPercent / 400 }}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
        <div>
          <h4 className="text-lg font-semibold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-butter" />
            <span>{group.name}</span>
          </h4>
          <div className="flex flex-wrap gap-2 mt-2">
            {group.models.map(mId => {
              const model = AVAILABLE_MODELS.find(m => m.id === mId);
              return (
                <span 
                  key={mId} 
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white flex items-center gap-1.5"
                  style={{ backgroundColor: `${model?.accentColor}40`, border: `1px solid ${model?.accentColor}80` }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: model?.accentColor }} />
                  {model?.name || mId}
                </span>
              );
            })}
          </div>
        </div>

        <div className="text-right flex flex-col items-start sm:items-end">
          <span className="text-xs text-gray-400">Response Similarity</span>
          <span className="text-2xl font-bold text-butter flex items-center gap-1.5">
            <Award className="w-5 h-5 text-butter" />
            {group.similarityPercent}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
        {/* Common points */}
        <div className="space-y-3">
          <h5 className="text-sm font-semibold text-butter/95 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-butter" />
            <span>Convergent Points</span>
          </h5>
          <ul className="space-y-2">
            {group.commonPoints.map((point, idx) => (
              <li key={idx} className="text-xs text-gray-300 leading-relaxed pl-4 relative">
                <span className="absolute left-0 top-1.5 w-1.5 h-1.5 rounded-full bg-butter" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        {/* Unique points */}
        {group.uniquePoints.length > 0 && (
          <div className="space-y-3">
            <h5 className="text-sm font-semibold text-butter/95 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-butter" />
              <span>Unique Perspectives</span>
            </h5>
            <div className="space-y-3">
              {group.uniquePoints.map((item, idx) => {
                const model = AVAILABLE_MODELS.find(m => m.id === item.modelId);
                return (
                  <div key={idx} className="text-xs bg-darkgreen-muted/30 p-3 rounded-lg border border-gray-800/80">
                    <span 
                      className="font-bold text-[10px] uppercase tracking-wider block mb-1"
                      style={{ color: model?.accentColor || '#ffefb3' }}
                    >
                      Only {model?.name || item.modelId} Mentioned:
                    </span>
                    <p className="text-gray-300 font-light leading-relaxed">
                      {item.point}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ConsensusGroupCard;
