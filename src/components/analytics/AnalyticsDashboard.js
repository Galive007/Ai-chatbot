'use client';

import { useEffect, useState } from 'react';
import { advancedAnalyticsSystem } from '@/services/advancedAnalyticsSystem';
import { agentStatusSystem } from '@/services/agentStatusSystem';
import { AGENT_CONFIG } from '@/services/agentBehaviorEngine';

export function AnalyticsDashboard() {
  const [report, setReport] = useState(null);
  const [statusSummary, setStatusSummary] = useState(null);
  const [updateKey, setUpdateKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const newReport = advancedAnalyticsSystem.getPerformanceReport();
      const newStatus = agentStatusSystem.getActivitySummary();

      setReport(newReport);
      setStatusSummary(newStatus);
      setUpdateKey((prev) => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!report || !statusSummary) {
    return <div className="p-4">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6 p-4">
      {/* Session Overview */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-sm text-slate-400">Duration</p>
          <p className="text-2xl font-bold">{report.session.duration}m</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-sm text-slate-400">Total Messages</p>
          <p className="text-2xl font-bold">{report.session.totalMessages}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-sm text-slate-400">Avg Messages/min</p>
          <p className="text-2xl font-bold">{report.session.avgMessagesPerMinute}</p>
        </div>
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-sm text-slate-400">AI Agents</p>
          <p className="text-2xl font-bold">{Object.keys(AGENT_CONFIG).length}</p>
        </div>
      </div>

      {/* Engagement */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Engagement Metrics</h3>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-slate-400">Engagement Score</p>
            <div className="w-full bg-slate-700 rounded h-2">
              <div
                className="bg-blue-500 h-2 rounded transition-all"
                style={{ width: `${Math.min(report.engagement.score, 100)}%` }}
              />
            </div>
            <p className="text-sm font-semibold mt-1">{report.engagement.score}/100</p>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Topics: {report.engagement.topicDiversity} • Most discussed: {report.engagement.mostCommonTopic}
          </p>
        </div>
      </div>

      {/* Agent Status */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Agent Activity</h3>
        <div className="space-y-3">
          {Object.entries(statusSummary).map(([agentId, status]) => (
            <div key={agentId} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium">{status.name}</p>
                <p className="text-xs text-slate-500">{AGENT_CONFIG[agentId]?.role || 'AI Agent'}</p>
                <div className="flex gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-1 rounded ${status.status === 'idle'
                      ? 'bg-green-500/20 text-green-400'
                      : status.status === 'typing'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                  >
                    {status.status}
                  </span>
                  {!status.available && (
                    <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                      cooling down
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold">{status.responseCount}</p>
                <p className="text-xs text-slate-400">responses</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agent Statistics */}
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Participation</h3>
        <div className="space-y-2">
          {Object.entries(report.agents).map(([agentId, stats]) => (
            <div key={agentId}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{AGENT_CONFIG[agentId]?.name || agentId}</span>
                <span className="text-slate-400">{stats.participationRate}</span>
              </div>
              <div className="w-full bg-slate-700 rounded h-2">
                <div
                  className="bg-purple-500 h-2 rounded transition-all"
                  style={{
                    width: stats.participationRate,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3">Agent Personas</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {Object.entries(AGENT_CONFIG).map(([agentId, config]) => (
            <div key={agentId} className="rounded-xl border border-slate-700 p-3 bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-200">{config.name}</p>
                  <p className="text-xs text-slate-400">{config.role}</p>
                </div>
                <span className="text-xl">{config.personality.emoji}</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">{config.personality.communicationStyle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
