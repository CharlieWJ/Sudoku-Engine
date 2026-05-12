// ─── state.js — Shared game state ────────────────────────────────────────────

let puzzle    = [];
let solution  = [];
let userBoard = [];
let notes     = [];
let selected  = null;
let notesMode = false;
let difficulty = 'easy';
let solved    = false;

// Timer
let timerInterval, startTime, elapsed = 0;
let timerEnabled = true;

// Strikes
let strikesEnabled = false;
let strikes = 0;
const MAX_STRIKES = 3;

// History (undo stack)
let history = [];

// Hint tracking
let hintCells = new Set();

// Score
let score = 0;

// Theme
let isLight = false;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function flatNotes() {
  return Array.from({length: 81}, () => Array(10).fill(false));
}

function pushHistory() {
  history.push({
    userBoard: userBoard.map(r => [...r]),
    notes:     notes.map(n => [...n]),
    selected:  selected ? [...selected] : null,
    hintCells: new Set(hintCells),
    score,
  });
}
