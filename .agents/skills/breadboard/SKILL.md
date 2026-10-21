---
name: breadboard
description: Map a workflow or selected shape into concrete places, UI affordances, code affordances, data stores, wiring and vertical slices for this React site. Use to detail a shape, trace an existing flow, or prepare implementation slices.
---

# Breadboard

Turn a user journey or selected shape into affordance tables. The tables are the source of truth;
diagrams are optional.

## Workflow

1. Resolve the source: a shaping doc, an existing breadboard, or the user journey. Resume an existing
   artifact for the same work when there is one.
2. Pick the mode: map an existing flow, detail a selected shape, or slice a breadboard.
3. Identify **Places** with the blocking test: if the user cannot interact with what is behind a
   surface, it is a separate Place. A route, a modal and the work-page close are Places.
4. Trace the real layers of this app: routes (`src/lib/route.ts`, `router.tsx`), pages (`src/pages/`),
   components (`src/components/`), hooks and state, pure helpers (`src/lib/`), the content model
   (`src/content/`) and generated data (`src/data/`).
5. Write four tables with declared identifiers:
   - **Places** (P1, P2, ...): name, route or surface, how you get there.
   - **UI affordances** (U1, ...): place, control or visible outcome, trigger, wires out.
   - **Code affordances** (C1, ...): module and function or component, what it does, wires in and out.
   - **Data stores** (D1, ...): content file, generated file, URL, local state, with owner.
6. Every visible outcome and every wire endpoint needs a declared identifier. Reject prose or diagram
   edges that are not in the table wiring.
7. For slices, require a demonstrable initiating action to a visible result. Mark a slice blocked when a
   required mechanism is missing; never substitute a horizontal infrastructure slice for the workflow.
8. Save `<date>/plans/<date>-<slug>-breadboard.md` (see `AGENTS.md`, "Plans and other artifacts").

## Output

The artifact path, mode, source journey, the riskiest wires, missing mechanisms, and whether the next step
is a bounded spike, another revision, or `design-spec` or `builder`.
