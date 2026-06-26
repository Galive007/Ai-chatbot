# 03 - Folder Architecture

> **Document Version:** 1.0
>
> **Purpose**
>
> This document defines the project's folder architecture, module responsibilities, dependency rules, and communication between different systems.
>
> Every source file must belong to a clearly defined architectural layer.
>
> No folder should become a "miscellaneous" dumping ground.

---

# 1. Architecture Philosophy

This project follows a **Domain-Driven Modular Architecture**.

Instead of organizing files by technology (components, hooks, utils, services), the project is organized by **business domains**.

Every domain owns its own logic and is responsible for a specific part of the application.

The architecture must satisfy the following principles:

* High cohesion
* Low coupling
* Single Responsibility Principle
* Separation of Concerns
* Easy scalability
* Easy replacement of individual systems
* AI-friendly project structure

Each folder should answer one question:

> **"What responsibility does this folder own?"**

---

# 2. High-Level Architecture

```text
UI Layer
    │
    ▼
Application Layer
    │
    ▼
Conversation Engine
    │
    ├──────────────┐
    ▼              ▼
Behavior      Memory Engine
    │              │
    └──────┬───────┘
           ▼
    Prompt Builder
           │
           ▼
      AI Provider
           │
           ▼
    Storage Layer
```

Every layer has a single responsibility.

---

# 3. Project Structure

```text
src/

├── app/
│
├── components/
│
├── conversation/
│
├── behavior/
│
├── memory/
│
├── providers/
│
├── storage/
│
├── services/
│
├── hooks/
│
├── store/
│
├── lib/
│
├── config/
│
├── constants/
│
├── utils/
│
├── styles/
│
└── assets/
```

---

# 4. Folder Responsibilities

---

## app/

The application's entry point.

Contains:

* App Router
* Layouts
* Route Groups
* API Routes
* Metadata
* Global Providers

Example:

```text
app/

layout.js

page.js

api/

chat/

provider/
```

Rules:

* Keep route files thin.
* Never place business logic here.
* API routes should delegate work to services.

---

## components/

Contains reusable UI components.

Examples:

```text
components/

chat/

message/

sidebar/

header/

input/

upload/

typing/

dialogs/

ui/
```

Rules:

* Components should only render UI.
* No AI logic.
* No storage logic.
* No memory logic.
* No prompt generation.

Good examples:

* Message Bubble
* Avatar
* Chat Input
* File Card
* Emoji Picker
* Typing Indicator

---

## conversation/

This is the heart of the application.

Responsible for managing conversations.

Suggested structure:

```text
conversation/

engine/

scheduler/

topic/

mentions/

summary/

context/

builder/
```

Responsibilities:

* Receive user messages
* Detect mentions
* Maintain message order
* Detect active topic
* Build conversation context
* Coordinate other engines

Must NOT:

* Call Gemini directly
* Read IndexedDB directly
* Render UI

---

## behavior/

Responsible for agent decisions.

Suggested structure:

```text
behavior/

engine/

mood/

energy/

cooldown/

relationship/

reply-score/

typing/
```

Responsibilities:

* Mood simulation
* Reply probability
* Typing delay
* Cooldowns
* Relationship updates
* Interest calculation

This layer decides:

> **Should this AI respond?**

---

## memory/

Responsible for long-term memory.

Suggested structure:

```text
memory/

shared/

agent/

summary/

history/

manager/
```

Responsibilities:

* Shared memory
* Agent memories
* Conversation summaries
* Topic history
* User preferences
* Memory updates

Must NOT generate responses.

---

## providers/

Responsible for AI providers.

Example:

```text
providers/

gemini/

groq/

manager/

base-provider.js
```

Responsibilities:

* Build requests
* Send requests
* Retry failures
* Parse responses

Every provider must expose the same interface.

Example:

```javascript
generateReply()

generateSummary()

generateMemory()
```

Never import provider SDKs outside this folder.

---

## storage/

Responsible for persistence.

Suggested structure:

```text
storage/

db/

repositories/

migrations/

cache/
```

Responsibilities:

* IndexedDB
* Dexie configuration
* Save messages
* Load messages
* Store files
* Restore memories

No UI component should communicate with IndexedDB directly.

Always use repositories.

---

## services/

Contains orchestration services.

Examples:

```text
services/

chat-service.js

upload-service.js

agent-service.js

memory-service.js
```

Services coordinate multiple domains.

Example:

```text
Conversation Engine

↓

Chat Service

↓

Behavior Engine

↓

Memory Engine

↓

Provider

↓

Storage
```

---

## hooks/

Contains reusable React hooks.

Examples:

```text
use-chat.js

use-upload.js

use-scroll.js

use-typing.js
```

Hooks should never contain core business logic.

They are adapters between React and the application.

---

## store/

Contains Zustand stores.

Example:

```text
chat-store.js

agent-store.js

ui-store.js
```

Stores hold runtime state only.

Never implement AI logic inside stores.

---

## lib/

Contains third-party wrappers.

Examples:

```text
dexie.js

fetch.js

logger.js

dayjs.js
```

This folder centralizes library configuration.

---

## config/

Application configuration.

Examples:

```text
providers.js

agents.js

environment.js

theme.js
```

Anything that behaves like configuration belongs here.

---

## constants/

Contains static values.

Examples:

```text
message-types.js

agent-status.js

colors.js

limits.js
```

Avoid magic numbers throughout the project.

---

## utils/

Pure helper functions.

Examples:

```text
format-date.js

truncate.js

debounce.js

file-size.js
```

Rules:

* No side effects.
* No API calls.
* No storage.
* No state management.

---

## styles/

Global styling.

Contains:

* globals.css
* animations.css
* variables.css

Tailwind should remain the primary styling solution.

---

## assets/

Static assets.

Examples:

* Avatars
* Icons
* Placeholder images
* Emoji assets

---

# 5. Dependency Rules

The dependency direction must always remain consistent.

```text
Components
      │
      ▼
Hooks / Services
      │
      ▼
Conversation Engine
      │
      ▼
Behavior Engine
      │
      ▼
Memory Engine
      │
      ▼
Providers
      │
      ▼
Storage
```

Reverse dependencies are forbidden.

Example:

❌ Storage importing React components.

❌ Providers importing UI.

❌ Components importing Gemini SDK.

---

# 6. Naming Conventions

Use lowercase kebab-case for files.

Examples:

```text
chat-input.jsx

message-bubble.jsx

conversation-engine.js

reply-scheduler.js
```

Folders should use nouns.

Examples:

```text
conversation/

behavior/

memory/

storage/
```

Avoid generic folder names like:

```text
misc/

temp/

new/

old/

helpers/
```

---

# 7. Scalability

The architecture must allow future migration to:

* Authentication
* MongoDB
* Cloud storage
* Multiple chat rooms
* Real-time collaboration
* Voice support

without requiring major restructuring.

Every folder should own a single responsibility so that future systems can be added without tightly coupling unrelated modules.

---

# 8. Summary

The folder architecture is designed around **business domains rather than technologies**.

Every module has a clearly defined responsibility, communicates through well-defined interfaces, and avoids direct dependencies on unrelated systems.

By following this structure, the application remains maintainable, scalable, and easy for both human developers and AI coding agents to understand and extend.
