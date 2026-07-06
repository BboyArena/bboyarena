# AI Agents

This directory contains the operational prompts used by AI agents during the development of **BboyArena**.

The goal is to give each agent a **clear responsibility**, reducing overlap and keeping the project architecture consistent.

These documents are intended to be used as context for AI coding assistants (such as Codex) and should be treated as role definitions rather than project documentation.

---

## Implemented Agents

| Agent | Charter | Responsibility |
| --- | --- | --- |
| Gameplay Agent | [`gameplay-agent.md`](./gameplay-agent.md) | Gameplay systems, player controller, game feel, and core mechanics |
| Rendering Agent | [`rendering-agent.md`](./rendering-agent.md) | Three.js, React Three Fiber, rendering pipeline, and performance |
| Input Agent | [`input-agent.md`](./input-agent.md) | Keyboard, touch, gamepad, and unified input abstraction |
| Website & Community Agent | [`website-community-agent.md`](./website-community-agent.md) | Website, community pages, documentation, and public communication |
| Devlog Agent | [`devlog-agent.md`](./devlog-agent.md) | Development logs, technical articles, and social content |

Additional roles such as animation, Blender pipeline, repository hygiene, architecture review, and product roadmap may be added later. They are not available until a corresponding charter exists in this directory.

---

## General Principles

Every agent should:

* Keep changes incremental and easy to review.
* Prefer simple solutions over unnecessary complexity.
* Avoid introducing new dependencies without clear justification.
* Respect the existing architecture.
* Clearly explain every change.
* Leave the project in a buildable state.

---

## Agent Priority

When responsibilities overlap, follow this priority order:

1. Architecture consistency
2. Gameplay quality
3. Performance
4. Maintainability
5. Refactoring

---

## Project Philosophy

BboyArena is being developed in the open.

The objective is **not** to build the perfect engine first, but to progressively create a fun and playable breaking game.

Whenever there is a choice between adding infrastructure or improving gameplay, gameplay takes priority.

> **A playable prototype is always more valuable than a perfect architecture with nothing to play.**

---

## Shared Project Context

All agents operate on the same project and should use the shared documentation as their primary source of truth before starting any task.

Unless explicitly instructed otherwise, every agent should read and respect the following documents:

1. [`PROJECT_SPEC.md`](../PROJECT_SPEC.md) — canonical inventory, technical stack, conventions, routes, components, and current state.
2. [`docs/current-architecture.md`](../docs/current-architecture.md) — runtime ownership and dependency boundaries.
3. [`ROADMAP.md`](../ROADMAP.md) — accepted product and technical direction when priorities matter.
4. [`agents/README.md`](./README.md) — shared role and collaboration rules.
5. The specific agent charter being used for the current task.

Agents should **not** re-analyze the entire project from scratch if the required information is already available in these documents.

When project documentation and previous assumptions conflict, the documentation takes precedence.

If documentation appears outdated, the agent should:

1. clearly identify the inconsistency;
2. explain why it may no longer reflect the current implementation;
3. propose an update;
4. avoid silently changing architectural decisions.

---

## Working Principles

Before making significant changes, every agent should:

* understand the current architecture;
* identify the affected modules;
* respect project boundaries;
* keep changes incremental;
* avoid unnecessary refactoring;
* preserve backward compatibility whenever reasonable;
* explain architectural decisions whenever introducing new patterns.

Agents should optimize for long-term maintainability rather than short-term convenience.

---

## Documentation First

Whenever a task introduces a new architectural concept, workflow, convention or reusable pattern, the responsible agent should also determine whether the shared documentation should be updated.

Documentation is considered part of the implementation, not an optional extra.

If appropriate, the agent should propose updates to:

* [`PROJECT_SPEC.md`](../PROJECT_SPEC.md)
* [`docs/current-architecture.md`](../docs/current-architecture.md)
* the relevant agent charter
* any related documentation under `docs/`

Keeping documentation synchronized with the implementation is part of the development process.

## Usage

Load the appropriate agent before starting a task.

Examples:

* Use **Gameplay Agent** when implementing new mechanics.
* Use **Rendering Agent** for Three.js or rendering improvements.
* Use **Input Agent** when working on keyboard, touch or gamepad controls.
* Perform an explicit architecture review before merging significant boundary changes.
* Perform a repository-hygiene review before creating a release.

Agents are designed to complement each other, not to replace human design decisions.
