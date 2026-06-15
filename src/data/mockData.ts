import type { ModelConfig } from '../types';

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'gemini',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Ultra-fast, native multimodal inference. Strong overall reasoning.',
    accentColor: '#4285F4',
    iconName: 'Sparkles',
    apiModelId: 'google/gemini-2.5-flash',
    speedRating: 10,
    reasoningRating: 8
  },
  {
    id: 'deepseek',
    name: 'DeepSeek Chat',
    provider: 'DeepSeek',
    description: 'Expert coding, debugging, and multi-turn instruction efficiency.',
    accentColor: '#0052CC',
    iconName: 'Cpu',
    apiModelId: 'deepseek/deepseek-chat',
    fallbackModelId: 'deepseek/deepseek-chat',
    speedRating: 9,
    reasoningRating: 9
  },
  {
    id: 'llama',
    name: 'Llama 3.1 8B',
    provider: 'Meta',
    description: 'General-purpose open weight instruction-tuned model by Meta AI.',
    accentColor: '#006400',
    iconName: 'MessageSquare',
    apiModelId: 'meta-llama/llama-3.1-8b-instruct',
    fallbackModelId: 'meta-llama/llama-3.1-8b-instruct',
    speedRating: 8,
    reasoningRating: 7
  },
  {
    id: 'qwen',
    name: 'Qwen 2.5 7B',
    provider: 'Alibaba',
    description: 'Powerful multilingual expert in mathematical logic and language.',
    accentColor: '#8E44AD',
    iconName: 'Globe',
    apiModelId: 'qwen/qwen-2.5-7b-instruct',
    fallbackModelId: 'qwen/qwen-2.5-7b-instruct',
    speedRating: 9,
    reasoningRating: 8
  },
  {
    id: 'phi4',
    name: 'Phi-4',
    provider: 'Microsoft',
    description: 'Advanced small language model, excels in logical alignment and accuracy.',
    accentColor: '#005A9E',
    iconName: 'MessageSquare',
    apiModelId: 'microsoft/phi-4',
    fallbackModelId: 'microsoft/phi-4',
    speedRating: 9,
    reasoningRating: 8
  },
  {
    id: 'nous',
    name: 'Nous Hermes 2',
    provider: 'NousResearch',
    description: 'Instruction-tuned for conversational and analytical robustness.',
    accentColor: '#E63946',
    iconName: 'Globe',
    apiModelId: 'nousresearch/hermes-3-llama-3.1-405b',
    fallbackModelId: 'nousresearch/nous-hermes-2-mixtral-8x7b-dpo',
    speedRating: 6,
    reasoningRating: 9
  },
  {
    id: 'mythomax',
    name: 'MythoMax L2',
    provider: 'Gryphe',
    description: 'Highly creative and adaptive conversational fine-tune.',
    accentColor: '#1D3557',
    iconName: 'Zap',
    apiModelId: 'gryphe/mythomax-l2-13b',
    fallbackModelId: 'gryphe/mythomax-l2-13b',
    speedRating: 7,
    reasoningRating: 6
  }
];
