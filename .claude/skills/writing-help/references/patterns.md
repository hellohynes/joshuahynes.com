# Editing patterns

Adapted from [petergyang/no-ai-slop](https://github.com/petergyang/no-ai-slop). Apply these patterns
as evidence, not as a claim about who wrote the draft.

## Editing principles

- Preserve the writer's point, voice, useful edge, and supported detail.
- Lead with the point when setup adds nothing.
- Prefer active voice, direct verbs, concrete mechanisms, and sourced numbers.
- Make the minimum effective edit. Do not flatten every paragraph into the same shape.
- Keep structure when it helps the reader. Reorganize only when the document is doing the wrong job
  or mixing incompatible audiences.

## Patterns to detect

| Pattern                 | Evidence                                                                       | Fix                                                  |
| ----------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------- |
| Binary contrast         | "It isn't X. It's Y." or "not just X, but Y"                                   | State the useful claim directly.                     |
| Throat clearing         | "Here's the thing," "It's worth noting," or "Let's dive in"                    | Start with the point.                                |
| Faux insight            | "What everyone misses" or "The uncomfortable truth"                            | Remove the setup and support the claim.              |
| Colon reveal            | A dramatic noun phrase followed by a lowercase reveal                          | Write a plain sentence. Keep colons for real lists.  |
| Superficial analysis    | Trailing "highlighting," "showcasing," "reflecting," or "underscoring" clauses | Explain the actual consequence or stop the sentence. |
| Importance puffery      | "Pivotal," "transformative," "vital," or similar unsupported importance        | State the fact and let the reader judge it.          |
| Weasel attribution      | "Experts agree," "studies show," or "many believe" without a named source      | Name the source or remove the claim.                 |
| Fake-strong verb        | "Serves as," "stands as," or a forceful verb hiding a simpler fact             | Prefer `is`, `has`, or the concrete action.          |
| Synonym cycling         | Rotating names for the same actor, system, or concept                          | Repeat the precise term.                             |
| Negative listing        | "Not X. Not Y. Z." used for rhythm rather than a contract                      | State Z directly. Keep real safety boundaries.       |
| Dramatic fragmentation  | Stacked fragments such as "And X. And Y." or a mic-drop line                   | Use complete sentences and end on a concrete point.  |
| Robotic rhythm          | Repeated sentence openings, paragraph shapes, or identical bullet grammar      | Combine or vary only where the content warrants it.  |
| Rhetorical setup        | Self-answered questions, "Think about it," or "Plot twist"                     | Make the claim directly.                             |
| Fake-profound ending    | A metaphor, aphorism, or slogan that claims depth without adding information   | Delete it and end on the last concrete point.        |
| Summary-recap ending    | A final paragraph that repeats the document                                    | End with a takeaway, result, or next action.         |
| Formatting slop         | Decorative emoji, scattered bold, tiny sections, or bullets better as prose    | Let the content determine the structure.             |
| Em-dash habit           | Dashes used repeatedly as a default cadence                                    | Prefer periods, commas, or parentheses when clearer. |
| Abstract nominalization | "Realization," "enablement," or another noun hiding who does what              | Name the actor and action.                           |
| Tangled sentence        | Several independent claims or caveats joined into one sentence                 | Split by idea without removing supported nuance.     |

## Technical-writing exceptions

Do not apply a surface rule when it would make the technical contract less precise.

- Preserve project and product names as proper nouns even when the same word appears on a generic banned-word list.
- Preserve exact negative constraints such as "does not write seed data" and "fails on unknown
  ownership."
- Preserve repeated identifiers when they refer to distinct code types or stages. Explain the
  distinction instead of replacing them with casual synonyms.
- Preserve lists that encode real options, validation rules, mappings, or ordered procedures.
- Preserve hedging when the source is genuinely uncertain.

## Surface notes

- Chat: lead with the result. No recap of what you just did.
- Code comments: say why, not what. Do not narrate the change.
- Plans and PR bodies: open with a plain-language summary; put technical detail below it.

## Final check

Confirm that the result:

1. Preserves every supported fact and constraint.
2. Leads with what the reader needs.
3. Uses consistent terms and concrete actions.
4. Avoids repeated rhythm and decorative structure.
5. Sounds natural when read to a sharp colleague.
