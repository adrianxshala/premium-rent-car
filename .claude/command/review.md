---
description: Review uncommitted TypeScript changes with the ts-reviewer agent
allowed-tools: Bash(git diff:*), Bash(git status:*), Read, Grep, Glob
---

Review the current code changes using the **ts-reviewer** agent.

Scope:

- If `$ARGUMENTS` names files or paths, review only those.
- Otherwise review all uncommitted changes (`git diff` + staged).

Current changes:
!`git status --short`

!`git diff --stat`

Delegate to the ts-reviewer subagent and return its verdict (APPROVE / APPROVE WITH NITS / REQUEST CHANGES) with issues listed most-serious-first. Keep it terse.
