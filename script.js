// Global variables
let currentMathType = '';
let currentQuestion = {};
let mathScore = 0;
let vocabScore = 0;
let currentVocabGame = '';
let memorySequence = [];
let playerSequence = [];
let memoryLevel = 1;
let isMemoryPlaying = false;

// Vocabulary data
const vocabularyData = {
    words: [
        { word: 'GATTO', emoji: '🐱', description: 'Animale domestico che fa miao' },
        { word: 'CANE', emoji: '🐶', description: 'Il migliore amico dell\'uomo' },
        { word: 'SOLE', emoji: '☀️', description: 'Stella che illumina il giorno' },
        { word: 'LUNA', emoji: '🌙', description: 'Satellite che vediamo di notte' },
        { word: 'FIORE', emoji: '🌸', description: 'Pianta colorata e profumata' },
        { word: 'ALBERO', emoji: '🌳', description: 'Pianta grande con molte foglie' },
        { word: 'CASA', emoji: '🏠', description: 'Dove viviamo con la famiglia' },
        { word: 'LIBRO', emoji: '📚', description: 'Oggetto con pagine per leggere' }
    ]
};

// Navigation functions
function openTool(toolName) {
    // Hide home screen
    document.querySelector('.container').style.display = 'none';
    
    // Hide all tools
    const tools = document.querySelectorAll('.tool-container');
    tools.forEach(tool => tool.classList.add('hidden'));
    
    // Show selected tool
    document.getElementById(toolName + '-tool').classList.remove('hidden');
}

function goHome() {
    // Show home screen
    document.querySelector('.container').style.display = 'block';
    
    // Hide all tools
    const tools = document.querySelectorAll('.tool-container');
    tools.forEach(tool => tool.classList.add('hidden'));
    
    // Reset all games
    resetAllGames();
}

function resetAllGames() {
    // Reset math game
    document.getElementById('math-game').classList.add('hidden');
    mathScore = 0;
    document.getElementById('score-value').textContent = '0';
    
    // Reset vocabulary game
    document.getElementById('vocab-game').classList.add('hidden');
    vocabScore = 0;
    document.getElementById('vocab-score-value').textContent = '0';
    
    // Reset games
    document.getElementById('color-game').classList.add('hidden');
    document.getElementById('memory-game').classList.add('hidden');
}

// Math functions
function startMathGame(type) {
    currentMathType = type;
    document.getElementById('math-game').classList.remove('hidden');
    generateMathQuestion();
}

function generateMathQuestion() {
    let num1, num2, operator, answer;
    
    switch(currentMathType) {
        case 'addition':
            num1 = Math.floor(Math.random() * 20) + 1;
            num2 = Math.floor(Math.random() * 20) + 1;
            operator = '+';
            answer = num1 + num2;
            break;
        case 'subtraction':
            num1 = Math.floor(Math.random() * 20) + 10;
            num2 = Math.floor(Math.random() * num1) + 1;
            operator = '-';
            answer = num1 - num2;
            break;
        case 'multiplication':
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            operator = '×';
            answer = num1 * num2;
            break;
    }
    
    currentQuestion = { num1, num2, operator, answer };
    document.getElementById('question').textContent = `${num1} ${operator} ${num2} = ?`;
    document.getElementById('answer').value = '';
    document.getElementById('result').textContent = '';
}

function checkAnswer() {
    const userAnswer = parseInt(document.getElementById('answer').value);
    const resultDiv = document.getElementById('result');
    
    if (userAnswer === currentQuestion.answer) {
        resultDiv.textContent = '🎉 Bravo! Risposta corretta!';
        resultDiv.className = 'correct';
        mathScore++;
        document.getElementById('score-value').textContent = mathScore;
        
        setTimeout(() => {
            generateMathQuestion();
        }, 1500);
    } else {
        resultDiv.textContent = `❌ Ops! La risposta corretta è ${currentQuestion.answer}`;
        resultDiv.className = 'incorrect';
        
        setTimeout(() => {
            generateMathQuestion();
        }, 2500);
    }
}

// Vocabulary functions
function startVocabGame(type) {
    currentVocabGame = type;
    document.getElementById('vocab-game').classList.remove('hidden');
    
    if (type === 'spelling') {
        generateSpellingQuestion();
    } else if (type === 'matching') {
        generateMatchingQuestion();
    }
}

function generateSpellingQuestion() {
    const randomWord = vocabularyData.words[Math.floor(Math.random() * vocabularyData.words.length)];
    
    document.getElementById('vocab-question').innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem;">${randomWord.emoji}</div>
        <div>${randomWord.description}</div>
        <div style="margin-top: 1rem;">
            <input type="text" id="vocab-input" placeholder="Scrivi la parola..." 
                   style="font-size: 1.2rem; padding: 0.5rem; border-radius: 8px; border: 2px solid #ccc;">
            <button onclick="checkSpelling('${randomWord.word}')">Controlla!</button>
        </div>
    `;
    document.getElementById('vocab-options').innerHTML = '';
}

function checkSpelling(correctWord) {
    const userInput = document.getElementById('vocab-input').value.toUpperCase().trim();
    const resultDiv = document.getElementById('vocab-result');
    
    if (userInput === correctWord) {
        resultDiv.textContent = '🎉 Perfetto! Hai scritto la parola correttamente!';
        resultDiv.className = 'correct';
        vocabScore++;
        document.getElementById('vocab-score-value').textContent = vocabScore;
    } else {
        resultDiv.textContent = `❌ La parola corretta è: ${correctWord}`;
        resultDiv.className = 'incorrect';
    }
    
    setTimeout(() => {
        generateSpellingQuestion();
    }, 2000);
}

function generateMatchingQuestion() {
    const correctWord = vocabularyData.words[Math.floor(Math.random() * vocabularyData.words.length)];
    const wrongWords = vocabularyData.words.filter(w => w.word !== correctWord.word)
                                         .sort(() => Math.random() - 0.5)
                                         .slice(0, 2);
    
    const allOptions = [correctWord, ...wrongWords].sort(() => Math.random() - 0.5);
    
    document.getElementById('vocab-question').innerHTML = `
        <div style="font-size: 4rem; margin-bottom: 1rem;">${correctWord.emoji}</div>
        <div>Quale parola corrisponde a questa immagine?</div>
    `;
    
    document.getElementById('vocab-options').innerHTML = allOptions.map(word => 
        `<div class="vocab-option" onclick="checkMatching('${word.word}', '${correctWord.word}')">
            ${word.word}
        </div>`
    ).join('');
}

function checkMatching(selectedWord, correctWord) {
    const resultDiv = document.getElementById('vocab-result');
    
    if (selectedWord === correctWord) {
        resultDiv.textContent = '🎉 Fantastico! Hai scelto la parola giusta!';
        resultDiv.className = 'correct';
        vocabScore++;
        document.getElementById('vocab-score-value').textContent = vocabScore;
    } else {
        resultDiv.textContent = `❌ La parola corretta era: ${correctWord}`;
        resultDiv.className = 'incorrect';
    }
    
    setTimeout(() => {
        generateMatchingQuestion();
    }, 2000);
}

// Reading comprehension
function checkReading() {
    const q1Answer = document.getElementById('q1').value.toLowerCase().trim();
    const q2Answer = document.getElementById('q2').value;
    const resultDiv = document.getElementById('reading-result');
    
    let score = 0;
    let feedback = '';
    
    if (q1Answer === 'luce') {
        score++;
        feedback += '✅ Domanda 1: Corretto!\n';
    } else {
        feedback += '❌ Domanda 1: La risposta è "Luce"\n';
    }
    
    if (q2Answer === 'correct') {
        score++;
        feedback += '✅ Domanda 2: Corretto!\n';
    } else {
        feedback += '❌ Domanda 2: Luce brillò per aiutare un bambino\n';
    }
    
    resultDiv.innerHTML = `
        <div style="white-space: pre-line; font-size: 1.1rem;">
            ${feedback}
            <br><strong>Punteggio: ${score}/2</strong>
            ${score === 2 ? ' 🎉 Perfetto!' : score === 1 ? ' 👍 Bene!' : ' 💪 Prova ancora!'}
        </div>
    `;
    resultDiv.className = score >= 1 ? 'correct' : 'incorrect';
}

// Color game
function startColorGame() {
    document.getElementById('color-game').classList.remove('hidden');
    document.getElementById('color-score-value').textContent = '0';
    generateColorGame();
}

function generateColorGame() {
    const colors = [
        { name: 'ROSSO', color: '#ff4444' },
        { name: 'BLU', color: '#4444ff' },
        { name: 'VERDE', color: '#44ff44' },
        { name: 'GIALLO', color: '#ffff44' },
        { name: 'ARANCIONE', color: '#ff8844' },
        { name: 'VIOLA', color: '#8844ff' }
    ];
    
    const targetColor = colors[Math.floor(Math.random() * colors.length)];
    document.getElementById('color-target').textContent = targetColor.name;
    
    const shuffledColors = [...colors].sort(() => Math.random() - 0.5).slice(0, 6);
    
    document.getElementById('color-grid').innerHTML = shuffledColors.map(color => 
        `<div class="color-box" style="background-color: ${color.color}" 
              onclick="checkColor('${color.name}', '${targetColor.name}')"></div>`
    ).join('');
}

function checkColor(selectedColor, targetColor) {
    if (selectedColor === targetColor) {
        let currentScore = parseInt(document.getElementById('color-score-value').textContent);
        document.getElementById('color-score-value').textContent = currentScore + 1;
        
        // Visual feedback
        setTimeout(() => {
            generateColorGame();
        }, 1000);
    }
}

// Memory game
function startMemoryGame() {
    document.getElementById('memory-game').classList.remove('hidden');
    memoryLevel = 1;
    document.getElementById('memory-level').textContent = memoryLevel;
    setupMemoryGrid();
}

function setupMemoryGrid() {
    document.getElementById('memory-grid').innerHTML = '';
    
    for (let i = 0; i < 9; i++) {
        const box = document.createElement('div');
        box.className = 'memory-box';
        box.dataset.index = i;
        box.addEventListener('click', () => playerMemoryClick(i));
        document.getElementById('memory-grid').appendChild(box);
    }
}

function startMemorySequence() {
    if (isMemoryPlaying) return;
    
    isMemoryPlaying = true;
    memorySequence = [];
    playerSequence = [];
    
    // Generate sequence
    for (let i = 0; i < memoryLevel; i++) {
        memorySequence.push(Math.floor(Math.random() * 9));
    }
    
    // Show sequence
    playMemorySequence();
}

function playMemorySequence() {
    let index = 0;
    
    const showNext = () => {
        if (index < memorySequence.length) {
            const boxes = document.querySelectorAll('.memory-box');
            boxes[memorySequence[index]].classList.add('active');
            
            setTimeout(() => {
                boxes[memorySequence[index]].classList.remove('active');
                index++;
                setTimeout(showNext, 300);
            }, 600);
        } else {
            // Player's turn
            isMemoryPlaying = false;
        }
    };
    
    setTimeout(showNext, 1000);
}

function playerMemoryClick(index) {
    if (isMemoryPlaying) return;
    
    playerSequence.push(index);
    
    // Visual feedback
    const box = document.querySelector(`[data-index="${index}"]`);
    box.classList.add('player-active');
    setTimeout(() => box.classList.remove('player-active'), 200);
    
    // Check sequence
    const currentStep = playerSequence.length - 1;
    
    if (playerSequence[currentStep] !== memorySequence[currentStep]) {
        // Wrong! Reset
        alert('Ops! Ricomincia dal livello 1');
        memoryLevel = 1;
        document.getElementById('memory-level').textContent = memoryLevel;
        return;
    }
    
    if (playerSequence.length === memorySequence.length) {
        // Level complete!
        memoryLevel++;
        document.getElementById('memory-level').textContent = memoryLevel;
        alert(`Livello ${memoryLevel - 1} completato! 🎉`);
        
        setTimeout(() => {
            startMemorySequence();
        }, 1000);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add enter key support for math answers
    document.getElementById('answer').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            checkAnswer();
        }
    });
    
    // Add enter key support for vocabulary input
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const vocabInput = document.getElementById('vocab-input');
            if (vocabInput && vocabInput === document.activeElement) {
                const checkButton = vocabInput.nextElementSibling;
                if (checkButton) {
                    checkButton.click();
                }
            }
        }
    });
});