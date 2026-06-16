import type { ModelId, ModelResponse } from '../types';
import { AVAILABLE_MODELS } from '../data/mockData';

// Fetch API keys from Vite environment variables
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Executes a native Google Gemini API request.
 */
const fetchNativeGeminiResponse = async (question: string): Promise<{ answer: string; tokens: number }> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key missing (VITE_GEMINI_API_KEY not configured in .env).');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: question }]
          }
        ]
      })
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('429 Quota Exceeded');
    }
    if (response.status === 503) {
      throw new Error('503 Service Unavailable');
    }
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error('Invalid or empty response structure received from Gemini API.');
  }

  // Estimate tokens if usage metadata is missing from the payload
  const tokenCount = data.usageMetadata?.candidatesTokenCount || Math.ceil(text.length / 4);

  return { answer: text, tokens: tokenCount };
};

/**
 * Executes an OpenRouter API request.
 */
export const fetchOpenRouterResponse = async (modelId: string, question: string): Promise<{ answer: string; tokens: number }> => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key missing (VITE_OPENROUTER_API_KEY not configured in .env).');
  }

  const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
  console.log("Final OpenRouter URL:", OPENROUTER_URL);
  console.log("Model:", modelId);
  console.log("OpenRouter key exists:", !!OPENROUTER_API_KEY);

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:5173',
      'X-Title': 'HiveMind'
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: question }]
    })
  });

  console.log("Response Status:", response.status);
  console.log("Response Status Text:", response.statusText);

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('429 Quota Exceeded');
    }
    let errorDetails = '';
    try {
      const errorJson = await response.json();
      errorDetails = JSON.stringify(errorJson, null, 2);
    } catch(e) {
      errorDetails = await response.text();
    }
    throw new Error(`OpenRouter API error ${response.status} (${response.statusText}):\n${errorDetails}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error('Invalid or empty response structure received from OpenRouter API.');
  }

  const tokenCount = data.usage?.completion_tokens || Math.ceil(text.length / 4);

  return { answer: text, tokens: tokenCount };
};

/**
 * Primary dispatch function to fetch from either Gemini or OpenRouter.
 */
export const fetchAIModelResponse = async (
  modelId: ModelId,
  question: string,
  onProgress?: (text: string) => void // Kept in signature for backward compatibility
): Promise<ModelResponse> => {
  const modelConfig = AVAILABLE_MODELS.find(m => m.id === modelId);
  if (!modelConfig) {
    return {
      modelId,
      status: 'error',
      answer: `Configuration for model "${modelId}" not found.`
    };
  }

  const startTime = performance.now();

  try {
    let result: { answer: string; tokens: number };
    let usedFallback = false;

    if (modelId === 'gemini') {
      result = await fetchNativeGeminiResponse(question);
    } else {
      try {
        result = await fetchOpenRouterResponse(modelConfig.apiModelId, question);
      } catch (err: any) {
        if (modelConfig.fallbackModelId && modelConfig.fallbackModelId !== modelConfig.apiModelId) {
          console.warn(`Primary model ${modelConfig.apiModelId} failed. Retrying with fallback ${modelConfig.fallbackModelId}... Error:`, err.message);
          result = await fetchOpenRouterResponse(modelConfig.fallbackModelId, question);
          usedFallback = true;
        } else {
          throw err;
        }
      }
    }

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    // Update progress callback at completion if present
    if (onProgress) {
      onProgress(result.answer);
    }

    return {
      modelId,
      status: 'success',
      answer: result.answer,
      responseTimeMs: duration,
      tokenCount: result.tokens,
      usedFallback
    };
  } catch (err: any) {
    console.error(`[AI Service] Error for ${modelId}:`, err);
    const errMsg = err?.message?.toLowerCase() || '';
    const isQuota = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('exhausted') || errMsg.includes('rate limit');
    const isBusy = errMsg.includes('503') || errMsg.includes('unavailable') || errMsg.includes('high demand') || errMsg.includes('overloaded');
    
    let finalAnswer = (err?.message || 'Failed to fetch model response.');
    if (isQuota) {
      finalAnswer = "Today's free limit is over for this model. Please try again later.";
    } else if (isBusy) {
      finalAnswer = `${modelConfig?.name || 'This model'} is temporarily busy. Please try again later.`;
    }

    return {
      modelId,
      status: 'error',
      answer: finalAnswer
    };
  }
};

