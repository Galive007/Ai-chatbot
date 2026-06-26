# 04 - UI Design System

> **Document Version:** 1.0
>
> **Purpose**
>
> This document defines the complete design language of the application, including colors, typography, spacing, components, animations, interaction principles, and user experience guidelines.
>
> Every screen should follow these design principles to ensure consistency throughout the application.

---

# 1. Design Philosophy

The application should feel like a modern messaging platform while maintaining its own identity.

The interface should be:

* Clean
* Modern
* Minimal
* Friendly
* Comfortable for long conversations
* Fast
* Distraction-free

The chat experience should always remain the primary focus.

The design should emphasize readability over decoration.

---

# 2. Design Principles

The UI should follow these principles:

### Simplicity

Avoid unnecessary visual elements.

Only display information that benefits the conversation.

---

### Consistency

Buttons, cards, icons, spacing, and typography should behave consistently across the application.

---

### Accessibility

Maintain sufficient color contrast.

Interactive elements should be easy to identify.

Use semantic HTML whenever possible.

---

### Motion With Purpose

Animations should communicate state changes rather than simply decorate the interface.

Examples:

* Opening a menu
* Uploading a file
* AI typing
* New message arrival

---

### Focus On Conversation

Messages should always receive the highest visual priority.

The interface should never compete with the conversation.

---

# 3. Theme

Version 1 should support both:

* Light Theme
* Dark Theme

Dark mode should be the default.

---

# 4. Color Palette

Use CSS variables for all colors.

Never hardcode colors inside components.

Example:

```css
--background
--foreground

--primary
--secondary

--muted

--accent

--border

--card

--success

--warning

--danger
```

---

## Message Colors

User messages:

* Primary color
* White text

AI messages:

* Card background
* Foreground text

System messages:

* Muted colors

Typing indicator:

* Accent color

---

# 5. Typography

Use a single font family throughout the application.

Recommended:

```text
Geist
```

Fallback:

```text
Inter
```

Typography hierarchy:

```text
Heading

↓

Section Title

↓

Chat Username

↓

Message

↓

Timestamp

↓

Caption
```

Messages should remain highly readable.

Avoid extremely small fonts.

---

# 6. Spacing System

Use a consistent spacing scale.

Example:

```text
4px

8px

12px

16px

20px

24px

32px

40px

48px
```

Avoid arbitrary spacing values.

---

# 7. Border Radius

Modern rounded design.

Example:

```text
Buttons

12px

Cards

16px

Dialogs

20px

Message Bubbles

18px

Images

14px
```

---

# 8. Shadows

Use subtle shadows.

Avoid strong floating effects.

Primary use cases:

* Dialogs
* Dropdowns
* Context menus

Chat messages should not rely on heavy shadows.

---

# 9. Layout

Desktop layout:

```text
+------------------------------+
| Sidebar |     Chat Area       |
|         |                     |
|         |                     |
|         |                     |
|         |                     |
+------------------------------+
```

Sidebar width:

Approximately:

```text
300px
```

Chat area should fill remaining space.

---

# 10. Chat Layout

Every message contains:

```text
Avatar

Username

Message

Timestamp
```

Messages should align naturally.

User messages:

Right side.

AI messages:

Left side.

System messages:

Centered.

---

# 11. Message Bubble

Every bubble contains:

* Text
* Files
* Images
* Videos
* Replies
* Reactions

Maximum width:

Approximately:

```text
70%
```

Messages should wrap naturally.

---

# 12. Message Animation

New messages should animate smoothly.

Recommended:

* Fade
* Slight upward movement

Avoid exaggerated animations.

---

# 13. Typing Indicator

Typing indicator should mimic real messaging applications.

Example:

```text
Alex is typing...

```

Multiple users:

```text
Alex and Mia are typing...

```

or

```text
Alex, Mia and Ethan are typing...
```

The indicator should disappear immediately after the message is sent.

---

# 14. Input Area

Contains:

* Text input
* Emoji button
* Attachment button
* Send button

Input should automatically expand for multiple lines.

Maximum height should remain limited.

---

# 15. Sidebar

Contains:

* Group avatar
* Group name
* Participants
* Search
* Settings

Future versions may include multiple chat rooms.

The layout should already accommodate future expansion.

---

# 16. AI Participant Card

Each AI participant should display:

* Avatar
* Name
* Online status
* Typing status (optional)
* Short description

Clicking a participant may open their profile in future versions.

---

# 17. Attachments

Images:

Display thumbnail.

Videos:

Display thumbnail with play icon.

Other files:

Display as cards.

Example:

```text
📄 Physics Notes.pdf

```

```text
📦 Project.zip

```

```text
📘 Report.docx
```

---

# 18. Emoji Reactions

Reactions appear below messages.

Example:

```text
👍 ❤️ 😂 🔥
```

Hovering should display who reacted.

Future versions may support AI-generated reactions.

---

# 19. Reply Preview

Replying to a message should display:

* Original sender
* Short preview
* Reply indicator

This behavior should resemble WhatsApp or Discord.

---

# 20. Scroll Behavior

The application should:

* Auto-scroll for new user messages.
* Preserve scroll position when loading history.
* Avoid sudden jumps.

---

# 21. Empty State

When no conversation exists:

Display:

* Illustration
* Welcome message
* Short explanation

Avoid empty screens.

---

# 22. Loading States

Use skeleton loaders where appropriate.

Examples:

* Messages
* Sidebar
* Participant list

Avoid large spinners whenever possible.

---

# 23. Error States

Errors should appear as lightweight notifications.

Examples:

* Upload failed.
* API unavailable.
* File too large.

The interface should never become unusable because of an error.

---

# 24. Animations

Animations should be subtle.

Recommended durations:

```text
150ms

200ms

250ms

300ms
```

Avoid slow interfaces.

---

# 25. Icons

Use Lucide icons consistently.

Do not mix multiple icon libraries.

---

# 26. Responsiveness

Desktop is the primary target.

Tablet support:

Required.

Mobile support:

Basic support for Version 1.

Future versions may optimize mobile interactions.

---

# 27. Component Philosophy

Every UI component should be:

* Reusable
* Self-contained
* Accessible
* Small
* Easy to understand

Avoid components with multiple unrelated responsibilities.

---

# 28. Future Design Considerations

The design system should allow future support for:

* Multiple themes
* Custom accent colors
* User avatars
* Animated emojis
* Voice messages
* Rich embeds
* Collaborative workspaces

The visual foundation should remain flexible enough to support future expansion.

---

# 29. Summary

The design system prioritizes clarity, consistency, and conversation-focused interaction.

Every interface decision should improve readability, reduce distractions, and create the feeling of using a polished modern messaging application.

Visual simplicity should always take precedence over unnecessary decoration.

The interface should disappear into the background, allowing the conversation itself to become the center of the user experience.
