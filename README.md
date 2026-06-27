# AI Group Chat Application

A realistic multi-agent AI group chat simulation using Next.js, React, Zustand, and Dexie with support for Google Gemini and Groq AI providers.

## Features

### ✅ Completed
- **Chat Interface**: Modern, responsive messaging UI with auto-scroll
- **Local Storage**: IndexedDB persistence with Dexie
- **User Messaging**: Send, edit, delete, and react to messages
- **Reply System**: Quote and reply to specific messages
- **Mentions**: Tag agents with @mentions (@Alex, @Mia, @Noah)
- **Reactions**: Add emoji reactions to messages
- **Fixed Composer**: Input area stays pinned while messages scroll

### 🤖 AI & Agent Systems
- **Multi-Agent Support**: Nine distinct AI personalities
- **Agent Behavior Engine**: Personality-driven decision making
  - Mood system: Affects willingness to respond
  - Energy system: Determines response frequency
  - Cooldown system: Realistic reply delays
  - Knowledge expertise: Topic-specific expertise
  - Confidence levels: Affects reply probability

- **Conversation Engine**: Central orchestrator
  - Topic detection
  - Mention detection
  - Context building
  - Agent selection for responses
  - Response scheduling

- **Prompt Builder**: Personality-aware prompt generation
  - System prompts tailored to each agent
  - Context-aware user prompts
  - Dynamic prompt engineering

- **Memory Engine**: Agent memory management
  - Fact retention
  - Relationship tracking
  - Expertise updates
  - Interaction history

- **AI Providers**:
  - Google Gemini (default)
  - Groq (alternative)
  - Fallback mock responses if no API key

### 📊 Analytics
- Conversation engagement tracking
- Agent participation metrics
- Session statistics

## Setup

### Prerequisites
- Node.js 18+ and npm
- (Optional) Google Gemini API key
- (Optional) Groq API key

### Installation

```bash
# Clone or navigate to the project
cd new

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your API keys (optional)
# GEMINI_API_KEY=your_key_here
# GROQ_API_KEY=your_key_here
```

### Running the App

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000` in your browser.

## Architecture

### Frontend
- **React 19**: Component-based UI
- **Tailwind CSS**: Styling
- **Zustand**: Global state management
- **Dexie**: Local IndexedDB management

### Backend
- **Next.js 16**: App Router
- **API Routes**: `/api/chat` endpoint
- **Agents**: Three AI participants

### Key Services
- `agentBehaviorEngine.js`: Agent personality and decision logic
- `conversationEngine.js`: Message orchestration
- `promptBuilder.js`: Prompt generation
- `providerManager.js`: AI provider abstraction
- `memoryEngine.js`: Agent memory management
- `conversationAnalytics.js`: Session analytics

## Usage

### Sending Messages
1. Type your message in the input box
2. Press Enter or click Send
3. The app automatically:
   - Saves your message locally
   - Selects responding agents based on topic/engagement
   - Shows typing indicators
   - Generates agent responses with personality

### Mentioning Agents
```
@Alex explain this physics problem
@Mia, what do you think?
Both @Alex and @Noah, your thoughts?
```

Mentioned agents are prioritized to respond.

### Using Different AI Providers

Edit `.env.local`:
```env
# Use Gemini (default)
NEXT_PUBLIC_AI_PROVIDER=gemini
GEMINI_API_KEY=your_key

# Or use Groq
NEXT_PUBLIC_AI_PROVIDER=groq
GROQ_API_KEY=your_key
```

## Agent Personalities

### Alex - Physics Expert
- **Traits**: Friendly, logical, confident, detailed
- **Interests**: Physics, math, astronomy, problem-solving
- **Style**: Lengthy explanations with examples
- **Emoji**: 🙂

### Mia - Study Buddy
- **Traits**: Supportive, organized, empathetic, practical
- **Interests**: Studying, note-taking, motivation, group-work
- **Style**: Concise, supportive, asks clarifying questions
- **Emoji**: 💪

### Noah - Creative Thinker
- **Traits**: Creative, curious, humorous, unconventional
- **Interests**: Creative problem-solving, design, storytelling, fun-facts
- **Style**: Creative analogies, humor, occasional puns
- **Emoji**: ✨

## Development Phases

1. ✅ Project Foundation
2. ✅ UI Foundation
3. ✅ Chat System
4. ✅ Local Storage
5. ✅ AI Provider Integration
6. ✅ Conversation Engine
7. ✅ Agent Behavior Engine
8. 🚧 Memory Engine (In Progress)
9. 📋 Advanced Features (Future)

## Future Enhancements

- [ ] Persistent memory across sessions
- [ ] Custom agent creation
- [ ] Learning from conversation history
- [ ] Advanced natural language processing
- [ ] File sharing and attachments
- [ ] Voice message support
- [ ] Multi-conversation management
- [ ] Export conversation history
- [ ] Custom AI model support

## Configuration

### Agent Configuration
Modify agent personalities in `src/services/agentBehaviorEngine.js`:

```javascript
export const AGENT_CONFIG = {
  alex: {
    name: 'Alex',
    personality: { /* ... */ },
    initialState: { /* mood, energy, etc */ }
  },
  // ...
}
```

### API Timeout
Adjust in `src/services/providerManager.js` and individual provider classes.

### Message History Limit
Modify context building in `src/services/conversationEngine.js`.

## Troubleshooting

### "No API response"
1. Check `.env.local` has valid API key
2. Verify API key permissions
3. Check network connection
4. App falls back to mock responses automatically

### "Messages not persisting"
1. Clear browser storage and refresh
2. Check IndexedDB in DevTools
3. Verify Dexie is initialized

### "Agents not responding"
1. Check Conversation Engine logs in console
2. Verify agent selection logic isn't filtering all agents
3. Check reply score calculations

## Development

### Building
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### File Structure
```
src/
├── app/               # Next.js routes
├── components/        # React components
├── services/          # Business logic
├── store/            # Zustand stores
├── storage/          # Database layer
├── utils/            # Utilities
├── constants/        # Constants
└── styles/           # Global styles
```

## License

MIT

## Support

For issues or suggestions, open an issue in the repository.
