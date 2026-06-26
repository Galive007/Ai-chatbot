# 05 - Chat System

> **Document Version:** 1.0
>
> **Purpose**
>
> This document defines how the chat system functions from both the user's perspective and the application's internal architecture.
>
> It specifies the complete lifecycle of a message, supported message types, user interactions, file handling, message rendering, and behavioral rules.
>
> This document does **not** define AI decision-making. AI behavior is covered in later documents.

---

# 1. Overview

The Chat System is the core interaction layer of the application.

Its responsibility is to create a messaging experience similar to modern applications such as WhatsApp, Discord, Messenger, and Telegram while supporting AI participants.

The Chat System should only manage **communication**, not intelligence.

Conversation decisions belong to the Conversation Engine.

AI personality belongs to the Behavior Engine.

Memory belongs to the Memory Engine.

---

# 2. Primary Responsibilities

The Chat System is responsible for:

* Displaying messages
* Sending messages
* Receiving messages
* Rendering attachments
* Managing replies
* Managing mentions
* Managing reactions
* Typing indicators
* Scroll behavior
* Message grouping
* File uploads
* Local persistence integration

---

# 3. Chat Lifecycle

Every message follows the same lifecycle.

```text
User Types Message
        │
        ▼
Input Validation
        │
        ▼
Create Message Object
        │
        ▼
Render User Message
        │
        ▼
Save Message
        │
        ▼
Conversation Engine
        │
        ▼
Receive AI Responses
        │
        ▼
Render AI Messages
        │
        ▼
Persist Everything
```

The user message should appear immediately.

The application should never wait for AI responses before rendering the user's message.

---

# 4. Supported Message Types

The system must support multiple message types.

## Text

Standard conversation.

Example

```text
Hello everyone!
```

---

## Image

Supported formats:

* jpg
* jpeg
* png
* webp
* gif

Display:

Thumbnail preview.

Clicking opens a larger preview.

---

## Video

Supported formats:

* mp4
* webm
* mov

Display:

Video thumbnail with play button.

---

## File

Examples:

```text
📄 homework.pdf

📘 physics.docx

📦 project.zip
```

Only file name, size, and icon are displayed.

---

## System Message

Example

```text
Conversation restored.

Storage synchronized.

Alex joined.
```

Displayed differently from normal messages.

---

# 5. Message Object

Every message should contain the following information.

```javascript
{
  id,
  senderId,
  senderType,
  content,
  attachments,
  mentions,
  replyTo,
  reactions,
  timestamp,
  edited,
  deleted,
  status
}
```

The structure should remain extensible.

---

# 6. Message Status

Messages may have different states.

Possible states:

```text
Sending

Sent

Failed
```

Because Version 1 is local-first, "Delivered" and "Seen" are unnecessary.

---

# 7. Sending Messages

When the user presses Enter or clicks Send:

1. Validate input.
2. Create message.
3. Display message immediately.
4. Save locally.
5. Notify Conversation Engine.

The UI should remain responsive even if the AI request fails.

---

# 8. Editing Messages

Version 1:

Only user messages may be edited.

Editing AI messages is not allowed.

When edited:

* Update message
* Preserve timestamp
* Display "(edited)"

---

# 9. Deleting Messages

Deleting removes the message locally.

Conversation history should be updated accordingly.

AI memories should **not** automatically change.

Memory synchronization is handled by the Memory Engine.

---

# 10. Reply System

Users can reply to existing messages.

Every reply stores the referenced message ID.

Rendering:

```text
┌───────────────────
│ Alex
│ "Use Newton's Law"
└───────────────────

I agree.
```

Reply previews should remain compact.

---

# 11. Mention System

Supported syntax:

```text
@Alex

@Mia
```

Mentions should:

* Highlight visually.
* Store participant IDs.
* Notify Conversation Engine.

Mention detection should not depend on AI.

---

# 12. Emoji Reactions

Supported reactions include:

👍

❤️

😂

🔥

😮

😢

Additional emojis may be supported later.

Users and AI participants can react.

Multiple participants may react to the same message.

---

# 13. File Uploads

Supported files include:

Images

Videos

PDF

Word

Excel

PowerPoint

ZIP

TXT

Other documents

Files should remain local.

No cloud upload.

---

# 14. Attachment Rendering

Images:

Display preview.

Videos:

Display thumbnail.

Other files:

Display file card.

Example

```text
📄 Calculus Notes.pdf

2.4 MB
```

---

# 15. Image Viewer

Clicking an image opens:

* Larger preview
* Zoom
* Close button

No editing features.

---

# 16. Drag and Drop

The chat should support drag-and-drop uploads.

Dragging files over the chat area should display a drop indicator.

---

# 17. Clipboard Support

Users should be able to paste:

* Images
* Text

Future versions may support additional clipboard content.

---

# 18. Message Grouping

Consecutive messages from the same sender should appear grouped.

Example

```text
Alex

Hello.

How are you?

Need help?
```

Instead of repeating the avatar every time.

Grouping improves readability.

---

# 19. Date Separators

Messages from different days should display separators.

Example

```text
──────────────

Yesterday

──────────────
```

---

# 20. Auto Scroll

When the user sends a message:

Automatically scroll to the bottom.

When reading older messages:

Do not interrupt reading.

If new messages arrive while the user is reading history:

Display

```text
↓ New Messages
```

instead of forcing scrolling.

---

# 21. Typing Indicator

The Chat System only displays typing indicators.

It does not decide who types.

Behavior Engine decides.

Examples:

```text
Alex is typing...
```

```text
Alex and Mia are typing...
```

Typing indicators should disappear immediately after sending.

---

# 22. Loading Older Messages

Older messages should load incrementally.

Avoid rendering extremely large conversations all at once.

Future implementations may use virtualization.

---

# 23. Search

Users should be able to search:

* Text
* File names
* User names

Search should remain local.

---

# 24. Empty Messages

Empty messages are invalid.

Whitespace-only messages should not be sent.

---

# 25. Maximum Length

Define reasonable limits.

Example:

Message:

4,000 characters.

Longer messages should be rejected gracefully.

---

# 26. Keyboard Shortcuts

Recommended shortcuts:

Enter

Send message.

Shift + Enter

New line.

Escape

Close dialogs.

Ctrl + F

Search chat.

---

# 27. Error Handling

Possible errors:

* Unsupported file
* File too large
* Upload failed
* AI unavailable

Errors should appear as lightweight notifications.

Never block the interface.

---

# 28. Persistence

Every successful operation should be persisted.

Including:

* Messages
* Replies
* Reactions
* Attachments
* Edit history

Persistence implementation belongs to the Storage Layer.

---

# 29. Future Features

Future versions may include:

* Voice messages
* Message forwarding
* Polls
* Pinned messages
* Threaded replies
* Multiple rooms
* Shared conversations
* Cloud synchronization

The current architecture should remain compatible with these additions.

---

# 30. Responsibilities

The Chat System is responsible for **communication mechanics**.

It is **not responsible** for:

* AI personality
* AI decision-making
* Mood simulation
* Conversation memory
* Prompt generation
* Provider communication

Those responsibilities belong to later architectural layers.

---

# 31. System Boundaries

The Chat System communicates with the following modules.

```text
Chat UI
    │
    ▼
Chat System
    │
    ├──────────────┐
    ▼              ▼
Storage      Conversation Engine
```

The Chat System should never communicate directly with AI providers.

All AI interactions must pass through the Conversation Engine.

---

# 32. Success Criteria

The Chat System is considered complete when it satisfies the following conditions:

* Messages appear instantly after sending.
* Attachments render correctly.
* Replies function reliably.
* Mentions are detected accurately.
* Typing indicators display correctly.
* Messages persist across browser sessions.
* Search functions correctly.
* Auto-scroll behaves naturally.
* The interface remains responsive regardless of AI response time.

The Chat System should provide a polished messaging experience independent of the AI systems built on top of it.
