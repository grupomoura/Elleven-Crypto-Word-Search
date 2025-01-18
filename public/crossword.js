let currentDifficulty = 'easy';
let crosswordData = null;
let selectedCell = null;
let selectedDirection = 'across';
let startTime = null;
let timerInterval = null;

async function initGame(difficulty = 'easy') {
    try {
        const response = await fetch(`/generate-crossword?difficulty=${difficulty}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data.result || !data.grid) {
            throw new Error('Invalid crossword data received from server');
        }

        // Limpar o grid existente
        const gridContainer = document.getElementById('crossword-grid');
        gridContainer.innerHTML = '';
        
        // Criar o grid
        const grid = data.grid;
        const gridSize = grid.length;
        
        gridContainer.style.gridTemplateColumns = `repeat(${gridSize}, 40px)`;
        
        // Criar células do grid
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                if (grid[y][x] !== null) {
                    cell.classList.add('active-cell');
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.dataset.x = x;
                    input.dataset.y = y;
                    cell.appendChild(input);
                }
                
                gridContainer.appendChild(cell);
            }
        }
        
        // Organizar dicas
        const acrossClues = document.getElementById('across-clues');
        const downClues = document.getElementById('down-clues');
        acrossClues.innerHTML = '<h3>Horizontal</h3>';
        downClues.innerHTML = '<h3>Vertical</h3>';
        
        // Adicionar números e dicas
        data.result.forEach(word => {
            const clueElement = document.createElement('div');
            clueElement.className = 'clue';
            clueElement.textContent = `${word.number}. ${word.clue}`;
            
            if (word.orientation === 'across') {
                acrossClues.appendChild(clueElement);
            } else {
                downClues.appendChild(clueElement);
            }
            
            // Adicionar número à primeira célula da palavra
            const firstCell = gridContainer.children[word.y * gridSize + word.x];
            if (firstCell) {
                const numberDiv = document.createElement('div');
                numberDiv.className = 'cell-number';
                numberDiv.textContent = word.number;
                firstCell.insertBefore(numberDiv, firstCell.firstChild);
            }
        });
        
        // Adicionar event listeners para navegação
        const inputs = document.querySelectorAll('.grid-cell input');
        inputs.forEach(input => {
            input.addEventListener('keyup', handleInput);
            input.addEventListener('click', function() {
                this.select();
            });
        });
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        document.getElementById('crossword-grid').innerHTML = 
            `<div class="error">Error loading crossword: ${error.message}</div>`;
    }
}

function handleInput(event) {
    if (event.key === 'Backspace' || event.key === 'Delete') {
        const prevCell = findAdjacentCell(event.target, 'prev');
        if (prevCell) {
            prevCell.focus();
            prevCell.select();
        }
        return;
    }
    
    if (event.target.value.length === event.target.maxLength) {
        const nextCell = findAdjacentCell(event.target, 'next');
        if (nextCell) {
            nextCell.focus();
            nextCell.select();
        }
    }
}

function findAdjacentCell(currentInput, direction) {
    const currentCell = currentInput.parentElement;
    const cells = Array.from(document.querySelectorAll('.grid-cell'));
    const currentIndex = cells.indexOf(currentCell);
    
    let nextIndex;
    if (direction === 'next') {
        nextIndex = currentIndex + 1;
    } else {
        nextIndex = currentIndex - 1;
    }
    
    if (nextIndex >= 0 && nextIndex < cells.length) {
        const nextCell = cells[nextIndex].querySelector('input');
        if (nextCell) {
            return nextCell;
        }
    }
    return null;
}

// Iniciar o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    initGame('easy');
});
