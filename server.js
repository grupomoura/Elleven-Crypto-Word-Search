const express = require('express');
const path = require('path');
const CrosswordGenerator = require('crossword-layout-generator');

const app = express();
const port = process.env.PORT || 3003;

app.use(express.static(path.join(__dirname, 'public')));

// Crypto words dictionary
const cryptoWords = {
    easy: [
        { answer: 'BITCOIN', clue: 'A primeira e mais famosa criptomoeda' },
        { answer: 'WALLET', clue: 'Onde você guarda suas criptomoedas' },
        { answer: 'TOKEN', clue: 'Ativo digital que representa algo' },
        { answer: 'SMART', clue: 'Tipo de contrato automatizado' },
        { answer: 'NODE', clue: 'Ponto da rede blockchain' },
        { answer: 'NFT', clue: 'Token não fungível' },
        { answer: 'CRYPTO', clue: 'Moeda digital' },
        { answer: 'HASH', clue: 'Função criptográfica de uma via' },
        { answer: 'BLOCKCHAIN', clue: 'Tecnologia de registro distribuído' },
        { answer: 'ALTCOIN', clue: 'Qualquer cripto que não seja Bitcoin' },
        { answer: 'STAKING', clue: 'Processo de bloquear tokens para validação' },
        { answer: 'LEDGER', clue: 'Livro-razão de transações' },
        { answer: 'METAMASK', clue: 'Popular carteira de browser' },
        { answer: 'TRUSTWALLET', clue: 'Carteira móvel popular' },
        { answer: 'BINANCE', clue: 'Grande exchange de criptomoedas' },
        { answer: 'COINBASE', clue: 'Exchange americana popular' },
        { answer: 'KRAKEN', clue: 'Exchange com foco em segurança' },
        { answer: 'SMARTCONTRACT', clue: 'Contrato auto-executável na blockchain' },
        { answer: 'DECENTRALIZED', clue: 'Sem controle central' },
        { answer: 'CRYPTOCURRENCY', clue: 'Moeda baseada em criptografia' }
    ],
    medium: [
        { answer: 'ETHEREUM', clue: 'Plataforma de contratos inteligentes' },
        { answer: 'MINING', clue: 'Processo de validação de transações' },
        { answer: 'DEFI', clue: 'Finanças descentralizadas' },
        { answer: 'LEDGER', clue: 'Registro distribuído de transações' },
        { answer: 'BLOCK', clue: 'Unidade básica da blockchain' },
        { answer: 'CONSENSUS', clue: 'Mecanismo de acordo entre nodes' },
        { answer: 'PROTOCOL', clue: 'Conjunto de regras da rede' },
        { answer: 'HASH', clue: 'Função criptográfica unidirecional' },
        { answer: 'STAKING', clue: 'Bloqueio de tokens para validação' },
        { answer: 'METAMASK', clue: 'Popular carteira de browser' }
    ],
    hard: [
        { answer: 'CONSENSUS', clue: 'Mecanismo de acordo entre nodes' },
        { answer: 'PROTOCOL', clue: 'Conjunto de regras da rede' },
        { answer: 'HASH', clue: 'Função criptográfica unidirecional' },
        { answer: 'STAKING', clue: 'Bloqueio de tokens para validação' },
        { answer: 'METAMASK', clue: 'Popular carteira de browser' },
        { answer: 'TRUSTWALLET', clue: 'Carteira móvel popular' },
        { answer: 'BINANCE', clue: 'Grande exchange de criptomoedas' },
        { answer: 'COINBASE', clue: 'Exchange americana popular' },
        { answer: 'KRAKEN', clue: 'Exchange com foco em segurança' },
        { answer: 'SMARTCONTRACT', clue: 'Contrato auto-executável na blockchain' },
        { answer: 'DECENTRALIZED', clue: 'Sem controle central' },
        { answer: 'CRYPTOCURRENCY', clue: 'Moeda baseada em criptografia' }
    ]
};

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Create grid function
function createGrid(difficulty = 'medium', size = 15) {
    // Get random 10 words from the difficulty level
    const allWords = cryptoWords[difficulty].map(word => word.answer.toUpperCase());
    const shuffledWords = [...allWords].sort(() => Math.random() - 0.5);
    const selectedWords = shuffledWords.slice(0, 10);
    
    const grid = Array(size).fill().map(() => Array(size).fill(''));
    const positions = [];
    const placedWords = [];

    function canPlaceWord(word, row, col, dRow, dCol) {
        if (row + dRow * (word.length - 1) >= size || row + dRow * (word.length - 1) < 0) return false;
        if (col + dCol * (word.length - 1) >= size || col + dCol * (word.length - 1) < 0) return false;

        for (let i = 0; i < word.length; i++) {
            const currentRow = row + dRow * i;
            const currentCol = col + dCol * i;
            if (grid[currentRow][currentCol] !== '' && 
                grid[currentRow][currentCol] !== word[i]) {
                return false;
            }
        }
        return true;
    }

    function placeWord(word) {
        const directions = [
            [0, 1],   // horizontal
            [1, 0],   // vertical
            [1, 1],   // diagonal down-right
            [-1, 1],  // diagonal up-right
        ];
        
        const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
        
        for (let attempts = 0; attempts < 100; attempts++) {
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);
            
            for (const [dRow, dCol] of shuffledDirections) {
                if (canPlaceWord(word, row, col, dRow, dCol)) {
                    // Place the word
                    for (let i = 0; i < word.length; i++) {
                        const currentRow = row + dRow * i;
                        const currentCol = col + dCol * i;
                        grid[currentRow][currentCol] = word[i];
                    }
                    
                    // Store the word position
                    positions.push({
                        word,
                        start: [row, col],
                        end: [row + dRow * (word.length - 1), col + dCol * (word.length - 1)]
                    });
                    
                    return true;
                }
            }
        }
        return false;
    }

    // Try to place each word
    for (const word of selectedWords) {
        if (placeWord(word)) {
            placedWords.push(word);
        }
    }

    // Fill empty spaces with random uppercase letters
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j] === '') {
                grid[i][j] = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }

    console.log('Grid created with words:', placedWords);
    console.log('Word positions:', positions);

    return { grid, words: placedWords, positions };
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/crossword', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'crossword.html'));
});

app.get('/new-game', (req, res) => {
    const difficulty = req.query.difficulty || 'medium';
    const gameData = createGrid(difficulty);
    res.json(gameData);
});

app.get('/crypto-words', (req, res) => {
    const { difficulty = 'medium' } = req.query;
    res.json(cryptoWords[difficulty].map(item => item.answer));
});

app.get('/crypto-clues', (req, res) => {
    const { difficulty = 'medium' } = req.query;
    const clues = {};
    cryptoWords[difficulty].forEach(item => {
        clues[item.answer] = item.clue;
    });
    res.json(clues);
});

app.get('/generate-crossword', (req, res) => {
    try {
        const { difficulty = 'easy' } = req.query;
        const words = cryptoWords[difficulty];
        
        // Criar o gerador de palavras cruzadas
        const layout = new CrosswordGenerator();
        
        // Preparar as palavras no formato esperado pela biblioteca
        const entries = words.map(({ answer, clue }) => ({
            word: answer,
            clue: clue
        }));
        
        // Gerar o layout
        const puzzle = layout.generateLayout(entries);
        
        if (!puzzle) {
            throw new Error('Não foi possível gerar o layout da palavra cruzada');
        }
        
        // Transformar o resultado para o formato que nosso frontend espera
        const result = puzzle.result.map(entry => ({
            answer: entry.word,
            clue: entry.clue,
            x: entry.startX,
            y: entry.startY,
            orientation: entry.orientation === 'across' ? 'across' : 'down',
            number: entry.position
        }));
        
        res.json({
            result,
            grid: puzzle.grid
        });
        
    } catch (error) {
        console.error('Erro ao gerar palavra cruzada:', error);
        res.status(500).json({ 
            error: 'Falha ao gerar palavra cruzada',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// Handle 404s
app.use((req, res) => {
    res.status(404).send('Not found');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
