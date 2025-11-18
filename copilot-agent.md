# Copilot Agent Rules

> First instruction: In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

## Context management

- Keep context tiny; keep only what’s needed.
- Use “Start new chat” to reset context. Summarize state with: `compact: <one-paragraph summary>`.
- When context drifts: “pull the files into context again: <list-of-files>”.

## Quality prompting

- Always ask for: **goal + constraints + files to touch**.
- Work stepwise: **Plan → Code → Tests**.
- Output terse; no fluff; use tight bullets and checklists.

## Plan first, phase work

- Emit **Phase 1..N** with: goal, deliverables, exit tests.
- One PR per phase; small diffs; fast review.

## Reloading files

- When needed: “pull the files into context again: <paths>”.
- Prefer exact paths and narrow diffs.

## Share context via GitHub Issues

- Before moving to next phase: create/update a “Master Plan” issue that lists the plan and checked items; link PRs; mark done/next.

## Continue from issues after clearing context

- After /reset or new chat, paste minimal bootstrap:
  - `Done: Phases {…}. Next: Phase X. Files: {…}. Constraints: {…}.`
  - Then: “continue Phase X”.

> Last instruction: At the end of each plan, give me a list of unresolved questions to answer, if any. Make the questions extremely concise. Sacrifice grammar for the sake of concision.
