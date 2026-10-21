---
name: writing-help
description: Rewrite or audit anything an agent writes (chat replies, code comments, plans and shaping documents, documentation, PR descriptions, reports) into plain, terse, human prose by removing named AI-slop patterns while preserving technical meaning. Use when the user invokes writing-help, asks whether writing sounds AI-generated, requests less generic or more human copy, or wants a direct, concrete rewrite. AGENTS.md applies the patterns as a standing rule.
---

# Writing Help

Edit prose without flattening the writer's voice or weakening technical contracts.

This skill is adapted from [Peter Yang's no-ai-slop skill](https://github.com/petergyang/no-ai-slop).
Read [references/patterns.md](references/patterns.md) before auditing or editing. The original license
is preserved in [LICENSE.txt](LICENSE.txt).

## Modes

| Mode   | Trigger                                              | Behavior                                                                                          |
| ------ | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Detect | Audit, review, scan, check, or "does this sound AI?" | Report named patterns with a short quote and fix. Do not edit, score, or guess who wrote it.      |
| Edit   | Edit, rewrite, fix, tighten, apply, or make human    | Make the minimum effective changes, then return the revised prose or changed files and a summary. |

When the request is ambiguous, default to detect mode. A named file narrows scope; it does not by
itself authorize edits.

## Where it applies

Edit mode applies to text this session wrote. Existing human-written text stays detect-only unless
the user asks for an edit.

| Output                                        | How                                                                                           |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Chat replies                                  | Standing rule in `AGENTS.md`. Apply the patterns while writing; do not run the full workflow. |
| Code comments                                 | Apply the patterns while writing: say why, not what.                                          |
| Plans, shaping, breadboard, design-spec, build plans | Edit mode on the finished document.                                                    |
| Documentation (`README.md`, `AGENTS.md`)      | Edit mode. Keep the commands, paths and rules exact.                                          |
| PR bodies                                     | `pr-create` runs it on the drafted body.                                                      |
| Site copy (`src/content/`)                    | Detect mode only, unless the user asks for an edit. It is the user's own voice.               |

## Workflow

1. Read the complete draft or bounded document before changing it.
2. Identify the reader, the document's job, and the facts or constraints that must survive. Ask one
   question only when a missing answer would materially change the edit.
3. Notice the writer's vocabulary, cadence, bluntness, humor, uncertainty, and level of polish.
4. Apply the named patterns in [references/patterns.md](references/patterns.md). Leave strong,
   specific sentences alone.
5. Preserve names, numbers, citations, code identifiers, CLI flags, file paths, and contract language
   unless the source proves they are wrong.
6. Read the result aloud mentally. Remove repeated sentence shapes, ornamental formatting, empty
   setup, and abstract wording that still obscures the point.
7. For repository docs, run the checks the changed surface needs (`pnpm check` for content files,
   `pnpm lint` for code comments).

## Guardrails

- Treat project and product names as proper nouns, even when a generic word list would otherwise flag them.
- Keep negative statements that define safety, ownership, unsupported behavior, or failure modes.
  Rewrite only theatrical or repetitive negative framing.
- Keep current-state documentation current. Do not add roadmap promises or speculative behavior to
  explain an implemented feature.
- Prefer the same precise domain term throughout. Do not rotate among near-synonyms merely for
  variety.
- Do not invent examples, metrics, sources, user quotes, or technical behavior.

## Output

For detect mode, provide:

- The pattern name.
- A short quote or exact file and line.
- Why it weakens this document.
- The smallest useful fix.

For edit mode, provide the full revised draft when the user pasted prose. For repository files,
report the changed files, the important edits, and validation results. Add a short `What changed`
section, but do not append a conclusion that repeats the document.
