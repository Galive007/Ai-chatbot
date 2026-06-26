'use client';

import { useEffect, useState } from 'react';
import { agentStatusSystem } from '@/services/agentStatusSystem';

export function AgentStatusPanel() {
  const [agentStatus, setAgentStatus] = useState({});
  const [mostActive, setMostActive] = useState(null);
  const [fastest, setFastest] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const status = agentStatusSystem.getAllStatus();
      setAgentStatus(status);

      const active = agentStatusSystem.getMostActiveAgent();
      const fast = agentStatusSystem.getFastestAgent();

      setMostActive(active);
      setFastest(fast);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'idle':
        return 'bg-green-500';
      case 'typing':
        return 'bg-blue-500';
      case 'thinking':
        return 'bg-yellow-500';
      case 'responding':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Agent Status Cards */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {Object.values(agentStatus).map((agent) => (
          <div key={agent.agentId} className="bg-slate-800 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-sm">{agent.name}</h4>
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`}
              />
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-slate-400">
                Status: <span className="text-slate-200">{getStatusText(agent.status)}</span>
              </p>
              <p className="text-slate-400">
                Responses: <span className="text-slate-200">{agent.responseCount}</span>
              </p>
              {agent.responseCount > 0 && (
                <p className="text-slate-400">
                  Avg: <span className="text-slate-200">{Math.round(agent.totalResponseTime / agent.responseCount)}ms</span>
                </p>
              )}

              {!agent.availability && (
                <p className="text-red-400">
                  Cooldown: {agent.cooldownUntil}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Highlights */}
      <div className="bg-slate-800 rounded-lg p-3 text-xs space-y-2">
        {mostActive && (
          <div>
            <p className="text-slate-400">Most Active</p>
            <p className="text-slate-200">
              <span className="font-semibold">{mostActive.name}</span> - {mostActive.responseCount} responses
            </p>
          </div>
        )}

        {fastest && (
          <div>
            <p className="text-slate-400">Fastest Response</p>
            <p className="text-slate-200">
              <span className="font-semibold">{fastest.name}</span> - {Math.round(fastest.totalResponseTime / fastest.responseCount)}ms avg
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 text-xs">
        <button
          onClick={() => agentStatusSystem.resetAllStats()}
          className="flex-1 px-2 py-2 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
        >
          Reset Stats
        </button>
      </div>
    </div>
  );
}
