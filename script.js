// Game Configuration
const wordBanks = {
    easy: [
        { word: "CAT", hint: "A feline companion." },
        { word: "DOG", hint: "Man's most loyal friend." },
        { word: "BIRD", hint: "It takes to the heavens." },
        { word: "FISH", hint: "It breathes where men drown." },
        { word: "TREE", hint: "The giant of the forest." },
        { word: "BOOK", hint: "A vessel for written knowledge." },
        { word: "LAMP", hint: "It banishes the shadows." },
        { word: "FIRE", hint: "Both warmth and destruction." },
        { word: "SNOW", hint: "Cold white dust from above." },
        { word: "WIND", hint: "The breath of the earth." },
        { word: "GOLD", hint: "The king of metals." },
        { word: "IRON", hint: "The strength of a sword." },
        { word: "WOLF", hint: "A hunter in the moonlight." },
        { word: "DEER", hint: "Swift runner of the woods." },
        { word: "KING", hint: "A ruler of many lands." },
        { word: "SHIP", hint: "It carries souls across the sea." }
    ],
    medium: [
        { word: "SCRIBE", hint: "One who writes for history." },
        { word: "PARCHMENT", hint: "Skin prepared for writing." },
        { word: "CANDLE", hint: "A small light that burns away." },
        { word: "SWORD", hint: "A double-edged tool of war." },
        { word: "CASTLE", hint: "A stone fortress for lords." },
        { word: "DRAGON", hint: "A winged beast of flame." },
        { word: "SHIELD", hint: "Protection from the blow." },
        { word: "POTION", hint: "A liquid of magical intent." },
        { word: "SCROLL", hint: "A rolled script of secrets." },
        { word: "KNIGHT", hint: "A warrior of honor and steel." },
        { word: "THRONE", hint: "The seat of high authority." },
        { word: "CHURCH", hint: "A house of holy assembly." },
        { word: "VILLAGE", hint: "A cluster of humble dwellings." },
        { word: "MARKET", hint: "Where coin meets craft." }
    ],
    hard: [
        { word: "ARCHITECTURE", hint: "The art of building high." },
        { word: "ALCHEMY", hint: "Turning lead into gold." },
        { word: "PHILOSOPHY", hint: "The love of wisdom." },
        { word: "LITERATURE", hint: "The written legacy of man." },
        { word: "LEGENDARY", hint: "Spoken through the ages." },
        { word: "MYSTERIOUS", hint: "Veiled in deep shadow." },
        { word: "ENCHANTMENT", hint: "A spell cast upon the soul." },
        { word: "CATHEDRAL", hint: "A grand temple of stone." },
        { word: "MANUSCRIPT", hint: "A book written by hand." },
        { word: "RENAISSANCE", hint: "The rebirth of art and mind." },
        { word: "CHIVALRY", hint: "The code of the noble warrior." }
    ]
};

const ancientWisdom = [
    "Patience is the pen of the wise.",
    "A word once spoken cannot be untyped.",
    "The scroll of life is written in many hands.",
    "Seek truth in the lines between the words.",
    "A scholar is but a novice who never gave up.",
    "Victory is found through persistent ink.",
    "The mind that guesses is the mind that learns."
];

let currentWord = "";
let currentHint = "";
let guessedLetters = [];
let triesLeft = 10;
let hintRevealed = false;

// Player Meta State
let playerStats = JSON.parse(localStorage.getItem('scribe_stats')) || {
    xp: 0,
    rank: "Initiate Scribe"
};

// To-Do (Quest Log) State
let quests = JSON.parse(localStorage.getItem('scribe_quests')) || [
    { id: 1, text: "Slay the Word Dragon (Win a game)", completed: false },
    { id: 2, text: "Transcribe the daily goals", completed: false }
];

// DOM Elements
const tabGame = document.getElementById('tab-game');
const tabTodo = document.getElementById('tab-todo');
const gameSection = document.getElementById('game-section');
const todoSection = document.getElementById('todo-section');

const wordDisplay = document.getElementById('word-display');
const hintDisplay = document.getElementById('hint-display');
const revealHintBtn = document.getElementById('reveal-hint-btn');
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const triesCount = document.getElementById('tries-count');
const mistakesList = document.getElementById('mistakes-list');
const gameMessage = document.getElementById('game-message');
const newGameBtn = document.getElementById('new-game-btn');
const difficultySelect = document.getElementById('difficulty');

const todoList = document.getElementById('todo-list');
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const questsRemaining = document.getElementById('quests-remaining');

// --- Tab Switching ---
tabGame.addEventListener('click', () => {
    tabGame.classList.add('active');
    tabTodo.classList.remove('active');
    gameSection.classList.remove('hidden');
    todoSection.classList.add('hidden');
});

tabTodo.addEventListener('click', () => {
    tabTodo.classList.add('active');
    tabGame.classList.remove('active');
    todoSection.classList.remove('hidden');
    gameSection.classList.add('hidden');
    renderQuests();
});

// --- Meta Features Logic ---
function updatePlayerStats(gainedXp) {
    playerStats.xp += gainedXp;
    
    // Calculate Rank
    if (playerStats.xp >= 500) playerStats.rank = "Grand Archivist";
    else if (playerStats.xp >= 300) playerStats.rank = "Sage of the Scroll";
    else if (playerStats.xp >= 150) playerStats.rank = "Master Calligrapher";
    else if (playerStats.xp >= 50) playerStats.rank = "Apprentice Chronicler";
    else playerStats.rank = "Initiate Scribe";

    localStorage.setItem('scribe_stats', JSON.stringify(playerStats));
    renderPlayerStats();
}

function renderPlayerStats() {
    const rankEl = document.getElementById('player-rank');
    const xpBar = document.getElementById('xp-bar');
    
    rankEl.textContent = playerStats.rank;
    
    // XP Progress relative to next rank thresholds
    let progress = 0;
    if (playerStats.xp < 50) progress = (playerStats.xp / 50) * 100;
    else if (playerStats.xp < 150) progress = ((playerStats.xp - 50) / 100) * 100;
    else if (playerStats.xp < 300) progress = ((playerStats.xp - 150) / 150) * 100;
    else if (playerStats.xp < 500) progress = ((playerStats.xp - 300) / 200) * 100;
    else progress = 100;

    xpBar.style.width = `${progress}%`;
}

// --- Word Guessr Logic ---
function initGame() {
    const difficulty = difficultySelect.value;
    const bank = wordBanks[difficulty];
    const item = bank[Math.floor(Math.random() * bank.length)];
    currentWord = item.word;
    currentHint = item.hint;
    guessedLetters = [];
    triesLeft = difficulty === 'hard' ? 7 : 10;
    hintRevealed = false;
    
    if (hintDisplay) {
        hintDisplay.textContent = "";
        hintDisplay.classList.add('hidden');
    }
    if (revealHintBtn) {
        revealHintBtn.classList.remove('hidden');
    }
    gameMessage.textContent = "";
    gameMessage.className = "message-box";
    updateDisplay();
}

function updateDisplay() {
    let display = "";
    for (let char of currentWord) {
        if (guessedLetters.includes(char)) {
            display += char;
        } else {
            display += "_";
        }
    }
    wordDisplay.textContent = display;
    
    triesCount.textContent = triesLeft;
    const mistakes = guessedLetters.filter(l => !currentWord.includes(l));
    mistakesList.textContent = mistakes.join(", ");

    if (!display.includes("_")) {
        gameMessage.textContent = "Huzzah! Thou hast triumphed!";
        gameMessage.className = "message-box success";
        guessInput.disabled = true;
        guessBtn.disabled = true;
        
        // Gain XP based on difficulty
        const difficulty = difficultySelect.value;
        let xpGain = 10;
        if (difficulty === 'medium') xpGain = 20;
        if (difficulty === 'hard') xpGain = 40;
        updatePlayerStats(xpGain);
        
        completeQuest("Slay the Word Dragon");
    } else if (triesLeft <= 0) {
        gameMessage.textContent = `Alas! The word was ${currentWord}.`;
        gameMessage.className = "message-box error";
        guessInput.disabled = true;
        guessBtn.disabled = true;
    } else {
        guessInput.disabled = false;
        guessBtn.disabled = false;
    }
}

function handleGuess() {
    const guess = guessInput.value.toUpperCase();
    guessInput.value = "";
    guessInput.focus();

    if (!guess || guess.length !== 1 || !/[A-Z]/.test(guess)) return;

    if (guessedLetters.includes(guess)) {
        gameMessage.textContent = "Thou hast already cast that letter.";
        return;
    }

    guessedLetters.push(guess);
    if (!currentWord.includes(guess)) {
        triesLeft--;
        createInkBlot();
    } else {
        gameMessage.textContent = "";
    }

    updateDisplay();
}

function createInkBlot() {
    const blot = document.createElement('div');
    blot.className = 'ink-blot';
    const gameBoard = document.getElementById('game-board');
    const rect = gameBoard.getBoundingClientRect();
    blot.style.left = Math.random() * rect.width + 'px';
    blot.style.top = Math.random() * rect.height + 'px';
    blot.style.position = 'absolute';
    blot.style.width = '20px';
    blot.style.height = '20px';
    blot.style.background = 'var(--ink)';
    blot.style.borderRadius = '50%';
    blot.style.opacity = '0.3';
    blot.style.pointerEvents = 'none';
    blot.style.transform = `scale(${Math.random() * 2 + 1})`;
    blot.style.transition = 'opacity 2s';
    
    gameBoard.appendChild(blot);
    setTimeout(() => {
        blot.style.opacity = '0';
        setTimeout(() => blot.remove(), 2000);
    }, 100);
}

// --- Quest Log Logic ---
function renderQuests() {
    todoList.innerHTML = "";
    quests.forEach(quest => {
        const li = document.createElement('li');
        if (quest.completed) li.classList.add('completed');
        
        li.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${quest.completed ? 'checked' : ''}>
            <span>${quest.text}</span>
            <button class="delete-btn" title="Exile this quest">&times;</button>
        `;

        const checkbox = li.querySelector('.todo-checkbox');
        checkbox.addEventListener('change', () => toggleQuest(quest.id));

        const deleteBtn = li.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteQuest(quest.id));

        todoList.appendChild(li);
    });
    
    const count = quests.filter(q => !q.completed).length;
    questsRemaining.textContent = `${count} Quest${count !== 1 ? 's' : ''} Outstanding`;
    localStorage.setItem('scribe_quests', JSON.stringify(quests));
}

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    
    quests.push({
        id: Date.now(),
        text: text,
        completed: false
    });
    
    todoInput.value = "";
    renderQuests();
}

function toggleQuest(id) {
    const quest = quests.find(q => q.id === id);
    if (quest && !quest.completed) {
        updatePlayerStats(15); // XP for completing a quest manually
    }
    quests = quests.map(q => q.id === id ? { ...q, completed: !q.completed } : q);
    renderQuests();
}

function deleteQuest(id) {
    quests = quests.filter(q => q.id !== id);
    renderQuests();
}

function completeQuest(textSubstring) {
    let gained = false;
    quests = quests.map(q => {
        if (q.text.includes(textSubstring) && !q.completed) {
            gained = true;
            return { ...q, completed: true };
        }
        return q;
    });
    if (gained) {
        updatePlayerStats(15);
    }
    localStorage.setItem('scribe_quests', JSON.stringify(quests));
}

// Event Listeners
guessBtn.addEventListener('click', handleGuess);
guessInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleGuess();
});
newGameBtn.addEventListener('click', initGame);
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});

// Meta Feature: Wisdom Seal
const inkBottle = document.getElementById('ink-bottle');
const wisdomSeal = document.getElementById('wisdom-seal');
const wisdomText = document.getElementById('wisdom-text');

inkBottle.addEventListener('click', () => {
    // Reveal wisdom
    const wisdom = ancientWisdom[Math.floor(Math.random() * ancientWisdom.length)];
    wisdomText.textContent = `"${wisdom}"`;
    wisdomSeal.classList.remove('hidden');
    
    // Gain a tiny bit of XP for seeking wisdom
    updatePlayerStats(2);
    
    // Hide after some time
    setTimeout(() => {
        wisdomSeal.classList.add('hidden');
    }, 5000);
});

// Reveal Hint Logic
revealHintBtn.addEventListener('click', () => {
    if (!hintRevealed) {
        hintRevealed = true;
        hintDisplay.textContent = `A whisper from the past: "${currentHint}"`;
        hintDisplay.classList.remove('hidden');
        revealHintBtn.classList.add('hidden');
        
        // Cost of a hint
        updatePlayerStats(-5);
    }
});

// Initialize
renderPlayerStats();
initGame();
renderQuests();
