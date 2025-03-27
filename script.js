// Game state
let gameState = {
    isPlaying: false,
    iterations: 0,
    startTime: null,
    timer: null,
    currentWords: [],
    previousWords: []
};

// DOM elements
const landingPage = document.getElementById('landingPage');
const gamePage = document.getElementById('gamePage');
const startGameButton = document.getElementById('startGameButton');
const player1Input = document.getElementById('player1Input');
const player2Input = document.getElementById('player2Input');
const submitButton = document.getElementById('submitButton');
const resetButton = document.getElementById('resetButton');
const timerDisplay = document.getElementById('timer');
const iterationsDisplay = document.getElementById('iterations');
const timeDisplay = document.getElementById('time');
const previousWordsDisplay = document.getElementById('previousWords');
const messageDisplay = document.getElementById('message');
const generatedImage = document.getElementById('generatedImage');
const leftWordOverlay = document.querySelector('.left-word');
const rightWordOverlay = document.querySelector('.right-word');

// Initialize game
function initGame() {
    gameState = {
        isPlaying: false,
        iterations: 0,
        startTime: null,
        timer: null,
        currentWords: [],
        previousWords: []
    };
    
    // Reset UI
    player1Input.value = '';
    player2Input.value = '';
    player1Input.disabled = false;
    player2Input.disabled = false;
    submitButton.disabled = false;
    resetButton.disabled = true;
    timerDisplay.textContent = '10';
    iterationsDisplay.textContent = '0';
    timeDisplay.textContent = '0:00';
    previousWordsDisplay.innerHTML = '';
    messageDisplay.textContent = '';
    generatedImage.src = '';
    leftWordOverlay.textContent = '';
    rightWordOverlay.textContent = '';
    
    // Reset timer circle
    const timerFill = document.querySelector('.timer-progress-fill');
    timerFill.style.strokeDasharray = '283';
    timerFill.style.strokeDashoffset = '0';
}

// Generate and display image based on words
async function generateImage(word1, word2) {
    try {
        // Use a more reliable image API
        const searchTerm = `${word1} ${word2}`;
        const response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchTerm)}&per_page=1&orientation=landscape`, {
            headers: {
                'Authorization': 'Client-ID qcmoAPAq6-0Vcf07G1pYkqPph2AJ-J4tNQ0u_FEQ_kY'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
                generatedImage.src = data.results[0].urls.regular;
                leftWordOverlay.textContent = word1;
                rightWordOverlay.textContent = word2;
            } else {
                // If no results found, try searching with individual words
                const word1Response = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(word1)}&per_page=1&orientation=landscape`, {
                    headers: {
                        'Authorization': 'Client-ID qcmoAPAq6-0Vcf07G1pYkqPph2AJ-J4tNQ0u_FEQ_kY'
                    }
                });
                const word1Data = await word1Response.json();
                if (word1Data.results && word1Data.results.length > 0) {
                    generatedImage.src = word1Data.results[0].urls.regular;
                    leftWordOverlay.textContent = word1;
                    rightWordOverlay.textContent = word2;
                }
            }
        } else {
            throw new Error('Failed to fetch image');
        }
    } catch (error) {
        console.error('Error generating image:', error);
        // If all else fails, use a placeholder with the words
        generatedImage.src = `https://via.placeholder.com/800x600/cccccc/666666?text=${encodeURIComponent(word1 + ' + ' + word2)}`;
        leftWordOverlay.textContent = word1;
        rightWordOverlay.textContent = word2;
    }
}

// Start game from landing page
function startGameFromLanding() {
    landingPage.classList.add('hidden');
    gamePage.classList.remove('hidden');
    gameState.isPlaying = true;
    gameState.startTime = Date.now();
    updateTimeDisplay();
}

// Submit words
function submitWords() {
    const word1 = player1Input.value.trim();
    const word2 = player2Input.value.trim();

    if (!word1 || !word2) {
        messageDisplay.textContent = 'Please enter words for both players!';
        return;
    }

    gameState.currentWords = [word1, word2];
    gameState.iterations++;
    iterationsDisplay.textContent = gameState.iterations;

    // Display previous words
    const wordPair = document.createElement('div');
    wordPair.textContent = `${word1} - ${word2}`;
    previousWordsDisplay.appendChild(wordPair);

    // Generate and display image
    generateImage(word1, word2);

    // Check if words match
    if (word1.toLowerCase() === word2.toLowerCase()) {
        endGame(true);
        return;
    }

    // Start next round
    startNextRound();
}

// Start next round
function startNextRound() {
    // Clear inputs
    player1Input.value = '';
    player2Input.value = '';
    
    // Start 10-second timer
    let timeLeft = 10;
    timerDisplay.textContent = timeLeft;
    
    // Setup timer circle
    const timerFill = document.querySelector('.timer-progress-fill');
    const circumference = 283; // 2 * π * r (45)
    timerFill.style.strokeDasharray = `${circumference}`;
    timerFill.style.strokeDashoffset = '0';

    gameState.timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        // Update circle progress
        const progress = (timeLeft / 10) * circumference;
        timerFill.style.strokeDashoffset = `${circumference - progress}`;

        if (timeLeft <= 0) {
            clearInterval(gameState.timer);
            messageDisplay.textContent = "Come on!";
            messageDisplay.classList.add('success');
        }
    }, 1000);
}

// End game
function endGame(success = false) {
    gameState.isPlaying = false;
    clearInterval(gameState.timer);
    
    const totalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    if (success) {
        messageDisplay.textContent = `Success! Words matched after ${gameState.iterations} iterations!`;
        messageDisplay.classList.add('success');
    }

    submitButton.disabled = true;
    resetButton.disabled = false;
}

// Update time display
function updateTimeDisplay() {
    if (!gameState.startTime) return;

    const totalTime = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Event listeners
startGameButton.addEventListener('click', startGameFromLanding);
submitButton.addEventListener('click', submitWords);
resetButton.addEventListener('click', initGame);

// Initialize game on load
initGame(); 