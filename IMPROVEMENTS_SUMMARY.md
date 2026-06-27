# AI Group Chat Behavior System - Improvements Summary

## Overview
This document outlines all the improvements made to make the AI agents feel more human-like and realistic in group conversations.

## Changes Made

### 1. **User Mood & Intent Detection** (`src/utils/conversationUtils.js`)
Added three new utility functions for understanding user emotional state and intentions:

- `detectUserMood(text)` - Detects: bored, sad, excited, stressed, annoyed, calm, neutral
- `detectUserIntent(text)` - Detects: share_project, seek_fun, ask_help, seek_opinion, chat
- `inferConversationGoal(text, mood)` - Generates contextual conversation goal based on mood

**Usage**: These are automatically extracted from every user message and passed to agent decision-making.

### 2. **Enhanced Agent Status System** (`src/services/agentStatusSystem.js`)
- Updated to dynamically initialize from AGENT_CONFIG instead of hard-coded agent list
- Now supports all 9 agents (alex, mia, noah, zoe, kai, jade, leo, nia, sam)
- Each agent gets their own status tracking: idle, typing, thinking, responding

### 3. **Improved Agent Response Decision System** (`src/services/agentBehaviorEngine.js`)

#### New Scoring Methods:
- `calculateRelevanceScore()` - Scores how relevant a message is to this agent based on:
  - Whether agent was mentioned
  - Keywords matching agent interests
  - User mood indicators (bored agents get bonus)
  - User intent (e.g., share_project rewards tech agents)

- `calculateRepeatResponsePenalty()` - Prevents same agent from dominating conversation

#### Enhanced `shouldReply()` Logic:
- Now considers user mood (lower silence threshold if user is bored)
- Adjusts decision thresholds based on user's emotional state
- Factors in user intent (project sharing, seeking fun, etc.)

#### Smart Responder Selection (`selectResponders()`):
- Selects 0-2 agents instead of forcing all to respond
- Prioritizes agents with highest relevance scores
- Adds natural variation through score-proximity grouping
- Includes fallback for specific intents (projects, help-seeking)

### 4. **Natural Response Timing** (`src/services/agentBehaviorEngine.js` - `getTypingDelay()`)

Updated typing delay calculation to include:
- **Base delay**: 900-2400ms (adjustable per agent via personality.timing)
- **Speed modifier**: Based on typingSpeed attribute
- **Energy modifier**: Tired agents type slower
- **Mood modifier**: Stressed users get slightly slower responses; bored users get faster responses
- **Intent modifier**: Project sharing gets thoughtful delays; seeking fun gets quicker responses
- **Thoughtfulness factor**: Allows per-agent thinking patterns

**Result**: Agent responses vary naturally from 1-7 seconds, with context-aware variation.

### 5. **Context-Aware Conversation Engine** (`src/services/enhancedConversationEngine.js`)

Enhanced context building:
```javascript
{
  topic,
  mentionedAgents,
  recentMessages,
  currentSpeaker,
  conversationLength,
  timestamp,
  agentRelationships,
  topicContext,
  trendingTopics,
  userMood,              // NEW
  userIntent,            // NEW
  conversationGoal,      // NEW
  recentAgentResponses,  // NEW
  userMessage,           // NEW
}
```

This rich context is passed to all decision-making functions.

### 6. **Improved Prompt Builder** (`src/services/promptBuilder.js`)

#### System Prompt Enhancements:
- Added explicit "CRITICAL RULES" section
- Clear emphasis on sounding human, not AI
- Rules about reacting to emotional state
- Guidance on staying on topic
- Behavior guidelines for authentic responses

#### User Prompt Enhancements:
Now includes:
- **User's Current State**: Mood, Intent, Conversation Goal
- **Mood-specific instructions**:
  - Bored: "engage them with something fun or interesting"
  - Sad: "be supportive and genuine"
  - Excited: "match their energy"
  - Stressed: "be understanding and calm"
- **Intent-specific instructions**:
  - share_project: "show genuine interest, ask specific questions"
  - seek_fun: "be playful, suggest activities, be engaging"
  - ask_help: "actually engage, don't just echo"
  - seek_opinion: "give one! Be honest and authentic"
- **Reply type instructions**: Question, joke, challenge, or short responses

**Result**: Agents now receive contextual guidance to generate more appropriate, human-like responses.

### 7. **Idle Conversation System** (`src/services/idleConversationSystem.js`)

New system for detecting user inactivity and allowing natural re-engagement:

**Features**:
- Detects 30+ seconds of user inactivity
- Prevents constant triggering (60-second minimum between idle events)
- Selects 1-2 agents using:
  - Availability (not on cooldown)
  - Energy level (prefer active agents)
  - Response count (give quiet agents a chance)
- Uses natural, casual "check-in" prompts:
  - "Hey, you disappeared 😂 Everything okay?"
  - "Random question... what are you doing?"
  - "Yo, still there?"
  - etc.

**Integration**:
- Integrated into chat store
- Starts monitoring when ChatWindow loads
- Stops when component unmounts
- Respects agent cooldowns and availability

### 8. **Chat Store Updates** (`src/store/chatStore.js`)

Added:
- Import of `idleConversationSystem`
- `idleConversationSystem.recordUserMessage()` when user sends message
- `startIdleMonitoring()` and `stopIdleMonitoring()` functions
- Idle check interval (5-second polling)
- Idle response generation with natural delays

### 9. **ChatWindow Integration** (`src/components/chat/ChatWindow.js`)

Updated to:
- Call `startIdleMonitoring()` on load
- Call `stopIdleMonitoring()` on cleanup
- Properly manage lifecycle of idle monitoring

## Behavior Examples

### Scenario 1: User is Bored
```
User: "I'm so bored"

Expected Behavior:
- Agents detect "bored" mood
- Lower silence threshold (more likely to respond)
- Mood-aware prompts encourage engagement
- Example responses:
  - "Same lol, want to do something random?"
  - "Maybe we should talk about something fun"
  - "Let's change the topic"

NOT: "Painting is an interesting art form..."
```

### Scenario 2: User Shares a Project
```
User: "I made a cool project! Check it out—it's this API that uses ML"

Expected Behavior:
- Agents detect "share_project" intent
- Tech-focused agents (Alex, Sam) prioritize responding
- Non-tech agents stay quiet (if not interested)
- Example responses:
  - "Yo that's sick! What tech stack did you use?"
  - "Wait, ML? Tell me more about the model!"
  - "Nice work! How long did it take?"

NOT: "Projects are interesting things that people create."
```

### Scenario 3: User Stops Typing (30+ seconds)
```
Timeline:
- 0s: Last user message
- 5s: Idle system waiting
- 30s: System detects idle, selects agent
- 33s: Agent typing indicator shows (1-4 second "think time")
- 37s: Agent sends check-in message naturally

Example messages:
- "Hey, where did you go? 😂"
- "Still there?"
- "Random thought... what's your favorite food?"

NOT: All 9 agents suddenly responding at once
```

### Scenario 4: Conversation Flow
```
User: "I'm stressed about the project deadline"
- Mood: stressed
- Intent: ask_help

Response Pattern:
- Agent 1 (Nia - empathetic): Responds first at 2.5s
  "Hey, you got this! What part is stressing you the most?"
- Agent 2 (Leo - supportive): Responds at 5.5s
  "Tell me what you need, I'll help"
- Agent 3 (Kai - cool/chill): Stays silent (not interested in serious topics)
- Agents 4-9: Stay silent (too high threshold for this topic)

Chat feels like real friends responding at different times
```

## Key Improvements Summary

| Problem | Solution | Result |
|---------|----------|--------|
| Agents feel robotic | Realistic personality-driven prompts + varied timing | Agents sound like real people |
| Multiple agents reply instantly | Natural delay system (1-7s) + smart responder selection | Staggered, organic responses |
| Agents ignore user mood | Mood detection + mood-aware scoring + mood instructions | Agents acknowledge and react to emotions |
| Agents continue own topics | Relevance scoring + intent understanding | Agents stay focused on user's message |
| No natural pauses | Context-aware typing delays + energy/mood modifiers | Feels like humans thinking before typing |
| Too many agents per message | Responder selection limits to 0-2 agents | Realistic group chat feel |
| User inactivity = silence | Idle detection system | Agents naturally re-engage after 30+ seconds |

## Files Modified

1. `src/utils/conversationUtils.js` - Added mood/intent detection
2. `src/services/agentStatusSystem.js` - Dynamic initialization from AGENT_CONFIG
3. `src/services/agentBehaviorEngine.js` - Enhanced scoring, timing, selection logic
4. `src/services/enhancedConversationEngine.js` - Context enrichment with mood/intent
5. `src/services/promptBuilder.js` - Improved system and user prompts
6. `src/services/idleConversationSystem.js` - NEW system for idle detection
7. `src/store/chatStore.js` - Idle monitoring integration
8. `src/components/chat/ChatWindow.js` - Idle monitoring lifecycle

## Testing Recommendations

1. **Test Mood Detection**:
   - Type "I'm bored" → agents should be more responsive
   - Type "I'm stressed" → agents should be supportive
   - Type "that's awesome!" → agents should match energy

2. **Test Agent Selection**:
   - Type about coding → Alex should respond more than Nia
   - Type about art → Nia should respond more than Sam
   - Type about games → Leo should respond more than Jade

3. **Test Timing**:
   - Multiple messages in quick succession → response delays vary (not all at once)
   - Messages should arrive staggered, not all immediately

4. **Test Idle Detection**:
   - Stop typing for 30+ seconds → agents should naturally break silence
   - Agents shouldn't all respond to idle check-in
   - 60-second cooldown prevents spam

5. **Test Focus**:
   - Change topics → agents should follow, not continue previous topic
   - Share project → project-relevant agents should engage specifically
   - Ask question → agents should answer, not ignore

## Architecture Preserved

All changes maintain the existing architecture:
- ✅ Conversation Engine remains the orchestrator
- ✅ Agent Behavior Engine makes decisions
- ✅ Prompt Builder constructs requests
- ✅ No bypassing of design
- ✅ Backward compatible with existing memory/relationship systems

## Future Enhancements

1. Add agent "concentration" levels (harder to distract some agents)
2. Agent turn-taking preferences (some agents like to speak in pairs)
3. Conversation momentum detection (speed up/slow down based on energy)
4. Emotional contagion (agents influence each other's moods)
5. Topic expertise tracking (agents get better/faster on familiar topics)
