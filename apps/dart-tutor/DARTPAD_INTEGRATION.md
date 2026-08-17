# DartPad Integration

## Overview

Phase 2 integrates DartPad iframe để thực thi Dart code trong browser một cách an toàn.

## Architecture

```
ExerciseView
    ↓
DartPadEmbed (iframe wrapper)
    ↓
https://dartpad.dev/embed-inline.html (sandboxed)
    ↓
postMessage API
    ↓
dartpad-adapter.ts (parse results)
    ↓
ExerciseResult
```

## Components

### DartPadEmbed.tsx

React component wrapper cho DartPad iframe.

**Props**:
- `initialCode: string` — Starter code
- `testCode?: string` — Test code (optional)
- `onReady?: () => void` — Callback khi DartPad ready
- `onConsoleOutput?: (output: string) => void` — Console output handler
- `onCompilationError?: (error: string) => void` — Compilation error handler

**Features**:
- postMessage communication với DartPad
- Run button: execute user code
- Test button: execute user code + test code
- Console output display
- Compilation error display
- Loading state

### dartpad-adapter.ts

Parse test output từ Dart test package.

**Functions**:
- `parseTestOutput(output: string): TestOutput`
  - Parse Dart test format: `00:00 +N -M`
  - Extract passed/failed counts
  - Collect all messages

- `createExerciseResult(...): ExerciseResult`
  - Convert test output → structured result
  - Determine status: passed/failed/compile_error/unavailable
  - Calculate duration

## DartPad URL

```
https://dartpad.dev/embed-inline.html?theme=dark&run=false
```

**Parameters**:
- `theme=dark` — Dark theme
- `run=false` — Don't auto-run on load

**Sandbox attributes**:
```html
sandbox="allow-scripts allow-same-origin"
```

## PostMessage API

### Outgoing (app → DartPad)

```typescript
iframe.contentWindow.postMessage(
  {
    command: 'execute',
    code: '...',
  },
  'https://dartpad.dev'
);
```

### Incoming (DartPad → app)

```typescript
{
  type: 'ready' | 'consoleOutput' | 'compilationError',
  message?: string,
}
```

## Test Output Format

Dart test package output:

```
00:00 +0: test description
00:00 +1: All tests passed!
```

hoặc

```
00:00 +0: test one
00:00 +0 -1: test two failed
00:00 +2 -1: Some tests failed
```

**Parsing logic**:
- `+N` → passed tests
- `-N` → failed tests
- "All tests passed" → at least 1 passed

## ExerciseResult

```typescript
{
  exerciseId: string;
  status: 'passed' | 'failed' | 'compile_error' | 'runtime_error' | 'timeout' | 'unavailable';
  testsPassed: number;
  testsTotal: number;
  messages: string[];
  durationMs?: number;
  timestamp: string;
}
```

## Security

✅ **Safe**:
- DartPad runs in iframe với sandbox
- Code thực thi trong Dart VM (browser-isolated)
- Không có Node eval/Function
- postMessage origin validation: `event.origin === 'https://dartpad.dev'`

❌ **NOT safe** (not implemented):
- Learner code không được thực thi bởi Node backend
- API keys không được exposed

## Limitations

### Known Issues

1. **DartPad postMessage API không chính thức**
   - Không có official documentation
   - API có thể thay đổi
   - Fallback: `status: 'unavailable'`

2. **Test output parsing heuristic**
   - Dựa trên Dart test format quan sát được
   - Có thể không catch hết edge cases
   - Tests verify parsing logic

3. **Timeout không implement**
   - DartPad có timeout riêng (~30s)
   - App không enforce timeout riêng
   - Future: add client-side timeout

4. **Không thể edit code trong iframe**
   - DartPad embed là read-only trong implementation này
   - Code được set qua postMessage
   - Future: expose DartPad editor

## Testing

### Unit Tests

`tests/evaluator.test.ts` — 8 tests:

```bash
✓ parseTestOutput
  ✓ should parse passing tests
  ✓ should parse failing tests
  ✓ should handle empty output
  ✓ should collect all messages

✓ createExerciseResult
  ✓ should create compile_error result
  ✓ should create passed result
  ✓ should create failed result
  ✓ should create unavailable result
```

### Manual Testing

1. Start dev server: `pnpm dev`
2. Navigate to any exercise
3. Click "Run" — xem console output
4. Click "Test" — xem test results
5. Edit code to fail tests — verify error display

## Future Improvements

1. **Editable DartPad**
   - Expose DartPad editor
   - Sync code changes back to app

2. **Structured test output**
   - Use Dart test JSON reporter
   - More reliable than text parsing

3. **Timeout handling**
   - Client-side timeout (10s)
   - Show "timeout" status

4. **Runtime error detection**
   - Distinguish compile vs runtime errors
   - Parse stack traces

5. **Test progress**
   - Show "running tests..." state
   - Progress indicator

## References

- https://dart.dev/tools/dartpad
- https://github.com/dart-lang/dart-pad/wiki/Embedding-Guide
- https://dart.dev/tools/dartpad/troubleshoot

---

**Implemented**: Phase 2 — 2026-08-17  
**Status**: ✅ Working (với limitations noted above)
