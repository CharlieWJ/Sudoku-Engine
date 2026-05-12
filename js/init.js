// ─── init.js — Event listeners & app boot ────────────────────────────────────

// Difficulty buttons
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    difficulty = btn.dataset.diff;
  });
});

// Action buttons
document.getElementById('newBtn').addEventListener('click', generatePuzzle);
document.getElementById('checkBtn').addEventListener('click', checkBoard);
document.getElementById('hintBtn').addEventListener('click', giveHint);
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('solveBtn').addEventListener('click', solvePuzzle);

// Toggle buttons
document.getElementById('notesToggle').addEventListener('click', toggleNotes);
document.getElementById('timerToggle').addEventListener('click', toggleTimer);
document.getElementById('strikesToggle').addEventListener('click', toggleStrikes);

// Theme toggle
const themeToggleBtn = document.getElementById('themeToggle');
themeToggleBtn.addEventListener('click', () => {
  isLight = !isLight;
  document.documentElement.classList.toggle('light', isLight);
  themeToggleBtn.textContent = isLight ? '🌙' : '☀️';
});

// Keyboard shortcuts
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo(); return; }
  if (e.key >= '1' && e.key <= '9') enterNum(+e.key);
  if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') eraseCell();
  if (e.key === 'n' || e.key === 'N') toggleNotes();
  if (!selected) return;
  const [r, c] = selected;
  const moves = { ArrowUp: [-1,0], ArrowDown: [1,0], ArrowLeft: [0,-1], ArrowRight: [0,1] };
  if (moves[e.key]) {
    e.preventDefault();
    const [dr, dc] = moves[e.key];
    selectCell(Math.max(0, Math.min(8, r + dr)), Math.max(0, Math.min(8, c + dc)));
  }
});

// Boot
buildGrid();
buildNumpad();
generatePuzzle();
