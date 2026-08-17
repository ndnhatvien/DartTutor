# Dart Tutor — Implementation Plan

## Goal
Build a browser-based Dart Tutor using DartPad for interactive execution, objective tests for grading, a deterministic tutor state machine, optional LLM tutoring, real learner progress, and optional ACE retrieval.

The first release is a small vertical slice, not a full platform.

## Constraints
- Keep the existing ACE TypeScript/Node/pnpm core intact.
- Prefer `apps/dart-tutor/`.
- Do not execute learner Dart with Node `eval`, `new Function`, or unsandboxed child processes.
- Do not fabricate learner history, scores, compiler output, or test results.
- Objective correctness comes from tests/execution, never from the LLM.
- AI is optional; the tutor must work without an API key.
- Never expose AI secrets to the browser.
- Use Zod to validate external/LLM data.
- Do not weaken existing CI rules.

DartPad references:
- https://dart.dev/tools/dartpad
- https://github.com/dart-lang/dart-pad/wiki/Embedding-Guide
- https://dart.dev/tools/dartpad/troubleshoot

## Architecture

```text
Browser
 ├─ Tutor UI
 │   ├─ Lesson
 │   ├─ Exercise
 │   ├─ Tutor
 │   └─ Progress
 └─ DartPad iframe
          |
          v
Tutor API
 ├─ Content repository
 ├─ Exercise/evaluation adapter
 ├─ Tutor state machine
 ├─ Learner state
 ├─ RuleBasedTutorProvider
 ├─ optional LLMTutorProvider
 └─ optional AceContextProvider
```

## MVP Lessons

1. **Basics** — main, variables, final/const, types, interpolation.
   - interpolation
   - final/const
   - greeting function

2. **Control Flow** — if/else, loops, switch, boolean expressions.
   - grade classification
   - FizzBuzz
   - calculator

3. **Functions + Null Safety** — parameters, return types, `?`, `?.`, `??`.
   - `getLength(String? text)`
   - safe first character
   - safe integer parsing

4. **Collections** — List, Set, Map, where, map, fold.
   - filter
   - transform
   - count values

5. **Async/Await** — Future, async, await, try/catch.
   - await Future
   - sequencing
   - async error handling

## Content Model

```ts
interface Lesson {
  id: string;
  title: string;
  objectives: string[];
  prerequisites: string[];
  exercises: Exercise[];
}

interface Exercise {
  id: string;
  lessonId: string;
  title: string;
  conceptTags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  instructions: string;
  starterCode: string;
  testCode: string;
  solutionCode: string;
  hints: string[];
  expectedConcepts: string[];
  commonMistakes: CommonMistake[];
}
```

Store content in version control, separate from learner state.

Suggested tree:

```text
apps/dart-tutor/
  README.md
  ARCHITECTURE.md
  CONTENT_GUIDE.md
  AI_TUTOR.md
  IMPLEMENTATION_NOTES.md
  content/lessons/
  src/content/
  src/evaluator/
  src/learner/
  src/tutor/
  src/api/
  src/ui/
  tests/
```

## DartPad

Use the official embed, preferably:

```text
https://dartpad.dev/embed-inline.html
```

Use only supported query parameters such as `theme`, `run`, and `split`.

Where the exercise model is used, keep:
- learner code
- `test.dart`
- `solution.dart`
- `hint.txt`

semantically separate.

The application must distinguish:

```text
passed
failed
compile_error
runtime_error
timeout
unavailable
```

Do not invent a result if the integration cannot observe it.

## Evaluation

```ts
interface ExerciseResult {
  exerciseId: string;
  status: "passed" | "failed" | "compile_error" | "runtime_error" | "timeout" | "unavailable";
  testsPassed: number;
  testsTotal: number;
  messages: string[];
  durationMs?: number;
  timestamp: string;
}
```

## Tutor State Machine

```text
NEW
 -> ATTEMPTED
 -> FIRST_FAILURE
 -> SECOND_FAILURE
 -> REPEATED_FAILURE
 -> PASSED
 -> MASTERED
```

Policy:
- first failure: conceptual hint
- second failure: stronger hint + concept
- repeated failure: diagnostic question/minimal example
- solution requested: show solution + explanation
- pass: acknowledge + explain one useful idiom + next action

Never repeat the same hint indefinitely.

## Misconceptions

Start with deterministic rules:

```text
NULLABLE_ACCESS
WRONG_RETURN_TYPE
MUTABLE_VS_FINAL
ASYNC_NOT_AWAITED
ITERABLE_VS_LIST_CONFUSION
OFF_BY_ONE
WRONG_BOOLEAN_CONDITION
EXCEPTION_NOT_HANDLED
```

```ts
interface Misconception {
  id: string;
  confidence: number;
  evidence: string[];
  concept: string;
}
```

LLM diagnosis is probabilistic and cannot override objective results.

## Learner State

```ts
interface LearnerConceptState {
  concept: string;
  attempts: number;
  passes: number;
  consecutiveFailures: number;
  lastAttemptAt: string | null;
  mastery: number;
}
```

Only real events may update this state. Document and test the mastery formula.

Minimum persisted events:
- attempt
- objective result
- hint requested
- solution requested
- concept
- timestamp

## AI Provider

```ts
interface TutorProvider {
  explain(input: TutorContext): Promise<TutorResponse>;
  diagnose(input: TutorContext): Promise<DiagnosisResponse>;
  askQuestion(input: TutorContext): Promise<TutorQuestion>;
}
```

Required:
- `RuleBasedTutorProvider`

Optional:
- `LLMTutorProvider`

Environment:

```env
TUTOR_AI_ENABLED=false
TUTOR_BASE_URL=
TUTOR_API_KEY=
TUTOR_MODEL=
```

LLM input should contain only the current lesson/exercise, student code, objective result, prior hints, misconception evidence, and learner concept state.

Validate responses with Zod. Invalid/unavailable AI must fall back to the deterministic tutor.

## ACE Integration

Not required for MVP.

Later add:

```ts
interface AceContextProvider {
  retrieve(query: string): Promise<ContextItem[]>;
}
```

Use it for lesson explanations, examples, common mistakes, and explicitly recorded learner notes.

ACE failure must not break the tutor.

## API

```text
GET  /api/lessons
GET  /api/lessons/:lessonId
GET  /api/exercises/:exerciseId
POST /api/exercises/:exerciseId/attempt
GET  /api/learner/state
POST /api/tutor/respond
```

Validate input with Zod. Do not expose solution code through the normal exercise endpoint.

## UI

```text
+-----------------------------------------------------------+
| Dart Tutor | Lesson X/Y | Progress                       |
+----------------------+------------------------------------+
| Lesson / Tutor       | DartPad                            |
| Objective            | [editor]                           |
| Hint                 | [Run/Test]                         |
| Tutor message        | [result/console]                   |
+----------------------+------------------------------------+
| Attempts | Mastery | Concept | Next action                 |
+-----------------------------------------------------------+
```

Keyboard accessibility, visible focus, meaningful labels, no color-only status, readable errors.

## Testing

Unit:
- content schema
- exercise loading
- state transitions
- mastery
- misconceptions
- hints
- AI schema/fallback

Integration:
```text
attempt -> result -> learner state
failure -> hint
second failure -> stronger hint
repeated failure -> diagnostic
pass -> progression
bad LLM -> deterministic fallback
```

Smoke:
```text
open -> lesson -> exercise -> edit -> run -> result
-> hint -> retry -> pass -> progress update
```

## CI

Never weaken ACE CI.

Run:

```bash
pnpm install --frozen-lockfile
pnpm biome check ./src
pnpm tsc --noEmit
pnpm build
pnpm test
```

Add only necessary tutor commands such as:

```bash
pnpm tutor:dev
pnpm tutor:test
pnpm tutor:build
```

## Phases

### Phase 0 — Reconnaissance
Inspect repository, build, tests, web infrastructure, and reusable components. Write `IMPLEMENTATION_NOTES.md`. No core changes.

### Phase 1 — Shell
Create tutor UI, lesson list, exercise view, progress panel.

### Phase 2 — DartPad
Embed DartPad, add starter code, tests, hints, solution, and objective results.

### Phase 3 — Deterministic Tutor
Add state machine, hints, misconception rules, persistence.

### Phase 4 — AI Tutor
Add provider interface, LLM provider, structured output, fallback.

### Phase 5 — ACE Context
Add optional ACE adapter.

### Phase 6 — Release
Tests, accessibility, security review, documentation, deployment, CI.

## First Milestone

Implement only:

```text
Phase 0 + Phase 1 + minimal Phase 2

1 lesson
3 exercises
DartPad
objective tests
static hints
local progress
NO LLM
```

Only after this vertical slice works should the agent add the deterministic tutor, then LLM, then ACE retrieval.

## Definition of Done

- [ ] 5 lessons with reviewed content
- [ ] every exercise has objective tests
- [ ] every exercise has >=2 hints and a solution
- [ ] DartPad works or reports an explicit unavailable state
- [ ] deterministic tutor works without AI
- [ ] AI output is schema validated
- [ ] real events only drive learner progress
- [ ] solution hidden by default
- [ ] no unsafe learner-code execution
- [ ] tests pass
- [ ] existing ACE CI remains green
- [ ] docs complete
- [ ] no fake learner analytics
