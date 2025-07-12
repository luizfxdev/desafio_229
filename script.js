// Variáveis globais
let maze = [];
let heroPosition = { row: 0, col: 0 };
let moves = 0;
let gameActive = true;

// Elementos do DOM
const mazeElement = document.getElementById('maze');
const statusMessage = document.getElementById('status-message');
const moveCounter = document.getElementById('move-counter');
const upButton = document.getElementById('up');
const downButton = document.getElementById('down');
const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');
const solveButton = document.getElementById('solve');

// Inicialização do jogo
function initGame() {
  generateMaze();
  renderMaze();
  setupEventListeners();
  updateStatusMessage('Bem-vindo, herói! Encontre o caminho para o amuleto!');
}

// Gera um novo labirinto
function generateMaze() {
  // Labirinto padrão 5x5 (0 = caminho, 1 = árvore)
  const baseMaze = [
    [0, 0, 1, 1, 0],
    [1, 0, 1, 0, 0],
    [0, 0, 0, 0, 1],
    [1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0]
  ];

  // Faz uma cópia do labirinto base
  maze = JSON.parse(JSON.stringify(baseMaze));

  // Aleatoriza um pouco o labirinto (30% de chance de mudar um caminho para árvore e vice-versa)
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      // Não altera a posição inicial nem final
      if ((row === 0 && col === 0) || (row === 4 && col === 4)) continue;

      if (Math.random() < 0.3) {
        maze[row][col] = maze[row][col] === 0 ? 1 : 0;
      }
    }
  }

  // Reseta a posição do herói e contador de movimentos
  heroPosition = { row: 0, col: 0 };
  moves = 0;
  gameActive = true;
  updateMoveCounter();
}

// Renderiza o labirinto no DOM
function renderMaze() {
  mazeElement.innerHTML = '';

  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      const cell = document.createElement('div');
      cell.className = 'cell';

      // Determina o tipo de célula
      if (row === heroPosition.row && col === heroPosition.col) {
        cell.classList.add('hero');
        cell.innerHTML = '🦸';
      } else if (row === 4 && col === 4) {
        cell.classList.add('amulet');
        cell.innerHTML = '🌟';
      } else if (maze[row][col] === 1) {
        cell.classList.add('tree');
        cell.innerHTML = '🌲';
      } else {
        cell.classList.add('path');
      }

      mazeElement.appendChild(cell);
    }
  }
}

// Configura os event listeners
function setupEventListeners() {
  upButton.addEventListener('click', () => moveHero(-1, 0));
  downButton.addEventListener('click', () => moveHero(1, 0));
  leftButton.addEventListener('click', () => moveHero(0, -1));
  rightButton.addEventListener('click', () => moveHero(0, 1));
  solveButton.addEventListener('click', solveMaze);

  // Adiciona controles por teclado
  document.addEventListener('keydown', e => {
    if (!gameActive) return;

    switch (e.key) {
      case 'ArrowUp':
        moveHero(-1, 0);
        break;
      case 'ArrowDown':
        moveHero(1, 0);
        break;
      case 'ArrowLeft':
        moveHero(0, -1);
        break;
      case 'ArrowRight':
        moveHero(0, 1);
        break;
    }
  });
}

// Move o herói na direção especificada
function moveHero(rowDelta, colDelta) {
  if (!gameActive) return;

  const newRow = heroPosition.row + rowDelta;
  const newCol = heroPosition.col + colDelta;

  // Verifica se o movimento é válido
  if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5 && maze[newRow][newCol] === 0) {
    heroPosition.row = newRow;
    heroPosition.col = newCol;
    moves++;
    updateMoveCounter();
    renderMaze();

    // Verifica se o herói chegou ao amuleto
    if (heroPosition.row === 4 && heroPosition.col === 4) {
      gameActive = false;
      updateStatusMessage('Sucesso! Você resgatou o Amuleto do Destino!', 'success');
    } else {
      // 30% de chance do labirinto mudar após cada movimento
      if (Math.random() < 0.3) {
        modifyMaze();
        updateStatusMessage('A Floresta das Ilusões muda de forma... Cuidado!', 'warning');
      } else {
        updateStatusMessage('Continue sua jornada, herói!', 'info');
      }
    }
  } else {
    updateStatusMessage('Caminho bloqueado! Tente outra direção.', 'warning');
  }
}

// Modifica o labirinto (exceto posições do herói e amuleto)
function modifyMaze() {
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      // Não altera a posição do herói, amuleto ou células adjacentes ao herói
      if (
        (row === heroPosition.row && col === heroPosition.col) ||
        (row === 4 && col === 4) ||
        (Math.abs(row - heroPosition.row) <= 1 && Math.abs(col - heroPosition.col) <= 1)
      ) {
        continue;
      }

      // 20% de chance de mudar cada célula
      if (Math.random() < 0.2) {
        maze[row][col] = maze[row][col] === 0 ? 1 : 0;
      }
    }
  }

  renderMaze();
}

// Atualiza a mensagem de status
function updateStatusMessage(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message';

  if (type === 'success') {
    statusMessage.classList.add('success');
  } else if (type === 'warning') {
    statusMessage.classList.add('failure');
  }
}

// Atualiza o contador de movimentos
function updateMoveCounter() {
  moveCounter.textContent = `Movimentos: ${moves}`;
}

// Resolve o labirinto automaticamente (usando busca em profundidade)
function solveMaze() {
  if (!gameActive) return;

  // Cria uma cópia do labirinto para trabalhar
  const mazeCopy = JSON.parse(JSON.stringify(maze));

  // Marca a posição inicial como visitada
  mazeCopy[heroPosition.row][heroPosition.col] = 2;

  // Tenta encontrar um caminho
  const path = [];
  const found = findPath(mazeCopy, heroPosition.row, heroPosition.col, path);

  if (found) {
    updateStatusMessage('O oráculo revela um caminho possível!', 'success');
    animateSolution(path);
  } else {
    updateStatusMessage('Não há caminho possível neste labirinto.', 'failure');
    gameActive = false;
  }
}

// Função recursiva para encontrar caminho (DFS)
function findPath(maze, row, col, path) {
  // Verifica se chegamos ao destino
  if (row === 4 && col === 4) {
    path.push({ row, col });
    return true;
  }

  // Marca a célula atual como parte do caminho
  path.push({ row, col });

  // Define as direções possíveis (baixo, direita, cima, esquerda)
  const directions = [
    [1, 0], // baixo
    [0, 1], // direita
    [-1, 0], // cima
    [0, -1] // esquerda
  ];

  // Tenta cada direção
  for (const [dr, dc] of directions) {
    const newRow = row + dr;
    const newCol = col + dc;

    // Verifica se a nova posição é válida
    if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5 && maze[newRow][newCol] === 0) {
      // Marca como visitada
      maze[newRow][newCol] = 2;

      // Chama recursivamente
      if (findPath(maze, newRow, newCol, path)) {
        return true;
      }

      // Backtracking
      path.pop();
    }
  }

  return false;
}

// Anima a solução encontrada
function animateSolution(path) {
  gameActive = false;
  let i = 0;

  const interval = setInterval(() => {
    if (i < path.length) {
      heroPosition.row = path[i].row;
      heroPosition.col = path[i].col;
      renderMaze();
      i++;
    } else {
      clearInterval(interval);
      updateStatusMessage('Caminho revelado! O amuleto está seu!', 'success');
    }
  }, 300);
}

// Inicia o jogo quando a página carrega
window.onload = initGame;
