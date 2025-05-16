const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const playAgainBtn = document.getElementById('play-again');
const difficultySlider = document.getElementById('difficulty');
const difficultyLabel = document.getElementById('difficulty-label');
const antiCheatCheckbox = document.getElementById('anti-cheat');
const multiplayerCheckbox = document.getElementById('multiplayer');

let board = Array(9).fill(null);
let playerTurn = true;
let gameOver = false;
let difficulty = 2;
let antiCheat = false;
let multiplayer = false;

function createBoard() {
  boardEl.innerHTML = '';
  board.forEach((cell, idx) => {
    const cellEl = document.createElement('div');
    cellEl.classList.add('cell');
    cellEl.dataset.index = idx;
    cellEl.textContent = cell || '';
    cellEl.onclick = () => handleMove(idx);
    boardEl.appendChild(cellEl);
  });
}

function checkWin(b, p) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(line => line.every(i => b[i] === p));
}

function getEmptyIndices(b) {
  return b.map((v, i) => v === null ? i : null).filter(v => v !== null);
}

function handleMove(index) {
  if (board[index] !== null || gameOver) return;

  if (multiplayer) {
    board[index] = playerTurn ? 'X' : 'O';
    createBoard();
    if (checkWin(board, board[index])) {
      statusEl.textContent = `${board[index]} wins!`;
      gameOver = true;
      return;
    }
    if (getEmptyIndices(board).length === 0) {
      statusEl.textContent = 'Draw!';
      gameOver = true;
      return;
    }
    playerTurn = !playerTurn;
    return;
  }

  if (!playerTurn) return;

  board[index] = 'X';

  createBoard();

  if (checkWin(board, 'X')) {
    statusEl.textContent = antiCheat ? 'You win! ✅' : 'You win! (or did you?)';
    gameOver = true;
    return;
  }


  playerTurn = false;
  setTimeout(evilAIMove, 500);
}

function evilAIMove() {
  if (gameOver) return;

  const empty = getEmptyIndices(board);
  if (empty.length === 0) {
    statusEl.textContent = 'Draw. You survived... this time.';
    gameOver = true;
    return;
  }

  let move;
  if (difficulty === 3) {
    const playerWin = findBlockingMove('X');
    const aiWin = findBlockingMove('O');
    move = aiWin !== -1 ? aiWin : (playerWin !== -1 ? playerWin : empty[Math.floor(Math.random() * empty.length)]);
  } else if (difficulty === 2) {
    if (Math.random() < 0.5) {
      const block = findBlockingMove('X');
      move = block !== -1 ? block : empty[Math.floor(Math.random() * empty.length)];
    } else {
      move = empty[Math.floor(Math.random() * empty.length)];
    }
  } else {
    move = empty[Math.floor(Math.random() * empty.length)];
  }

  let cheated = false;

  if (!antiCheat && Math.random() < difficulty * 0.15) {
    // AI cheats by replacing one of player's Xs
    const xIndex = board.findIndex(v => v === 'X');
    if (xIndex !== -1) {
      board[xIndex] = 'O';
      cheated = true;
    } else {
      board[move] = 'O';
    }
  } else {
    board[move] = 'O';
  }

  createBoard();

  if (cheated && checkWin(board, 'O')) {
    statusEl.innerHTML = `<span class="evil">AI wins! Resistance is futile. 😈</span>`;
    gameOver = true;
    return;
  }

  if (checkWin(board, 'O')) {
    statusEl.textContent = 'AI wins! Resistance is futile.';
    gameOver = true;
    return;
  }

  if (getEmptyIndices(board).length === 0) {
    statusEl.textContent = 'Draw!';
    gameOver = true;
    return;
  }

  playerTurn = true;
}

function findBlockingMove(player) {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let pattern of winPatterns) {
    const marks = pattern.map(i => board[i]);
    if (marks.filter(x => x === player).length === 2 && marks.includes(null)) {
      return pattern[marks.indexOf(null)];
    }
  }
  return -1;
}

function resetGame() {
  board = Array(9).fill(null);
  playerTurn = true;
  gameOver = false;
  statusEl.textContent = '';
  createBoard();
}

playAgainBtn.addEventListener('click', resetGame);

difficultySlider.addEventListener('input', () => {
  difficulty = parseInt(difficultySlider.value, 10);
  const labels = ['Easy', 'Medium', 'Max Evil'];
  difficultyLabel.textContent = labels[difficulty - 1];
});

antiCheatCheckbox.addEventListener('change', () => {
  antiCheat = antiCheatCheckbox.checked;
});

multiplayerCheckbox.addEventListener('change', () => {
  multiplayer = multiplayerCheckbox.checked;
  resetGame();
});

createBoard();
