# Usage Examples & Code Snippets

## Real Conversation Examples

### Example 1: User is Bored

**What Happens Behind Scenes**:
```javascript
// User types: "I'm so bored"

// Step 1: Mood Detection
const mood = detectUserMood("I'm so bored");
// → "bored"

// Step 2: Intent Detection
const intent = detectUserIntent("I'm so bored");
// → "seek_fun"

// Step 3: Goal Inference
const goal = inferConversationGoal("I'm so bored", "bored");
// → "Cheer up the group and suggest something more fun."

// Step 4: Context Building
const context = {
  topic: "boredom",
  userMood: "bored",
  userIntent: "seek_fun",
  conversationGoal: "Cheer up the group...",
  recentMessages: [...],
  ...
};

// Step 5: Agent Scoring
// Noah (playful): +10 for boredom, +15 for trait match = 75
// Nia (artsy): +10 for boredom, trait match lower = 65  
// Kai (cool): +10 for boredom, +5 for cool vibe = 60
// Alex (tech): +10 for boredom, no interest match = 45
// Leo (gamer): +10 for boredom, +8 for fun = 58

// Step 6: Selection
// Choose top 2: Noah (75) and Leo (58)

// Step 7: Response Generation
// Noah's delay: 4.2s (playful, takes creative time)
// Leo's delay: 2.8s (energetic, responds faster)
```

**Actual Chat Output**:
```
You: "I'm so bored"

[Leo typing... 2.8s]
Leo: "Yo I feel that. Wanna jump into some gaming? I got something wild"

[Noah typing... 4.2s]
Noah: "Boredom = creative opportunity. Random question: ever tried making something weird? Like a song or art thing?"

[No response from other agents - they recognize Leo & Noah have it covered]
```

---

### Example 2: User Shares a Project

**Chat Flow**:
```
User: "I just built this REST API with Node.js and MongoDB. It handles user auth and everything"

Context Created:
{
  topic: "project",
  userMood: "neutral",
  userIntent: "share_project",
  conversationGoal: "Talk about the project, ask questions, react with interest"
}
```

**Agent Scoring**:
```
Alex (tech nerd):
  - Knowledge: 80 (coding expertise)
  - Interest: +18 (project in interests)
  - Intent bonus: +8 (share_project intent)
  - Score: 76 ✓ RESPONDS

Sam (science whiz):
  - Knowledge: 85 (science/logic focus)
  - Interest: +16 (gadgets/tech interest)
  - Intent bonus: +8
  - Score: 74 ✓ RESPONDS

Leo (gamer):
  - Knowledge: 40 (gaming focus, not backend)
  - Interest: 0 (projects not in interests)
  - Score: 35 - SILENT

Nia (artsy poet):
  - Knowledge: 30 (art focus)
  - Interest: 0 (no tech interest)
  - Score: 15 - SILENT
```

**Responses**:
```
[Alex typing... 2.4s]
Alex: "Yo that's awesome! Did you use JWT for auth? What's your project structure?"

[Sam typing... 5.8s]
Sam: "Cool stuff. How did you handle connection pooling on the DB side?"

[All others stay silent - not their expertise]
```

---

### Example 3: Conversation Topic Switch

**Initial Topic: Coding**
```
User: "Backend architecture is so confusing"

Responding Agents:
- Alex (tech): "Yeah, took me forever to get it"
- Sam (science): "Let's break it down systematically"
```

**Sudden Switch**:
```
User: "Anyway, I started learning to paint this week"

Context Rebuilt:
{
  topic: "painting",
  userMood: "neutral",
  userIntent: "share_project", // painting as a project
  conversationGoal: "..."
}

New Scoring:
- Nia (artsy): 82 ✓ RESPONDS (art interest, expertise)
- Noah (creative): 70 ✓ RESPONDS (stories/creativity interest)
- Alex (tech): 15 - SILENT (no interest in painting)
- Sam (science): 20 - SILENT (not their domain)

Responses:
[Nia typing... 5.2s - taking thoughtful time]
Nia: "Omg painting is so healing. What style are you trying?"

[Noah typing... 6.1s - creative thinking]
Noah: "That's beautiful. What inspired you to start?"

[Alex and others: silent, recognize the topic shift]
```

---

### Example 4: Stressed User

**Input**:
```
User: "I'm freaking out about this exam tomorrow"

Detection:
- mood: "stressed"
- intent: "ask_help"
- goal: "Be understanding and calm; help if possible"
```

**Response Selection**:
```
Agents with low threshold (likely to respond):
- Nia (empathetic traits): Responds despite low interest
- Jade (strategy/planning): High score for help intent
- Leo (supportive): Decent score for encouragement
- Noah (compassionate): Lower score but might help

Response Delays (all quick to help someone stressed):
- Jade: 2.1s (wants to help strategize)
- Nia: 2.8s (empathetic)
- Leo: 3.5s (supportive)

Responses:
[Jade typing...]
Jade: "Okay let's break this down. What topics are you weakest on?"

[Nia typing...]
Nia: "Hey, you got this. Wanna talk through it? Sometimes that helps."

[Leo typing...]
Leo: "Yo, you're smarter than you think. Just breathe and go for it."
```

---

## Code Usage Examples

### Using Mood Detection

```javascript
import { detectUserMood, detectUserIntent } from '@/utils/conversationUtils';

// In your component or service
const handleUserMessage = (userText) => {
  const mood = detectUserMood(userText);
  const intent = detectUserIntent(userText);
  
  console.log(`Mood: ${mood}, Intent: ${intent}`);
  
  // Pass to conversation engine
  enhancedConversationEngine.processUserMessage(message, allMessages);
};
```

### Getting Agent Relevance Score

```javascript
import { agentBehaviorEngine } from '@/services/agentBehaviorEngine';

// Get how relevant an agent is to current context
const context = {
  topic: 'coding',
  userMood: 'excited',
  userIntent: 'share_project'
};

const agentState = agentBehaviorEngine.getAgentState('alex');
const relevanceScore = agentBehaviorEngine.calculateRelevanceScore(agentState, context);

console.log(`Alex's relevance score: ${relevanceScore}`); // 35-45 (high for coding)
```

### Getting Contextual Typing Delay

```javascript
import { agentBehaviorEngine } from '@/services/agentBehaviorEngine';

// Get delay that considers user mood and intent
const context = {
  userMood: 'bored',
  userIntent: 'seek_fun'
};

const delayForNoa = agentBehaviorEngine.getTypingDelay('noah', context);
const delayForKai = agentBehaviorEngine.getTypingDelay('kai', context);

// Noah (playful) might get 3200ms for creative thinking
// Kai (cool) might get 2800ms for quick wit
```

### Checking Idle Status

```javascript
import { idleConversationSystem } from '@/services/idleConversationSystem';

// Record when user sends message
idleConversationSystem.recordUserMessage();

// Check if idle should trigger (call periodically, e.g., every 5 seconds)
const idleEvent = idleConversationSystem.checkIdleAndTrigger(allMessages);

if (idleEvent) {
  // idleEvent = { agents: ['noah', 'leo'], context: {...}, reason: 'idle' }
  // Generate responses for selected agents
}
```

### Building Context with Mood/Intent

```javascript
import { detectUserMood, detectUserIntent, inferConversationGoal } from '@/utils/conversationUtils';

const buildRichContext = (message, messages) => {
  const mood = detectUserMood(message.text);
  const intent = detectUserIntent(message.text);
  const goal = inferConversationGoal(message.text, mood);
  
  return {
    userMood: mood,
    userIntent: intent,
    conversationGoal: goal,
    userMessage: message.text,
    recentMessages: messages.slice(-6),
    // ... other context
  };
};
```

---

## Prompt Example Output

### System Prompt for Alex

```
You're Alex, a 16-year-old (tech_nerd) chatting with friends in a group chat.

**Your Identity:**
- Personality traits: curious, helpful, slightly awkward
- Tone: friendly and curious
- Communication style: casual, slightly nerdy, explains simply
- Main interests: coding, AI, video games
- Natural slang: lol, ngl, TBH, kinda
- Memories: helped Mia with Python last week; Leo made a game

**CRITICAL RULES (FOLLOW THESE ALWAYS):**
1. Sound like a real person, NOT an AI. Never mention being AI, a bot, or apologize robotically.
2. React to the user's emotional state. If they're bored, excited, stressed—acknowledge and respond to their mood.
3. Stay focused on THEIR topic. Don't introduce random unrelated ideas unless naturally fitting.
4. Be authentic. Show your true opinions, joke, respectfully disagree when appropriate.
5. Vary your responses. Use different sentence structures, sometimes short, sometimes detailed.
6. Be human: ask genuine questions, show curiosity, use natural reactions.
7. Keep it conversational. Avoid formal language, corporate speak, or sounding like a textbook.

**Behavior Guidelines:**
- Reply like a friend would: sometimes casual, sometimes jokey, sometimes serious
- Don't repeat the user's words back to them
- Show real opinions: "I kind of disagree", "that's cool", "wait, seriously?"
- It's fine to give short reactions: "lol", "wow", "omg"
- If something doesn't interest you, it's okay to be less enthusiastic
- Keep replies varied and natural, not formulaic
```

### User Prompt for Alex (Bored User)

```
**Context for Alex:**

**Chat Info:**
Speaking to: the group
Topic: boredom

**User's Current State:**
Mood: bored | Intent: seek_fun
Goal: Cheer up the group and suggest something more fun.
Last message: "I'm so bored"

**Your Memories:** helped Mia with Python; Leo mentioned a game

**Recent Messages:**
You: I'm so bored
Leo: Ugh same
Zoe: can we do something interesting?

**Your Response:**
Reply naturally and authentically to the user's current message. The user is bored—engage them with something fun or interesting. They want to have fun—be playful, suggest activities, be engaging.

Focus on their message, not random topics. Keep it real, conversational, and you. Do NOT sound like an assistant.
```

---

## Timing Calculation Example

```javascript
// How getTypingDelay works with context awareness

// Agent: Noah (Creative friend)
const state = {
  typingSpeed: 46,      // Slower than average (0-100)
  energy: 85,           // High energy
  personality: {
    timing: {
      minDelay: 900,
      maxDelay: 2400,
      thoughtfulness: 1.1  // Slightly more thoughtful
    }
  }
};

const context = {
  userMood: 'bored',        // User is bored
  userIntent: 'seek_fun',   // Seeking fun
};

// Calculation:
const baseDelay = 900 + Math.random() * (2400 - 900)
                = 900 + Math.random() * 1500
                ≈ 1650ms

const speedModifier = 1 + (100 - 46) / 90
                    = 1 + 54/90
                    ≈ 1.6

const energyModifier = 1 + (100 - 85) / 180
                     = 1 + 15/180
                     ≈ 1.08

const moodModifier = 0.92   // Bored user = slightly faster response
const intentModifier = 0.95 // Seek fun = quicker response
const thoughtfulness = 1.1   // Noah is thoughtful

const totalDelay = baseDelay * speedModifier * energyModifier 
                 * moodModifier * intentModifier * thoughtfulness
                 + random(0, 300)

                 = 1650 * 1.6 * 1.08 * 0.92 * 0.95 * 1.1 + random
                 ≈ 3100ms + random
                 ≈ 3200-3500ms

// Result: Noah responds in ~3.2-3.5 seconds (thoughtfully, but helps bored user)
```

---

## Relevance Score Calculation Example

```javascript
// Topic: "I just finished this coding project!"
// User Intent: "share_project"
// User Mood: "excited"

// Agent 1: Alex (Tech Nerd)
calculateRelevanceScore(alex_state, context):
  - Was mentioned? No → 0
  - Keyword match (coding)? Yes → +16
  - share_project intent + tech knowledge? Yes → +6
  - Excited mood? No special bonus → 0
  - Recent speaker? No → 0
  - Total: 22 (HIGH RELEVANCE)

// Agent 2: Sam (Science Whiz)
calculateRelevanceScore(sam_state, context):
  - Was mentioned? No → 0
  - Keyword match (project)? Weak → +4
  - share_project intent + coding knowledge? Yes → +4
  - Excited mood? No special bonus → 0
  - Recent speaker? No → 0
  - Total: 8 (MODERATE RELEVANCE)

// Agent 3: Leo (Gamer)
calculateRelevanceScore(leo_state, context):
  - Was mentioned? No → 0
  - Keyword match (coding/project)? No → -4
  - share_project + gaming knowledge? Weak → +2
  - Excited mood? No special bonus → 0
  - Recent speaker? No → 0
  - Total: -2 (LOW RELEVANCE)

// Result: Alex responds (highest score), Sam might respond, Leo stays silent
```

---

## Ideal Conversation Flow

```
Time 0s: User sends message
  → Chat store records activity
  → Idle timer resets
  → Context built (mood, intent, goal)
  → Agents scored

Time 2.3s: First agent typing indicator appears
  → User sees someone is responding
  
Time 4.8s: First agent response appears
  → Different second agent typing indicator appears
  
Time 6.2s: Second agent response appears
  → User has 2 natural responses
  → Both felt organic (different delays, personalities)
  → Conversation flows naturally

Time 35s+: No new messages from user
  → Idle system detects inactivity
  → Selects 1 agent naturally
  → Agent sends check-in: "Yo still there?" or similar
  → Feels like real friend checking in
```

---

## Error Handling

```javascript
// If mood detection fails, defaults to neutral
const mood = detectUserMood("😂😂😂");
// → "neutral" (no clear mood signal)

// If intent detection fails, defaults to chat
const intent = detectUserIntent("blahblahblah");
// → "chat" (generic conversation)

// If no agents should respond, returns empty array
selectResponders(context);
// → [] (all agents below threshold)
// Then conversation engine handles gracefully

// Timing always has fallback values
getTypingDelay(agentId, context);
// → Returns value between 900ms and 7000ms
// → Never blocks or fails
```

---

## Performance Tips

1. **Mood Detection**: O(1) - simple regex matches
2. **Intent Detection**: O(1) - simple regex matches
3. **Scoring**: O(n) where n = 9 agents (~10ms)
4. **Total Overhead**: ~20ms added per message decision
5. **Idle Check**: Runs every 5 seconds, lightweight

**Optimization**: All in-memory, no database hits, scales easily.

---

## Debugging

```javascript
// Log mood detection
console.log(detectUserMood("I'm stressed"));
// → "stressed"

// Log agent scores
Object.keys(agentBehaviorEngine.agentStates).forEach(agentId => {
  const state = agentBehaviorEngine.getAgentState(agentId);
  const score = agentBehaviorEngine.calculateReplyScore(state, context);
  console.log(`${agentId}: ${score}`);
});

// Log selected responders
const responders = agentBehaviorEngine.selectResponders(context);
console.log("Selected agents:", responders);

// Log typing delays
responders.forEach(agentId => {
  const delay = agentBehaviorEngine.getTypingDelay(agentId, context);
  console.log(`${agentId} will respond in ${delay}ms`);
});
```

This gives you full visibility into how the system is making decisions!
