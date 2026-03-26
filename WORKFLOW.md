---
# WORKFLOW.md Configuration
tracker:
  kind: linear
  project_key: "{LINEAR_PROJECT_KEY}"
  active_states:
    - Todo
    - In Progress
    - Merging
    - Rework
  terminal_states:
    - Done
    - Cancelled
    - Duplicate

workspace:
  root: ~/workspaces

hooks:
  after_create: "npm install"

agent:
  max_turns: 20
---

# veettukkar — Workflow

> How Claude Code builds this project, issue by issue

## Setup

This file tells Claude Code how to work on issues in this project:
1. **Tracker**: Linear (your issue tracker)
2. **States**: Todo → In Progress → Merging → Done
3. **Rules**: Read docs first, follow conventions, test before merging

## Status routing

### When state = Todo

1. Check prerequisites — are blocking tasks complete? If not, stop and report the blocker.
2. Read the task description carefully.
3. Plan your approach — describe what you'll do before writing code.
4. Move issue to **In Progress** when you start implementing.

### When state = In Progress

1. **Scope.** Only implement what the task describes.
2. **Conventions.** Follow SCAFFOLDING.md.
3. **Architecture.** Follow ARCHITECTURE.md.
4. **Tests.** Write tests alongside implementation.
5. **Commit.** `{ISSUE-ID}: brief description`

When done: push branch → create PR → move to **Merging**.

### When state = Merging

1. Check CI — are tests passing?
2. Address all PR feedback.
3. Validate against PRD and Architecture.
4. Merge PR → move to **Done**.

### When state = Rework

1. Read all Linear comments for specific feedback.
2. Address each point.
3. Push fixes → move back to **Merging**.

## Completion gates

Before any issue moves to Done:
- [ ] Implementation matches task description
- [ ] Tests pass
- [ ] PR merged
- [ ] Linear comment documents what was done

## Escape hatch

If you hit a genuine blocker:
1. Add a Linear comment describing the blocker precisely
2. Move issue to **Rework**
3. Stop — do not guess or work around issues

## Symphony Execution Loop

```
LOOP:
  1. Query Linear for next Todo issue
  2. Move to In Progress
  3. Read context (CLAUDE.md, ARCHITECTURE.md, SCAFFOLDING.md)
  4. Plan → Implement → Test → PR
  5. Move to Merging → handle CI → Merge
  6. Move to Done → pick next
```
