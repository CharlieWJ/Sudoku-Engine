# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Running locally

Open `index.html` directly in a browser, or serve it:

```
python3 -m http.server 8080
```

There is no build step, no package manager, and no test suite — this is plain HTML/CSS/JS.

## Architecture

The app is split into seven vanilla JS files loaded via `<script>` tags in `index.html`. **Load order is a hard dependency** — each file assumes symbols from earlier files exist on `window`:

| Order | File | Responsibility |
|-------|------|----------------|
| 1 | `js/engine.js` | Pure puzzle logic: board generation, uniqueness checking (`countSolutions`), clue removal |
| 2 | `js/state.js` | All shared mutable globals (`puzzle`, `solution`, `userBoard`, `notes`, `selected`, `history`, etc.) and `pushHistory()` / `flatNotes()` helpers |
| 3 | `js/render.js` | DOM-only: builds the grid/numpad, `renderGrid()`, `selectCell()`, status/hint banner helpers |
| 4 | `js/scoring.js` | Score math + visual feedback (popup, bump animation, confetti via `launchCheers`) |
| 5 | `js/hints.js` | Strategy engine: Naked Single → Hidden Single → Naked Pair → Pointing Pair; `giveHint()` dispatches and falls back to a random fill |
| 6 | `js/game.js` | Game flow: `generatePuzzle()`, `enterNum()`, `eraseCell()`, `undo()`, timer, strikes |
| 7 | `js/init.js` | Event wiring (buttons, keyboard shortcuts) and boot (`buildGrid(); buildNumpad(); generatePuzzle()`) |

### Key data structures

- `puzzle[r][c]` — given clues (0 = blank); never mutated after generation
- `userBoard[r][c]` — player's working board; mirrored from `puzzle` at start
- `notes[idx]` — flat array of 81 entries, each a 10-element boolean array (index 1–9 = candidate on/off)
- `history` — undo stack; each entry is a snapshot of `{userBoard, notes, selected, hintCells, score}`

### Puzzle generation

`engine.js` uses backtracking (`fillBoard`) with randomized digit order to produce a complete solution, then `createPuzzle` removes cells while verifying uniqueness via `countSolutions(board, limit=2)`. Clue counts per difficulty: easy 36, medium 30, hard 26, pro 24, expert 22.

### Hint strategy pipeline

`findHint()` in `hints.js` tries strategies in order of complexity and returns the first hit. Pointing Pair hints populate candidate notes instead of filling a cell directly. If no strategy fires, `giveHint()` falls back to filling a random incorrect/empty cell from `solution`.

### Scoring

`calcScore` in `scoring.js` applies a `DIFFICULTY_MULTIPLIER` (1×–3×). Correct placements earn a random 1–5 base × multiplier; completing a row/col/box adds a bonus; completing all three simultaneously triggers the confetti overlay. Wrong placements deduct `10 × multiplier`.
