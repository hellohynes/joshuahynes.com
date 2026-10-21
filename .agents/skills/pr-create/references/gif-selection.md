# GIF selection

Every PR body carries one GIF. Select a real one for a new PR. An existing PR keeps its current valid GIF
unless the user asks for a replacement; add one when an update has none.

The GIF is required. Never publish a guessed, inaccessible, non-GIF or placeholder URL. If a validated GIF
cannot be selected, stop before any push or PR mutation and say why. The user can supply a GIF URL or say
to publish without one. Only that explicit instruction allows a PR with no GIF; record it in the handoff.

## Search angles

Pick two different angles for the PR title type. The phrases omit the word `gif`; add
`gif site:giphy.com` when building the web query. Do not use the same two angles every time.

| Title type | Search angles                                                                                                   |
| ---------- | --------------------------------------------------------------------------------------------------------------- |
| `feat`     | `excited reaction`, `big reveal`, `new feature launch`, `tada surprise`, `first look`, `level up`               |
| `fix`      | `relief reaction`, `phew that was close`, `disaster averted`, `close call`, `problem solved`, `crisis handled`  |
| `refactor` | `satisfying clean`, `organized finally`, `makeover transformation`, `clean desk`, `tidy up`, `before and after` |
| `docs`     | `taking notes`, `reading manual`, `documentation complete`, `book stack`, `study session`, `explainer`          |
| `style`    | `polished look`, `fresh coat of paint`, `makeover reveal`, `looks good`, `design sparkle`, `clean design`       |
| `test`     | `quality check`, `passed inspection`, `science experiment`, `green check`, `all clear`, `detective work`        |
| `chore`    | `fresh start`, `toolbox`, `maintenance mode`, `organized workflow`, `spring cleaning`, `housekeeping`           |
| `perf`     | `zoom fast`, `turbo speed`, `lightning quick`, `fast loading`, `speed boost`, `vroom`                           |
| `build`    | `construction site`, `building blocks`, `assembly line`, `under construction`, `stacking bricks`, `crane lift`  |
| `ci`       | `conveyor belt`, `domino chain`, `well oiled machine`, `pit crew`, `relay race`, `automatic doors`              |
| `revert`   | `rewind`, `undo button`, `moonwalk back`, `take it back`, `reverse reverse`, `back to the future`               |

For a breaking change, use `careful warning`, `handle with care`, `proceed with caution`, `heads up`,
`watch your step` or `warning sign`.

## Selection process

1. Choose two different search terms from the title type or the change.
2. Search the web with your runtime's search tool for each term plus `gif site:giphy.com`, for example
   `quality check gif site:giphy.com`. A search that returns nothing is not a result: retry with another
   angle or another search engine.
3. Extract Giphy IDs from results shaped like `https://giphy.com/gifs/<slug>-<ID>`; the ID is the text
   after the last hyphen. Results under `/explore/` and channel pages are not GIFs. When fewer than four
   GIF pages come back, open one `/explore/<term>` page and take its `/gifs/` links.
4. Combine the candidates from both searches.
5. Skip the first result of each search when possible to avoid the most repeated GIF.
6. Pick from positions 2 to 6 of the combined pool, seeded by the current minute: `start = 1`,
   `end = Math.min(5, pool_size - 1)`, `index = start + (current_minute % (end - start + 1))`. With a
   one-item pool, use index `0`.
7. Reject empty IDs and placeholders such as `XXXXX`, `path/to/gif`, example IDs, or a Giphy page URL.
   Use the clean form `https://media.giphy.com/media/<ID>/giphy.gif`.
8. Request the chosen URL (`curl -sI -L "<url>"`) and require a 200 response with `content-type:
   image/gif`. If that check cannot run or fails, treat the selection as failed and follow the rule above.

Do not use robot, AI or automation-themed GIFs unless the PR is about those topics.

## In the body

Add it as the last section:

```
## GIF

![<short description of what the GIF shows>](https://media.giphy.com/media/<ID>/giphy.gif)
```

The alt text describes the GIF, not the PR.
