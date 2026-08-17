# Dart Tutor

Browser-based interactive Dart learning platform với objective testing, deterministic tutoring, và optional AI enhancement.

## Status

✅ **Phase 0 Complete** — Project setup  
⏭️ **Phase 1** — UI Shell (next)

## Quick Start

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Test
pnpm test

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Architecture

```
Browser
 ├─ Tutor UI (React)
 │   ├─ Lesson viewer
 │   ├─ Exercise editor
 │   ├─ Progress panel
 │   └─ Tutor feedback
 └─ DartPad iframe (sandboxed Dart execution)
          ↓
    Objective evaluation
          ↓
    Tutor State Machine
     ├─ Rule-based (deterministic)
     └─ LLM-based (optional, Phase 4)
```

## MVP Scope

**5 lessons**, **15 exercises**, objective tests, hints, progress tracking.

1. Dart Basics (variables, functions, interpolation)
2. Control Flow (if/else, loops, switch)
3. Functions + Null Safety
4. Collections (List, Set, Map)
5. Async/Await

## Key Principles

- ✅ Objective tests determine pass/fail (never LLM)
- ✅ Deterministic tutor works without AI
- ✅ Learner code runs in DartPad sandbox (browser-safe)
- ✅ Real events only (no fabricated data)
- ✅ AI optional, validated with Zod, falls back on error

## Documentation

- [`plan.md`](./plan.md) — Full implementation plan
- [`AI_AGENT_PROMPT.md`](./AI_AGENT_PROMPT.md) — Development guide
- [`apps/dart-tutor/IMPLEMENTATION_NOTES.md`](./apps/dart-tutor/IMPLEMENTATION_NOTES.md) — Technical notes

## Tech Stack

- **Frontend**: React 18 + Vite
- **Language**: TypeScript (strict mode)
- **Validation**: Zod
- **Testing**: Vitest
- **Linter**: Biome
- **Package Manager**: pnpm (workspace)

## License

MIT
