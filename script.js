document.addEventListener('DOMContentLoaded', () => {
    const introScreen = document.getElementById('introScreen');
    const gameContainer = document.getElementById('gameContainer');
    const settingsScreen = document.getElementById('settingsScreen');
    const multiplayerButton = document.getElementById('multiplayerButton');
    const computerButton = document.getElementById('computerButton');
    const settingsButton = document.getElementById('settingsButton');
    const saveSettingsButton = document.getElementById('saveSettingsButton');
    const cancelSettingsButton = document.getElementById('cancelSettingsButton');
    const backButton = document.getElementById('backButton');

    const volumeControl = document.getElementById('volumeControl');
    const brightnessControl = document.getElementById('brightnessControl');

    const board = document.getElementById('board');
    const cells = document.querySelectorAll('.cell');
    const message = document.getElementById('message');
    const resetButton = document.getElementById('resetButton');
    const symbolOptions = document.querySelectorAll('.symbol');
    const turnIndicator = document.getElementById('turnIndicator');

    let playerXName = document.getElementById('playerXName');
    let playerOName = document.getElementById('playerOName');

    let currentPlayer = 'X';
    let playerXSymbol = '';
    let playerOSymbol = '';
    let playerXClass = '';
    let playerOClass = '';
    let boardState = ['', '', '', '', '', '', '', '', ''];
    let gameActive = false;
    let isComputerOpponent = false;

    const winningConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    let savedVolume = 0.5;
    let savedBrightness = 1;

    // Sound effects
    const clickSound = new Audio('sounds/click.mp3');
    const symbolSelectSound = new Audio('sounds/select.mp3');
    const winSound = new Audio('sounds/win.mp3');
    const tieSound = new Audio('sounds/tie.mp3');
    const resetSound = new Audio('sounds/reset.mp3');

    // Set initial volume
    clickSound.volume = savedVolume;
    symbolSelectSound.volume = savedVolume;
    winSound.volume = savedVolume;
    tieSound.volume = savedVolume;
    resetSound.volume = savedVolume;

    // Handle Multiplayer
    multiplayerButton.addEventListener('click', () => {
        clickSound.play();
        isComputerOpponent = false;
        introScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        handleReset();
    });

    // Handle Computer Opponent
    computerButton.addEventListener('click', () => {
        clickSound.play();
        isComputerOpponent = true;
        introScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        handleReset();
    });

    // Handle Settings
    settingsButton.addEventListener('click', () => {
        clickSound.play();
        introScreen.style.display = 'none';
        settingsScreen.style.display = 'block';
    });

    // Handle Save Settings
    saveSettingsButton.addEventListener('click', () => {
        clickSound.play();
        savedVolume = volumeControl.value;
        savedBrightness = brightnessControl.value;
        gameContainer.style.filter = `brightness(${savedBrightness})`;

        // Update volume for all sounds
        clickSound.volume = savedVolume;
        symbolSelectSound.volume = savedVolume;
        winSound.volume = savedVolume;
        tieSound.volume = savedVolume;
        resetSound.volume = savedVolume;

        settingsScreen.style.display = 'none';
        introScreen.style.display = 'block';
    });

    // Handle Cancel Settings
    cancelSettingsButton.addEventListener('click', () => {
        clickSound.play();
        volumeControl.value = savedVolume;
        brightnessControl.value = savedBrightness;
        settingsScreen.style.display = 'none';
        introScreen.style.display = 'block';
    });

    // Handle Back Button
    backButton.addEventListener('click', () => {
        clickSound.play();
        gameContainer.style.display = 'none';
        introScreen.style.display = 'block';
    });

    // Volume control (for demonstration)
    volumeControl.addEventListener('input', () => {
        const volume = volumeControl.value;
        // Example: soundEffect.volume = volume;
    });

    // Brightness control for game container only
    brightnessControl.addEventListener('input', () => {
        const brightness = brightnessControl.value;
        gameContainer.style.filter = `brightness(${brightness})`;
    });

    // Symbol selection logic
    symbolOptions.forEach(option => {
        option.addEventListener('click', function() {
            if (!playerXSymbol) {
                playerXSymbol = this.getAttribute('data-symbol');
                playerXClass = this.getAttribute('data-symbol-class');
                this.classList.add('selected');
                symbolSelectSound.play();
            } else if (!playerOSymbol) {
                playerOSymbol = this.getAttribute('data-symbol');
                playerOClass = this.getAttribute('data-symbol-class');
                this.classList.add('selected');
                symbolSelectSound.play();
                startGame();
            }
        });
    });

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    resetButton.addEventListener('click', handleReset);

    function handleCellClick(event) {
        const cell = event.target;
        const cellIndex = parseInt(cell.getAttribute('data-index'));

        if (boardState[cellIndex] !== '' || !gameActive) {
            return;
        }

        boardState[cellIndex] = currentPlayer;
        cell.innerText = currentPlayer === 'X' ? playerXSymbol : playerOSymbol;

        if (currentPlayer === 'X') {
            cell.classList.add(playerXClass);
        } else {
            cell.classList.add(playerOClass);
        }

        cell.classList.add('pop');
        clickSound.play();
        checkResult();

        if (gameActive && isComputerOpponent && currentPlayer === 'O') {
            setTimeout(computerMove, 500); // Delay for the computer's move
        }
    }

    function checkResult() {
        let roundWon = false;

        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
                roundWon = true;
                document.querySelector(`[data-index="${a}"]`).classList.add('winning-cell');
                document.querySelector(`[data-index="${b}"]`).classList.add('winning-cell');
                document.querySelector(`[data-index="${c}"]`).classList.add('winning-cell');
                break;
            }
        }

        if (roundWon) {
            const winner = currentPlayer === 'X' ? playerXName.value || 'X' : playerOName.value || 'O';
            message.innerText = `${winner} wins! 🎉`;
            turnIndicator.innerText = '';
            winSound.play();
            gameActive = false;
            return;
        }

        if (!boardState.includes('')) {
            message.innerText = "It's a tie!";
            turnIndicator.innerText = '';
            tieSound.play();
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTurnIndicator();
    }

    function handleReset() {
        currentPlayer = 'X';
        playerXSymbol = '';
        playerOSymbol = '';
        playerXClass = '';
        playerOClass = '';
        boardState = ['', '', '', '', '', '', '', '', ''];
        cells.forEach(cell => {
            cell.innerText = '';
            cell.classList.remove('symbol-x', 'symbol-o', 'symbol-flame', 'symbol-water', 'symbol-star', 'symbol-luck', 'pop', 'winning-cell');
        });
        symbolOptions.forEach(option => option.classList.remove('selected'));
        message.innerText = '';
        turnIndicator.innerText = 'Waiting for players to choose symbols...';
        resetSound.play();
        gameActive = false;
    }

    function startGame() {
        gameActive = true;
        updateTurnIndicator();
    }

    function updateTurnIndicator() {
        const currentPlayerName = currentPlayer === 'X' ? playerXName.value || 'X' : playerOName.value || 'O';
        turnIndicator.innerText = `${currentPlayerName}'s turn (${currentPlayer === 'X' ? playerXSymbol : playerOSymbol})`;
    }

    function computerMove() {
        // More advanced AI logic

        // 1. Win if possible
        if (makeStrategicMove('O')) return;

        // 2. Block opponent's win
        if (makeStrategicMove('X')) return;

        // 3. Take the center if available
        if (boardState[4] === '') {
            document.querySelector(`[data-index="4"]`).click();
            return;
        }

        // 4. Take any corner if available
        const corners = [0, 2, 6, 8];
        for (let corner of corners) {
            if (boardState[corner] === '') {
                document.querySelector(`[data-index="${corner}"]`).click();
                return;
            }
        }

        // 5. Take any remaining empty cell
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === '') {
                document.querySelector(`[data-index="${i}"]`).click();
                break;
            }
        }
    }

    function makeStrategicMove(player) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (boardState[a] === player && boardState[b] === player && boardState[c] === '') {
                document.querySelector(`[data-index="${c}"]`).click();
                return true;
            } else if (boardState[a] === player && boardState[b] === '' && boardState[c] === player) {
                document.querySelector(`[data-index="${b}"]`).click();
                return true;
            } else if (boardState[a] === '' && boardState[b] === player && boardState[c] === player) {
                document.querySelector(`[data-index="${a}"]`).click();
                return true;
            }
        }
        return false;
    }
});
