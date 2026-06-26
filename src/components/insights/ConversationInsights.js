'use client';

import { useState, useEffect } from 'react';
import { conversationManager } from '@/services/conversationManager';
import { topicMemorySystem } from '@/services/topicMemorySystem';
import { advancedAnalyticsSystem } from '@/services/advancedAnalyticsSystem';

export function ConversationInsights() {
  const [insights, setInsights] = useState(null);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [summary, setConversationSummary] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentSession = conversationManager.currentSession;
      if (currentSession) {
        const sessionSummary = conversationManager.generateSessionSummary();
        setConversationSummary(sessionSummary);
      }

      const trending = topicMemorySystem.getTrendingTopics(3);
      setTrendingTopics(trending);

      const analytics = advancedAnalyticsSystem.getConversationSummary();
      setInsights(analytics);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!insights) return null;

  return (
    <div className="bg-slate-800 rounded-lg p-4 space-y-3">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <p className="text-slate-400">Total Messages</p>
          <p className="text-lg font-semibold text-white">{insights.totalMessages}</p>
        </div>
        <div>
          <p className="text-slate-400">Active Agents</p>
          <p className="text-lg font-semibold text-white">{insights.agentCount}</p>
        </div>
        <div>
          <p className="text-slate-400">Topics Discussed</p>
          <p className="text-lg font-semibold text-white">{insights.topicCount}</p>
        </div>
        <div>
          <p className="text-slate-400">Duration</p>
          <p className="text-lg font-semibold text-white">{insights.sessionDuration}m</p>
        </div>
      </div>

      {/* Engagement Score */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <p className="text-xs text-slate-400">Engagement Level</p>
          <p className="text-sm font-semibold text-blue-400">{insights.engagementScore}/100</p>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${Math.min(insights.engagementScore, 100)}%` }}
          />
        </div>
      </div>

      {/* Trending Topics */}
      {trendingTopics.length > 0 && (
        <div>
          <p className="text-xs text-slate-400 mb-2">Trending Topics</p>
          <div className="flex flex-wrap gap-1">
            {trendingTopics.map((topic) => (
              <span
                key={topic.name}
                className="px-2 py-1 bg-slate-700 rounded-full text-xs text-slate-300"
              >
                {topic.name}
                <span className="text-blue-400 ml-1">({topic.mentions})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Conversation Summary */}
      {summary && (
        <div className="pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-2">Session Summary</p>
          <div className="text-xs text-slate-300 space-y-1">
            <p>• {summary.messageCount || 0} messages exchanged</p>
            <p>• {summary.participantCount || 0} participants engaged</p>
            {summary.summary && <p>• {summary.summary}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
