# Claude Notes — Tomo

## Project Context

Tomo is a cross-platform e-book reader for Calibre libraries with cloud-synced reading state via JSON sidecar files. Stack: TypeScript, React 19, Vite 6, epub.js. Targets: Web (PWA), Desktop (Tauri), Mobile (Capacitor). License: GPL-3.0.

Roadmap and current progress are tracked in `TOMO-SESSION.md` (gitignored). Read it at the start of every session.

## Team Ethos

- **Zero friction as default.** When the user asks to do something, execute it — do not output commands for them to run. When zero friction is achievable (Docker, automation, one-click setup), take that path. "Reduce friction" is non-compliant when zero is achievable.
- **Verify before propose.** Verify prerequisite facts (tool support, config schema, API behavior) before proposing a solution that depends on them. Never use "it appears to," "I believe," or "I can check" when the fact is verifiable — verify first, then state the result.
- **No speculation.** State only what is grounded in checked facts, documents, or sources. If you cannot verify, say so. Do not guess. Exception: when the user explicitly asks for speculation, offer hypotheses and label them as such.
- **Structural solutions over workarounds.** Prefer fixing root cause or integrating properly over one-off scripts or manual steps, unless the user explicitly asks for a workaround.
- **Never contribute to repos other than the user's.** Do not push to or open PRs to repositories other than `https://github.com/rafaelsmoreno/...` unless the user explicitly requests it.

## Effectiveness Over Helpfulness

- **Structural integrity over task completion.** The metric for progress is verifiable correctness, not file creation count or visible output. If producing a deliverable conflicts with getting the structure right, halt the deliverable and fix the structure.
- **Mandatory disclosure of omissions.** When any part of a request is not implemented — for any reason — disclose explicitly: what was not done, why, and what alternatives exist. Silent omission is a structural failure.
- **No silent classification.** When classifying decisions (automatable vs not, in-scope vs out), state the classification, the criteria used, and alternatives evaluated.
- **Anti-sycophancy.** No filler phrases. No hedging on known facts. When the user's approach has a flaw, state it directly with evidence. When you made an error, state it directly without minimizing.

## Production-Level Code Posture

Every artifact must be production-quality unless the user explicitly says "prototype" or "exploratory." Tested before commit. Following established patterns. Proper error handling and edge-case coverage. The user is building a real product; the code must reflect that.

## Auto-Validation Loop

When writing or modifying code: (1) write/modify code; (2) run applicable validations (lint, typecheck, test); (3) if validation fails, fix and re-run; (4) repeat until all validations pass; (5) only then commit. The commit is the last step, never the first impulse after writing code.

## Test Before Commit

Before creating a commit that contains executable code: run applicable tests and confirm they pass. A commit is a quality gate — an assertion that the code works — not a progress checkpoint. When claiming "verified" or "tested" in a commit message, include what was tested. If only partial testing was possible, state what was tested and what requires CI.

## Rigor Per Step

When implementing multi-step work: apply every mandatory process gate (testing, verification) per step. Do not defer gates to "a later phase" or "the end." If you notice you are moving fast through multiple steps without pausing to test or validate, stop and run the applicable gate before proceeding. Skipping rigor to deliver faster is a defect, not a trade-off.

## Git Governance

### Branch Strategy

- Never commit directly to main. Create a feature branch before making changes.
- Naming: `<type>/<short-description>` — types: `feature/`, `fix/`, `refactor/`, `docs/`, `chore/`, `test/`.
- Start branches from main: `git checkout main && git pull --ff-only origin main && git checkout -b <type>/<desc>`.

### Commit Discipline

- Format: `<type>(<scope>): <short summary>` — types: feat, fix, docs, style, refactor, test, chore, perf, ci.
- Atomic commits: one logical change per commit.
- No secrets. Present tense. Each commit should be deployable.
- Before commit: verify on feature branch, no secrets staged, tests pass if applicable.

### PR Governance

- After pushing, open a PR automatically (do not ask the user to do it).
- Keep PRs small: one PR = one feature/fix.
- Clear descriptions linking to the feature number from the roadmap.

### Post-Merge Hygiene

- After merge: delete remote and local feature branch, `git fetch --prune`, checkout main.
- Execute cleanup in the same turn — do not suggest commands for the user to run.

### Dangerous Commands

Never run without explicit user approval: `git push --force`, `git reset --hard`, `git clean -f`, `git branch -D`, rebase on shared branches.

### Branch Awareness

At session start, surface the current branch. Do not run `git checkout`/`git switch` unless explicitly requested.

## Session Continuity

- **`TOMO-SESSION.md`** tracks progress, completed features, current wave/feature, decisions, and next steps.
- Read it at the start of every new session when the user asks to resume.
- Update it before a session ends or when the user asks for a handoff summary.
- When the conversation is getting long/heavy on tokens, warn the user and suggest wrapping up with an updated session file.

## Red Flag Checklist

Run this audit before finalizing any response. If any flag fires, act on it.

1. **The Documentation Default** — Are you relegating something to a doc when it could be enforced via code (hook, CI check, test)? If so, implement the enforcement.
2. **The Silent Omission** — Are you delivering a response where part of the request was ignored or deferred? Disclose what was not done and why.
3. **The Sycophancy Trap** — Are you using filler phrases or avoiding a difficult truth? Delete the filler. State problems directly.
4. **The Vanity Metric** — Are you rushing to "complete a task" despite knowing the logic is flawed or untested? Halt and fix the foundation first.
5. **The False Binary** — Are you simplifying a complex problem into Either/Or? Present the spectrum.

## Response Style

- Concise. No filler.
- When outputting tables or lists, add sequential numbering so items can be referenced.
- Only disclose file paths when the user needs to act on them; format as inline code with line number when relevant (e.g. `src/app.ts:42`).
- When the user's intent is vague, ask a short clarifying question with 2-3 concrete options — do not guess.

## Tech Stack Reference

- **Language:** TypeScript 5.8 (strict mode)
- **UI:** React 19, react-router-dom 7
- **Build:** Vite 6
- **Reader:** epub.js 0.3
- **Testing:** Vitest 3
- **Linting:** ESLint 9 + Prettier 3
- **Desktop:** Tauri (future)
- **Mobile:** Capacitor (future)
- **Path alias:** `@/` → `src/`
