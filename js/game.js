// ─── game.js — Game flow & input handling ─────────────────────────────────────

// ─── Note peer removal ────────────────────────────────────────────────────────

function removeNoteFromPeers(r, c, n) {
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 9; i++) {
    notes[r * 9 + i][n] = false; // same row
    notes[i * 9 + c][n] = false; // same col
  }
  for (let dr = 0; dr < 3; dr++)
    for (let dc = 0; dc < 3; dc++)
      notes[(br + dr) * 9 + (bc + dc)][n] = false; // same box
}

// ─── Puzzle generation ────────────────────────────────────────────────────────

function generatePuzzle() {
  solved    = false;
  selected  = null;
  history   = [];
  hintCells = new Set();
  strikes   = 0;
  updateStrikesDisplay();
  resetScore();
  setStatus('');
  hideHintBanner();
  document.getElementById('winOverlay').classList.remove('show');
  document.getElementById('grid').classList.add('generating');
  setStatus('Generating…');

  setTimeout(() => {
    solution  = generateSolution();
    puzzle    = createPuzzle(solution, difficulty);
    userBoard = puzzle.map(r => [...r]);
    notes     = flatNotes();
    renderGrid();
    document.getElementById('grid').classList.remove('generating');
    setStatus('');
    startTimer();
  }, 20);
}

// ─── Win / lose ───────────────────────────────────────────────────────────────

function checkWin() {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (userBoard[r][c] !== solution[r][c]) return;
  solved = true;
  stopTimer();
  const t = formatTime(elapsed);
  document.getElementById('winTime').textContent  = `Completed in ${t} — ${difficulty}`;
  document.getElementById('winScore').textContent = `Final score: ${score}`;
  document.getElementById('winOverlay').classList.add('show');
}

function checkBoard() {
  let errors = 0;
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (puzzle[r][c] === 0 && userBoard[r][c] !== 0 && userBoard[r][c] !== solution[r][c])
        errors++;
  if (errors === 0) setStatus('No errors found!', 'win');
  else setStatus(`${errors} error${errors > 1 ? 's' : ''} found.`, 'err');
  renderGrid();
}

function solvePuzzle() {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      userBoard[r][c] = solution[r][c];
  solved = true;
  stopTimer();
  setStatus('Puzzle solved.', 'win');
  renderGrid();
}

// ─── Input handling ───────────────────────────────────────────────────────────

function isExhausted(n) {
  let count = 0;
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (userBoard[r][c] === n && userBoard[r][c] === solution[r][c])
        count++;
  return count === 9;
}

function enterNum(n) {
  if (!selected || solved) return;
  const [r, c] = selected;
  if (puzzle[r][c] !== 0) return;
  if (!notesMode && isExhausted(n)) return;
  const idx = r * 9 + c;
  hideHintBanner();

  if (notesMode) {
    pushHistory();
    notes[idx][n] = !notes[idx][n];
  } else {
    const placing = userBoard[r][c] !== n;
    pushHistory();
    userBoard[r][c] = userBoard[r][c] === n ? 0 : n;
    notes[idx] = Array(10).fill(false);

    if (placing && userBoard[r][c] !== 0) {
      const isCorrect = userBoard[r][c] === solution[r][c];
      if (isCorrect) removeNoteFromPeers(r, c, n);
      applyScore(r, c, isCorrect);
      if (strikesEnabled && !isCorrect) {
        strikes++;
        updateStrikesDisplay();
        if (strikes >= MAX_STRIKES) {
          stopTimer();
          solved = true;
          renderGrid();
          document.getElementById('gameOverOverlay').classList.add('show');
          document.getElementById('gameOverScore').textContent = `Final score: ${score}`;
          return;
        }
      }
    }
    checkWin();
  }
  renderGrid();
}

function eraseCell() {
  if (!selected || solved) return;
  const [r, c] = selected;
  if (puzzle[r][c] !== 0) return;
  pushHistory();
  userBoard[r][c] = 0;
  notes[r * 9 + c] = Array(10).fill(false);
  renderGrid();
}

// ─── Undo ─────────────────────────────────────────────────────────────────────

function undo() {
  if (history.length === 0 || solved) return;
  const prev = history.pop();
  userBoard = prev.userBoard;
  notes     = prev.notes;
  selected  = prev.selected;
  hintCells = prev.hintCells;
  score     = prev.score;
  document.getElementById('scoreValue').textContent = score;
  hideHintBanner();
  setStatus('');
  renderGrid();
}

// ─── Timer ────────────────────────────────────────────────────────────────────

function startTimer() {
  stopTimer();
  elapsed   = 0;
  startTime = Date.now();
  updateTimer();
  if (timerEnabled) timerInterval = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function updateTimer() {
  elapsed = Math.floor((Date.now() - startTime) / 1000);
  const el = document.getElementById('timer');
  if (timerEnabled) {
    el.classList.remove('hidden');
    el.textContent = formatTime(elapsed);
  } else {
    el.classList.add('hidden');
  }
}

function formatTime(s) {
  const m   = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
}

// ─── Strikes ──────────────────────────────────────────────────────────────────

function updateStrikesDisplay() {
  if (!strikesEnabled) return;
  for (let i = 1; i <= MAX_STRIKES; i++) {
    const pip = document.getElementById(`pip${i}`);
    pip.classList.toggle('used', i <= strikes);
  }
}

function toggleStrikes() {
  strikesEnabled = !strikesEnabled;
  const btn     = document.getElementById('strikesToggle');
  btn.textContent = `Strikes: ${strikesEnabled ? 'On' : 'Off'}`;
  btn.classList.toggle('active', strikesEnabled);
  const display = document.getElementById('strikesDisplay');
  display.style.display = strikesEnabled ? 'flex' : 'none';
  if (strikesEnabled) { strikes = 0; updateStrikesDisplay(); }
}

// ─── Notes mode ───────────────────────────────────────────────────────────────

function toggleNotes() {
  notesMode = !notesMode;
  const btn = document.getElementById('notesToggle');
  btn.textContent = `Notes: ${notesMode ? 'On' : 'Off'}`;
  btn.classList.toggle('active', notesMode);
}

// ─── Timer toggle ─────────────────────────────────────────────────────────────

function toggleTimer() {
  timerEnabled = !timerEnabled;
  const btn = document.getElementById('timerToggle');
  btn.classList.toggle('active', !timerEnabled);
  btn.title = timerEnabled ? 'Hide timer' : 'Show timer';
  if (timerEnabled) {
    startTime     = Date.now() - elapsed * 1000;
    timerInterval = setInterval(updateTimer, 1000);
  } else {
    clearInterval(timerInterval);
  }
  updateTimer();
}
