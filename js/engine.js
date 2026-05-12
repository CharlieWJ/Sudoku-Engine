// ─── engine.js — Puzzle generation & solving ─────────────────────────────────

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isValid(board, row, col, num) {
  if (board[row].includes(num)) return false;
  for (let r = 0; r < 9; r++) if (board[r][col] === num) return false;
  const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
  for (let r = br; r < br + 3; r++)
    for (let c = bc; c < bc + 3; c++)
      if (board[r][c] === num) return false;
  return true;
}

function fillBoard(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        const nums = shuffle([1,2,3,4,5,6,7,8,9]);
        for (const n of nums) {
          if (isValid(board, row, col, n)) {
            board[row][col] = n;
            if (fillBoard(board)) return true;
            board[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateSolution() {
  const board = Array.from({length: 9}, () => Array(9).fill(0));
  fillBoard(board);
  return board;
}

// Count solutions up to `limit` — stops early once limit is reached
function countSolutions(board, limit = 2) {
  let count = 0;
  function solve(b) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (b[row][col] === 0) {
          for (let n = 1; n <= 9; n++) {
            if (isValid(b, row, col, n)) {
              b[row][col] = n;
              solve(b);
              b[row][col] = 0;
              if (count >= limit) return;
            }
          }
          return;
        }
      }
    }
    count++;
  }
  solve(board.map(r => [...r]));
  return count;
}

// Clue counts per difficulty
const CLUES = { easy: 36, medium: 30, hard: 26, pro: 24, expert: 22 };

function createPuzzle(solution, difficulty) {
  const clueCount = CLUES[difficulty];
  const puzzle = solution.map(r => [...r]);
  const cells = shuffle([...Array(81).keys()]);
  let removed = 0;
  const target = 81 - clueCount;

  for (const idx of cells) {
    if (removed >= target) break;
    const row = Math.floor(idx / 9), col = idx % 9;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;
    if (countSolutions(puzzle) === 1) {
      removed++;
    } else {
      puzzle[row][col] = backup;
    }
  }
  return puzzle;
}
