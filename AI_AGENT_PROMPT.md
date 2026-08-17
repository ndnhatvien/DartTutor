# AI AGENT PROMPT — Implement Dart Tutor

Repository: https://github.com/ndnhatvien/Awesome-Context-Engineering

Read `plan.md` completely before changing code. Treat it as the specification.

## Mission

Implement a reliable Dart Tutor prototype using DartPad for interactive Dart execution, objective exercise tests, a deterministic tutor, real learner progress, and an optional LLM tutor.

Do not rewrite ACE core.

## Rules

1. Inspect before editing.
2. Preserve the existing build/test/CI architecture.
3. Never fabricate test results, compiler output, learner history, or mastery.
4. Objective correctness comes from tests, not the LLM.
5. AI must be optional.
6. Never expose API keys to the browser.
7. Never execute learner code with Node `eval`, `new Function`, or an unsandboxed process.
8. Use proper TypeScript types; do not add `any` just to silence lint.
9. Do not disable existing lint/type/test gates.
10. Do not implement the whole platform before the first vertical slice works.

## Step 1 — Reconnaissance

Inspect:

- repository tree
- package.json
- tsconfig
- Biome config
- current web/dashboard/Express code
- current tests
- CI workflows
- existing MCP/ACE APIs

Run the baseline checks:

```bash
pnpm install --frozen-lockfile
pnpm biome check ./src
pnpm tsc --noEmit
pnpm build
pnpm test
```

Create:

```text
apps/dart-tutor/IMPLEMENTATION_NOTES.md
```

Record:
- reusable infrastructure
- proposed files
- risks
- baseline command results
- pre-existing failures

Do not hide pre-existing failures.

## Step 2 — First vertical slice

Implement only:

- 1 lesson: Dart Basics
- 3 exercises
- DartPad embedding
- objective tests
- static hints
- local progress
- basic tutor UI

Exercises:

1. string interpolation
2. `final` / `const`
3. greeting function

Required user journey:

```text
open
 -> lesson
 -> exercise
 -> edit code
 -> run
 -> objective result
 -> hint
 -> retry
 -> pass
 -> progress update
```

Do NOT add the LLM yet.

## Step 3 — DartPad

Use:

```text
https://dartpad.dev/embed-inline.html
```

Use only documented embedding behavior and supported query parameters.

References:

- https://dart.dev/tools/dartpad
- https://github.com/dart-lang/dart-pad/wiki/Embedding-Guide
- https://dart.dev/tools/dartpad/troubleshoot

If an objective execution result cannot be observed reliably through the chosen integration, do not invent it. Introduce an explicit integration adapter and an `unavailable` state.

## Step 4 — Exercise model

Each exercise must have:

- id
- title
- instructions
- concept tags
- starter code
- objective tests
- solution
- >=2 hints
- common mistakes

Keep test/solution content out of normal learner-editable code.

## Step 5 — Deterministic tutor

Implement `RuleBasedTutorProvider`.

Policy:

- first failure -> conceptual hint
- second failure -> stronger hint + concept
- repeated failure -> diagnostic question/minimal example
- solution requested -> solution + explanation
- pass -> acknowledgement + useful explanation + next action

Avoid repeating identical hints.

## Step 6 — Learner state

Persist only real events:

- attempt
- pass/fail
- hint request
- solution request
- concept
- timestamp

Implement and test a documented mastery formula.

No fake data.

## Step 7 — Misconceptions

Start with deterministic categories:

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

Every diagnosis must contain evidence.

## Step 8 — Optional AI

Only after the deterministic vertical slice passes.

Create:

```ts
interface TutorProvider {
  explain(input: TutorContext): Promise<TutorResponse>;
  diagnose(input: TutorContext): Promise<DiagnosisResponse>;
  askQuestion(input: TutorContext): Promise<TutorQuestion>;
}
```

Implement:

- `RuleBasedTutorProvider`
- `LLMTutorProvider`

Environment:

```env
TUTOR_AI_ENABLED=false
TUTOR_BASE_URL=
TUTOR_API_KEY=
TUTOR_MODEL=
```

Validate LLM output with Zod.

On timeout, invalid output, missing credentials, or provider error:

```text
LLM -> RuleBasedTutorProvider fallback
```

The app must continue working.

The LLM may explain and diagnose, but it must never declare an exercise passed.

## Step 9 — Optional ACE integration

Only after the tutor works independently.

Create an adapter such as:

```ts
interface AceContextProvider {
  retrieve(query: string): Promise<ContextItem[]>;
}
```

Use it for lesson context, explanations, examples, and common mistakes.

ACE unavailability must not break the tutor.

## Step 10 — Tests

Add unit tests for:

- content
- exercise loading
- state transitions
- mastery
- hints
- misconceptions
- LLM response validation
- fallback

Add integration tests for:

```text
attempt -> result -> learner state
failure -> hint
second failure -> stronger hint
repeated failure -> diagnostic
pass -> progression
bad LLM -> fallback
```

Add an end-to-end smoke test for the complete user journey.

## Step 11 — Documentation

Create:

```text
apps/dart-tutor/README.md
apps/dart-tutor/ARCHITECTURE.md
apps/dart-tutor/CONTENT_GUIDE.md
apps/dart-tutor/AI_TUTOR.md
```

Document setup, DartPad limitations, exercise authoring, tutor behavior, AI configuration, security, and ACE integration.

## Step 12 — Final verification

Run:

```bash
pnpm biome check ./src
pnpm tsc --noEmit
pnpm build
pnpm test
```

and tutor-specific tests/build.

Never make CI pass by disabling rules or skipping tests.

## Final response format

Report exactly:

### Implemented
Exact files and features.

### Verification
Exact commands and their real results.

### Known limitations
Especially DartPad iframe/execution limitations.

### Next step
Only the smallest logical next increment.

Never claim a test passed unless you actually ran it.
