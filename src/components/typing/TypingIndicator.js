'use client';

import { useChatStore } from '@/store/chatStore';
import { AGENT_CONFIG } from '@/services/agentBehaviorEngine';

export default function TypingIndicator() {
  const typingAgents = useChatStore((state) => state.typingAgents);
  const typingAgentIds = Object.keys(typingAgents);

  if (typingAgentIds.length === 0) {
    return null;
  }

  const typingNames = typingAgentIds
    .map((agentId) => AGENT_CONFIG[agentId]?.name || agentId)
    .join(', ');

  const displayText = typingAgentIds.length === 1
    ? `${typingNames} is typing...`
    : `${typingNames} are typing...`;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-full bg-slate-950/95 px-4 py-3 shadow-inner shadow-slate-900 border border-slate-800 text-sm text-slate-200">
      <div className="flex items-center gap-2">
        {typingAgentIds.map((agentId) => (
          <span
            key={agentId}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-xs"
            title={AGENT_CONFIG[agentId]?.name || agentId}
          >
            {AGENT_CONFIG[agentId]?.personality?.emoji || '💬'}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <div className="flex h-2.5 items-center gap-1">
          <span className="block h-2.5 w-2.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0s' }} />
          <span className="block h-2.5 w-2.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0.1s' }} />
          <span className="block h-2.5 w-2.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>
        <p className="font-medium">{displayText}</p>
      </div>
    </div>
  );
}
