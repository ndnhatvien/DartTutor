# Dart Tutor

Interactive Dart learning platform với DartPad execution, deterministic tutoring, optional LLM enhancement.

## 🎯 MVP Status

**Phase 0-4 Complete** ✅

- ✅ Phase 0: Project setup & monorepo structure
- ✅ Phase 1: UI shell (Lesson list, Exercise view, Progress panel)
- ✅ Phase 2: DartPad iframe integration
- ✅ Phase 3: Deterministic tutor (rule-based)
- ✅ Phase 4: Optional AI tutor (LLM with fallback)
- ⏭️ Phase 5: ACE integration (skipped)
- 🔄 Testing: Manual testing with DartPad

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser
# → http://localhost:3000
```

## 📖 Content

**Lesson 1: Dart Basics** (3 exercises)
1. String Interpolation
2. Final vs Const
3. Greeting Function (optional parameters)

## ✨ Features

### Core Features
- **DartPad Integration**: Real Dart code execution in browser (sandboxed)
- **Objective Testing**: Tests determine pass/fail (not LLM opinion)
- **Progressive Hints**: Gentle → Strong → Diagnostic
- **State Machine**: NEW → ATTEMPTED → FAILURE → PASSED → MASTERED
- **Learner Persistence**: localStorage tracks progress
- **Misconception Detection**: 10 patterns (nullable access, string concat, etc.)

### Optional AI
- **LLM Tutor**: Anthropic Claude API (when configured)
- **Automatic Fallback**: Falls back to rule-based on error
- **Zero Config**: Works without API key (rule-based only)

## 🏗️ Architecture

```
Browser
 ├─ Tutor UI (React)
 │   ├─ LessonList
 │   ├─ ExerciseView
 │   └─ ProgressPanel
 ├─ DartPad iframe (https://dartpad.dev/embed-inline.html)
 └─ LearnerStateManager (localStorage)

Tutor Engine
 ├─ HybridTutorProvider
 │   ├─ LLMTutorProvider (optional)
 │   └─ RuleBasedTutorProvider (fallback)
 └─ State Machine + Misconception Detection
```

## 🛠️ Development

### Commands

```bash
pnpm dev          # Dev server (http://localhost:3000)
pnpm build        # Production build
pnpm test         # Run tests (40 tests)
pnpm lint         # Lint with Biome
pnpm type-check   # TypeScript check
```

### Tech Stack

- **Frontend**: React 18 + Vite
- **Language**: TypeScript (strict mode)
- **Validation**: Zod
- **Testing**: Vitest
- **Linter**: Biome
- **Package Manager**: pnpm (workspace)

## 🔧 Configuration

### Optional AI Tutor

Create `.env`:

```env
VITE_TUTOR_AI_ENABLED=true
VITE_TUTOR_API_BASE_URL=https://api.anthropic.com/v1
VITE_TUTOR_API_KEY=sk-ant-...
VITE_TUTOR_MODEL=claude-sonnet-4-20250514
```

**Cost**: ~$0.0045 per interaction with Claude Sonnet 4

**Security**: API key visible in browser during development. For production, move LLM calls to backend.

## 📊 Testing

### Unit Tests (40 tests)

```bash
pnpm test
```

- 1 baseline test
- 8 evaluator tests (test output parsing)
- 20 tutor tests (state machine + misconceptions)
- 11 ai-tutor tests (config + schemas)

### Manual Testing

See [`TESTING.md`](./TESTING.md) for comprehensive checklist:
- UI navigation
- DartPad execution
- Tutor feedback
- State persistence
- Error handling
- Accessibility

## 📝 Documentation

- [`plan.md`](../../plan.md) — Full implementation plan
- [`IMPLEMENTATION_NOTES.md`](./IMPLEMENTATION_NOTES.md) — Technical notes
- [`DARTPAD_INTEGRATION.md`](./DARTPAD_INTEGRATION.md) — DartPad iframe docs
- [`AI_TUTOR.md`](./AI_TUTOR.md) — LLM integration docs
- [`TESTING.md`](./TESTING.md) — Testing checklist

## 🔒 Security

✅ **Safe**:
- DartPad runs in sandboxed iframe
- No Node eval/Function execution
- Zod validation on external data
- API keys in `.env` (not committed)

⚠️ **Limitations**:
- API key visible in browser DevTools (dev mode)
- localStorage only (no backend auth)

## 🐛 Known Limitations

### DartPad
- postMessage API unofficial (may change)
- Test output parsing heuristic-based
- No way to extract edited code yet
- ~30s timeout imposed by DartPad

### Storage
- localStorage only (cleared on browser reset)
- No export/import yet
- No multi-device sync

### Content
- Only 1 lesson (3 exercises) in MVP
- No video/images in lessons yet

## 🎯 Definition of Done (MVP)

From `plan.md`:

- [x] 1 lesson với 3 exercises (MVP scope)
- [x] Every exercise has objective tests
- [x] Every exercise has >=2 hints and solution
- [x] DartPad works or reports unavailable state
- [x] Deterministic tutor works without AI
- [x] AI output is schema validated
- [x] Real events only drive learner progress
- [x] Solution hidden by default
- [x] No unsafe learner-code execution
- [x] Tests pass (40 tests)
- [x] Docs complete
- [ ] Manual testing complete (in progress)

## 📦 Build

```bash
pnpm build
```

**Output**:
- `dist/index.html` — 0.32 KB
- `dist/assets/*.js` — 229.54 KB (68.75 KB gzipped)

**Total**: ~69 KB gzipped

## 🚢 Deployment

### Static Hosting

Deploy `apps/dart-tutor/dist/` to:
- Vercel
- Netlify
- GitHub Pages
- Cloudflare Pages

**Config**:
- Build command: `pnpm build`
- Output directory: `apps/dart-tutor/dist`
- Node version: 20+

### Environment Variables

Set in hosting platform:
- `VITE_TUTOR_AI_ENABLED`
- `VITE_TUTOR_API_KEY` (if AI enabled)

## 📄 License

MIT

## 🙏 Credits

- **DartPad**: https://dartpad.dev
- **Anthropic Claude**: https://anthropic.com
- **React**: https://react.dev
- **Vite**: https://vitejs.dev
