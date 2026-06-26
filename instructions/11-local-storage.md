# 11 - Local Storage

> **Document Version:** 1.0
>
> **Purpose**
>
> This document defines how application data is stored, retrieved, updated, and managed locally.
>
> Version 1 follows a **Local-First Architecture**, meaning every conversation, memory, attachment, and AI state exists entirely inside the user's browser.
>
> No cloud storage or database server is required.

---

# 1. Philosophy

The application should work entirely without user authentication.

Every user has their own local conversation.

Closing the browser must **not** delete the chat history.

The application should feel like using a messaging app whose data is permanently stored on the user's device.

Storage should be:

* Fast
* Reliable
* Asynchronous
* Scalable
* Independent from the UI

---

# 2. Storage Technology

Version 1 uses:

* IndexedDB
* Dexie.js

Reasons:

* Large storage capacity
* File support
* Asynchronous operations
* Object storage
* Better performance than LocalStorage
* Suitable for future expansion

Cookies and LocalStorage should **not** be used for conversation data.

---

# 3. Storage Architecture

```text
UI

↓

Services

↓

Repositories

↓

Dexie

↓

IndexedDB
```

React components should never communicate directly with IndexedDB.

---

# 4. Repository Pattern

Every storage operation must pass through repositories.

Example

```text
Chat Service

↓

Chat Repository

↓

IndexedDB
```

Never write:

```javascript
db.messages.add(...)
```

inside React components.

---

# 5. Repository Structure

```text
storage/

├── db/
│   ├── dexie.js
│   └── schema.js
│
├── repositories/
│   ├── chat-repository.js
│   ├── memory-repository.js
│   ├── agent-repository.js
│   ├── settings-repository.js
│   └── file-repository.js
│
└── cache/
```

Every repository owns one responsibility.

---

# 6. Chat Repository

Responsible for:

* Save messages
* Delete messages
* Edit messages
* Load history
* Search messages
* Reactions
* Replies

It should never manage memories.

---

# 7. Memory Repository

Responsible for:

* Shared memories
* Agent memories
* Conversation summaries
* User preferences
* Memory updates

It should never store messages.

---

# 8. Agent Repository

Responsible for runtime AI state.

Example:

* Mood
* Energy
* Confidence
* Cooldown
* Relationships
* Last reply time
* Activity level

Personality definitions remain inside configuration files.

Only runtime values are stored here.

---

# 9. File Repository

Responsible for:

* Images
* Videos
* Documents
* File metadata

The repository should generate unique identifiers for every uploaded file.

---

# 10. Settings Repository

Stores user preferences.

Examples:

* Theme
* Accent color
* Selected provider
* Preferred model
* Sidebar state
* UI preferences

Settings should survive page refreshes.

---

# 11. Database Schema

Suggested tables:

```text
messages

memories

agents

files

settings

conversation_summary
```

Every table should have a clearly defined responsibility.

---

# 12. Messages Table

Stores:

* Text
* Attachments
* Replies
* Mentions
* Reactions
* Status
* Timestamp

Messages should remain immutable whenever possible.

Edits should update only editable fields.

---

# 13. Memories Table

Stores:

* Shared memories
* Private memories
* Confidence
* Category
* Importance

This table powers long-term conversations.

---

# 14. Agents Table

Stores runtime state.

Example:

```text
Agent ID

Mood

Energy

Cooldown

Last Reply

Relationship State

Typing Speed
```

Personality should not be duplicated here.

---

# 15. Files Table

Stores:

* File ID
* Name
* Size
* MIME Type
* Blob
* Upload Time
* Thumbnail (optional)

Images and videos remain entirely local.

---

# 16. Settings Table

Stores application preferences.

Example:

```text
Dark Mode

Current Provider

Current Model

Sidebar Width

Notification Preferences
```

---

# 17. Conversation Summary

Store only the latest summary.

Whenever the Memory Engine creates a new summary:

Replace the previous summary.

There should never be multiple active summaries.

---

# 18. Storage Flow

Saving follows this sequence.

```text
User Action

↓

Service

↓

Repository

↓

Dexie

↓

IndexedDB
```

Loading follows the reverse order.

---

# 19. Startup Flow

When the application opens:

```text
Initialize Database

↓

Load Settings

↓

Load Messages

↓

Load Memories

↓

Load Agents

↓

Load Summary

↓

Render UI
```

The user should immediately continue where they left off.

---

# 20. Save Strategy

Save data immediately after successful operations.

Examples:

* Message sent
* File uploaded
* Memory updated
* Mood changed
* Settings changed

Avoid delaying persistence.

---

# 21. Search

Searching should occur locally.

Searchable items:

* Messages
* File names
* User names
* Memory categories

No server communication is required.

---

# 22. File Storage

Attachments should remain inside IndexedDB.

Supported:

* Images
* Videos
* PDFs
* Documents
* ZIP files

Never upload files to external storage in Version 1.

---

# 23. Performance

Avoid loading every message into memory.

Recommended strategy:

Load recent history first.

Load older messages on demand.

Future versions may support virtualization.

---

# 24. Cache Layer

Frequently accessed data may remain in memory.

Examples:

* Current conversation
* Active summary
* Runtime agent state

The cache should synchronize with IndexedDB.

IndexedDB remains the source of truth.

---

# 25. Synchronization

Whenever data changes:

```text
Update Runtime

↓

Update Repository

↓

Persist

↓

Notify UI
```

Avoid multiple sources of truth.

---

# 26. Error Recovery

If saving fails:

* Preserve runtime state.
* Retry when appropriate.
* Notify the user only if necessary.

The application should never lose messages because of temporary failures.

---

# 27. Versioning

The database schema should support version upgrades.

Example:

```text
Version 1

↓

Version 2

↓

Migration

↓

Updated Database
```

Dexie migrations should handle schema changes safely.

---

# 28. Clearing Data

Provide a future option to clear:

* Chat history
* Memories
* Files
* Settings

Each operation should be independent.

Avoid deleting everything unintentionally.

---

# 29. Future Migration

The Repository Pattern allows migration to:

* MongoDB
* PostgreSQL
* Supabase
* Firebase

without changing:

* Chat System
* Conversation Engine
* Behavior Engine
* Memory Engine

Only repository implementations should change.

---

# 30. Security

Version 1 stores everything locally.

No personal information leaves the browser except AI prompts sent to the selected provider.

API keys must never be stored inside IndexedDB.

Sensitive configuration remains on the server.

---

# 31. Backup Strategy

Future versions may support:

* Export conversation
* Import conversation
* Backup as JSON
* Backup as Markdown
* Backup as PDF

The current storage model should support these features.

---

# 32. Storage Boundaries

The Storage Layer should never:

* Generate AI responses
* Decide behavior
* Modify personalities
* Render UI
* Build prompts

Its responsibility is persistence only.

---

# 33. Success Criteria

The Local Storage system is considered successful when:

* Conversations survive browser refreshes.
* AI memories persist across sessions.
* Attachments remain accessible.
* Runtime agent states are restored correctly.
* Search works locally.
* Data loading is fast.
* Storage remains independent from application logic.
* Future migration to cloud databases requires minimal changes.

The Local Storage layer should function as the application's permanent memory, ensuring that every conversation and every AI participant retains continuity without requiring authentication or external databases.
