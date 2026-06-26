# 13 - Coding Guidelines

> **Document Version:** 1.0
>
> **Purpose**
>
> This document defines the coding standards, architectural rules, naming conventions, and development practices that must be followed throughout the project.
>
> The objective is to keep the codebase maintainable, scalable, readable, and AI-friendly.
>
> Every contributor—human or AI—must follow these guidelines.

---

# 1. Core Philosophy

Code should be written for humans first.

Good code should be:

* Readable
* Predictable
* Modular
* Reusable
* Testable
* Maintainable

Avoid writing clever code.

Write obvious code.

The next developer should understand a file within a few minutes.

---

# 2. General Principles

Always prefer:

* Simplicity over cleverness
* Readability over brevity
* Composition over duplication
* Explicitness over assumptions
* Small focused modules over large files

---

# 3. Single Responsibility Principle

Every file should have **one primary responsibility**.

Examples:

Good

```text
chat-input.jsx

typing-indicator.jsx

message-card.jsx
```

Bad

```text
chat-utils-final-new.js
```

Avoid files that solve unrelated problems.

---

# 4. File Size

Recommended limits:

Components

```text
< 300 lines
```

Hooks

```text
< 200 lines
```

Services

```text
< 300 lines
```

Utility files

```text
< 150 lines
```

If a file grows beyond these limits, consider splitting it.

---

# 5. Function Size

Functions should perform one task.

Recommended:

```text
10–40 lines
```

Large functions usually indicate multiple responsibilities.

---

# 6. Naming Conventions

Folders

```text
conversation

behavior

memory

storage
```

Files

```text
chat-input.jsx

reply-scheduler.js

agent-service.js
```

Variables

```javascript
currentTopic

replyQueue

selectedAgents
```

Constants

```javascript
MAX_MESSAGE_LENGTH

DEFAULT_TYPING_SPEED
```

Avoid abbreviations.

Bad

```javascript
ctx

msg

tmp
```

Good

```javascript
conversationContext

message

temporaryMessage
```

---

# 7. Component Guidelines

Components should:

* Render UI
* Receive props
* Emit events

Components should **not**:

* Call AI providers
* Access IndexedDB
* Build prompts
* Update memories

Components should remain as "dumb" as possible.

---

# 8. Service Guidelines

Services coordinate domains.

Example:

```text
Chat Service

↓

Conversation Engine

↓

Behavior Engine

↓

Memory Engine
```

Services may call multiple modules.

They should not contain presentation logic.

---

# 9. Repository Guidelines

Repositories own persistence.

Repositories should never:

* Update UI
* Build prompts
* Generate AI responses

Repositories expose CRUD operations only.

---

# 10. Utility Guidelines

Utilities must be:

* Pure
* Stateless
* Reusable

Good examples:

* Date formatting
* File size formatting
* String truncation
* Debounce

Utilities must never:

* Access storage
* Call APIs
* Modify application state

---

# 11. State Management

React State

Use for:

* Inputs
* Dialogs
* Hover state
* Local UI

---

Zustand

Use for:

* Runtime application state
* Active conversation
* Typing indicators
* Current topic

---

IndexedDB

Use for:

Persistent data.

Never duplicate persistent data unnecessarily.

---

# 12. Separation of Concerns

Every layer owns one responsibility.

```text
UI

↓

Services

↓

Conversation

↓

Behavior

↓

Memory

↓

Prompt

↓

Provider

↓

Storage
```

Never skip layers.

---

# 13. Import Rules

Allowed:

```text
Components

↓

Hooks

↓

Services

↓

Engines

↓

Storage
```

Forbidden:

Storage importing Components.

Providers importing UI.

Behavior importing React Components.

Conversation importing UI.

Dependencies should always point downward.

---

# 14. Error Handling

Never ignore errors.

Always:

* Catch
* Log
* Recover when possible

Avoid empty catch blocks.

Bad

```javascript
try {

} catch {}
```

Good

```javascript
try {

} catch (error) {

logger.error(error)

}
```

---

# 15. Async Code

Always use:

```javascript
async

await
```

Avoid deeply nested Promise chains.

Example:

Good

```javascript
const response = await provider.generateReply();
```

Bad

```javascript
provider.generateReply().then(...).then(...).catch(...)
```

---

# 16. Magic Numbers

Avoid:

```javascript
if(score > 73)
```

Instead

```javascript
const REPLY_THRESHOLD = 70;
```

Constants improve readability.

---

# 17. Comments

Code should explain itself.

Use comments to explain **why**, not **what**.

Bad

```javascript
// Increment i

i++;
```

Good

```javascript
// Prevent duplicate replies from recently active participants
```

---

# 18. Logging

Development logging is encouraged.

Examples:

* Provider requests
* Response times
* Conversation flow
* Errors

Avoid excessive console logging in production.

Consider a centralized logger.

---

# 19. Configuration

Hardcoded values should become configuration.

Examples:

* Typing speed
* Cooldown duration
* Reply threshold
* API timeout

Configuration should remain centralized.

---

# 20. Constants

Avoid scattering identical values.

Store them inside:

```text
constants/

limits.js

provider.js

animation.js
```

---

# 21. Code Duplication

Duplicate logic should be extracted.

Rule:

Write once.

Reuse everywhere.

Copy-paste should be a last resort.

---

# 22. Composition

Prefer composing small modules instead of creating large ones.

Example

Instead of:

```text
ChatManager
```

Prefer

```text
Conversation Engine

Behavior Engine

Memory Engine

Prompt Builder
```

Small modules are easier to maintain.

---

# 23. Defensive Programming

Assume external data may be invalid.

Always validate:

* User input
* API responses
* File uploads
* Storage data

Never trust external sources.

---

# 24. Performance

Optimize only after correctness.

Avoid premature optimization.

However:

* Memoize expensive calculations.
* Avoid unnecessary renders.
* Lazy-load large modules.
* Keep prompts efficient.

---

# 25. Accessibility

Every interactive component should support:

* Keyboard navigation
* Focus states
* Semantic HTML
* ARIA labels where appropriate

Accessibility is part of quality.

---

# 26. Git Commit Messages

Recommended format:

```text
feat(chat): add reply system

fix(memory): resolve summary duplication

refactor(storage): simplify repositories

docs(prompt): update prompt template
```

Keep commits focused.

---

# 27. Pull Request Checklist

Before merging:

* Code works.
* No lint errors.
* No unused imports.
* No console logs.
* Documentation updated.
* Architecture preserved.

---

# 28. AI Development Rules

When an AI coding agent contributes to the project, it must:

* Respect folder architecture.
* Avoid unnecessary dependencies.
* Never modify unrelated files.
* Preserve modularity.
* Follow naming conventions.
* Prefer reusable solutions.

AI-generated code should be reviewed before acceptance.

---

# 29. Forbidden Practices

Do **not**:

* Create "misc" folders.
* Use global mutable variables.
* Mix UI and business logic.
* Hardcode API keys.
* Duplicate business logic.
* Skip architectural layers.
* Introduce unnecessary dependencies.

These practices increase technical debt.

---

# 30. Refactoring

Refactor whenever:

* Code becomes repetitive.
* Responsibilities become unclear.
* Files become too large.
* Naming becomes confusing.

Refactoring should preserve behavior.

---

# 31. Documentation

Every major module should include:

* Purpose
* Responsibilities
* Dependencies

Complex algorithms should include brief explanatory comments.

Architecture documentation must remain synchronized with implementation.

---

# 32. Testing Mindset

Every feature should be tested manually before completion.

Ask:

* Does it work?
* Does it break existing features?
* Does it follow architecture?
* Is it reusable?

Testing should be continuous, not postponed.

---

# 33. Future Compatibility

Write code assuming the project will eventually support:

* Authentication
* Cloud synchronization
* Multiple chat rooms
* Real-time collaboration
* Mobile applications
* Additional AI providers

Avoid making decisions that prevent future expansion.

---

# 34. Definition of Done

A feature is complete only when:

* Functionality works correctly.
* Architecture is respected.
* Code is readable.
* Naming is consistent.
* No unnecessary complexity exists.
* Documentation is updated.
* No major known bugs remain.

---

# 35. Final Principle

The quality of this project will not be determined by the number of features it contains.

It will be determined by:

* The clarity of its architecture.
* The consistency of its implementation.
* The maintainability of its code.
* The realism of its conversations.

Every line of code should contribute toward building a modular, scalable, and believable AI group chat system.

When faced with multiple implementation choices, prefer the one that improves long-term maintainability, even if it requires slightly more work today.
