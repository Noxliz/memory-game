// Configuration du jeu
const config = {
    boardSize: 4, // Grille 4x4 (16 cartes, 8 paires)
    icons: ['🍎', '🍌', '🍒', '🍓', '🍊', '🍋', '🍐', '🍇'], // Emojis pour les paires
    flipDelay: 1000 // Délai avant de retourner les cartes non appariées (ms)
};

// État du jeu
let gameState = {
    board: [],
    flippedCards: [],
    matchedPairs: 0,
    moves: 0,
    canFlip: true,
    timer: 0,
    timerInterval: null
};

// Éléments du DOM
const elements = {
    board: document.getElementById('board'),
    movesCounter: document.getElementById('moves'),
    restartButton: document.getElementById('restart'),
    timerDisplay: document.getElementById('time')
};

// Initialisation du jeu
function startTimer() {
    clearInterval(gameState.timerInterval);
    gameState.timer = 0;
    updateTimerDisplay();
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameState.timer / 60).toString().padStart(2, '0');
    const seconds = (gameState.timer % 60).toString().padStart(2, '0');
    elements.timerDisplay.textContent = `${minutes}:${seconds}`;
}

function initGame() {
    // Réinitialiser l'état du jeu
    gameState = {
        board: [],
        flippedCards: [],
        matchedPairs: 0,
        moves: 0,
        canFlip: true,
        timer: 0,
        timerInterval: null
    };

    // Mettre à jour le compteur de coups
    elements.movesCounter.textContent = gameState.moves;
    startTimer();

    // Vider le plateau
    elements.board.innerHTML = '';

    // Créer et mélanger les paires de cartes
    const cards = [...config.icons, ...config.icons];
    gameState.board = shuffleArray(cards);

    // Créer les cartes dans le DOM
    gameState.board.forEach((icon, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.index = index;
        card.dataset.icon = icon;
        card.addEventListener('click', handleCardClick);
        elements.board.appendChild(card);
    });
}

// Mélanger un tableau (algorithme de Fisher-Yates)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Gestion du clic sur une carte
function handleCardClick(event) {
    const card = event.currentTarget;
    const cardIndex = parseInt(card.dataset.index);

    // Vérifier si on peut retourner la carte
    if (!gameState.canFlip || 
        gameState.flippedCards.length >= 2 || 
        card.classList.contains('flipped') || 
        card.classList.contains('matched')) {
        return;
    }

    // Retourner la carte
    flipCard(card, true);

    // Ajouter la carte aux cartes retournées
    gameState.flippedCards.push({ index: cardIndex, element: card });

    // Vérifier si on a retourné 2 cartes
    if (gameState.flippedCards.length === 2) {
        gameState.moves++;
        elements.movesCounter.textContent = gameState.moves;

        // Vérifier si les cartes correspondent
        const card1 = gameState.flippedCards[0];
        const card2 = gameState.flippedCards[1];
        const isMatch = gameState.board[card1.index] === gameState.board[card2.index];

        if (isMatch) {
            // Cartes identiques - les marquer comme appariées
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');
            gameState.flippedCards = [];
            gameState.matchedPairs++;

            // Vérifier si le jeu est terminé
            if (gameState.matchedPairs === config.icons.length) {
                clearInterval(gameState.timerInterval);
                document.querySelectorAll('.card').forEach(card => {
                    card.classList.add('victory');
                });
                setTimeout(() => {
                    alert(`Félicitations ! Vous avez gagné en ${gameState.moves} coups et ${gameState.timer} secondes !`);
                }, 500);
            }
        } else {
            // Cartes différentes - les retourner après un délai
            gameState.canFlip = false;
            setTimeout(() => {
                flipCard(card1.element, false);
                flipCard(card2.element, false);
                gameState.flippedCards = [];
                gameState.canFlip = true;
            }, config.flipDelay);
        }
    }
}

// Retourner une carte
function flipCard(card, isFlipped) {
    if (isFlipped) {
        card.classList.add('flipped');
        card.textContent = card.dataset.icon;
    } else {
        card.classList.remove('flipped');
        card.textContent = '';
    }
}

// Écouteur d'événement pour le bouton Rejouer
elements.restartButton.addEventListener('click', initGame);

// Démarrer le jeu
initGame();
