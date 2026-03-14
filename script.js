// Player Meta State
let playerStats = JSON.parse(localStorage.getItem('scribe_stats')) || {
    xp: 0,
    rank: "Initiate Scribe"
};

const wordBanks = {
    easy: [
        { word: "BOOK", hint: "A vessel for written knowledge." },
        { word: "LAMP", hint: "It banishes the shadows." },
        { word: "FIRE", hint: "Both warmth and destruction." },
        { word: "WIND", hint: "The breath of the earth." },
        { word: "GOLD", hint: "The king of metals." },
        { word: "IRON", hint: "The strength of a sword." },
        { word: "WOLF", hint: "A hunter in the moonlight." },
        { word: "DEER", hint: "Swift runner of the woods." }
    ],
    medium: [
        { word: "SCRIBE", hint: "One who writes for history." },
        { word: "SWORD", hint: "A double-edged tool of war." },
        { word: "CASTLE", hint: "A stone fortress for lords." },
        { word: "DRAGON", hint: "A winged beast of flame." },
        { word: "SHIELD", hint: "Protection from the blow." },
        { word: "POTION", hint: "A liquid of magical intent." },
        { word: "KNIGHT", hint: "A warrior of honor and steel." },
        { word: "THRONE", hint: "The seat of high authority." }
    ],
    hard: [
        { word: "ALCHEMY", hint: "Turning lead into gold." },
        { word: "CANDLE", hint: "A small light that burns away." },
        { word: "SCROLL", hint: "A rolled script of secrets." },
        { word: "CHIVALRY", hint: "The code of the noble warrior." },
        { word: "LEGENDARY", hint: "Spoken through the ages." },
        { word: "MYSTERIOUS", hint: "Veiled in deep shadow." }
    ]
};

const ancientWisdom = [
    "Patience is the pen of the wise.",
    "A word once spoken cannot be untyped.",
    "The scroll of life is written in many hands.",
    "Seek truth in the lines between the words.",
    "A scholar is but a novice who never gave up.",
    "Victory is found through persistent ink."
];

let currentWord = "";
let currentHint = "";
let triesLeft = 6;
let currentGuessIndex = 0;
let isGameOver = false;

// DOM Elements
const grid = document.getElementById('wordle-grid');
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const triesCount = document.getElementById('tries-count');
const gameMessage = document.getElementById('game-message');
const difficultySelect = document.getElementById('difficulty');
const newGameBtn = document.getElementById('new-game-btn');
const hintDisplay = document.getElementById('hint-display');
const revealHintBtn = document.getElementById('reveal-hint-btn');

// --- Wordle Logic ---
function initGame() {
    const difficulty = difficultySelect.value;
    const bank = wordBanks[difficulty];
    const item = bank[Math.floor(Math.random() * bank.length)];
    currentWord = item.word.toUpperCase();
    currentHint = item.hint;
    
    triesLeft = 6;
    currentGuessIndex = 0;
    isGameOver = false;
    
    gameMessage.textContent = "";
    gameMessage.className = "message-box";
    triesCount.textContent = triesLeft;
    guessInput.value = "";
    guessInput.maxLength = currentWord.length;
    guessInput.disabled = false;
    guessBtn.disabled = false;

    if (hintDisplay) {
        hintDisplay.textContent = "";
        hintDisplay.classList.add('hidden');
    }
    revealHintBtn.classList.remove('hidden');

    createGrid();
}

function createGrid() {
    grid.innerHTML = "";
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('div');
        row.className = 'wordle-row';
        for (let j = 0; j < currentWord.length; j++) {
            const tile = document.createElement('div');
            tile.className = 'wordle-tile';
            row.appendChild(tile);
        }
        grid.appendChild(row);
    }
}

function handleGuess() {
    if (isGameOver) return;

    const guess = guessInput.value.toUpperCase();
    if (guess.length !== currentWord.length) {
        gameMessage.textContent = `Thy script must be ${currentWord.length} letters long.`;
        return;
    }

    const rows = grid.querySelectorAll('.wordle-row');
    const currentRow = rows[currentGuessIndex];
    const tiles = currentRow.querySelectorAll('.wordle-tile');

    const wordArr = currentWord.split('');
    const guessArr = guess.split('');
    const status = new Array(currentWord.length).fill('absent');

    // First pass: correct positions
    for (let i = 0; i < currentWord.length; i++) {
        if (guessArr[i] === wordArr[i]) {
            status[i] = 'correct';
            wordArr[i] = null;
        }
    }

    // Second pass: present but wrong positions
    for (let i = 0; i < currentWord.length; i++) {
        if (status[i] === 'correct') continue;
        const index = wordArr.indexOf(guessArr[i]);
        if (index !== -1) {
            status[i] = 'present';
            wordArr[index] = null;
        }
    }

    // Update UI with animation
    guessArr.forEach((letter, i) => {
        setTimeout(() => {
            tiles[i].textContent = letter;
            tiles[i].classList.add(status[i]);
        }, i * 100);
    });

    currentGuessIndex++;
    triesLeft--;
    triesCount.textContent = triesLeft;
    guessInput.value = "";

    if (guess === currentWord) {
        endGame(true);
    } else if (triesLeft <= 0) {
        endGame(false);
    }
}

function endGame(win) {
    isGameOver = true;
    guessInput.disabled = true;
    guessBtn.disabled = true;

    if (win) {
        gameMessage.textContent = "Huzzah! Thou hast deciphered the script!";
        gameMessage.className = "message-box success";
        
        let xpGain = 20;
        if (difficultySelect.value === 'medium') xpGain = 35;
        if (difficultySelect.value === 'hard') xpGain = 50;
        updatePlayerStats(xpGain);
        completeQuest("Slay the Word Dragon");
    } else {
        gameMessage.textContent = `Alas! The secret was ${currentWord}.`;
        gameMessage.className = "message-box error";
    }
}

// --- Status & Meta ---
function updatePlayerStats(gainedXp) {
    playerStats.xp += gainedXp;
    if (playerStats.xp >= 500) playerStats.rank = "Grand Archivist";
    else if (playerStats.xp >= 300) playerStats.rank = "Sage of the Scroll";
    else if (playerStats.xp >= 150) playerStats.rank = "Master Calligrapher";
    else if (playerStats.xp >= 50) playerStats.rank = "Apprentice Chronicler";
    else playerStats.rank = "Initiate Scribe";

    localStorage.setItem('scribe_stats', JSON.stringify(playerStats));
    renderPlayerStats();
}

function renderPlayerStats() {
    document.getElementById('player-rank').textContent = playerStats.rank;
    const xpBar = document.getElementById('xp-bar');
    let progress = 0;
    if (playerStats.xp < 50) progress = (playerStats.xp / 50) * 100;
    else if (playerStats.xp < 150) progress = ((playerStats.xp - 50) / 100) * 100;
    else if (playerStats.xp < 300) progress = ((playerStats.xp - 150) / 150) * 100;
    else if (playerStats.xp < 500) progress = ((playerStats.xp - 300) / 200) * 100;
    else progress = 100;
    xpBar.style.width = `${progress}%`;
}

// --- Tabs & Quests (Simplified) ---
let quests = JSON.parse(localStorage.getItem('scribe_quests')) || [
    { id: 1, text: "Slay the Word Dragon (Win a game)", completed: false },
    { id: 2, text: "Transcribe the daily goals", completed: false }
];

function renderQuests() {
    const todoList = document.getElementById('todo-list');
    todoList.innerHTML = "";
    quests.forEach(quest => {
        const li = document.createElement('li');
        if (quest.completed) li.classList.add('completed');
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${quest.completed ? 'checked' : ''}>
            <span>${quest.text}</span>
            <button class="delete-btn" onclick="deleteQuest(${quest.id})">&times;</button>
        `;
        li.querySelector('.todo-checkbox').onclick = () => toggleQuest(quest.id);
        todoList.appendChild(li);
    });
    localStorage.setItem('scribe_quests', JSON.stringify(quests));
}

function toggleQuest(id) {
    quests = quests.map(q => q.id === id ? { ...q, completed: !q.completed } : q);
    renderQuests();
}

window.deleteQuest = (id) => {
    quests = quests.filter(q => q.id !== id);
    renderQuests();
};

document.getElementById('add-todo-btn').onclick = () => {
    const text = document.getElementById('todo-input').value;
    if (text) {
        quests.push({ id: Date.now(), text, completed: false });
        document.getElementById('todo-input').value = "";
        renderQuests();
    }
};

function completeQuest(textSubstring) {
    quests = quests.map(q => q.text.includes(textSubstring) ? { ...q, completed: true } : q);
    renderQuests();
}

// Tabs
document.getElementById('tab-game').onclick = () => {
    document.getElementById('game-section').classList.remove('hidden');
    document.getElementById('todo-section').classList.add('hidden');
    document.getElementById('tab-game').classList.add('active');
    document.getElementById('tab-todo').classList.remove('active');
};
document.getElementById('tab-todo').onclick = () => {
    document.getElementById('todo-section').classList.remove('hidden');
    document.getElementById('game-section').classList.add('hidden');
    document.getElementById('tab-todo').classList.add('active');
    document.getElementById('tab-game').classList.remove('active');
    renderQuests();
};

// Wisdom & Hints
const inkBottle = document.getElementById('ink-bottle');
inkBottle.onclick = () => {
    const wisdom = ancientWisdom[Math.floor(Math.random() * ancientWisdom.length)];
    const seal = document.getElementById('wisdom-seal');
    document.getElementById('wisdom-text').textContent = wisdom;
    seal.classList.remove('hidden');
    setTimeout(() => seal.classList.add('hidden'), 5000);
    updatePlayerStats(2);
};

revealHintBtn.onclick = () => {
    hintDisplay.textContent = `A whisper: "${currentHint}"`;
    hintDisplay.classList.remove('hidden');
    revealHintBtn.classList.add('hidden');
    updatePlayerStats(-5);
};

newGameBtn.onclick = initGame;
guessBtn.onclick = handleGuess;
guessInput.onkeypress = (e) => { if (e.key === 'Enter') handleGuess(); };

// Init
initGame();
renderPlayerStats();
renderQuests();
