import { create } from 'zustand';
import { createMessage, parseMentions } from '@/utils/message';
import { participants } from '@/constants/chatData';
import { ChatService } from '@/services/chatService';
import { enhancedConversationEngine } from '@/services/enhancedConversationEngine';
import { conversationManager } from '@/services/conversationManager';
import { memoryEngine } from '@/services/memoryEngine';
import { topicMemorySystem } from '@/services/topicMemorySystem';
import { agentRelationshipSystem } from '@/services/agentRelationshipSystem';
import { agentStatusSystem } from '@/services/agentStatusSystem';
import { multiRoomChatSystem } from '@/services/multiRoomChatSystem';
import { idleConversationSystem } from '@/services/idleConversationSystem';
import { AGENT_CONFIG } from '@/services/agentBehaviorEngine';

export const useChatStore = create((set, get) => ({
  messages: [],
  draft: '',
  replyTo: null,
  editingMessageId: null,
  initialized: false,
  typingAgents: {},
  conversationState: {},
  idleCheckInterval: null,
  setDraft: (draft) => set({ draft }),
  setReplyTo: (replyTo) => set({ replyTo }),
  setTyping: (agentId, isTyping) =>
    set((state) => ({
      typingAgents: isTyping
        ? { ...state.typingAgents, [agentId]: true }
        : (() => {
          const newTyping = { ...state.typingAgents };
          delete newTyping[agentId];
          return newTyping;
        })(),
    })),
  clearReply: () => set({ replyTo: null }),
  clearInbox: async () => {
    try {
      await ChatService.clearMessages();
      const currentRoom = multiRoomChatSystem.getCurrentRoom();
      if (currentRoom) {
        multiRoomChatSystem.clearRoom(currentRoom.id);
      }
      conversationManager.clearContext();
      await memoryEngine.clearMemory();
      topicMemorySystem.clear();
      agentRelationshipSystem.reset();
      agentStatusSystem.resetAllStats();
      idleConversationSystem.reset();
    } catch (error) {
      console.error('Failed to clear inbox and memory:', error);
    }
    set({
      messages: [],
      draft: '',
      replyTo: null,
      editingMessageId: null,
      typingAgents: {},
      conversationState: {},
    });
  },
  startEdit: (message) => set({ editingMessageId: message.id, draft: message.text, replyTo: null }),
  cancelEdit: () => set({ editingMessageId: null, draft: '', replyTo: null }),
  updateConversationState: (state) => set({ conversationState: state }),
  exportConversation: async (format = 'json') => {
    return await enhancedConversationEngine.exportConversation(format);
  },
  loadMessages: async () => {
    // Prefer messages from the current room if available
    const currentRoom = multiRoomChatSystem.getCurrentRoom();
    if (currentRoom && currentRoom.messages && currentRoom.messages.length > 0) {
      set({ messages: currentRoom.messages, initialized: true });
      return;
    }

    const storedMessages = await ChatService.loadMessages();
    // Use persisted messages if available; otherwise start with an empty conversation
    if (storedMessages && storedMessages.length > 0) {
      set({ messages: storedMessages, initialized: true });
      return;
    }

    set({ messages: [], initialized: true });
  },
  deleteMessage: async (messageId) => {
    await ChatService.deleteMessage(messageId);
    set((state) => ({
      messages: state.messages.filter((message) => message.id !== messageId),
      replyTo: state.replyTo?.id === messageId ? null : state.replyTo,
      editingMessageId: state.editingMessageId === messageId ? null : state.editingMessageId,
    }));
  },
  sendMessage: async (text) => {
    const normalizedText = text.trim();
    if (normalizedText.length === 0) {
      return;
    }

    set({ draft: '' });
    const state = get();

    if (state.editingMessageId) {
      const editingMessageId = state.editingMessageId;
      await ChatService.updateMessage(editingMessageId, {
        text: normalizedText,
        edited: true,
      });
      set((current) => ({
        messages: current.messages.map((message) => {
          if (message.id !== editingMessageId) return message;
          return {
            ...message,
            text: normalizedText,
            mentions: parseMentions(normalizedText, participants),
            edited: true,
          };
        }),
        editingMessageId: null,
      }));
      return;
    }

    const message = await ChatService.saveMessage({
      senderId: 'user',
      senderName: 'You',
      senderType: 'user',
      text: normalizedText,
      replyTo: state.replyTo,
    });

    // Record user activity for idle detection
    idleConversationSystem.recordUserMessage();

    // Add to global store
    set((current) => ({
      messages: [...current.messages, message],
      draft: '',
      replyTo: null,
    }));

    // Also persist message to current multi-room (if active)
    try {
      multiRoomChatSystem.addMessage(message);
    } catch (e) {
      console.warn('Failed to add message to room:', e);
    }

    // Process through Enhanced Conversation Engine
    try {
      console.log('📨 Processing message through Enhanced Conversation Engine:', message.text);
      const result = await enhancedConversationEngine.processUserMessage(
        message,
        get().messages,
        {
          onTypingStart: (agentId, delay) => {
            console.log(`⌨️ ${agentId} started typing (${delay}ms delay)`);
            get().setTyping(agentId, true);
          },
          onTypingEnd: (agentId) => {
            console.log(`✓ ${agentId} finished typing`);
            get().setTyping(agentId, false);
          },
          onAgentResponse: async (response) => {
            console.log(`💬 Received response from ${response.agentName}:`, response.text);
            const aiMessage = await ChatService.saveMessage({
              senderId: response.agentId,
              senderName: response.agentName,
              senderType: 'ai',
              text: response.text,
            });

            set((current) => ({
              messages: [...current.messages, aiMessage],
            }));

            // persist AI message into current room as well
            try {
              multiRoomChatSystem.addMessage(aiMessage);
            } catch (e) {
              console.warn('Failed to add AI message to room:', e);
            }
          },
        }
      );
      
      console.log('✅ Conversation engine processing complete. Result:', result);

      // Update conversation state
      const newState = enhancedConversationEngine.getState();
      get().updateConversationState(newState);
    } catch (error) {
      console.error('❌ Enhanced Conversation Engine error:', error);
      // Fallback to simple AI response
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: 'alex',
            agentConfig: { name: 'Alex', role: 'Physics Expert' },
            context: { topic: 'physics' },
          }),
        });

        const data = await response.json();
        const aiMessage = await ChatService.saveMessage({
          senderId: 'alex',
          senderName: 'Alex',
          senderType: 'ai',
          text: data?.result?.text || 'I understand your point.',
        });

        set((current) => ({
          messages: [...current.messages, aiMessage],
        }));
      } catch (fallbackError) {
        console.error('❌ Fallback error:', fallbackError);
      }
    }
  },
  toggleReaction: async (messageId, emoji) => {
    set((state) => ({
      messages: state.messages.map((message) => {
        if (message.id !== messageId) return message;
        const existing = message.reactions.find((reaction) => reaction.emoji === emoji);
        if (existing) {
          const updated = message.reactions
            .map((reaction) => (reaction.emoji === emoji ? { ...reaction, count: reaction.count - 1 } : reaction))
            .filter((reaction) => reaction.count > 0);
          return { ...message, reactions: updated };
        }

        return { ...message, reactions: [...message.reactions, { emoji, count: 1 }] };
      }),
    }));
  },
  startIdleMonitoring: () => {
    const state = get();
    if (state.idleCheckInterval) return;

    const interval = setInterval(async () => {
      const currentState = get();
      const idleEvent = idleConversationSystem.checkIdleAndTrigger(currentState.messages);

      if (!idleEvent) return;

      const { agents, context } = idleEvent;

      for (const agentId of agents) {
        try {
          get().setTyping(agentId, true);

          const delay = 2000 + Math.random() * 3000;
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Generate idle response
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              agentId,
              agentConfig: AGENT_CONFIG[agentId],
              context: {
                topic: 'idle_check_in',
                userMood: 'neutral',
                userIntent: 'idle_check_in',
                conversationGoal: 'Re-engage the user naturally',
                recentMessages: context.recentMessages || [],
                userMessage: 'idle_check_in',
              },
            }),
          });

          const data = await response.json();

          if (data.success && data.result) {
            const aiMessage = await ChatService.saveMessage({
              senderId: agentId,
              senderName: AGENT_CONFIG[agentId].name,
              senderType: 'ai',
              text: data.result.text,
            });

            get().setTyping(agentId, false);

            set((current) => ({
              messages: [...current.messages, aiMessage],
            }));

            try {
              multiRoomChatSystem.addMessage(aiMessage);
            } catch (e) {
              console.warn('Failed to add idle message to room:', e);
            }
          }
        } catch (error) {
          console.error(`Failed to generate idle response for ${agentId}:`, error);
          get().setTyping(agentId, false);
        }
      }
    }, 5000); // Check every 5 seconds

    set({ idleCheckInterval: interval });
  },
  stopIdleMonitoring: () => {
    const state = get();
    if (state.idleCheckInterval) {
      clearInterval(state.idleCheckInterval);
      set({ idleCheckInterval: null });
    }
  },
}));
