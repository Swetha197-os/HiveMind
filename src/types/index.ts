export type ModelId = 'gemini' | 'llama' | 'qwen' | 'deepseek' | 'phi4' | 'nous' | 'mythomax';

export interface ModelConfig {
  id: ModelId;
  name: string;
  provider: string;
  description: string;
  accentColor: string; // for UI representation
  iconName: string;
  apiModelId: string;
  fallbackModelId?: string;
  speedRating: number; // 1-10
  reasoningRating: number; // 1-10
}

export interface ModelResponse {
  modelId: ModelId;
  status: 'loading' | 'success' | 'error';
  answer: string;
  responseTimeMs?: number;
  tokenCount?: number;
  usedFallback?: boolean;
}

export interface ConsensusGroup {
  id: string;
  name: string;
  similarityPercent: number;
  models: ModelId[];
  commonPoints: string[];
  uniquePoints: { modelId: ModelId; point: string }[];
}

export interface QueenAnswer {
  text: string;
  attributions: {
    modelId: ModelId;
    contribution: string;
  }[];
}

export interface AnalysisReport {
  hiveScore: number;
  groups: ConsensusGroup[];
  originalityScores: Record<ModelId, number>;
  missingInfo: { modelId: ModelId; info: string }[];
  queenAnswer: QueenAnswer;
}

export interface ComparisonSession {
  id: string;
  question: string;
  selectedModels: ModelId[];
  responses: Record<ModelId, ModelResponse>;
  analysis?: AnalysisReport;
  timestamp: number;
}
