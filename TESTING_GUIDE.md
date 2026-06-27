# AI Group Chat - Testing Guide

## Quick Start: 3 Test Scenarios

### Test 1: Mood Detection & Responsive Agents
**Goal**: Verify agents react to user emotions

**Steps**:
1. Open the chat application
2. Type: `"I'm bored"`
3. Watch agent responses

**Expected**:
- Agents respond more quickly and eagerly
- Tone should be upbeat and engaging
- Examples of good responses:
  - "Same lol, want to do something fun?"
  - "Yo, we could try something random"
  - "Boredom = time for chaos 😂"

**Bad Responses (Should NOT See)**:
- "Boredom is a state of mind where..."
- "I understand you're experiencing boredom"
- Generic technical responses

---

### Test 2: Agent Specialization & Topic Focus
**Goal**: Verify agents respond to topics they care about

**Steps**:
1. Type: `"I just built an API with Node.js and it actually works!"`
2. Observe which agents respond first
3. Note the content of their responses

**Expected**:
- **Alex (Tech nerd)**: Should respond first or very quickly
  - "Yo that's awesome! What endpoints did you build?"
- **Sam (Science whiz)**: Might respond with curiosity
  - "Nice! What was the hardest part?"
- **Kai (Rebel)**: Might stay silent or give short reaction "that's cool dude"
- **Nia (Artsy poet)**: Likely stays silent (not interested in coding)

**Bad Pattern (Should NOT See)**:
- Nia giving detailed coding advice
- All 9 agents responding with equal enthusiasm
- Generic congratulations from everyone

---

### Test 3: Natural Response Timing
**Goal**: Verify responses are staggered, not simultaneous

**Steps**:
1. Type: `"How's everyone doing?"`
2. Watch the typing indicators carefully
3. Note the order and timing of responses
4. Open browser DevTools → Console to see timestamps

**Expected**:
- First agent types at ~2-3 seconds
- Second agent types at ~5-7 seconds  
- Typing indicators show at DIFFERENT times
- Messages arrive sequentially, not all at once

**Bad Pattern (Should NOT See)**:
- 3+ typing indicators appearing simultaneously
- All messages arriving within 1 second of each other
- Identical delays between all agents

---

## Detailed Test Cases

### Mood Detection Tests

#### Test A: Sad/Stressed Detection
```
User Input: "I'm really stressed about this deadline"

Check:
✓ Does mood show as "stressed" in context?
✓ Do agents acknowledge the stress?
✓ Are responses supportive, not dismissive?

Example Good Responses:
- Nia: "Hey, you got this. What's stressing you most?"
- Leo: "Yo, you need help? I'm in"
- Jade: "Take a step back. What's the priority?"

Example Bad Responses:
- "Stress is a physiological response..."
- "I am an AI and I understand stress..."
- Ignoring the emotional signal entirely
```

#### Test B: Excited Detection
```
User Input: "OMG I just got accepted to the internship!!!"

Check:
✓ Do agents match the excitement?
✓ Is the tone celebratory?
✓ Do agents congratulate/celebrate?

Example Good Responses:
- Leo: "YOOO THAT'S HUGE! Congrats bro!"
- Zoe: "OMG that's amazing!! 💖"
- Noah: "Yo that's fire, when do you start?"

Example Bad Responses:
- "Internships are valuable career experiences..."
- Flat tone, no excitement matching
- Clinical congratulations
```

#### Test C: Bored Detection
```
User Input: "This is so boring"

Check:
✓ Do agents try to re-engage?
✓ Are suggestions fun/interesting?
✓ Multiple agents respond (NOT silent)?

Example Good Responses:
- Noah: "Yo, want to do something wild?"
- Kai: "Random question... ever tried skateboarding?"
- Sam: "Wait, let me tell you about this wild experiment..."

Example Bad Responses:
- Silence (all agents miss the boredom signal)
- Boring responses to boredom complaint
- "Boredom affects motivation levels..."
```

---

### Relevance/Specialization Tests

#### Test A: Tech Topic
```
User Input: "What's the best way to optimize database queries?"

Expected Responders (in order):
1. Alex (coding: 80) - Should respond eagerly
2. Sam (science: 90) - Might respond with system thinking
3. Jade (strategy: 83) - Might respond with approach

Less Likely:
- Nia (artist) - Poetry focus, not databases
- Kai (skateboard) - No interest in databases
```

#### Test B: Art/Creative Topic
```
User Input: "I want to start painting"

Expected Responders:
1. Nia (art: 84) - Should respond enthusiastically
2. Noah (stories: 75) - Creative interest
3. Zoe (trends: 88) - Might engage socially

Less Likely:
- Sam (science focus, not art)
- Leo (gamer focus, not painting)
```

#### Test C: Music Topic
```
User Input: "Just discovered this new artist, they're insane"

Expected Responders:
1. Mia (music: 80) - Should respond with opinions
2. Noah (music: 70) - Creative interest
3. Leo (music: 82) - Should engage

Less Likely:
- Jade (books/strategy, not music focused)
```

---

### Timing & Stagger Tests

#### Test A: Response Delays Should Vary
```
User Input: "hey"

Watch for:
□ Typing indicator at ~1.5s for first agent
□ Different typing indicator at ~4s-6s for second agent (NOT same time)
□ Different typing indicator at ~7s-8s for third agent (if responding)

BAD PATTERN:
✗ Three typing indicators all appear at once
✗ All messages arrive within 1 second
✗ Identical 2.5s delay for every agent
```

#### Test B: Personality-Based Timing
```
Expected Delays (rough):
- Mia (quick responder): 1.5-3s
- Leo (energetic): 2-4s
- Jade (thoughtful): 3-5s
- Noah (creative, slower): 4-6s
- Nia (artistic, reflective): 5-7s
- Kai (laidback): 4-7s

Measure by opening DevTools → Performance or checking message timestamps
```

---

### Idle Detection Tests

#### Test A: 30+ Second Silence
```
Steps:
1. Type a message
2. Wait 30+ seconds WITHOUT typing
3. Watch for natural agent re-engagement

Expected at ~35-40s:
- One agent's typing indicator appears
- After ~2-4 seconds: Agent sends check-in message
- Example: "Yo, you still there?" or "Random thought..."

Check:
□ Only 1-2 agents respond (not all 9)
□ Message is casual, not formal
□ Doesn't interrupt if you start typing again
```

#### Test B: Idle Cooldown (60 seconds)
```
Steps:
1. Trigger idle event (wait 30s) → Agent A responds
2. Wait another 30 seconds
3. Check if another idle trigger happens

Expected:
□ NO second idle event (cooldown prevents spam)
□ Wait another 35+ seconds from first response
□ Then second idle event can trigger

Bad Pattern:
✗ Agents constantly breaking silence every 30s
✗ Multiple idle responses in short succession
```

#### Test C: Idle Cooldown Respect (Agent Availability)
```
Steps:
1. Wait for idle → Agent A responds
2. Wait 60 seconds from FIRST idle event (not from response)
3. Check next idle trigger

Expected:
□ Agent B gets a chance (not Agent A again immediately)
□ Different agent each idle cycle
□ Agents have individual cooldowns
```

---

### Conversation Focus Tests

#### Test A: User Topic Change
```
Step 1: Discuss Topic A (e.g., coding)
- Alex, Sam respond enthusiastically

Step 2: Abruptly change to Topic B (e.g., art)
- "Anyway, I started painting"

Expected:
✓ Agents switch focus to painting
✓ NEW agents (Nia, Noah) respond
✓ Previous agents (Alex, Sam) don't force coding back

Bad Pattern:
✗ Alex continues talking about coding
✗ Agents ignore the topic change
✗ Conversation feels disjointed
```

#### Test B: User-Initiated Questions
```
User: "Leo, what's your favorite game?"

Expected:
✓ Leo responds with personal opinion
✓ Response is about Leo's preferences
✓ Tone is casual and direct

Bad Pattern:
✗ Generic response about gaming
✗ Lecturing tone
✗ Ignoring the direct question
```

#### Test C: Follow User's Thread
```
Conversation:
User: "I'm stuck on this feature"
Agent A: "What's the issue?"
User: "The API is timing out"
Agent B: ??

Expected for Agent B:
✓ Address the TIMEOUT issue specifically
✓ Ask relevant follow-up questions
✓ Show they understood the previous context

Bad Pattern:
✗ Restarting the conversation from scratch
✗ Generic advice unrelated to timeouts
✗ Asking what the original problem was again
```

---

## Performance Metrics to Watch

### Positive Indicators ✓
- Responses vary from 1-7 seconds
- Not all typing indicators at once
- Mood-specific language in responses
- Different agents per topic
- Agents stay silent on non-matching topics
- Idle system engages after 30s silence
- Conversation feels organic and natural

### Red Flags ✗
- All messages arriving in <1s
- Every agent responding to every message
- All agents using similar language/tone
- Robotic or formal AI language
- Ignoring user mood signals
- No changes in response behavior per topic
- Idle system triggers constantly

---

## Chat Prompt Commands for Testing

### Quick Tests
```
"I'm bored" 
→ Should get upbeat, engaging responses

"OMG this is amazing!"
→ Should see celebratory, excited tone

"This is stressing me out"
→ Should see supportive, understanding responses

"I just built [tech thing]"
→ Tech agents (Alex, Sam) should engage

"Let's talk about art"
→ Nia should become more responsive

"Stop typing for 35 seconds"
→ Natural check-in message should appear
```

### Debug Commands (if available)
```
// Check mood detection
console.log(detectUserMood("I'm bored"))
// Expected: "bored"

// Check intent detection
console.log(detectUserIntent("I made a project"))
// Expected: "share_project"

// Check agent scores
console.log(agentBehaviorEngine.calculateReplyScore(agentState, context))
// Should vary 30-85 depending on agent/context
```

---

## Sign-Off Checklist

- [ ] Mood detection is working (bored/sad/excited all tested)
- [ ] Agent specialization is visible (tech agents on tech, etc.)
- [ ] Response timing is staggered (not simultaneous)
- [ ] Idle detection works (agents re-engage after 30s)
- [ ] Agents stay silent when not interested
- [ ] Agents use varied language and tones
- [ ] No robotic or AI-like language
- [ ] Conversation stays focused on user's current topic
- [ ] Personality differences are noticeable
- [ ] System feels like talking to real friends

If all checkboxes pass ✓, the system is functioning as designed!
