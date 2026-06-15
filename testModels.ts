import 'dotenv/config';

const OPENROUTER_API_KEY = process.env.VITE_OPENROUTER_API_KEY;
if (!OPENROUTER_API_KEY) {
  console.error("No VITE_OPENROUTER_API_KEY found.");
  process.exit(1);
}

const models = [
  'meta-llama/llama-3.1-8b-instruct',
  'deepseek/deepseek-chat:free',
  'qwen/qwen-2.5-7b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'google/gemma-2-9b-it:free',
  'deepseek/deepseek-chat',
  'qwen/qwen-2.5-7b-instruct',
  'mistralai/mistral-7b-instruct',
  'google/gemma-2-9b-it'
];

async function testModels() {
  for (const model of models) {
    const startTime = performance.now();
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'HiveMind'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Say hello in one word.' }]
        })
      });
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      if (res.ok) {
        console.log(`[SUCCESS] ${model} - ${duration}ms`);
      } else {
        const text = await res.text();
        console.log(`[FAILED] ${model} - ${res.status}: ${text}`);
      }
    } catch (e: any) {
      console.log(`[ERROR] ${model} - ${e.message}`);
    }
  }
}

testModels();
