# Sudoku

A browser-based Sudoku puzzle generator and solver — no build step, no dependencies.

## Features

- **5 difficulty levels** — Easy, Medium, Hard, Pro, Expert
- **Hint system** — strategy-aware hints (Naked Single → Hidden Single → Naked Pair → Pointing Pair) with a plain-English explanation for each
- **Notes mode** — toggle candidate pencil marks on/off per cell
- **Scoring** — points for correct placements, bonuses for completing rows/cols/boxes, deductions for wrong entries; scaled by difficulty
- **Strikes mode** — optional 3-strike limit before game over
- **Undo** — step back through your move history
- **Check** — highlight any incorrect entries on the board
- **Solve** — reveal the full solution
- **Timer** — toggleable elapsed-time display
- **Light/Dark mode** — toggle in the top-right corner

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `1`–`9` | Enter digit in selected cell |
| `0`, `Backspace`, `Delete` | Erase selected cell |
| Arrow keys | Move selection |
| `N` | Toggle Notes mode |
| `Ctrl`/`Cmd` + `Z` | Undo |

## Running locally

**Option 1 — open directly:**
Double-click `index.html` to open it in your default browser.

**Option 2 — local server:**
```
python3 -m http.server 8080
```
Then visit `http://localhost:8080`.
