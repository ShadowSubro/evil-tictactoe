const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const playAgainBtn = document.getElementById('play-again');
const difficultySlider = document.getElementById('difficulty');
const difficultyLabel = document.getElementById('difficulty-label');
const antiCheatCheckbox = document.getElementById('anti-cheat');
const multiplayerCheckbox = document.getElementById('multiplayer');
const popup = document.getElementById('popup');
const popupMessage = document.getElementById('popup-message');
const closePopupBtn = document.getElementById('close-popup');

let board = Array(9).fill(null);
let playerTurn = true;
let gameOver = false;
let difficulty = 2; // 1: Easy, 2: Medium, 3: Max Evil
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

  if (!antiCheat && Math.random() < difficulty * 0.1) {
    board[index] = 'O';
    statusEl.innerHTML = `<span class="evil">Your move was stolen 😈</span>`;
  }

  createBoard();
  if (checkWin(board, 'X')) {
    statusEl.textContent = 'You win? ... Wait, no.';
    setTimeout(() => showPopup('AI WINS!'), 1000);
    gameOver = true;
    return;
  }

  playerTurn = false;

  setTimeout(evilAIMove, 700);
}

function evilAIMove() {
  if (gameOver) return;

  const empty = getEmptyIndices(board);
  if (empty.length === 0) {
    statusEl.textContent = 'Draw. You survived... this time.';
    gameOver = true;
    return;
  }

  let move = empty[Math.floor(Math.random() * empty.length)];

  if (!antiCheat && Math.random() < difficulty * 0.1) {
    const xIndex = board.findIndex(val => val === 'X');
    if (xIndex !== -1 && board[move] === null) {
      board[move] = 'X';
      board[xIndex] = 'O';
      statusEl.innerHTML = `<span class="evil">Swapped your X for an O 😈</span>`;
    } else {
      board[move] = 'O';
    }
  } else {
    board[move] = 'O';
  }

  createBoard();

  if (checkWin(board, 'O')) {
    showPopup('AI wins! Resistance is futile.');
    gameOver = true;
    return;
  }

  playerTurn = true;
}

function resetGame() {
  board = Array(9).fill(null);
  playerTurn = true;
  gameOver = false;
  statusEl.textContent = '';
  createBoard();
}

function showPopup(message) {
  popupMessage.textContent = message;
  popup.classList.remove('hidden');
}

playAgainBtn.addEventListener('click', resetGame);
const closePopupBtn = document.getElementById('close-popup');
closePopupBtn.addEventListener('click', () => {
  popup.classList.add('hidden');
  resetGame();
});

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
