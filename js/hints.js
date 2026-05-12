// ─── hints.js — Strategy engine & hint dispatch ───────────────────────────────

// ─── Candidate helpers ────────────────────────────────────────────────────────

function getCandidates(board, r, c) {
  if (board[r][c] !== 0) return [];
  const used = new Set();
  for (let i = 0; i < 9; i++) {
    used.add(board[r][i]);
    used.add(board[i][c]);
  }
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let dr = 0; dr < 3; dr++)
    for (let dc = 0; dc < 3; dc++)
      used.add(board[br + dr][bc + dc]);
  return [1,2,3,4,5,6,7,8,9].filter(n => !used.has(n));
}

function buildCandidateMap(board) {
  const map = [];
  for (let r = 0; r < 9; r++) {
    map[r] = [];
    for (let c = 0; c < 9; c++)
      map[r][c] = board[r][c] !== 0 ? [] : getCandidates(board, r, c);
  }
  return map;
}

// ─── Strategy 1: Naked Single ─────────────────────────────────────────────────

function findNakedSingle(board) {
  const map = buildCandidateMap(board);
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (map[r][c].length !== 1) continue;
      const val = map[r][c][0];

      const rowNums = [], colNums = [], boxNums = [];
      for (let i = 0; i < 9; i++) {
        if (i !== c && board[r][i] !== 0) rowNums.push(board[r][i]);
        if (i !== r && board[i][c] !== 0) colNums.push(board[i][c]);
      }
      const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
      for (let dr = 0; dr < 3; dr++)
        for (let dc = 0; dc < 3; dc++) {
          const nr = br+dr, nc = bc+dc;
          if ((nr !== r || nc !== c) && board[nr][nc] !== 0) boxNums.push(board[nr][nc]);
        }
      const eliminated = [...new Set([...rowNums, ...colNums, ...boxNums])].sort((a,b)=>a-b);
      const elStr = eliminated.length
        ? ` Every other digit (${eliminated.join(', ')}) is already present in its row, column, or box, leaving ${val} as the only possibility.`
        : '';

      return { r, c, val, strategy: 'Naked Single',
        desc: `R${r+1}C${c+1} has exactly one candidate: ${val}.${elStr}` };
    }
  }
  return null;
}

// ─── Strategy 2: Hidden Single ────────────────────────────────────────────────

function findHiddenSingle(board) {
  const map = buildCandidateMap(board);

  // Rows
  for (let r = 0; r < 9; r++) {
    for (let n = 1; n <= 9; n++) {
      const cols = [];
      for (let c = 0; c < 9; c++) if (map[r][c].includes(n)) cols.push(c);
      if (cols.length !== 1) continue;
      const c = cols[0];
      const blockers = [];
      for (let c2 = 0; c2 < 9; c2++)
        if (c2 !== c && board[r][c2] === 0 && !map[r][c2].includes(n)) blockers.push(`R${r+1}C${c2+1}`);
      const blockStr = blockers.length
        ? ` All other empty cells in row ${r+1} (${blockers.slice(0,3).join(', ')}${blockers.length > 3 ? '…' : ''}) already have ${n} eliminated by their column or box constraints.`
        : '';
      return { r, c, val: n, strategy: 'Hidden Single',
        desc: `${n} must go in R${r+1}C${c+1} — it's the only cell in row ${r+1} where ${n} is still a valid candidate.${blockStr}` };
    }
  }

  // Columns
  for (let c = 0; c < 9; c++) {
    for (let n = 1; n <= 9; n++) {
      const rows = [];
      for (let r = 0; r < 9; r++) if (map[r][c].includes(n)) rows.push(r);
      if (rows.length !== 1) continue;
      const r = rows[0];
      const blockers = [];
      for (let r2 = 0; r2 < 9; r2++)
        if (r2 !== r && board[r2][c] === 0 && !map[r2][c].includes(n)) blockers.push(`R${r2+1}C${c+1}`);
      const blockStr = blockers.length
        ? ` The other empty cells in column ${c+1} (${blockers.slice(0,3).join(', ')}${blockers.length > 3 ? '…' : ''}) have ${n} ruled out by their row or box.`
        : '';
      return { r, c, val: n, strategy: 'Hidden Single',
        desc: `${n} must go in R${r+1}C${c+1} — it's the only cell in column ${c+1} that can hold ${n}.${blockStr}` };
    }
  }

  // Boxes
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      for (let n = 1; n <= 9; n++) {
        const cells = [];
        for (let dr = 0; dr < 3; dr++)
          for (let dc = 0; dc < 3; dc++) {
            const r = br*3+dr, c = bc*3+dc;
            if (map[r][c].includes(n)) cells.push([r, c]);
          }
        if (cells.length !== 1) continue;
        const [r, c] = cells[0];
        const boxNum = br*3+bc+1;
        const blockers = [];
        for (let dr = 0; dr < 3; dr++)
          for (let dc = 0; dc < 3; dc++) {
            const nr = br*3+dr, nc = bc*3+dc;
            if ((nr === r && nc === c)) continue;
            if (board[nr][nc] === 0 && !map[nr][nc].includes(n)) blockers.push(`R${nr+1}C${nc+1}`);
          }
        const blockStr = blockers.length
          ? ` Every other empty cell in box ${boxNum} (${blockers.slice(0,3).join(', ')}${blockers.length > 3 ? '…' : ''}) has ${n} blocked by its row or column.`
          : '';
        return { r, c, val: n, strategy: 'Hidden Single',
          desc: `${n} must go in R${r+1}C${c+1} — it's the only cell in box ${boxNum} where ${n} can legally appear.${blockStr}` };
      }
    }
  }
  return null;
}

// ─── Strategy 3: Naked Pair ───────────────────────────────────────────────────

function findNakedPairResult(board) {
  const map = buildCandidateMap(board);

  function getUnits() {
    const units = [];
    for (let i = 0; i < 9; i++) {
      const row = [], col = [];
      for (let j = 0; j < 9; j++) { row.push([i,j]); col.push([j,i]); }
      units.push(row, col);
    }
    for (let br = 0; br < 3; br++)
      for (let bc = 0; bc < 3; bc++) {
        const box = [];
        for (let dr = 0; dr < 3; dr++)
          for (let dc = 0; dc < 3; dc++) box.push([br*3+dr, bc*3+dc]);
        units.push(box);
      }
    return units;
  }

  for (const unit of getUnits()) {
    const pairs = unit.filter(([r,c]) => map[r][c].length === 2);
    for (let i = 0; i < pairs.length; i++) {
      for (let j = i+1; j < pairs.length; j++) {
        const [r1,c1] = pairs[i], [r2,c2] = pairs[j];
        const a = map[r1][c1], b = map[r2][c2];
        if (a[0] !== b[0] || a[1] !== b[1]) continue;
        for (const [r,c] of unit) {
          if ((r===r1&&c===c1)||(r===r2&&c===c2)) continue;
          const reduced = map[r][c].filter(n => !a.includes(n));
          if (reduced.length !== 1) continue;
          const isRow  = unit.every(([ur])   => ur === r1);
          const isCol  = unit.every(([,uc])  => uc === c1);
          const unitName = isRow ? `row ${r1+1}` : isCol ? `column ${c1+1}` : `the shared box`;
          return { r, c, val: reduced[0], strategy: 'Naked Pair',
            desc: `R${r1+1}C${c1+1} and R${r2+1}C${c2+1} both contain only {${a[0]}, ${a[1]}}. One must hold ${a[0]} and the other ${a[1]} — either way both digits are "used up" within ${unitName}. This eliminates ${a[0]} and ${a[1]} from every other cell in ${unitName}, leaving ${reduced[0]} as the only option for R${r+1}C${c+1}.` };
        }
      }
    }
  }
  return null;
}

// ─── Strategy 4: Pointing Pair / Triple ──────────────────────────────────────

function findPointingPairResult(board) {
  const map = buildCandidateMap(board);
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      for (let n = 1; n <= 9; n++) {
        const cells = [];
        for (let dr = 0; dr < 3; dr++)
          for (let dc = 0; dc < 3; dc++) {
            const r = br*3+dr, c = bc*3+dc;
            if (map[r][c].includes(n)) cells.push([r,c]);
          }
        if (cells.length < 2 || cells.length > 3) continue;

        const rows     = [...new Set(cells.map(([r])   => r))];
        const cols     = [...new Set(cells.map(([,c])  => c))];
        const boxNum   = br*3+bc+1;
        const cellList = cells.map(([r,c]) => `R${r+1}C${c+1}`).join(', ');
        const word     = cells.length === 2 ? 'pair' : 'triple';

        if (rows.length === 1) {
          const r = rows[0];
          for (let c = 0; c < 9; c++) {
            if (Math.floor(c/3) === bc) continue;
            if (!map[r][c].includes(n)) continue;
            return { r, c: cells[0][1], val: n, strategy: 'Pointing Pair',
              desc: `In box ${boxNum}, ${n} can only appear in ${cellList} — all in row ${r+1}. This means ${n} is "claimed" by box ${boxNum} within row ${r+1}, eliminating ${n} from every other cell in row ${r+1} outside box ${boxNum}. Look at the notes to spot this ${word} and see which cells in row ${r+1} lose ${n} as a candidate.` };
          }
        }

        if (cols.length === 1) {
          const c = cols[0];
          for (let r = 0; r < 9; r++) {
            if (Math.floor(r/3) === br) continue;
            if (!map[r][c].includes(n)) continue;
            return { r: cells[0][0], c, val: n, strategy: 'Pointing Pair',
              desc: `In box ${boxNum}, ${n} can only appear in ${cellList} — all in column ${c+1}. Since ${n} must land in one of those cells, it's "claimed" by box ${boxNum} within column ${c+1}, eliminating ${n} from every other cell in column ${c+1} outside box ${boxNum}. Look at the notes to spot this ${word} and follow the elimination down column ${c+1}.` };
          }
        }
      }
    }
  }
  return null;
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

function findHint() {
  const board = userBoard;
  return (
    findNakedSingle(board)      ||
    findHiddenSingle(board)     ||
    findNakedPairResult(board)  ||
    findPointingPairResult(board) ||
    null
  );
}

// ─── Fill all candidate notes ─────────────────────────────────────────────────

function fillAllCandidateNotes() {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (userBoard[r][c] !== 0) continue;
      const idx = r * 9 + c;
      const candidates = getCandidates(userBoard, r, c);
      const n = Array(10).fill(false);
      candidates.forEach(v => n[v] = true);
      notes[idx] = n;
    }
  }
}

// ─── Hint dispatch ────────────────────────────────────────────────────────────

function giveHint() {
  if (solved) return;
  hideHintBanner();
  pushHistory();

  const hint = findHint();
  if (!hint) {
    // Fallback — fill a random incorrect/empty cell
    const empties = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (puzzle[r][c] === 0 && userBoard[r][c] !== solution[r][c])
          empties.push([r, c]);
    if (empties.length === 0) return;
    const [r, c] = empties[Math.floor(Math.random() * empties.length)];
    userBoard[r][c] = solution[r][c];
    notes[r * 9 + c] = Array(10).fill(false);
    removeNoteFromPeers(r, c, solution[r][c]);
    hintCells.add(r * 9 + c);
    selected = [r, c];
    showHintBanner('Hint', 'No simple strategy found — a cell was filled for you.');
  } else if (hint.strategy === 'Pointing Pair') {
    fillAllCandidateNotes();
    selected = [hint.r, hint.c];
    showHintBanner('Notes', 'The remaining cells have been filled with possible solutions.');
    renderGrid();
    return;
  } else {
    userBoard[hint.r][hint.c] = hint.val;
    notes[hint.r * 9 + hint.c] = Array(10).fill(false);
    removeNoteFromPeers(hint.r, hint.c, hint.val);
    hintCells.add(hint.r * 9 + hint.c);
    selected = [hint.r, hint.c];
    showHintBanner(hint.strategy, hint.desc);
  }

  checkWin();
  renderGrid();
}
