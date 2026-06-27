/**
 * Idle Conversation System
 * Detects user inactivity and allows agents to naturally start conversations.
 * Prevents all agents from responding at once; respects cooldowns.
 */

import { agentBehaviorEngine } from '@/services/agentBehaviorEngine';
import { agentStatusSystem } from '@/services/agentStatusSystem';

export class IdleConversationSystem {
    constructor() {
        this.lastUserMessageTime = Date.now();
        this.idleThresholdMs = 30000; // 30 seconds
        this.idleTriggered = false;
        this.minIdleIntervalMs = 60000; // Min 60 seconds between idle triggers
        this.lastIdleTriggerTime = 0;
        this.listeners = [];
    }

    /**
     * Record that the user sent a message
     */
    recordUserMessage() {
        this.lastUserMessageTime = Date.now();
        this.idleTriggered = false;
    }

    /**
     * Check if user is idle and trigger agents if needed
     */
    checkIdleAndTrigger(allMessages = []) {
        const now = Date.now();
        const timeSinceLastMessage = now - this.lastUserMessageTime;
        const timeSinceLastTrigger = now - this.lastIdleTriggerTime;

        // Not enough time has passed since last user message or last idle trigger
        if (timeSinceLastMessage < this.idleThresholdMs || timeSinceLastTrigger < this.minIdleIntervalMs) {
            return null;
        }

        // Already triggered once for this idle period
        if (this.idleTriggered) {
            return null;
        }

        // User is idle! Select an agent to start conversation
        const idleContext = this.buildIdleContext(allMessages);
        const selectedAgents = this.selectIdleResponders(idleContext);

        if (selectedAgents.length === 0) {
            return null;
        }

        this.idleTriggered = true;
        this.lastIdleTriggerTime = now;

        return {
            agents: selectedAgents,
            context: idleContext,
            reason: 'idle',
        };
    }

    /**
     * Build context for idle conversation
     */
    buildIdleContext(allMessages = []) {
        const recentMessages = allMessages.slice(-5);
        const lastMessage = allMessages[allMessages.length - 1];

        return {
            timeSinceLastMessage: Date.now() - this.lastUserMessageTime,
            recentMessages,
            lastMessage,
            reason: 'idle_check_in',
            conversationLength: allMessages.length,
        };
    }

    /**
     * Select 1-2 agents for idle response
     * Prefer agents who haven't spoken recently and have low cooldown
     */
    selectIdleResponders(context) {
        const candidateAgents = Object.keys(agentBehaviorEngine.agentStates)
            .filter((agentId) => agentId !== 'user')
            .map((agentId) => {
                const state = agentBehaviorEngine.getAgentState(agentId);
                const status = agentStatusSystem.getStatus(agentId);
                const isAvailable = agentStatusSystem.isAvailable(agentId);

                // Score based on availability, energy, and mood
                let score = 50;
                score += isAvailable ? 20 : -30;
                score += state.energy > 70 ? 15 : state.energy < 40 ? -10 : 5;
                score += state.mood > 75 ? 10 : state.mood < 40 ? -5 : 0;

                // Slightly favor agents with lower response counts (give quiet ones a chance)
                if (status?.responseCount === 0) score += 8;
                if (status?.responseCount === 1) score += 4;

                return {
                    agentId,
                    score,
                    isAvailable,
                    state,
                    status,
                };
            })
            .filter((agent) => agent.isAvailable)
            .sort((a, b) => b.score - a.score);

        if (candidateAgents.length === 0) {
            return [];
        }

        // Select top agent, maybe add a second if they have high score
        const primary = candidateAgents[0];
        const responders = [primary.agentId];

        // 50% chance to add a second agent if available
        if (candidateAgents.length > 1 && primary.score > 60 && Math.random() < 0.5) {
            responders.push(candidateAgents[1].agentId);
        }

        return responders;
    }

    /**
     * Build idle prompt context
     */
    buildIdlePrompt(agentId, context) {
        const idleMessages = [
            'Hey, you disappeared! 😂 Everything okay?',
            'Random question... what are you doing?',
            'Yo, still there?',
            'You went quiet lol',
            'Miss you! Where d you go?',
            'Hello? 👀',
            'Did you fall asleep? 😴',
            'Thoughts?',
        ];

        const randomMessage = idleMessages[Math.floor(Math.random() * idleMessages.length)];

        return `The user has been idle for ${Math.round(context.timeSinceLastMessage / 1000)} seconds. Break the silence naturally and gently. Don't make it weird—just a casual check-in or a thought-provoking question. Example: "${randomMessage}"

Keep it brief and genuine. If there's an interesting recent topic, you could reference it. But mainly, just see if they're still around.`;
    }

    /**
     * Subscribe to idle events
     */
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter((cb) => cb !== callback);
        };
    }

    /**
     * Notify listeners of idle event
     */
    notifyListeners(event) {
        this.listeners.forEach((listener) => {
            try {
                listener(event);
            } catch (e) {
                console.error('Idle conversation listener error:', e);
            }
        });
    }

    /**
     * Reset system
     */
    reset() {
        this.recordUserMessage();
        this.idleTriggered = false;
    }
}

export const idleConversationSystem = new IdleConversationSystem();
