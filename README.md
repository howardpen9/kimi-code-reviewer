<p align="center">
  <h1 align="center">Kimi Code Reviewer</h1>
  <p align="center">
    AI-powered code review for GitHub using <strong>Moonshot Kimi</strong> with <strong>256K context window</strong>
    <br />
    基於 Kimi 大模型的 GitHub 智能代碼審查工具，支援 256K 超長上下文
  </p>
</p>

<p align="center">
  <a href="#quick-start--github-action">GitHub Action</a> ·
  <a href="#self-hosted-github-app">GitHub App</a> ·
  <a href="#configuration">Configuration</a> ·
  <a href="#中文說明">中文說明</a>
</p>

---

> **Note:** This is a community-maintained GitHub Action for PR code review.
> For the official Kimi Code CLI with full features (chat, flows, MCP, etc.), see [MoonshotAI/kimi-cli](https://github.com/MoonshotAI/kimi-cli).

## Features

- **256K Context Window** — Reviews entire PRs with full file context, not just diffs
- **GitHub Action + App** — Use as a CI/CD Action or a self-hosted GitHub App (`@kimi` mentions)
- **Prefix Cache** — Server-side caching at $0.10/M tokens (75% cheaper than standard $0.39/M)
- **Inline Annotations** — Issues appear directly in the PR diff via GitHub Checks API
- **Per-Repo Config** — `.kimi-review.yml` for custom rules, severity thresholds, file filters
- **Multilingual** — Review comments in English, 繁體中文, 简体中文, 日本語, 한국어

## Quick Start — GitHub Action

### 1. Get an API Key

Get your API key from **[Kimi Code Console](https://www.kimi.com/code/console)** (recommended for code review use cases).

> **Kimi Code API vs Moonshot API**: The Kimi Code API (`api.kimi.com/coding/v1`) is optimized for coding tasks and is separate from the general Moonshot API (`api.moonshot.cn/v1`). Both work with this action, but the Kimi Code API provides better code-specific performance.

### 2. Add the Secret

Go to your repo **Settings → Secrets and variables → Actions** and add:

| Secret | Value |
|--------|-------|
| `MOONSHOT_API_KEY` | Your `sk-...` API key |

### 3. Create the Workflow

```yaml
# .github/workflows/kimi-review.yml
name: Kimi Code Review

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write
  checks: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: howardpen9/kimi-code-reviewer@main
        with:
          kimi_api_key: ${{ secrets.MOONSHOT_API_KEY }}
```

That's it. Every PR will now get an AI code review.

### Action Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `kimi_api_key` | Yes | — | Moonshot AI API key |
| `github_token` | No | `${{ github.token }}` | GitHub token for API access |
| `model` | No | `kimi-k2.5` | Kimi model (262K context) |
| `language` | No | `en` | Review language: `en`, `zh-TW`, `zh-CN`, `ja`, `ko` |
| `fail_on` | No | `critical` | Fail the check on: `critical`, `warning`, `never` |
| `config_path` | No | `.kimi-review.yml` | Path to config file |

### Action Outputs

| Output | Description |
|--------|-------------|
| `review_summary` | Review summary text |
| `annotations_count` | Number of inline annotations created |
| `critical_count` | Number of critical issues found |
| `tokens_used` | Total tokens consumed |
| `cost_estimate` | Estimated API cost (USD) |

### Example: Fail on Warnings + Chinese Reviews

```yaml
- uses: howardpen9/kimi-code-reviewer@main
  with:
    kimi_api_key: ${{ secrets.MOONSHOT_API_KEY }}
    language: zh-TW
    fail_on: warning
```

## Self-Hosted GitHub App

For teams that want `@kimi review` commands in PR comments.

### Setup

```bash
git clone https://github.com/howardpen9/kimi-code-reviewer.git
cd kimi-code-reviewer
npm install
cp .env.example .env  # Fill in credentials
npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `KIMI_API_KEY` | Yes | Moonshot AI API key |
| `GITHUB_APP_ID` | Yes | Your GitHub App ID |
| `GITHUB_PRIVATE_KEY` | Yes | GitHub App private key (PEM) |
| `GITHUB_WEBHOOK_SECRET` | Yes | Webhook verification secret |
| `PORT` | No | Server port (default: `3000`) |
| `LOG_LEVEL` | No | Log level (default: `info`) |

### @kimi Commands

Comment on any PR to trigger:

| Command | Description |
|---------|-------------|
| `@kimi review` | Run a full code review |
| `@kimi help` | Show available commands |

### Webhook Events

| Event | Trigger |
|-------|---------|
| `pull_request.opened` | PR created |
| `pull_request.synchronize` | New commits pushed |
| `pull_request.review_requested` | Review requested |
| `issue_comment.created` | `@kimi` mentioned in comment |

## Configuration

Create `.kimi-review.yml` in your repo root to customize behavior:

```yaml
# Review language (en, zh-TW, zh-CN, ja, ko)
language: zh-TW

# Kimi model
model: kimi-k2.5

review:
  # Auto-trigger settings
  auto:
    enabled: true
    onOpen: true        # Review when PR is opened
    onPush: true        # Review on new commits
    onReviewRequest: true
    drafts: false       # Skip draft PRs

  # What to check
  aspects:
    bugs: true
    security: true
    performance: true
    style: true
    bestPractices: true
    documentation: false
    testing: false

  # Severity filter: critical | warning | suggestion | nitpick
  minSeverity: suggestion

  # Max annotations per review (1-100)
  maxAnnotations: 30

  # When to fail the check: critical | warning | never
  failOn: critical

# File filters (minimatch glob patterns)
files:
  include:
    - "**/*"
  exclude:
    - "**/node_modules/**"
    - "**/dist/**"
    - "**/*.lock"
    - "**/*.min.*"
  maxFileSize: 100000  # bytes

# Custom review rules
rules:
  - name: no-console-log
    description: "No console.log in production code"
    severity: warning
    filePattern: "src/**/*.ts"

  - name: input-validation
    description: "All API endpoints must validate input"
    severity: critical
    filePattern: "src/routes/**"

# Custom prompt additions
prompt:
  systemAppend: "Pay special attention to SQL injection risks"
  reviewFocus: "Focus on API input validation and error handling"

# Prefix cache settings
cache:
  enabled: true
  ttl: 3600
```

If no config file is found, sensible defaults are used.

## How It Works

```
PR Event → Extract Context → Pack (256K) → Kimi API → Parse → Annotations
```

### Review Pipeline (12 Steps)

1. Create GitHub Check Run (in-progress)
2. Extract PR metadata, diff, and changed files
3. Filter files by include/exclude patterns
4. Pack context with 256K optimization
5. Build cache-optimized message order
6. Call Kimi API with structured JSON output
7. Parse response (supports multiple output formats)
8. Filter annotations by minimum severity
9. Limit to max annotation count
10. Determine pass/fail conclusion
11. Update Check Run with inline annotations
12. Post PR review comment with summary

### Context Packing Strategies

Automatically selects the best strategy based on PR size:

| PR Size | Strategy | What Gets Sent |
|---------|----------|----------------|
| Small (<50K tokens) | **Full** | All file contents + full diff |
| Medium (50–150K) | **Mixed** | Most-changed files in full, rest as diff only |
| Large (>150K) | **Chunked** | Diff only, no file contents |

### Cost

Kimi's server-side prefix caching reduces repeat costs by ~75%:

| Scenario | Estimated Cost |
|----------|---------------|
| First review of a PR | ~$0.01–0.02 |
| Subsequent pushes (cache hit) | ~$0.003–0.01 |

| Token Type | Rate |
|-----------|------|
| Input | $0.39 / 1M tokens |
| Output | $1.90 / 1M tokens |
| Cached input | $0.10 / 1M tokens |

## Architecture

```
kimi-code-reviewer/
├── action/              # GitHub Action entry point
│   ├── action.yml       # Action metadata (inputs/outputs)
│   ├── index.ts         # Action runner
│   └── dist/            # Bundled Action (ncc)
├── src/
│   ├── index.ts         # Hono server entry point
│   ├── app.ts           # GitHub App initialization
│   ├── kimi/
│   │   ├── client.ts          # Moonshot API client
│   │   ├── context-packer.ts  # 256K context optimization
│   │   ├── cache-strategy.ts  # Prefix cache message ordering
│   │   ├── prompt-builder.ts  # System/user prompt construction
│   │   └── response-parser.ts # Robust JSON extraction
│   ├── github/
│   │   ├── webhooks.ts   # Event handlers
│   │   ├── pulls.ts      # PR data extraction
│   │   ├── checks.ts     # Check Run API (annotations)
│   │   └── comments.ts   # PR review comments
│   ├── review/
│   │   ├── orchestrator.ts    # 12-step review pipeline
│   │   ├── file-filter.ts     # Glob-based file filtering
│   │   ├── diff-analyzer.ts   # Unified diff parsing
│   │   └── summary-builder.ts # Markdown summary generation
│   ├── config/
│   │   ├── schema.ts     # Zod config validation
│   │   ├── defaults.ts   # Default config values
│   │   └── loader.ts     # YAML config loader from repo
│   └── utils/
│       ├── tokens.ts     # Token estimation + cost calculation
│       ├── logger.ts     # Pino structured logging
│       └── errors.ts     # Custom error classes
├── test/
│   └── unit/             # Vitest unit tests
├── .kimi-review.yml      # Self-review config
└── .github/workflows/
    ├── ci.yml            # CI: lint + test + build
    └── kimi-review.yml   # Self-review on PRs
```

## Development

```bash
npm run dev          # Start dev server (hot reload)
npm test             # Run tests
npm run build        # Compile TypeScript
npm run build:action # Bundle GitHub Action with ncc
npm run lint         # Type check only
```

## Severity Levels

| Level | Meaning | Example |
|-------|---------|---------|
| `critical` | Must fix before merge | Bugs, security vulnerabilities, data loss |
| `warning` | Should fix | Performance issues, bad practices |
| `suggestion` | Nice to have | Readability, maintainability improvements |
| `nitpick` | Optional | Style preferences, minor formatting |

## Score

Each review includes a quality score (0–100):

| Range | Rating |
|-------|--------|
| 90–100 | Excellent |
| 70–89 | Good |
| 50–69 | Needs improvement |
| < 50 | Significant issues |

---

## 中文說明

### 簡介

Kimi Code Reviewer 是基於 [Moonshot Kimi](https://platform.moonshot.ai) 大模型的 GitHub 代碼審查工具。與其他 AI code review 工具不同，Kimi 擁有 **256K token 的超長上下文窗口**，可以讀取 PR 中所有檔案的完整內容（不僅僅是 diff），提供更準確、更有上下文的審查建議。

### 特色

- **超長上下文**：256K token 窗口，可以同時理解多個檔案之間的關聯
- **多語言支援**：審查意見支援繁體中文、簡體中文、英文、日文、韓文
- **行內標註**：問題直接標註在 PR diff 的對應行上
- **智能快取**：Prefix caching 讓重複審查節省 75% 費用
- **靈活配置**：每個 repo 可以用 `.kimi-review.yml` 自訂審查規則

### 快速開始

#### 1. 取得 API Key

前往 **[Kimi Code Console](https://www.kimi.com/code/console)** 取得 API key（推薦，專為程式碼任務優化）。也可使用 [platform.moonshot.ai](https://platform.moonshot.ai) 的通用 API key。

#### 2. 設定 GitHub Secret

在你的 repo 中前往 **Settings → Secrets and variables → Actions**，新增：

- `MOONSHOT_API_KEY`：你的 Moonshot API key（`sk-...` 開頭）

#### 3. 建立 Workflow

在你的 repo 中建立 `.github/workflows/kimi-review.yml`：

```yaml
name: Kimi Code Review

on:
  pull_request:
    types: [opened, synchronize]

permissions:
  contents: read
  pull-requests: write
  checks: write

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: howardpen9/kimi-code-reviewer@main
        with:
          kimi_api_key: ${{ secrets.MOONSHOT_API_KEY }}
          language: zh-TW    # 使用繁體中文
          fail_on: never     # 不讓 check 失敗
```

#### 4. 自訂配置（選填）

在你的 repo 根目錄建立 `.kimi-review.yml`：

```yaml
language: zh-TW
model: kimi-k2.5

review:
  aspects:
    bugs: true           # 檢查 bug
    security: true       # 檢查安全漏洞
    performance: true    # 檢查效能問題
    style: true          # 檢查程式風格
    bestPractices: true  # 檢查最佳實踐
  minSeverity: suggestion  # 最低回報等級
  maxAnnotations: 30       # 最多標註數量
  failOn: critical         # 只有 critical 時才 fail

files:
  exclude:
    - "**/dist/**"
    - "**/*.lock"

# 自訂規則
rules:
  - name: 禁止 console.log
    description: "正式程式碼不應包含 console.log"
    severity: warning
    filePattern: "src/**/*.ts"
```

### 費用估算

| 場景 | 預估費用 |
|------|---------|
| 首次 PR 審查 | ~$0.01–0.02 |
| 同一 PR 後續 push（快取命中） | ~$0.003–0.01 |

### 嚴重程度說明

| 等級 | 說明 | 範例 |
|------|------|------|
| `critical` | 必須在合併前修復 | Bug、安全漏洞、資料遺失風險 |
| `warning` | 應該修復 | 效能問題、不良實踐 |
| `suggestion` | 建議改善 | 可讀性、可維護性提升 |
| `nitpick` | 可選 | 風格偏好、格式微調 |

---

## License

[MIT](LICENSE)
