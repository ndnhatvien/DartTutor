# Contributing to Dart Tutor

Cảm ơn bạn quan tâm đến việc contribute cho Dart Tutor!

## Development Workflow

### Setup
```bash
# Clone repository
git clone https://github.com/ndnhatvien/DartTutor.git
cd DartTutor

# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

### Quality Checks
Trước khi commit, đảm bảo tất cả checks pass:

```bash
pnpm lint          # Biome linting
pnpm type-check    # TypeScript type checking
pnpm build         # Production build
pnpm test          # Run tests
```

### Commit Convention
Sử dụng conventional commits:

```
feat: add lesson 2 exercises
fix: dartpad iframe not loading
docs: update architecture diagram
test: add evaluator integration tests
refactor: simplify tutor state machine
phase: complete phase 1 UI shell
```

### Pull Request Process

1. **Fork** repository
2. **Create branch** từ `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Make changes** và commit
4. **Push** branch:
   ```bash
   git push origin feat/your-feature-name
   ```
5. **Open Pull Request** với title theo conventional commits
6. **Ensure CI passes** (lint, type-check, build, test)
7. **Request review**

### PR Checklist
- [ ] Code builds without errors
- [ ] All tests pass
- [ ] TypeScript types are correct
- [ ] Code is linted and formatted
- [ ] No `console.log` or `debugger` statements
- [ ] Documentation updated (if needed)
- [ ] Added tests for new features

## Code Standards

### TypeScript
- Sử dụng strict mode
- Không dùng `any` (use `unknown` if needed)
- Prefer `interface` over `type` for object shapes
- Always type function parameters and return values

### React
- Functional components only (no class components)
- Use hooks properly (follow Rules of Hooks)
- Keep components small and focused
- Props drilling → use Context for deep props

### Testing
- Unit tests for logic (evaluator, tutor, state machine)
- Integration tests for user flows
- Test real behavior, not implementation details

### File Organization
```
src/
  api/           # Backend endpoints
  content/       # Content loading/types
  evaluator/     # Exercise evaluation
  learner/       # Learner state management
  tutor/         # Tutor engine
  ui/            # React components
```

## Project Phases

Xem [`plan.md`](./plan.md) để hiểu roadmap:

- **Phase 0**: ✅ Project setup
- **Phase 1**: ⏭️ UI Shell
- **Phase 2**: DartPad integration
- **Phase 3**: Deterministic tutor
- **Phase 4**: Optional AI tutor
- **Phase 5**: Optional ACE context
- **Phase 6**: Release preparation

Contributions nên align với current phase.

## Content Guidelines

Khi thêm lessons/exercises, xem [`apps/dart-tutor/CONTENT_GUIDE.md`](./apps/dart-tutor/CONTENT_GUIDE.md) (sẽ được tạo ở Phase 3).

### Exercise Structure
Mỗi exercise phải có:
- Clear instructions (Vietnamese)
- Starter code
- Objective test cases (`test.dart`)
- Solution code
- >= 2 hints
- Common mistakes list

## Security

- ❌ KHÔNG execute learner code với Node `eval` hoặc `new Function`
- ❌ KHÔNG expose API keys trong browser code
- ✅ Validate tất cả external data với Zod
- ✅ DartPad iframe cung cấp sandboxed execution

## Questions?

- Open an issue với label `question`
- Check existing issues trước khi tạo mới
- Xem [`README.md`](./README.md) và [`plan.md`](./plan.md) cho context

## License

Bằng việc contribute, bạn đồng ý rằng contributions của bạn sẽ được licensed theo MIT License.
