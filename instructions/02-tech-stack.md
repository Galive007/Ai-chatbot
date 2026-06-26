# 02 - Tech Stack & Architecture

> **Document Version:** 1.0
>
> **Purpose**
>
> This document defines the technologies, architecture, coding principles, and dependency rules used throughout the project.
>
> Every implementation should follow this document unless explicitly overridden by future documentation.

---

# 1. Philosophy

Technology should always serve the architecture.

Libraries are chosen because they solve a specific problem while keeping the project modular, maintainable, and scalable.

The application should avoid unnecessary complexity.

Every dependency must have a clear purpose.

If a feature can be implemented with native browser APIs or the existing framework without significantly increasing complexity, avoid introducing additional packages.

---

# 2. Technology Stack

## Framework

Next.js (App Router)

Purpose:

* Routing
* Server Components
* API Routes
* Optimized bundling
* Production-ready architecture

The project should use the App Router exclusively.

Do not use the Pages Router.

---

## Language

JavaScript

Reason:

The project intentionally uses JavaScript to reduce development overhead.

The architecture must still follow strong modular design even without TypeScript.

---

## Styling

Tailwind CSS

Purpose:

* Utility-first styling
* Fast UI development
* Consistent spacing
* Responsive layouts

Avoid writing large custom CSS files.

Component-specific styling should remain close to the component whenever possible.

---

## UI Components

shadcn/ui

Purpose:

* Accessible UI
* Reusable components
* Modern design system
* Easy customization

The project should treat shadcn components as a starting point rather than a finished design.

Customization is encouraged.

---

## Icons

lucide-react

Purpose:

* Consistent icon system
* Lightweight
* Easily customizable

---

## State Management

Zustand

Purpose:

* Global application state
* Selected chat
* Agent runtime states
* Typing indicators
* UI preferences

Avoid placing business logic inside Zustand stores.

Stores should primarily hold state and expose simple actions.

---

## Local Database

IndexedDB

Accessed through:

Dexie.js

Purpose:

* Chat history
* Files
* Memories
* Conversation summaries
* Agent states
* Cached AI responses

Never interact with IndexedDB directly from React components.

Always use a repository layer.

---

## AI Providers

Supported providers:

* Gemini API
* Groq API

The application should never directly depend on one provider.

All providers must implement the same interface.

Example:

```text
generateResponse()

generateSummary()

generateMemory()

generateReaction()
```

Future providers should require minimal integration work.

---

## File Upload

Native browser File API

Purpose:

* Images
* Videos
* Documents

No cloud storage in Version 1.

Files remain inside IndexedDB.

---

## Utilities

Recommended libraries:

* clsx
* tailwind-merge
* nanoid
* react-dropzone

Only install additional libraries if they solve a meaningful architectural problem.

---

# 3. High-Level Architecture

The application should follow a layered architecture.

```text
Presentation Layer

↓

Application Layer

↓

Conversation Layer

↓

Behavior Layer

↓

Memory Layer

↓

Provider Layer

↓

Persistence Layer
```

Every layer should have a single responsibility.

---

# 4. Layer Responsibilities

## Presentation Layer

Contains:

* pages
* layouts
* components
* dialogs
* sidebars
* chat UI

Responsibilities:

* Rendering UI
* User interactions
* Displaying state

Must never:

* call AI providers directly
* manipulate memory directly
* access IndexedDB directly

---

## Application Layer

Contains:

* hooks
* stores
* controllers

Responsibilities:

* Coordinate features
* Dispatch actions
* Connect UI with engines

Acts as the bridge between the interface and business logic.

---

## Conversation Layer

Contains:

Conversation Engine.

Responsibilities:

* Receive new messages
* Determine current topic
* Maintain message order
* Track mentions
* Build conversation context

Should not generate AI responses.

---

## Behavior Layer

Contains:

Agent Behavior Engine.

Responsibilities:

* Mood
* Energy
* Confidence
* Interest
* Reply probability
* Typing simulation
* Cooldowns
* Relationship calculations

This layer decides WHO speaks.

---

## Memory Layer

Contains:

Memory Engine.

Responsibilities:

* Shared memory
* Individual memories
* Conversation summaries
* Topic history

This layer decides WHAT should be remembered.

---

## Provider Layer

Contains:

AI Providers.

Responsibilities:

* Prompt generation
* API requests
* Retry logic
* Error handling

This layer converts application state into prompts.

---

## Persistence Layer

Contains:

Repositories.

Responsibilities:

* Save data
* Load data
* Delete data
* Cache data

Only this layer should know how IndexedDB works.

---

# 5. Architectural Principles

Every major feature should be isolated.

Good separation is more important than reducing file count.

Large files should be split.

Small focused modules are preferred.

---

# 6. Folder Philosophy

Folders should represent responsibilities rather than technologies.

Bad example

```text
hooks/

utils/

helpers/

services/
```

These become dumping grounds.

Instead prefer

```text
conversation/

behavior/

memory/

providers/

storage/

chat/

upload/
```

Every folder should represent a domain.

---

# 7. State Management Rules

React State

Use for:

* input text
* dialog visibility
* hover effects
* temporary UI

---

Zustand

Use for:

* current conversation
* runtime agent state
* active typing users
* application settings

---

IndexedDB

Use for:

* persistent data

Never duplicate persistent data inside Zustand unless it is actively being used.

---

# 8. AI Provider Abstraction

Never write:

```javascript
import { GoogleGenerativeAI } from "...";
```

inside components.

Instead

```text
Conversation Engine

↓

Provider Manager

↓

Gemini Provider

or

Groq Provider
```

Every provider should expose identical methods.

Changing providers should require changing only one configuration value.

---

# 9. Error Handling Philosophy

Every AI request may fail.

The application should gracefully recover.

Possible failures include:

* API limit reached
* Network failure
* Timeout
* Invalid response
* Empty response

The UI should never crash because an AI request fails.

---

# 10. Performance Philosophy

Avoid unnecessary rendering.

Only update components affected by changes.

Memoize expensive calculations.

Conversation summaries should reduce prompt size.

Avoid repeatedly processing the full message history.

---

# 11. Security Philosophy

Version 1 is local-first.

Never expose API keys to the browser.

All AI requests should pass through Next.js API routes.

Client

↓

Next.js Route Handler

↓

AI Provider

↓

Response

This keeps provider implementations centralized.

---

# 12. Scalability Goals

The architecture should allow future migration to:

* MongoDB
* PostgreSQL
* Authentication
* Cloud storage
* Real-time collaboration

without changing business logic.

Repositories should hide storage implementation details.

---

# 13. Dependency Rules

Every dependency must satisfy at least one of these conditions:

* Improves maintainability.
* Significantly reduces complexity.
* Improves accessibility.
* Improves performance.

Avoid dependencies that only save a few lines of code.

---

# 14. Coding Standards

Prefer composition over inheritance.

Prefer pure functions.

Avoid deeply nested components.

Avoid global mutable state.

Keep functions focused.

Prefer descriptive names over abbreviations.

One file should ideally have one primary responsibility.

---

# 15. Repository Pattern

Every storage operation should pass through repositories.

Bad

```text
Component

↓

IndexedDB
```

Correct

```text
Component

↓

Chat Service

↓

Repository

↓

IndexedDB
```

If storage changes in the future, only repositories should require modification.

---

# 16. Service Layer

Every external interaction belongs inside services.

Examples:

* AI Service
* Upload Service
* Memory Service
* Conversation Service

Components should never perform complex business logic.

---

# 17. Future Compatibility

Every major system should be replaceable.

Examples:

Replace

Gemini

↓

Groq

without changing conversation logic.

Replace

IndexedDB

↓

MongoDB

without changing UI.

Replace

Current Behavior Engine

↓

Improved Behavior Engine

without modifying components.

Loose coupling is a primary architectural goal.

---

# 18. Development Mindset

This project is not a chatbot.

It is a simulation of a social group powered by multiple AI agents.

The architecture should reflect that distinction.

Conversation quality is more important than response quantity.

Believable behavior is more important than perfect answers.

The software should be designed as a collection of independent systems working together rather than a single monolithic application.

Every future document in this project builds upon the architectural principles defined here.
