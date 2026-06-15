import React from 'react';
import { AVAILABLE_MODELS } from '../data/mockData';
import { useHiveMind } from '../utils/HiveMindContext';
import type { ModelId } from '../types';
import { Sparkles, Cpu, MessageSquare, Globe, Zap, Check, Gauge, Brain } from 'lucide-react';

interface ModelSelectorProps {
  selectedModels: ModelId[];
  onChange: (models: ModelId[]) => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  Sparkles,
  Cpu,
  MessageSquare,
  Globe,
  Zap
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModels, onChange }) => {
  const { modelHealth } = useHiveMind();

  const toggleModel = (id: ModelId) => {
    // If it's unavailable, don't allow toggling
    if (modelHealth[id]?.status === 'unavailable') return;

    if (selectedModels.includes(id)) {
      onChange(selectedModels.filter(m => m !== id));
    } else {
      onChange([...selectedModels, id]);
    }
  };

  const handleSelectRecommended = () => {
    const recommended: ModelId[] = ['gemini', 'deepseek', 'llama', 'qwen', 'phi4'];
    const validRecommended = recommended.filter(id => modelHealth[id]?.status !== 'unavailable');
    onChange(validRecommended);
  };

  const handleSelectAllWorking = () => {
    const working = AVAILABLE_MODELS.filter(m => modelHealth[m.id]?.status !== 'unavailable').map(m => m.id);
    onChange(working);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h3 className="text-lg font-medium text-butter">Choose AI Minds</h3>
          <span className="text-xs text-gray-400">
            Selected: {selectedModels.length} of {AVAILABLE_MODELS.length}
          </span>
        </div>
        
        <div className="flex gap-2 text-xs font-semibold">
          <button 
            onClick={handleSelectRecommended}
            className="px-3 py-1.5 rounded-full bg-butter/10 text-butter hover:bg-butter/20 border border-butter/20 transition-colors"
          >
            Recommended
          </button>
          <button 
            onClick={handleSelectAllWorking}
            className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 transition-colors"
          >
            All Working
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {AVAILABLE_MODELS.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          const isUnavailable = modelHealth[model.id]?.status === 'unavailable';
          const Icon = iconMap[model.iconName] || Sparkles;

          let statusText = 'Unknown';
          let statusBadgeClass = 'text-gray-400 bg-gray-500/10 border border-gray-600/30';
          let dotClass = 'bg-gray-500';

          if (modelHealth[model.id]) {
            if (modelHealth[model.id].status === 'available') {
              statusText = 'Working';
              statusBadgeClass = 'text-green-400 bg-green-500/10 border border-green-500/30';
              dotClass = 'bg-green-500';
            } else if (modelHealth[model.id].status === 'slow') {
              statusText = 'Busy';
              statusBadgeClass = 'text-yellow-500 bg-yellow-500/10 border border-yellow-500/30';
              dotClass = 'bg-yellow-500';
            } else if (modelHealth[model.id].status === 'unavailable') {
              statusText = 'Unavailable';
              statusBadgeClass = 'text-red-400 bg-red-500/10 border border-red-500/30';
              dotClass = 'bg-red-500';
            }
          }

          return (
            <button
              key={model.id}
              onClick={() => toggleModel(model.id)}
              disabled={isUnavailable}
              className={`text-left p-5 rounded-xl glass-card relative overflow-hidden transition-all duration-300 flex flex-col justify-between min-h-[170px] ${
                isUnavailable ? 'opacity-40 cursor-not-allowed grayscale' : 'glass-card-hover cursor-pointer opacity-80 hover:opacity-100'
              } ${
                isSelected && !isUnavailable 
                  ? 'border-butter/50 bg-darkgreen/40 shadow-inner' 
                  : ''
              }`}
              style={{
                boxShadow: isSelected && !isUnavailable ? `inset 0 0 12px rgba(255, 239, 179, 0.05), 0 4px 20px rgba(0, 0, 0, 0.2)` : ''
              }}
            >
              {/* Corner Glow Highlight */}
              {isSelected && !isUnavailable && (
                <div 
                  className="absolute top-0 right-0 w-16 h-16 pointer-events-none opacity-20"
                  style={{
                    background: `radial-gradient(circle at top right, ${model.accentColor}, transparent 70%)`
                  }}
                />
              )}

              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="p-2.5 rounded-lg text-darkgreen relative"
                      style={{ backgroundColor: isUnavailable ? '#555' : model.accentColor }}
                    >
                      <Icon className="w-5 h-5 text-white" />
                      
                      {/* Status Indicator Dot */}
                      <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-darkgreen ${dotClass}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-base flex items-center space-x-2">
                        <span>{model.name}</span>
                      </h4>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                          {model.provider}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                      isSelected && !isUnavailable ? 'bg-butter text-darkgreen scale-100' : 'border border-gray-600 scale-90'
                    }`}
                  >
                    {isSelected && !isUnavailable && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed font-light line-clamp-2">
                  {model.description}
                </p>
              </div>

              {/* Bottom Row: Ratings and Status Badge */}
              <div className="mt-4 pt-3 border-t border-gray-800/60 flex items-center justify-between">
                <div className="flex gap-3">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400" title={`Speed: ${model.speedRating}/10`}>
                    <Gauge className="w-3 h-3 text-butter/70" />
                    <span className="font-medium">{model.speedRating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400" title={`Reasoning: ${model.reasoningRating}/10`}>
                    <Brain className="w-3 h-3 text-butter/70" />
                    <span className="font-medium">{model.reasoningRating}</span>
                  </div>
                </div>

                <span className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${statusBadgeClass}`}>
                  {statusText}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default ModelSelector;
