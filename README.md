# Dart & Flutter Tutor 🎯

Nền tảng học Dart và Flutter tương tác ngay trên trình duyệt với bài tập thực hành, chấm điểm tự động và tutor AI tùy chọn.

## 🌐 Live Demo

**https://ndnhatvien.github.io/DartTutor/**

## ✨ Tính năng

- **15 bài học** với **70 bài tập** (30 Dart + 40 Flutter), phân loại theo độ khó
  - Cơ bản → Trung bình → Nâng cao
- **Chấm điểm tự động** (objective testing) — không phụ thuộc AI
- **DartPad sandbox** — chạy code Dart/Flutter thực tế trong trình duyệt
- **Tutor AI tùy chọn** (LLM, validate bằng Zod, tự động fallback khi lỗi)
- **Theo dõi tiến độ** — lưu trạng thái từng bài tập, phần trăm hoàn thành
- **Gợi ý từng bước** và xem solution khi cần

## 🚀 Bắt đầu

### Chạy local

```bash
# Cài dependencies
pnpm install

# Dev server (http://localhost:3000)
pnpm dev

# Build production
pnpm build

# Chạy test (vitest run)
pnpm --filter dart-tutor test run

# Type check
pnpm type-check

# Lint
pnpm lint
```

### Deploy lên GitHub Pages

Repository đã có workflow `deploy.yml` tự động deploy khi push lên `main`. Để bật lần đầu:

1. Vào **Settings → Pages**
2. Mục **Build and deployment → Source**, chọn **GitHub Actions**
3. Push lên `main` — workflow sẽ build và deploy tự động

Có thể deploy thủ công bằng cách vào **Actions → Deploy to GitHub Pages → Run workflow**.

## 📚 Bài học

### 🎯 Dart (5 bài học, 30 bài tập)

| Bài học | Bài tập |
|---------|---------|
| Dart Basics | 6 |
| Control Flow | 7 |
| Functions + Null Safety | 7 |
| Collections | 5 |
| Async/Await | 5 |

### 💙 Flutter (10 bài học, 40 bài tập)

| Bài học | Bài tập |
|---------|---------|
| Flutter Basics | 3 |
| Flutter Layouts | 3 |
| Flutter Common Widgets | 5 |
| Flutter State Management | 3 |
| Flutter Navigation | 3 |
| Flutter Forms | 3 |
| Flutter Animation | 5 |
| Flutter Networking | 5 |
| Flutter Local Storage | 5 |
| Flutter Theming | 5 |

## 🏗️ Kiến trúc

```
Browser
 ├─ Tutor UI (React)
 │   ├─ Lesson viewer (Dart/Flutter panels)
 │   ├─ Exercise editor
 │   ├─ Progress panel
 │   └─ Tutor feedback
 └─ DartPad iframe (sandboxed Dart execution)
         ↓
   Objective evaluation
         ↓
   Tutor State Machine
    ├─ Rule-based (deterministic)
    └─ LLM-based (optional)
```

## ⚙️ CI/CD

- **CI** (`ci.yml`): lint, type-check, build, test trên mỗi push/PR
- **PR Title** (`pr-title.yml`): validate Conventional Commits
- **Deploy** (`deploy.yml`): build + deploy GitHub Pages trên `main`

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite 5 + TypeScript (strict)
- **Validation**: Zod
- **Testing**: Vitest + jsdom
- **Linter**: Biome
- **Package Manager**: pnpm (workspace)
- **CI**: GitHub Actions (Node 24)
- **Sandbox**: DartPad embed

## 📁 Cấu trúc

```
apps/dart-tutor/
├── content/lessons/     # 15 file JSON bài học
├── src/
│   ├── content/         # Loader + types
│   ├── evaluator/       # Đánh giá kết quả
│   ├── learner/         # Quản lý trạng thái + tiến độ
│   ├── tutor/           # Rule-based + AI tutor
│   └── ui/              # React components
├── tests/               # Vitest tests
└── vite.config.ts
```

## 🔑 Nguyên tắc

- ✅ Test khách quan quyết định pass/fail (không bao giờ dùng LLM)
- ✅ Tutor deterministic hoạt động không cần AI
- ✅ Code học viên chạy trong sandbox DartPad (an toàn trình duyệt)
- ✅ Chỉ dùng sự kiện thực (không bịa dữ liệu)
- ✅ AI tùy chọn, validate bằng Zod, tự fallback khi lỗi

## 📄 Tài liệu

- [`AI_AGENT_PROMPT.md`](./AI_AGENT_PROMPT.md) — Hướng dẫn phát triển
- [`apps/dart-tutor/DARTPAD_INTEGRATION.md`](./apps/dart-tutor/DARTPAD_INTEGRATION.md) — Tích hợp DartPad
- [`apps/dart-tutor/IMPLEMENTATION_NOTES.md`](./apps/dart-tutor/IMPLEMENTATION_NOTES.md) — Ghi chú kỹ thuật
- [`apps/dart-tutor/TESTING.md`](./apps/dart-tutor/TESTING.md) — Kiểm thử
- [`apps/dart-tutor/AI_TUTOR.md`](./apps/dart-tutor/AI_TUTOR.md) — AI Tutor

## 📄 License

MIT