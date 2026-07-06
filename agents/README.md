# AI Agents

This directory contains the operational prompts used by AI agents during the development of **BboyArena**.

The goal is to give each agent a **clear responsibility**, reducing overlap and keeping the project architecture consistent.

These documents are intended to be used as context for AI coding assistants (such as Codex) and should be treated as role definitions rather than project documentation.

---

## Available Agents

| Agent                  | Responsibility                                                            |
| ---------------------- | ------------------------------------------------------------------------- |
| Gameplay Agent         | Gameplay systems, player controller, game feel, core mechanics            |
| Rendering Agent        | Three.js, React Three Fiber, rendering pipeline, performance              |
| Input Agent            | Keyboard, touch, gamepad and unified input abstraction                    |
| Animation Agent        | Motion system, moves, pose blending, timing and BPM                       |
| Blender Pipeline Agent | Blender workflow, rigs, GLTF export, asset pipeline                       |
| Website Agent          | Website, community pages, documentation and public communication          |
| Devlog Agent           | Development logs, technical articles and social content                   |
| Repo Hygiene Agent     | Repository organization, releases, documentation and CI                   |
| Architecture Reviewer  | Technical reviews, architecture validation and overengineering prevention |
| Product Roadmap Agent  | Milestones, priorities and long-term planning                             |

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

## Usage

Load the appropriate agent before starting a task.

Examples:

* Use **Gameplay Agent** when implementing new mechanics.
* Use **Rendering Agent** for Three.js or rendering improvements.
* Use **Input Agent** when working on keyboard, touch or gamepad controls.
* Use **Architecture Reviewer** before merging significant changes.
* Use **Repo Hygiene Agent** before creating a release.

Agents are designed to complement each other, not to replace human design decisions.
