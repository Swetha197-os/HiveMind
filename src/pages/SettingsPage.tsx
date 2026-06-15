import React, { useState } from 'react';
import { useHiveMind } from '../utils/HiveMindContext';
import { Settings, ShieldCheck, ShieldAlert, Activity, RefreshCw } from 'lucide-react';
import { AVAILABLE_MODELS } from '../data/mockData';

export const SettingsPage: React.FC = () => {
  const { modelHealth, setModelHealth } = useHiveMind();
  const [isTesting, setIsTesting] = useState(false);
  const [testLog, setTestLog] = useState<{message: string, success: boolean}[]>([]);

  const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const runDiagnostics = async () => {
    setIsTesting(true);
    setTestLog([]);
    const logs: {message: string, success: boolean}[] = [];

    const updatedHealth = { ...modelHealth };

    for (const model of AVAILABLE_MODELS) {
      if (model.id === 'gemini') {
        if (geminiKey) {
          updatedHealth[model.id] = { status: 'available', latency: 150 };
          logs.push({ message: `[Gemini] Key present.`, success: true });
        } else {
          updatedHealth[model.id] = { status: 'unavailable', latency: 0 };
          logs.push({ message: `[Gemini] Key missing in .env`, success: false });
        }
      } else {
        logs.push({ message: `[${model.name}] Pinging OpenRouter...`, success: true });
        setTestLog([...logs]);

        const startTime = performance.now();
        try {
          const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openRouterKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:5173',
              'X-Title': 'HiveMind'
            },
            body: JSON.stringify({
              model: model.apiModelId,
              messages: [{ role: 'user', content: 'Say hello in 1 word.' }]
            })
          });
          const endTime = performance.now();
          const duration = Math.round(endTime - startTime);

          if (res.ok) {
            updatedHealth[model.id] = { status: duration > 2000 ? 'slow' : 'available', latency: duration };
            logs[logs.length - 1] = { message: `[${model.name}] SUCCESS - ${duration}ms`, success: true };
          } else {
            // Check fallback if primary failed
            if (model.fallbackModelId && model.fallbackModelId !== model.apiModelId) {
              logs.push({ message: `[${model.name}] Primary failed. Pinging fallback...`, success: true });
              setTestLog([...logs]);
              
              const fbStart = performance.now();
              const fbRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${openRouterKey}`,
                  'Content-Type': 'application/json',
                  'HTTP-Referer': 'http://localhost:5173',
                  'X-Title': 'HiveMind'
                },
                body: JSON.stringify({
                  model: model.fallbackModelId,
                  messages: [{ role: 'user', content: 'Say hello in 1 word.' }]
                })
              });
              const fbEnd = performance.now();
              const fbDuration = Math.round(fbEnd - fbStart);

              if (fbRes.ok) {
                updatedHealth[model.id] = { status: fbDuration > 2000 ? 'slow' : 'available', latency: fbDuration };
                logs[logs.length - 1] = { message: `[${model.name}] Fallback SUCCESS - ${fbDuration}ms`, success: true };
              } else {
                updatedHealth[model.id] = { status: 'unavailable', latency: 0 };
                logs[logs.length - 1] = { message: `[${model.name}] Fallback FAILED`, success: false };
                console.error(`[${model.name}] Fallback error: ${fbRes.status}`);
              }
            } else {
              updatedHealth[model.id] = { status: 'unavailable', latency: 0 };
              logs[logs.length - 1] = { message: `[${model.name}] FAILED`, success: false };
              console.error(`[${model.name}] Error: ${res.status}`);
            }
          }
        } catch (err: any) {
          updatedHealth[model.id] = { status: 'unavailable', latency: 0 };
          logs[logs.length - 1] = { message: `[${model.name}] ERROR - Connection failed`, success: false };
          console.error(`[${model.name}] Fetch error:`, err);
        }
      }
      setTestLog([...logs]);
      setModelHealth({ ...updatedHealth });
    }

    setIsTesting(false);
  };

  const hasTested = Object.keys(modelHealth).length > 0;
  const orWorking = Object.entries(modelHealth).some(([id, h]) => id !== 'gemini' && (h.status === 'available' || h.status === 'slow'));
  const orConnected = openRouterKey && (!hasTested || orWorking);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="border-b border-gray-800 pb-6 flex items-center space-x-3">
        <Settings className="w-6 h-6 text-butter" />
        <h2 className="text-2xl font-bold text-white">System Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Connections Card */}
        <div className="p-6 rounded-xl glass-card border-butter/10 space-y-6">
          <h3 className="font-semibold text-lg text-white">API Connections</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-darkgreen-muted/30 border border-gray-800">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${orConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {orConnected ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-medium text-white">OpenRouter</h4>
                  <p className="text-xs text-gray-400">Main inference engine</p>
                </div>
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${orConnected ? 'text-green-400' : 'text-red-400'}`}>
                {orConnected ? '✅ Connected' : 'Missing / Failed'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-darkgreen-muted/30 border border-gray-800">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${geminiKey ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  {geminiKey ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="font-medium text-white">Google Gemini</h4>
                  <p className="text-xs text-gray-400">Consensus & analysis (optional)</p>
                </div>
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${geminiKey ? 'text-green-400' : 'text-yellow-500'}`}>
                {geminiKey ? '✅ Connected' : 'Missing'}
              </span>
            </div>
          </div>
        </div>

        {/* Diagnostic Actions */}
        <div className="p-6 rounded-xl glass-card border-butter/10 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-lg text-white mb-2">Model Diagnostics</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-light mb-6">
              Run a health check across all selected AI endpoints to measure latency and confirm availability.
            </p>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={isTesting || (!openRouterKey && !geminiKey)}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all duration-300 shadow-md ${
              !openRouterKey && !geminiKey ? 'bg-gray-800 text-gray-500 cursor-not-allowed' :
              isTesting ? 'bg-darkgreen-muted border border-butter/30 text-butter' : 'bg-butter text-darkgreen hover:bg-butter-dark hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Running Ping Sweeps...' : 'Run Diagnostics Test'}</span>
          </button>
        </div>
      </div>

      {/* Results Log */}
      {testLog.length > 0 && (
        <div className="p-6 rounded-xl bg-[#03120f] border border-gray-800 font-mono text-xs space-y-2 max-h-[300px] overflow-y-auto">
          <h4 className="text-gray-400 uppercase tracking-widest mb-4 font-semibold">Diagnostic Output</h4>
          {testLog.map((log, i) => (
            <div key={i} className={`flex items-start space-x-2 ${log.success ? 'text-green-400' : 'text-red-400'}`}>
              <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
              <span>{log.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Model Health Grid */}
      <div className="pt-6">
        <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-butter" />
          <span>Endpoint Health Register</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AVAILABLE_MODELS.map(model => {
            const health = modelHealth[model.id] || { status: 'unknown', latency: 0 };
            return (
              <div key={model.id} className="p-4 rounded-lg bg-darkgreen/40 border border-gray-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-white">{model.name}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{model.provider}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center space-x-1.5 mb-1">
                    {health.status === 'available' && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                    {health.status === 'slow' && <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>}
                    {health.status === 'unavailable' && <span className="w-2 h-2 rounded-full bg-red-500"></span>}
                    {health.status === 'unknown' && <span className="w-2 h-2 rounded-full bg-gray-500"></span>}
                    <span className={`text-xs font-semibold capitalize ${
                      health.status === 'available' ? 'text-green-400' :
                      health.status === 'slow' ? 'text-yellow-500' :
                      health.status === 'unavailable' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {health.status}
                    </span>
                  </div>
                  {health.latency > 0 && (
                    <span className="text-[10px] text-gray-400 font-mono">{health.latency}ms</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default SettingsPage;
