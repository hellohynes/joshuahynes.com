---
name: shaping
description: Shape ambiguous work by exploring requirements, solution mechanisms, fit checks and spikes before implementation. Use when the problem is clear enough to explore but the solution is not, such as a new page, interaction or layout idea.
---

# Shaping

Produce a selected mechanism that can be breadboarded and built without hiding an important decision.

## Entry points

- **Discovery:** a vague idea. Establish the problem first: who sees it, what is wrong or missing now.
- **Requirements first:** a known problem with an open solution. Write the requirements first.
- **Shapes first:** a proposed solution to evaluate. Extract its requirements and the competing shapes.

## Workflow

1. Resolve the artifact (see `AGENTS.md`, "Plans and other artifacts"): resume the current shaping doc
   for this work, or create `<date>/plans/<date>-<slug>-shaping.md`.
2. Gather context from the repo: the route and content model (`README.md`, `src/content/`), the
   components involved, the existing design language, and any constraint such as the Vite `base` rule.
3. Write concise requirements, grouping subordinate constraints under the one they serve. Label each R1,
   R2, and so on.
4. Describe mutually exclusive shapes as mechanisms (what changes where), not aspirations. Label A, B,
   and so on.
5. Mark any mechanism you cannot yet explain as unknown and define a bounded spike: the question, the
   smallest throwaway check, and what result decides it.
6. Run a binary fit check: requirements as rows, shapes as columns, pass or fail. An unknown cannot pass.
7. Make the selection and the remaining decisions visible. Do not choose silently between shapes that
   differ in product behavior; ask.
8. Route the selected shape to `breadboard`. If it is small and concrete, `design-spec` or `builder`
   can follow directly.

## Output

The entry point, artifact path, requirements, shapes, fit-check result, selected shape or open decision,
required spikes, and the next skill.
