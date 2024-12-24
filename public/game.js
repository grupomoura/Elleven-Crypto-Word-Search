let gameState = {
    grid: [],
    words: [],
    positions: [],
    selectedCells: [],
    foundWords: new Set(),
    score: 0,
    timer: 0,
    timerInterval: null,
    difficulty: 'medium',
    isSelecting: false
};

// DOM Elements
const gridElement = document.querySelector('.grid');
const wordsList = document.querySelector('.words');
const timerElement = document.querySelector('.timer');
const scoreElement = document.querySelector('.score');
const recordsList = document.querySelector('.records-list');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const toggleRecordsBtn = document.querySelector('.toggle-records-btn');
const recordsSection = document.querySelector('.records');

// Event Listeners
difficultyButtons.forEach(btn => {
    btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
});

toggleRecordsBtn.addEventListener('click', () => {
    toggleRecordsBtn.classList.toggle('active');
    recordsSection.classList.toggle('visible');
    if (recordsSection.classList.contains('visible')) {
        displayRecords();
    }
});

// Functions
function createGrid(grid) {
    gridElement.innerHTML = '';
    gridElement.style.gridTemplateColumns = `repeat(${grid.length}, 30px)`;

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = grid[i][j];
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            cell.addEventListener('mousedown', (e) => {
                e.preventDefault(); // Prevent text selection
                gameState.isSelecting = true;
                selectCell(cell);
            });
            
            cell.addEventListener('mouseover', (e) => {
                if (gameState.isSelecting) {
                    handleSelection(gameState.selectedCells[0], cell);
                }
            });
            
            cell.addEventListener('mouseup', () => {
                if (gameState.isSelecting) {
                    gameState.isSelecting = false;
                    checkWord();
                }
            });
            
            gridElement.appendChild(cell);
        }
    }

    // Add mouseup to document to handle selection end outside grid
    document.addEventListener('mouseup', () => {
        if (gameState.isSelecting) {
            gameState.isSelecting = false;
            checkWord();
        }
    });
}

function selectCell(cell) {
    clearSelection();
    cell.classList.add('selected');
    gameState.selectedCells = [cell];
}

function handleSelection(startCell, currentCell) {
    if (!startCell || !currentCell) return;
    
    const startRow = parseInt(startCell.dataset.row);
    const startCol = parseInt(startCell.dataset.col);
    const currentRow = parseInt(currentCell.dataset.row);
    const currentCol = parseInt(currentCell.dataset.col);
    
    // Clear previous selection except start cell
    document.querySelectorAll('.cell.selected').forEach(cell => {
        if (cell !== startCell) {
            cell.classList.remove('selected');
        }
    });
    gameState.selectedCells = [startCell];

    // Calculate direction
    const rowDiff = currentRow - startRow;
    const colDiff = currentCol - startCol;
    
    // Only allow straight lines or diagonals
    if (rowDiff === 0 || colDiff === 0 || Math.abs(rowDiff) === Math.abs(colDiff)) {
        const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
        const dRow = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff);
        const dCol = colDiff === 0 ? 0 : colDiff / Math.abs(colDiff);

        // Select all cells in the line
        for (let i = 0; i <= steps; i++) {
            const row = startRow + dRow * i;
            const col = startCol + dCol * i;
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('selected');
                gameState.selectedCells.push(cell);
            }
        }
    }
}

function checkWord() {
    if (gameState.selectedCells.length < 2) {
        clearSelection();
        return;
    }

    // Remove duplicates from selection
    gameState.selectedCells = [...new Set(gameState.selectedCells)];
    
    const selectedWord = gameState.selectedCells.map(cell => cell.textContent.toUpperCase()).join('');
    const startCell = gameState.selectedCells[0];
    const endCell = gameState.selectedCells[gameState.selectedCells.length - 1];
    const start = [parseInt(startCell.dataset.row), parseInt(startCell.dataset.col)];
    const end = [parseInt(endCell.dataset.row), parseInt(endCell.dataset.col)];

    console.log('Selected Word:', selectedWord);
    console.log('Start Position:', start);
    console.log('End Position:', end);
    console.log('Available Words:', gameState.words);
    console.log('Word Positions:', gameState.positions);

    // Check if word exists in positions array
    const foundWord = gameState.positions.find(pos => {
        const forward = pos.word.toUpperCase() === selectedWord &&
                       start[0] === pos.start[0] &&
                       start[1] === pos.start[1] &&
                       end[0] === pos.end[0] &&
                       end[1] === pos.end[1];
                       
        const backward = pos.word.toUpperCase() === selectedWord.split('').reverse().join('') &&
                        start[0] === pos.end[0] &&
                        start[1] === pos.end[1] &&
                        end[0] === pos.start[0] &&
                        end[1] === pos.start[1];
                        
        console.log('Checking word:', pos.word.toUpperCase());
        console.log('Selected word:', selectedWord);
        console.log('Forward match:', forward);
        console.log('Backward match:', backward);
        console.log('Start matches:', start[0] === pos.start[0] && start[1] === pos.start[1]);
        console.log('End matches:', end[0] === pos.end[0] && end[1] === pos.end[1]);
        
        return forward || backward;
    });

    console.log('Found Word:', foundWord);

    if (foundWord && !gameState.foundWords.has(foundWord.word)) {
        console.log('Word found and not previously found!');
        // Mark word as found
        gameState.foundWords.add(foundWord.word);
        
        // Update score
        updateScore(calculatePoints(foundWord.word));
        
        // Mark cells as found
        gameState.selectedCells.forEach(cell => {
            cell.classList.remove('selected');
            cell.classList.add('found');
        });
        
        // Mark word in list as found
        const wordElement = document.querySelector(`.word[data-word="${foundWord.word}"]`);
        if (wordElement) {
            wordElement.classList.add('found');
        }
        
        // Check if game is complete
        if (gameState.foundWords.size === gameState.words.length) {
            endGame('Parabéns! Você encontrou todas as palavras!');
        }
    } else {
        clearSelection();
    }
}

function clearSelection() {
    document.querySelectorAll('.cell.selected').forEach(cell => {
        cell.classList.remove('selected');
    });
    gameState.selectedCells = [];
}

function displayWords(words) {
    wordsList.innerHTML = '';
    words.forEach(word => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word';
        wordElement.textContent = word;
        wordElement.dataset.word = word;
        if (gameState.foundWords.has(word)) {
            wordElement.classList.add('found');
        }
        wordsList.appendChild(wordElement);
    });
}

function updateTimer() {
    const minutes = Math.floor(gameState.timer / 60);
    const seconds = gameState.timer % 60;
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function updateScore(points) {
    gameState.score += points;
    scoreElement.textContent = gameState.score;
}

function calculatePoints(word) {
    return Math.floor(word.length * 10 * (1 + gameState.timer / 300));
}

function saveRecord() {
    const records = JSON.parse(localStorage.getItem('wordSearchRecords') || '[]');
    records.push({
        score: gameState.score,
        time: gameState.timer,
        difficulty: gameState.difficulty,
        date: new Date().toISOString()
    });
    records.sort((a, b) => b.score - a.score);
    localStorage.setItem('wordSearchRecords', JSON.stringify(records.slice(0, 10)));
    displayRecords();
}

function displayRecords() {
    const records = JSON.parse(localStorage.getItem('wordSearchRecords') || '[]');
    recordsList.innerHTML = '';
    
    records.forEach((record, index) => {
        const minutes = Math.floor(record.time / 60);
        const seconds = record.time % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const recordElement = document.createElement('div');
        recordElement.className = 'record-item';
        recordElement.innerHTML = `
            <span>#${index + 1} - ${record.score} pontos</span>
            <span>${timeStr}</span>
        `;
        recordsList.appendChild(recordElement);
    });
}

function endGame(message) {
    clearInterval(gameState.timerInterval);
    saveRecord();
    setTimeout(() => {
        alert(message);
        newGame(gameState.difficulty);
    }, 100);
}

function setDifficulty(difficulty) {
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.difficulty === difficulty);
    });
    newGame(difficulty);
}

async function newGame(difficulty = 'medium') {
    clearInterval(gameState.timerInterval);
    gameState = {
        ...gameState,
        grid: [],
        words: [],
        positions: [],
        selectedCells: [],
        foundWords: new Set(),
        score: 0,
        timer: 0,
        difficulty
    };

    updateTimer();
    updateScore(0);

    try {
        const response = await fetch(`/new-game?difficulty=${difficulty}`);
        const data = await response.json();
        
        console.log('New Game Data:', data);
        
        gameState.grid = data.grid;
        gameState.words = data.words;
        gameState.positions = data.positions;
        
        createGrid(data.grid);
        displayWords(data.words);
        
        gameState.timerInterval = setInterval(() => {
            gameState.timer++;
            updateTimer();
        }, 1000);
    } catch (error) {
        console.error('Error starting new game:', error);
        alert('Erro ao iniciar novo jogo. Por favor, tente novamente.');
    }
}

// Initialize game
displayRecords();
newGame();
