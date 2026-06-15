# HiveMind - Multi-AI Consensus Engine

HiveMind is a premium SaaS-style AI Comparison application that allows you to query multiple AI models simultaneously, cluster similar responses, analyze their differences, and generate a synthesized consolidated answer (Queen Answer).

> [!IMPORTANT]
> This app uses real AI APIs through OpenRouter/Gemini. Add API keys in `.env` to start comparing.

---

## Getting Started

### 1. Configure Credentials
Create a `.env` file in the root directory:
```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Supported AI Models
- **Google Gemini 2.5 Flash** (via native Gemini API endpoint)
- **Meta Llama 3.1 8B** (via OpenRouter API: `meta-llama/llama-3.1-8b-instruct:free`)
- **Mistral 7B** (via OpenRouter API: `mistralai/mistral-7b-instruct:free`)
- **Qwen 2.5 7B** (via OpenRouter API: `qwen/qwen-2.5-7b-instruct:free`)
- **DeepSeek Chat** (via OpenRouter API: `deepseek/deepseek-chat:free`)
- **Gemma 2 9B** (via OpenRouter API: `google/gemma-2-9b-it:free`)

---

## Installation & Commands

### Install Dependencies
```bash
npm install
```

### Start Local Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
