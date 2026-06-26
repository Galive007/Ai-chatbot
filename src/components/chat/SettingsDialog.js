'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useChatStore } from '@/store/chatStore';
import { AGENT_CONFIG } from '@/services/agentBehaviorEngine';
import { providerManager, PROVIDER_TYPES } from '@/services/providerManager';

export default function SettingsDialog({ open, onClose }) {
  const [darkMode, setDarkMode] = useState(true);
  const [activeProvider, setActiveProvider] = useState(providerManager.getActiveProvider());
  const [providerHealth, setProviderHealth] = useState({});
  const messages = useChatStore((state) => state.messages);

  const handleProviderChange = (provider) => {
    providerManager.setProvider(provider);
    setActiveProvider(provider);
  };

  const runHealthCheck = async (provider) => {
    setProviderHealth((s) => ({ ...s, [provider]: 'checking' }));
    const result = await providerManager.healthCheck(provider);
    setProviderHealth((s) => ({ ...s, [provider]: result.healthy ? 'healthy' : `fail: ${result.message}` }));
  };

  const agentStats = Object.entries(AGENT_CONFIG).reduce((acc, [agentId, config]) => {
    const agentMessages = messages.filter((m) => m.senderId === agentId);
    acc[agentId] = {
      name: config.name,
      role: config.role,
      messageCount: agentMessages.length,
      percentage: messages.length > 0 ? ((agentMessages.length / messages.length) * 100).toFixed(1) : 0,
    };
    return acc;
  }, {});

  return (
    <Modal title="Settings & Insights" open={open} onClose={onClose}>
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-[#111827] p-4">
          <h3 className="text-sm font-semibold text-foreground">AI Provider</h3>
          <p className="mt-2 text-xs text-muted">Select which AI provider to use for generating responses</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {Object.entries(PROVIDER_TYPES).map(([key, value]) => (
              <button
                key={value}
                type="button"
                onClick={() => handleProviderChange(value)}
                className={`rounded-2xl px-4 py-2 text-sm transition capitalize ${activeProvider === value ? 'bg-primary text-white' : 'bg-slate-900 text-muted'
                  }`}
              >
                {value}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {Object.values(PROVIDER_TYPES).map((p) => (
              <div key={`health_${p}`} className="text-xs">
                <button
                  onClick={() => runHealthCheck(p)}
                  className="px-2 py-1 rounded bg-slate-700 text-slate-300 mr-2"
                >
                  Check {p}
                </button>
                <span className="text-xs text-muted">
                  {providerHealth[p] || 'unknown'}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">
            Current: <span className="font-semibold text-foreground">{activeProvider}</span>
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-[#111827] p-4">
          <h3 className="text-sm font-semibold text-foreground">Conversation Stats</h3>
          <div className="mt-4 space-y-3 text-xs text-muted">
            <div className="flex justify-between">
              <span>Total Messages:</span>
              <span className="font-semibold text-foreground">{messages.length}</span>
            </div>
            <div className="flex justify-between">
              <span>User Messages:</span>
              <span className="font-semibold text-foreground">{messages.filter((m) => m.senderType === 'user').length}</span>
            </div>
            <div className="flex justify-between">
              <span>AI Responses:</span>
              <span className="font-semibold text-foreground">{messages.filter((m) => m.senderType === 'ai').length}</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-[#111827] p-4">
          <h3 className="text-sm font-semibold text-foreground">Agent Participation</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(agentStats).map(([agentId, stats]) => (
              <div key={agentId}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground">{stats.name}</span>
                  <span className="text-xs text-muted">{stats.messageCount} messages ({stats.percentage}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${Math.max(5, stats.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-[#111827] p-4 text-xs text-muted">
          <h3 className="text-sm font-semibold text-foreground mb-2">About</h3>
          <p>This AI group chat features nine distinct personalities with realistic behavior patterns, mood systems, and dynamic agent selection based on conversation context.</p>
          <p className="mt-2">Agents respond based on topic relevance, expertise, mood, and energy levels rather than replying to every message.</p>
        </div>
      </div>
    </Modal>
  );
}
