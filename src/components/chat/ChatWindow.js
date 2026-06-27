'use client';

import { useEffect, useRef, useState } from 'react';
import ChatHeader from '@/components/chat/ChatHeader';
import { MessageList } from '@/components/message/MessageList';
import ChatInput from '@/components/input/ChatInput';
import TypingIndicator from '@/components/typing/TypingIndicator';
import SearchPanel from '@/components/chat/SearchPanel';
import SettingsDialog from '@/components/chat/SettingsDialog';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { AgentStatusPanel } from '@/components/agents/AgentStatusPanel';
import { MultiRoomChatUI } from '@/components/rooms/MultiRoomChatUI';
import { ConversationInsights } from '@/components/insights/ConversationInsights';
import { ConversationExport } from '@/components/export/ConversationExport';
import { useUiStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';

export default function ChatWindow() {
  const { searchOpen, settingsOpen } = useUiStore();
  const loadMessages = useChatStore((state) => state.loadMessages);
  const messages = useChatStore((state) => state.messages);
  const startIdleMonitoring = useChatStore((state) => state.startIdleMonitoring);
  const stopIdleMonitoring = useChatStore((state) => state.stopIdleMonitoring);
  const scrollContainerRef = useRef(null);
  const [activePanel, setActivePanel] = useState(null); // null, 'analytics', 'status', 'rooms', 'insights'

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      if (!active) return;
      await loadMessages();
      startIdleMonitoring();
    };

    initialize();

    return () => {
      active = false;
      stopIdleMonitoring();
    };
  }, [loadMessages, startIdleMonitoring, stopIdleMonitoring]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const frame = window.requestAnimationFrame(() => {
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [messages.length]);

  return (
    <main className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-card">
      <div className="shrink-0 border-b border-border px-6 py-6 flex justify-between items-center">
        <ChatHeader />
        <div className="flex gap-2">
          <button
            onClick={() => setActivePanel(activePanel === 'analytics' ? null : 'analytics')}
            className={`px-3 py-1 rounded text-sm transition ${activePanel === 'analytics'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            title="Analytics Dashboard"
          >
            📊
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'status' ? null : 'status')}
            className={`px-3 py-1 rounded text-sm transition ${activePanel === 'status'
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            title="Agent Status"
          >
            ⚡
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'rooms' ? null : 'rooms')}
            className={`px-3 py-1 rounded text-sm transition ${activePanel === 'rooms'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            title="Multi-Room"
          >
            🏠
          </button>
          <button
            onClick={() => setActivePanel(activePanel === 'insights' ? null : 'insights')}
            className={`px-3 py-1 rounded text-sm transition ${activePanel === 'insights'
                ? 'bg-yellow-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            title="Insights"
          >
            💡
          </button>
          <ConversationExport messages={messages} />
        </div>
      </div>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-4">
        <div className="flex gap-4 min-h-0 flex-1">
          {/* Main Chat Area */}
          <div className="flex-1 min-h-0 flex flex-col">
            <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto pr-2">
              <MessageList />
            </div>
          </div>

          {/* Side Panel */}
          {activePanel && (
            <div className="w-80 min-h-0 overflow-y-auto bg-slate-900/50 rounded-lg p-4 border border-slate-700">
              {activePanel === 'analytics' && <AnalyticsDashboard />}
              {activePanel === 'status' && <AgentStatusPanel />}
              {activePanel === 'rooms' && <MultiRoomChatUI />}
              {activePanel === 'insights' && <ConversationInsights />}
            </div>
          )}
        </div>
      </section>

      <div className="shrink-0 border-t border-border px-6 py-4">
        <TypingIndicator />
        <ChatInput />
      </div>
      <SearchPanel open={searchOpen} onClose={() => useUiStore.setState({ searchOpen: false })} />
      <SettingsDialog open={settingsOpen} onClose={() => useUiStore.setState({ settingsOpen: false })} />
    </main>
  );
}
