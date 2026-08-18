# Testing Checklist — Dart Tutor MVP

## Pre-Test Setup

```bash
cd /home/nhatvien/Projects/DartTutor
pnpm install
pnpm dev
```

Open browser: http://localhost:3000

---

## Phase 1: UI Shell ✅

### Lesson List
- [ ] Lesson "Dart Basics" hiển thị
- [ ] 3 exercises hiển thị
- [ ] Progress: 0/3 (0%)
- [ ] Click vào lesson → navigate to first exercise

### Exercise View
- [ ] Exercise title hiển thị
- [ ] Difficulty badge: "Cơ bản"
- [ ] Concept tags hiển thị
- [ ] Instructions panel (left side)
- [ ] Hints collapsible
- [ ] Back button works
- [ ] Next exercise button (khi không phải exercise cuối)

---

## Phase 2: DartPad Integration

### DartPad Iframe
- [ ] Iframe loads (https://dartpad.dev/embed-inline.html)
- [ ] Dark theme applied
- [ ] Loading indicator: "⏳ Đang tải DartPad..."
- [ ] Loading indicator disappears when ready

### Code Execution
**Exercise 1: String Interpolation**

Test starter code:
```dart
String greet(String name) {
  // TODO: Implement this function
  return '';
}

void main() {
  print(greet('World'));
}
```

- [ ] Click "▶️ Run" → console shows output
- [ ] Click "✓ Test" → tests run

**Expected behavior**:
- [ ] Starter code: Test fails (empty return)
- [ ] Fix: `return 'Hello, $name!';`
- [ ] Tests pass

### Error Handling
- [ ] Compile error → red panel with error message
- [ ] Runtime error → captured in console
- [ ] Console output displayed

---

## Phase 3: Deterministic Tutor

### State Transitions

**Scenario 1: First Failure**
1. Leave starter code as-is
2. Click "✓ Test"

Expected:
- [ ] Tutor message: "💭 Có vẻ chưa đúng..."
- [ ] Gentle hint displayed
- [ ] Encouragement message
- [ ] Action: "💡 Xem gợi ý khác" button

**Scenario 2: Second Failure**
1. Make wrong fix: `return name;`
2. Click "✓ Test"

Expected:
- [ ] Tutor message: "🤔 Vẫn chưa đúng..."
- [ ] Stronger hint
- [ ] Action button visible

**Scenario 3: Repeated Failure (3+)**
1. Fail 3 times with different wrong code

Expected:
- [ ] Tutor message: "🆘 Có vẻ bạn đang gặp khó khăn"
- [ ] Diagnostic question appears
- [ ] "📖 Xem solution" button

**Scenario 4: Pass**
1. Fix code correctly: `return 'Hello, $name!';`
2. Click "✓ Test"

Expected:
- [ ] Tutor message: "🎉 Chúc mừng!"
- [ ] Green feedback panel
- [ ] "➡️ Bài tiếp theo" button
- [ ] Progress updates: 1/3

### Solution Display
- [ ] Click "📖 Xem solution"
- [ ] Solution code displayed in yellow panel
- [ ] Solution marked as viewed in learner state

### Progressive Hints
**Exercise 1 hints**:
1. "Sử dụng ký hiệu $ để nhúng biến vào string"
2. "Cú pháp: 'Hello, $name!' sẽ thay thế $name bằng giá trị..."

- [ ] First hint: Gentle
- [ ] Click "💡 Xem gợi ý khác" → Second hint
- [ ] Hints don't repeat

---

## Phase 4: AI Tutor (Optional)

### Without API Key (Default)
- [ ] Falls back to rule-based tutor
- [ ] No errors in console
- [ ] Tutor works normally

### With API Key (If configured)
Create `.env`:
```env
VITE_TUTOR_AI_ENABLED=true
VITE_TUTOR_API_KEY=sk-ant-...
```

Restart dev server:
```bash
pnpm dev
```

Expected:
- [ ] LLM responses more detailed
- [ ] Personalized feedback
- [ ] Falls back on error (check console logs)

---

## Learner State Persistence

### localStorage Check

Open DevTools → Application → localStorage:

- [ ] Key: `dart-tutor-learner-state` exists
- [ ] Contains exercises map
- [ ] Contains concepts map

### Progress Tracking

Complete Exercise 1:
- [ ] Progress: 1/3 (33%)
- [ ] Exercise state: `passed`
- [ ] Attempt count increments
- [ ] Mastery calculated

Refresh page:
- [ ] Progress persists
- [ ] Exercise remains marked as passed

### Reset Test
```javascript
// In browser console:
localStorage.clear()
location.reload()
```
- [ ] Progress resets to 0/3
- [ ] All exercises show as new

---

## All 3 Exercises

### Exercise 1: String Interpolation ✓
- [ ] Starter code loads
- [ ] Tests validate interpolation
- [ ] Hints helpful
- [ ] Solution correct

### Exercise 2: Final vs Const
**Starter code**:
```dart
// TODO: Khai báo userName (final)
// TODO: Khai báo maxAttempts (const)

bool canRetry(int attempts) {
  // TODO: Implement
  return false;
}
```

- [ ] Tests check userName, maxAttempts, canRetry
- [ ] Misconception detection: VAR_INSTEAD_OF_FINAL
- [ ] Hints explain final vs const

### Exercise 3: Greeting Function
**Starter code**:
```dart
String greetUser(String name, {String? title}) {
  // TODO: Implement
  return '';
}
```

- [ ] Tests check null handling
- [ ] Misconception detection: NULLABLE_ACCESS
- [ ] Hints explain optional parameters

---

## Edge Cases

### DartPad Unavailable
Simulate: Block `dartpad.dev` in hosts file

Expected:
- [ ] Loading indicator stays
- [ ] OR timeout message
- [ ] App doesn't crash

### Network Error (LLM)
If AI enabled, disconnect network:

Expected:
- [ ] Console warning: "LLM explain failed, falling back..."
- [ ] Rule-based response returned
- [ ] No user-visible error

### Invalid Code
Type syntax error:
```dart
String greet(String name {  // Missing )
```

Expected:
- [ ] Compile error caught
- [ ] Red error panel
- [ ] Tutor suggests checking syntax

---

## Performance

### Load Times
- [ ] Initial page load: < 2s
- [ ] DartPad iframe ready: < 5s
- [ ] Code execution: < 2s
- [ ] LLM response (if enabled): < 5s

### Build Size
```bash
pnpm build
```

Expected:
- [ ] dist/index.html < 1KB
- [ ] dist/assets/*.js < 250KB gzipped
- [ ] No console errors in production build

---

## Browser Compatibility

Test in:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

Expected:
- [ ] All features work
- [ ] No layout issues
- [ ] DartPad iframe loads

---

## Accessibility

### Keyboard Navigation
- [ ] Tab through lesson list
- [ ] Enter to select lesson
- [ ] Tab through buttons (Run, Test, Hint, Solution)
- [ ] Esc or Back button returns to lesson list

### Screen Reader
- [ ] Button labels clear ("Run", "Test", not just icons)
- [ ] Back button: aria-label="Quay lại"
- [ ] Hint details: semantic HTML

### Visual
- [ ] No color-only indicators
- [ ] Focus visible on interactive elements
- [ ] Contrast ratios pass WCAG AA

---

## Known Issues to Document

### DartPad Limitations
- [ ] postMessage API unofficial (may change)
- [ ] Test output parsing heuristic-based
- [ ] No way to extract user-edited code yet
- [ ] ~30s timeout imposed by DartPad

### Future Improvements Identified
- [ ] Code editor not exposed (read-only integration)
- [ ] No real-time test progress
- [ ] localStorage only (no backend persistence)
- [ ] LLM responses not cached

---

## Test Summary

**Tested by**: _______________________  
**Date**: _______________________  
**Build**: `git rev-parse --short HEAD` = _______________________

**Overall Status**:
- [ ] All core features work
- [ ] Major issues: _______________________
- [ ] Minor issues: _______________________
- [ ] Ready for demo: Yes / No

**Notes**:
