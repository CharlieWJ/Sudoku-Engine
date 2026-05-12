// ─── render.js — Grid & UI rendering ─────────────────────────────────────────

function buildGrid() {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', () => selectCell(r, c));
      grid.appendChild(cell);
    }
  }
}

function renderGrid() {
  document.querySelectorAll('.cell').forEach(cell => {
    const r = +cell.dataset.row, c = +cell.dataset.col;
    const idx = r * 9 + c;
    const given    = puzzle[r][c] !== 0;
    const val      = given ? puzzle[r][c] : userBoard[r][c];
    const cellNotes = notes[idx];
    const hasNotes  = !given && val === 0 && cellNotes.some(Boolean);

    cell.className = 'cell';
    if (given) cell.classList.add('given');

    if (hasNotes) {
      cell.classList.add('notes-mode');
      const ng = document.createElement('div');
      ng.className = 'notes-grid';
      for (let n = 1; n <= 9; n++) {
        const nd = document.createElement('div');
        nd.className = 'note-digit' + (cellNotes[n] ? ' active' : '');
        nd.textContent = cellNotes[n] ? n : '';
        ng.appendChild(nd);
      }
      cell.innerHTML = '';
      cell.appendChild(ng);
    } else {
      cell.innerHTML = '';
      if (val !== 0) {
        cell.textContent = val;
        if (!given) {
          const isHint    = hintCells.has(idx);
          const isCorrect = val === solution[r][c];
          if (isHint)          cell.classList.add('hint-input');
          else if (isCorrect)  cell.classList.add('correct');
          else                 cell.classList.add('user-input');
          if (!isCorrect)      cell.classList.add('error');
        }
      }
    }

    // Highlights
    if (selected) {
      const [sr, sc] = selected;
      if (r === sr && c === sc) {
        cell.classList.add('selected');
      } else {
        const selVal = puzzle[sr][sc] || userBoard[sr][sc];
        const myVal  = puzzle[r][c]   || userBoard[r][c];
        if (myVal !== 0 && myVal === selVal) {
          cell.classList.add('same-num');
        } else if (
          r === sr || c === sc ||
          (Math.floor(r/3) === Math.floor(sr/3) && Math.floor(c/3) === Math.floor(sc/3))
        ) {
          cell.classList.add('same-group');
        }
      }
    }
  });
  updateNumpad();
}

function buildNumpad() {
  const np = document.getElementById('numpad');
  np.innerHTML = '';
  for (let n = 1; n <= 9; n++) {
    const btn = document.createElement('button');
    btn.className = 'num-btn';
    btn.dataset.num = n;
    btn.textContent = n;
    btn.addEventListener('click', () => enterNum(n));
    np.appendChild(btn);
  }
}

function updateNumpad() {
  const counts = new Array(10).fill(0);
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++)
      if (userBoard[r][c] !== 0 && userBoard[r][c] === solution[r][c])
        counts[userBoard[r][c]]++;
  document.querySelectorAll('.num-btn[data-num]').forEach(btn => {
    const n = +btn.dataset.num;
    btn.classList.toggle('exhausted', counts[n] === 9);
  });
}

function selectCell(r, c) {
  selected = [r, c];
  renderGrid();
}

function setStatus(msg, type = '') {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status' + (type ? ' ' + type : '');
}

function showHintBanner(strategy, desc) {
  document.getElementById('hintStrategy').textContent = strategy;
  document.getElementById('hintDesc').textContent = desc;
  document.getElementById('hintBanner').classList.add('show');
}

function hideHintBanner() {
  document.getElementById('hintBanner').classList.remove('show');
}
