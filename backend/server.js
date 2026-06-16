const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = 3001;

// Allowed origin for local dev
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get('/', (req, res) => {
  res.send('HiveMind backend is running');
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HiveMind Backend',
    timestamp: new Date().toISOString()
  });
});

app.post('/api/chat', async (req, res) => {
  const { provider, modelId, question } = req.body;
  
  console.log("================================");
  console.log("HIVEMIND BACKEND REQUEST");
  console.log("Time:", new Date().toISOString());
  console.log("Provider:", provider);
  console.log("Model:", modelId);
  console.log("Question:", question);
  console.log("================================");

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const startTime = Date.now();

  try {
    let answer = '';
    let tokenCount = 0;

    if (provider === 'gemini') {
      if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key missing on backend.');
      }
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: question }] }]
          })
        }
      );

      if (!response.ok) {
        if (response.status === 429) throw new Error('429 Quota Exceeded');
        if (response.status === 503) throw new Error('503 Service Unavailable');
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!answer) {
        throw new Error('Invalid or empty response structure received from Gemini API.');
      }
      tokenCount = data.usageMetadata?.candidatesTokenCount || Math.ceil(answer.length / 4);

    } else if (provider === 'openrouter') {
      if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key missing on backend.');
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'HiveMind Backend'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: 'user', content: question }]
        })
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error('429 Quota Exceeded');
        const errorText = await response.text();
        throw new Error(`OpenRouter API error ${response.status} (${response.statusText}):\n${errorText}`);
      }

      const data = await response.json();
      answer = data.choices?.[0]?.message?.content;
      
      if (!answer) {
        throw new Error('Invalid or empty response structure received from OpenRouter API.');
      }
      tokenCount = data.usage?.completion_tokens || Math.ceil(answer.length / 4);
      
    } else {
      return res.status(400).json({ error: 'Invalid provider specified' });
    }

    const responseTime = Date.now() - startTime;

    console.log("SUCCESS");
    console.log("Provider:", provider);
    console.log("Model:", modelId);

    res.json({
      content: answer,
      modelId,
      provider,
      responseTime,
      tokenUsage: tokenCount
    });

  } catch (error) {
    console.error("API ERROR");
    console.error(error);
    console.error(`[Backend] Error fetching from ${provider}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`HiveMind Backend running at http://localhost:${port}`);
});
