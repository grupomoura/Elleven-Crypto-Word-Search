const express = require('express');
const path = require('path');
const app = express();
const port = 3003;

// Crypto words dictionary
const CRYPTO_WORDS = {
    easy: [
        "BITCOIN", "ETHEREUM", "WALLET", "MINING", "TOKEN",
        "DEFI", "NFT", "CRYPTO", "HASH", "NODE",
        "COIN", "BLOCK", "TRADE", "BUY", "SELL",
        "STAKE", "SWAP", "POOL", "FARM", "YIELD",
        "CHAIN", "MINT", "GAS", "FEE", "KEYS",
        "SEED", "COLD", "HOT", "PUMP", "DUMP",
        "BULL", "BEAR", "HOLD", "FOMO", "DIP",
        "ALT", "COIN", "PEAK", "MOON", "DOGE",
        "SHIB", "LINK", "USDT", "USDC", "BUSD",
        "MATIC", "BNB", "DOT", "AVAX", "ATOM"
    ],
    medium: [
        "BLOCKCHAIN", "ALTCOIN", "STAKING", "LEDGER", "SMART",
        "POLYGON", "SOLANA", "RIPPLE", "CARDANO", "YIELD",
        "METAMASK", "TRUSTWALLET", "BINANCE", "COINBASE", "KRAKEN",
        "POLKADOT", "AVALANCHE", "COSMOS", "CHAINLINK", "UNISWAP",
        "PANCAKESWAP", "SUSHISWAP", "COMPOUND", "AAVE", "MAKER",
        "LIGHTNING", "SEGWIT", "TAPROOT", "DECENTRAL", "EXCHANGE",
        "LIQUIDITY", "VALIDATOR", "DELEGATOR", "PROTOCOL", "NETWORK",
        "CONSENSUS", "MEMPOOL", "MERKLE", "ORACLE", "BRIDGE",
        "CROSSCHAIN", "MULTICHAIN", "SIDECHAIN", "MAINNET", "TESTNET",
        "HARDWALLET", "SOFTFORK", "HARDFORK", "WHITELIST", "BLACKLIST"
    ],
    hard: [
        "METAMASK", "OPENSEA", "UNISWAP", "AIRDROP", "HODL",
        "BULLISH", "BEARISH", "LEVERAGE", "PROTOCOL", "GOVERNANCE",
        "CRYPTOGRAPHY", "DECENTRALIZED", "DISTRIBUTED", "CONSENSUS", "VALIDATION",
        "IMMUTABLE", "PERMISSIONLESS", "TRUSTLESS", "INTEROPERABLE", "SCALABILITY",
        "TOKENOMICS", "DEFLATIONARY", "INFLATIONARY", "TOKENIZATION", "GAMEFI",
        "METAVERSE", "MULTIVERSE", "MARKETPLACE", "ECOSYSTEM", "INFRASTRUCTURE",
        "CRYPTOGRAPHIC", "ASYNCHRONOUS", "SYNCHRONOUS", "Byzantine", "ARBITRAGE",
        "COLLATERALIZED", "DECOLLATERALIZED", "ALGORITHMIC", "GOVERNANCE", "DELEGATION",
        "INTEROPERABILITY", "CROSSCHAIN", "MULTICHAIN", "SIDECHAIN", "ROLLUP",
        "ZEROKNOWLEDGE", "PROOFOFSTAKE", "PROOFOFWORK", "LIQUIDATION", "PERPETUAL"
    ]
};

// Serve static files
app.use(express.static('public'));

// Create grid function
function createGrid(difficulty = 'medium', size = 15) {
    // Get random 10 words from the difficulty level
    const allWords = CRYPTO_WORDS[difficulty].map(word => word.toUpperCase());
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

app.get('/new-game', (req, res) => {
    const difficulty = req.query.difficulty || 'medium';
    const gameData = createGrid(difficulty);
    console.log('Sending game data:', gameData);
    res.json(gameData);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
