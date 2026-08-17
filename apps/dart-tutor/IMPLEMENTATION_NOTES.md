# Dart Tutor — Implementation Notes

**Date**: 2026-08-17  
**Phase**: 0 — Reconnaissance & Project Setup

## Project Structure

```
dart-tutor-monorepo/
├── apps/
│   └── dart-tutor/           # Main application
│       ├── src/
│       │   ├── api/          # Backend API
│       │   ├── content/      # Content loading
│       │   ├── evaluator/    # Exercise evaluation
│       │   ├── learner/      # Learner state management
│       │   ├── tutor/        # Tutor engine (rules + optional AI)
│       │   └── ui/           # React UI components
│       ├── content/
│       │   └── lessons/      # Lesson content (JSON/TS)
│       ├── tests/            # Tests
│       └── package.json
├── packages/                  # Shared packages (future)
├── package.json               # Root package
├── pnpm-workspace.yaml
├── tsconfig.json
└── biome.json
```

## Technology Stack

### Core
- **Runtime**: Node.js v24.19.0
- **Package Manager**: pnpm 11.21.0
- **Language**: TypeScript 5.6.3
- **Module System**: ESM

### Frontend
- **Framework**: React 18.3.1
- **Build Tool**: Vite 5.4.11
- **UI**: Plain React (no UI library yet)

### Backend (Future)
- Will determine after Phase 1 (Express vs. Fastify vs. built-in server)

### DartPad Integration
- **Embed URL**: `https://dartpad.dev/embed-inline.html`
- **Method**: iframe with postMessage API
- **Execution**: Dart code runs in DartPad sandbox (browser-safe)

### Testing
- **Test Runner**: Vitest 2.1.8
- **Environment**: jsdom (for React components)

### Code Quality
- **Linter/Formatter**: Biome 1.9.4
- **Type Checking**: TypeScript strict mode
- **Validation**: Zod 3.23.8 (for runtime validation)

## Constraints & Safety

### Security
1. ✅ No learner code execution with Node eval/Function
2. ✅ DartPad iframe provides sandboxed execution
3. ⚠️ API keys must never reach browser (Phase 4)
4. ⚠️ Validate all external/LLM data with Zod (Phase 4)

### Correctness
1. ✅ Objective tests drive pass/fail (never LLM opinion)
2. ✅ Real events only → no fabricated learner data
3. ✅ Deterministic tutor must work without AI

### Compatibility
1. ✅ No existing ACE core to preserve (standalone project)
2. ✅ ACE integration is optional (Phase 5, future)
3. ✅ CI rules will be added, not weakened

## Reusable Infrastructure

### From Vite + React Ecosystem
- Hot module replacement
- TypeScript + JSX support
- Dev server with proxy capability
- Production build optimization

### From Biome
- Fast linting (<100ms for this codebase)
- Auto-formatting
- No ESLint/Prettier complexity

## Proposed Files (MVP)

### Phase 1 (UI Shell)
```
src/ui/
  App.tsx
  LessonList.tsx
  ExerciseView.tsx
  ProgressPanel.tsx
src/content/
  types.ts              # Lesson, Exercise interfaces
  loader.ts
content/lessons/
  basics.json           # Lesson 1 content
```

### Phase 2 (DartPad)
```
src/ui/
  DartPadEmbed.tsx      # iframe wrapper
src/evaluator/
  types.ts              # ExerciseResult
  dartpad-adapter.ts    # postMessage integration
```

### Phase 3 (Deterministic Tutor)
```
src/tutor/
  types.ts              # TutorProvider, TutorContext
  state-machine.ts      # NEW → ATTEMPTED → PASSED
  rule-based-provider.ts
  misconceptions.ts     # Deterministic diagnosis
```

### Phase 4 (AI Optional)
```
src/tutor/
  llm-provider.ts
  schemas.ts            # Zod schemas
.env.example
```

## Risks & Unknowns

### DartPad Integration
**Risk**: Iframe postMessage API may be unofficial/unstable  
**Mitigation**:
- Use only documented embed parameters
- Implement explicit `unavailable` state
- Document exact DartPad behavior observed
- Add integration tests with timeout

**Risk**: Cannot observe detailed test output from DartPad  
**Mitigation**:
- Require test code to use `expect()` with clear messages
- Parse console output if available
- Fall back to pass/fail/error only

### Learner State Persistence
**Risk**: MVP uses localStorage → data loss on browser clear  
**Mitigation**:
- Document limitation
- Phase 2+ can add backend persistence
- Export/import JSON for backup

### AI Provider
**Risk**: LLM may return invalid JSON or unsafe content  
**Risk**: LLM may hallucinate passing grades  
**Mitigation**:
- Zod validation on all LLM output
- Fallback to rule-based tutor on any error
- LLM can explain/diagnose but never override objective test results
- Timeout after 10s

### TypeScript Complexity
**Risk**: Strict mode + composite projects may slow iteration  
**Mitigation**:
- Already configured
- Biome is faster than ESLint
- Small codebase (<5k LOC for MVP)

## Baseline Command Results

### Before Implementation

```bash
pnpm install --frozen-lockfile
```
**Status**: ⏳ Not run yet (dependencies not installed)

```bash
pnpm biome check ./src
```
**Status**: ⏳ Not run yet (no src/ files)

```bash
pnpm tsc --noEmit
```
**Status**: ⏳ Not run yet

```bash
pnpm build
```
**Status**: ⏳ Not run yet

```bash
pnpm test
```
**Status**: ⏳ Not run yet

### After Phase 0 Setup

```bash
pnpm install
```
**Status**: ✅ Success (103 packages, 6.8s)

```bash
pnpm type-check
```
**Status**: ✅ Success (no errors)

```bash
pnpm lint
```
**Status**: ✅ Success (9 files, 11ms, no issues)

```bash
pnpm build
```
**Status**: ✅ Success (dist/index.html 0.32kB, dist/assets/index.js 142.76kB gzipped 45.91kB, 773ms)

```bash
pnpm test run
```
**Status**: ✅ Success (1 test passed, 977ms)

## Pre-existing Failures

**None** — this is a new project.

## DartPad Documentation References

Reviewed:
- https://dart.dev/tools/dartpad
- https://github.com/dart-lang/dart-pad/wiki/Embedding-Guide
- https://dart.dev/tools/dartpad/troubleshoot

Key findings:
- `embed-inline.html` is the recommended iframe endpoint
- Supported params: `theme`, `run`, `split`
- Communication via postMessage (need to verify exact API)
- No official npm package → custom iframe wrapper needed

## Next Steps

1. ✅ Project structure created
2. ✅ Install dependencies (`pnpm install`)
3. ✅ Run baseline checks
4. ✅ Create minimal React app skeleton
5. ✅ Verify build/dev/test commands work
6. ⏭️ Begin Phase 1 (UI Shell)

---

**Created**: 2026-08-17 20:45 UTC+7  
**Updated**: 2026-08-17 21:07 UTC+7 — Phase 0 complete, all baseline checks passed
