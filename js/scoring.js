// ─── scoring.js — Score calculation & display ─────────────────────────────────

const DIFFICULTY_MULTIPLIER = { easy: 1, medium: 1.5, hard: 2, pro: 2.5, expert: 3 };

// ─── Unit helpers ─────────────────────────────────────────────────────────────

function getRowCells(r)    { return Array.from({length: 9}, (_, c) => [r, c]); }
function getColCells(c)    { return Array.from({length: 9}, (_, r) => [r, c]); }
function getBoxCells(r, c) {
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  const cells = [];
  for (let dr = 0; dr < 3; dr++)
    for (let dc = 0; dc < 3; dc++)
      cells.push([br + dr, bc + dc]);
  return cells;
}

function isUnitComplete(cells) {
  return cells.every(([r, c]) => userBoard[r][c] !== 0 && userBoard[r][c] === solution[r][c]);
}

// ─── Calculation ──────────────────────────────────────────────────────────────

function calcScore(r, c, isCorrect) {
  const mult = DIFFICULTY_MULTIPLIER[difficulty] || 1;

  if (!isCorrect) {
    const deduct = Math.round(10 * mult);
    return { delta: -deduct, completions: [], cheers: false };
  }

  // Base: 1–5 pts scaled by difficulty
  const base = Math.round((1 + Math.random() * 4) * mult * 10) / 10;

  const rowDone = isUnitComplete(getRowCells(r));
  const colDone = isUnitComplete(getColCells(c));
  const boxDone = isUnitComplete(getBoxCells(r, c));

  const completions = [];
  if (rowDone) completions.push('row');
  if (colDone) completions.push('col');
  if (boxDone) completions.push('box');

  let bonus  = 0;
  let cheers = false;

  if (rowDone && colDone && boxDone) {
    bonus  = Math.round((250 + Math.random() * 50) * mult);
    cheers = true;
  } else if (boxDone && (rowDone || colDone)) {
    bonus = Math.round((150 + Math.random() * 50) * mult);
  } else if (boxDone || rowDone || colDone) {
    bonus = Math.round((10  + Math.random() * 90) * mult);
  }

  return { delta: Math.round((base + bonus) * 10) / 10, completions, cheers };
}

// ─── Display ─────────────────────────────────────────────────────────────────

function updateScoreDisplay(delta) {
  const el = document.getElementById('scoreValue');
  el.textContent = score;
  el.classList.remove('bump');
  void el.offsetWidth; // reflow to restart animation
  el.classList.add('bump');
  el.style.color = delta < 0 ? 'var(--error)' : 'var(--accent)';
  setTimeout(() => el.style.color = '', 600);
}

function showScorePopup(delta, anchorEl) {
  const popup = document.createElement('div');
  popup.className = 'score-popup ' + (delta >= 0 ? 'positive' : 'negative');
  popup.textContent = (delta >= 0 ? '+' : '') + delta;
  const rect = anchorEl.getBoundingClientRect();
  popup.style.left = (rect.left + rect.width / 2 - 24) + 'px';
  popup.style.top  = (rect.top  - 10) + 'px';
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 1500);
}

function launchCheers() {
  const overlay = document.getElementById('cheersOverlay');
  for (let i = 0; i < 18; i++) {
    const em = document.createElement('span');
    em.className   = 'cheers-emoji';
    em.textContent = '🥂';
    em.style.left           = (Math.random() * 100) + 'vw';
    em.style.animationDelay = (Math.random() * 0.8) + 's';
    em.style.fontSize       = (32 + Math.random() * 36) + 'px';
    overlay.appendChild(em);
    setTimeout(() => em.remove(), 2800);
  }
}

// ─── Main entry point ─────────────────────────────────────────────────────────

function applyScore(r, c, isCorrect) {
  const { delta, cheers } = calcScore(r, c, isCorrect);
  score = Math.max(0, Math.round((score + delta) * 10) / 10);
  updateScoreDisplay(delta);
  showScorePopup(delta, document.getElementById('grid'));
  if (cheers) launchCheers();
}

function resetScore() {
  score = 0;
  const el = document.getElementById('scoreValue');
  if (el) el.textContent = '0';
}
