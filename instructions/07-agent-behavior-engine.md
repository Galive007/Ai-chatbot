# 07 - Agent Behavior Engine

> **Document Version:** 1.0
>
> **Purpose**
>
> The Agent Behavior Engine is responsible for making every AI participant behave like an independent person rather than a chatbot.
>
> It determines **whether an AI should respond, when it should respond, how it should respond, and when it should remain silent.**
>
> This engine never generates text itself. It only makes behavioral decisions.
>
> The generated text is handled later by the Prompt Builder and AI Provider.

---

# 1. Philosophy

The goal of the Behavior Engine is realism.

The application should never feel like several AI models taking turns replying.

Instead, every AI participant should behave like a real member of a group chat.

Every participant has:

* Personality
* Mood
* Energy
* Interests
* Relationships
* Knowledge
* Confidence
* Communication habits

No participant is required to respond simply because a new message exists.

Silence is considered natural behavior.

---

# 2. Responsibilities

The Behavior Engine is responsible for:

* Selecting participants
* Deciding who ignores a message
* Calculating reply probability
* Managing moods
* Managing energy
* Managing cooldowns
* Managing relationships
* Scheduling typing
* Simulating realistic conversation

The engine is **not responsible** for:

* Prompt generation
* AI text generation
* Memory storage
* UI rendering
* Storage

---

# 3. Position In Architecture

```text
Conversation Engine
        │
        ▼
Behavior Engine
        │
        ├─────────────┐
        ▼             ▼
Reply Decision    Typing Schedule
        │             │
        └──────┬──────┘
               ▼
        Prompt Builder
```

The Behavior Engine decides behavior.

Everything else follows those decisions.

---

# 4. Agent State

Every AI participant maintains a runtime state.

Example

```javascript
{
    mood: 78,
    energy: 64,
    confidence: 82,
    curiosity: 55,
    attention: 73,
    cooldown: 0,
    lastReplyAt: Date,
    typingSpeed: 42,
    activityLevel: 61
}
```

These values continuously change.

---

# 5. Personality

Every AI has a permanent personality.

Example

```text
Alex

Friendly

Physics Enthusiast

Logical

Confident

Long explanations

Uses 🙂
```

Personality never changes.

It should remain recognizable throughout every conversation.

---

# 6. Runtime State

Unlike personality, runtime state changes constantly.

Examples:

* Happy
* Tired
* Excited
* Distracted
* Curious

Runtime state influences decisions.

---

# 7. Decision Pipeline

Every incoming message follows this pipeline.

```text
New Message

↓

Mention Detection

↓

Interest Analysis

↓

Knowledge Analysis

↓

Relationship Check

↓

Mood

↓

Energy

↓

Cooldown

↓

Confidence

↓

Random Variation

↓

Reply Score

↓

Decision
```

The engine should execute this pipeline for every participant.

---

# 8. Mention Rule

Mentions override nearly every decision.

Example

```
@Alex
```

Alex must respond.

Exceptions:

* API failure
* Internal errors

Other participants continue using the normal algorithm.

---

# 9. Interest Score

Every AI stores interests.

Example

```text
Alex

Physics

Math

Astronomy
```

If the topic matches:

Reply score increases.

If unrelated:

Reply score decreases.

---

# 10. Knowledge Score

Every AI has different expertise.

Example

```text
Alex

Physics

95
```

```text
Mia

Physics

25
```

High knowledge increases response probability.

Low knowledge encourages silence or questions.

---

# 11. Mood System

Mood affects willingness to participate.

Example

```text
0-20

Very Low
```

```text
20-40

Low
```

```text
40-60

Normal
```

```text
60-80

Positive
```

```text
80-100

Very Positive
```

Mood changes after conversations.

---

# 12. Energy System

Energy represents willingness to speak.

High energy:

* More replies
* Faster responses
* More interactions

Low energy:

* Short replies
* More silence
* Longer delays

---

# 13. Cooldown System

Every reply creates a cooldown.

Example

```
Alex replied.

↓

Cooldown

20 seconds
```

Cooldown prevents spam.

Mention overrides cooldown.

---

# 14. Confidence

Confidence affects response style.

High confidence:

* Gives answers
* Explains
* Leads discussions

Low confidence:

* Asks questions
* Uses uncertain language
* Lets others answer

---

# 15. Curiosity

Curiosity determines whether an AI asks follow-up questions.

High curiosity:

```
Really?

How?

Why?
```

Low curiosity:

Reads without replying.

---

# 16. Attention

Attention measures engagement with the current topic.

Low attention:

May ignore messages.

High attention:

Actively participates.

---

# 17. Relationship System

Every AI has relationship scores with other participants.

Example

```
Alex → Mia

Friendliness: 82
```

```
Alex → Noah

Friendly Rival: 67
```

Relationships influence:

* Mentions
* Jokes
* Agreements
* Disagreements

Relationships should evolve slowly.

---

# 18. Reply Score

Every AI calculates a final score.

Example

```
Knowledge

+25

Interest

+20

Mood

+15

Energy

+10

Confidence

+5

Cooldown

-25

Random

+4

Final

54
```

Higher scores increase reply probability.

---

# 19. Random Variation

Perfect predictability feels robotic.

A small random factor should influence decisions.

Randomness should never dominate the algorithm.

Suggested range:

```
-10

to

+10
```

---

# 20. Silence

Silence is a valid response.

Possible outcomes:

* Ignore
* React
* Reply
* Ask question
* Mention another participant

Ignoring should occur frequently.

---

# 21. Reply Types

Participants do not always generate full messages.

Possible actions:

```
Ignore

↓

Emoji Reaction

↓

Short Reply

↓

Normal Reply

↓

Question

↓

Mention Another AI
```

This variation creates realism.

---

# 22. Emoji Behavior

Some personalities frequently use emojis.

Others rarely do.

Emoji usage belongs to personality.

Not mood.

---

# 23. Typing Decision

Typing should only begin after the AI decides to respond.

Pipeline:

```
Reply Decision

↓

Typing

↓

Generate Response

↓

Send
```

The UI displays typing only after approval.

---

# 24. Typing Duration

Typing duration depends on:

* Message length
* Typing speed
* Personality

Example

```
Hi!

0.8 sec
```

```
200 words

7 seconds
```

Typing should include small randomness.

---

# 25. Interruption Handling

While typing:

Another participant may respond first.

The Behavior Engine decides whether:

* Continue
* Cancel
* Rewrite

This creates natural conversations.

---

# 26. Conversation Dominance

No participant should dominate the conversation.

The engine should monitor:

* Recent replies
* Reply frequency
* Speaking balance

Participants who recently replied receive lower priority.

---

# 27. Agreement & Disagreement

Participants should not always agree.

Possible reactions:

* Agree
* Slightly disagree
* Correct
* Joke
* Ignore

Differences create believable conversations.

---

# 28. Topic Switching

If a topic matches an AI's interests:

Participation increases.

If not:

Participation naturally decreases.

---

# 29. Conversation Initiation

AI participants may occasionally begin conversations.

Examples

```
How is everyone's day?

```

```
Anyone studying today?

```

These events should be rare.

---

# 30. Group Awareness

Every AI knows:

* Who spoke
* Who replied
* Who was mentioned
* Current topic
* Conversation flow

Participants should never behave as if isolated.

---

# 31. Anti-Robotic Rules

Never allow:

* Every AI replying
* Identical response lengths
* Identical typing delays
* Identical greetings
* Repeated wording
* Perfect agreement

Variation is required.

---

# 32. Behavioral Limits

The Behavior Engine should never:

* Change personality
* Generate text
* Modify memories
* Access storage
* Access UI

It only makes decisions.

---

# 33. Future Expansion

Future versions may include:

* Emotional growth
* Friend groups
* Conflicts
* Favorite users
* Dynamic interests
* Daily moods
* Time-based behavior
* Sleeping schedules
* Holiday behavior

The architecture should support these additions.

---

# 34. Success Criteria

The Behavior Engine is successful when users naturally begin treating AI participants as individual people.

The conversation should feel unpredictable while remaining coherent.

Users should never be able to accurately predict:

* Who will reply
* When they will reply
* Whether they will reply
* How long they will type
* Who they will mention

The engine should produce conversations that resemble real group chats rather than sequential AI responses.

The ultimate objective is not intelligence—it is **believability**.
