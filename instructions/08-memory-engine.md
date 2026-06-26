# 08 - Memory Engine

> **Document Version:** 1.0
>
> **Purpose**
>
> The Memory Engine is responsible for managing everything that the AI participants remember throughout the lifetime of a conversation.
>
> Unlike the Conversation Engine, which manages the current discussion, the Memory Engine manages **knowledge accumulated over time**.
>
> The goal is to make every AI participant feel like a real person that remembers previous conversations, user preferences, relationships, and important events.

---

# 1. Philosophy

Real people remember.

They remember:

* Previous conversations
* Personal preferences
* Funny moments
* Things they've learned
* Relationships
* Shared experiences

Without memory, every conversation feels like starting over.

The Memory Engine exists to create continuity between conversations.

---

# 2. Responsibilities

The Memory Engine is responsible for:

* Storing shared memories
* Storing individual AI memories
* Updating conversation summaries
* Remembering user preferences
* Tracking important events
* Maintaining long-term context
* Compressing conversation history
* Deciding what to remember
* Deciding what to forget

The Memory Engine **does not**:

* Generate replies
* Decide who responds
* Build prompts
* Render UI
* Call AI providers directly

---

# 3. Position In Architecture

```text
Conversation Engine
        │
        ▼
Memory Engine
        │
        ├──────────────┐
        ▼              ▼
Shared Memory     Agent Memory
        │              │
        └──────┬───────┘
               ▼
Conversation Summary
               │
               ▼
Storage
```

---

# 4. Memory Philosophy

Not everything deserves to be remembered.

Just because a message exists does **not** mean it becomes memory.

The engine should remember only meaningful information.

Good memories:

* User likes Physics.
* Alex explained SHM yesterday.
* Mia enjoys anime.
* User's exam is next week.

Bad memories:

* User said "Hello."
* Alex replied "Okay."
* Someone sent 👍.

The goal is **quality over quantity**.

---

# 5. Memory Types

The Memory Engine maintains several independent memory systems.

---

## Shared Memory

Shared Memory is visible to every AI participant.

Examples:

* Current study topic
* User's favorite subjects
* Upcoming exam
* Group projects
* Previous discussions

Example

```text
User is studying Classical Mechanics.

Alex explained Newton's Laws.

Mia is still confused.

Everyone knows the exam is tomorrow.
```

---

## Agent Memory

Every AI has its own private memory.

Example

Alex remembers:

```text
User enjoys solving derivations.

User likes detailed explanations.
```

Mia remembers:

```text
User enjoys anime.

User uses many emojis.
```

No AI should automatically know another AI's private memory.

---

## Relationship Memory

Stores memories between AI participants.

Example

```text
Alex trusts Ethan.

Noah often jokes with Alex.

Mia likes discussing movies with Luna.
```

Relationship memories evolve slowly.

---

## User Memory

Stores information specifically about the user.

Examples:

* Favorite subjects
* Preferred explanation style
* Frequently asked topics
* Study goals

This memory is shared by all participants.

---

## Conversation Summary

Instead of storing thousands of messages in prompts, maintain a compressed summary.

Example

```text
The group spent the last hour discussing SHM.

Alex explained phase difference.

Mia asked beginner questions.

User understood amplitude but remained confused about angular frequency.
```

The summary is continuously updated.

---

# 6. Memory Hierarchy

The engine should prioritize memories.

```text
Critical

↓

Important

↓

Useful

↓

Temporary

↓

Disposable
```

Not every memory receives equal importance.

---

# 7. Memory Lifecycle

Every memory follows this lifecycle.

```text
Conversation

↓

Memory Candidate

↓

Importance Evaluation

↓

Approved

↓

Stored

↓

Updated

↓

Archived

↓

Forgotten
```

---

# 8. Memory Importance

The engine should assign an importance score.

Example:

```text
User's birthday

95
```

```text
Upcoming exam

90
```

```text
Favorite subject

85
```

```text
Today's weather

10
```

Only high-value memories should persist long-term.

---

# 9. Memory Extraction

After every completed conversation, the engine analyzes:

* New preferences
* New interests
* Important facts
* New relationships
* Long-term goals

These become memory candidates.

---

# 10. Memory Update Rules

Existing memories should be updated instead of duplicated.

Bad

```text
User likes Physics.

User likes Physics.

User likes Physics.
```

Good

```text
User consistently enjoys Physics.

Confidence: High
```

---

# 11. Memory Confidence

Every memory should maintain confidence.

Example

```text
User likes Math.

Confidence

35%
```

Later

```text
Confidence

90%
```

Repeated evidence increases confidence.

---

# 12. Forgetting System

Real people forget.

The Memory Engine should also forget.

Temporary memories should expire naturally.

Example:

```text
User is eating lunch.

```

This should disappear later.

Permanent preferences should remain.

---

# 13. Memory Categories

Suggested categories:

* Preferences
* Education
* Relationships
* Hobbies
* Personality
* Projects
* Goals
* Current Events
* Long-term Facts

This organization simplifies retrieval.

---

# 14. Memory Compression

Long conversations should not produce enormous memories.

Instead:

Many messages

↓

Few memories

Example

Twenty messages discussing calculus become:

```text
User is currently learning Calculus.

Alex successfully explained derivatives.

User still struggles with integration.
```

---

# 15. Conversation Summary

The Conversation Summary is separate from long-term memory.

Its purpose is prompt optimization.

Instead of sending:

500 messages

Send:

Conversation Summary

*

Recent Messages

This dramatically reduces token usage.

---

# 16. Recent Context

Always preserve a recent message window.

Example:

```text
Last 20 Messages
```

Recent context should always accompany summaries.

---

# 17. Memory Retrieval

Before an AI generates a reply, retrieve:

* Shared memory
* Agent memory
* User memory
* Conversation summary
* Recent messages

Only relevant memories should be supplied.

Avoid unnecessary context.

---

# 18. Memory Search

Search should prioritize:

* Current topic
* Mentioned participants
* User references
* Similar discussions

Memories unrelated to the current topic should remain unused.

---

# 19. Memory Consistency

Conflicting memories should be resolved.

Example

Old:

```text
User dislikes Physics.
```

New:

```text
User studies Physics every day.
```

The engine should update rather than accumulate contradictions.

---

# 20. Memory Privacy

Agent memories remain private.

Example

Alex remembers:

```text
User enjoys difficult derivations.
```

Mia should not automatically know this unless it becomes shared knowledge.

---

# 21. Relationship Growth

Relationships evolve over time.

Positive interactions:

Increase trust.

Arguments:

Decrease trust.

Helping another participant:

Strengthens relationships.

Relationships should change gradually.

---

# 22. Memory Limits

Unlimited memory eventually becomes inefficient.

The engine should:

* Merge duplicates
* Compress summaries
* Remove obsolete memories
* Archive rarely used information

---

# 23. Storage

The Memory Engine stores:

* Shared memory
* Agent memory
* Conversation summaries
* Relationship memories

Storage implementation belongs to the Storage Layer.

---

# 24. Provider Independence

The Memory Engine never depends on Gemini or Groq.

Instead:

```text
Memory Engine

↓

Prompt Builder

↓

Provider Manager

↓

AI Provider
```

The architecture remains provider-agnostic.

---

# 25. Error Handling

If memory generation fails:

* Continue conversation.
* Preserve existing memories.
* Retry later if appropriate.

The application should never lose previous memories because one update failed.

---

# 26. Future Expansion

Future versions may include:

* Emotional memories
* Memory confidence decay
* Seasonal memories
* Memory importance learning
* Memory visualization
* User-editable memories
* AI journals
* Shared group history

The current architecture should remain compatible.

---

# 27. Success Criteria

The Memory Engine is successful when:

* AI participants remember previous discussions.
* User preferences remain consistent.
* Long conversations remain efficient.
* Prompt sizes stay manageable.
* Memories evolve naturally.
* Irrelevant information is forgotten.
* Relationships develop over time.
* Each AI maintains its own unique perspective.

The objective is not to remember **everything**.

The objective is to remember the **right things**, creating the illusion that every AI participant has a genuine history with both the user and the rest of the group.
