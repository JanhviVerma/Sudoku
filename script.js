document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('sudoku-board');
    const statusBar = document.getElementById('status-bar');
    const generateButton = document.getElementById('generate-puzzle');
    const resetButton = document.getElementById('reset-puzzle');
    const solveButton = document.getElementById('solve-puzzle');
    const pauseButton = document.getElementById('pause-timer');
    const resumeButton = document.getElementById('resume-timer');
    const undoButton = document.getElementById('undo-move');
    const redoButton = document.getElementById('redo-move');
    const saveButton = document.getElementById('save-game');
    const loadButton = document.getElementById('load-game');
    const hintButton = document.getElementById('hint-button');
    const saveProgressButton = document.getElementById('save-progress');
    const puzzleInput = document.getElementById('puzzle-input');
    const themeSelector = document.getElementById('theme');
    const difficultySelector = document.getElementById('difficulty');
    const timerDisplay = document.getElementById('timer');
    const moveCountDisplay = document.getElementById('move-count');
    const hintCountDisplay = document.getElementById('hint-count');
    const timeSpentDisplay = document.getElementById('time-spent');
    const avgTimeDisplay = document.getElementById('avg-time');
    const avgMovesDisplay = document.getElementById('avg-moves');
    const loadCustomPuzzleButton = document.getElementById('load-custom-puzzle');

    let undoStack = [];
    let redoStack = [];
    let initialPuzzleState = '';
    let currentPuzzle = '';
    let moveCount = 0;
    let hintCount = 0;
    let timerInterval;
    let timerPaused = false;
    let gameStartTime;
    let gameEndTime;

    const statistics = {
        totalGames: 0,
        totalTime: 0,
        totalMoves: 0,
    };

    const puzzles = {
        easy: [
            {
                puzzle: '000000000000000000000000000000000000000000000000000000000000000000000000000000',
                solution: '123456789456789123789123456214365897365897214897214365531978264978264431216879'
            }
        ],
        medium: [
            {
                puzzle: '030000000000000000600000000000000000000000000000000000000000000000000000000000',
                solution: '145278963982364517637915824563821479271496358894753621319647258746253582931764'
            }
        ],
        hard: [
            {
                puzzle: '002006000400000003000840000009020007000300000300070400500000200000100600004200000',
                solution: '572936418491758263683241579819423657724369851356174492518692734297146385163927'
            }
        ]
    };

    function createGrid() {
        board.innerHTML = '';
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            cell.appendChild(input);
            board.appendChild(cell);

            cell.addEventListener('click', () => selectCell(cell));
            input.addEventListener('input', () => validateCell(input, cell));
        }
    }

    function validateCell(input, cell) {
        const value = input.value;
        if (value === '' || /^[1-9]$/.test(value)) {
            cell.classList.remove('invalid');
            cell.classList.add('valid');
        } else {
            cell.classList.add('invalid');
            statusBar.textContent = "Invalid input. Please enter a number between 1 and 9.";
        }
        undoStack.push(getCurrentState());
        redoStack = [];
        moveCount++;
        moveCountDisplay.textContent = moveCount;
    }

    function provideHint() {
        const cells = board.querySelectorAll('input');
        let hintGiven = false;

        for (let i = 0; i < 81; i++) {
            const cell = cells[i];
            if (!cell.value && initialPuzzleState[i] !== '0') {
                cell.value = initialPuzzleState[i];
                cell.classList.add('valid');
                hintCount++;
                hintCountDisplay.textContent = hintCount;
                hintGiven = true;
                break;
            }
        }

        if (!hintGiven) {
            statusBar.textContent = "No hints available.";
        }
    }

    function selectCell(cell) {
        const previouslySelected = board.querySelector('.selected');
        if (previouslySelected) {
            deselectCell(previouslySelected);
        }
        cell.classList.add('selected');
    }

    function deselectCell(cell) {
        cell.classList.remove('selected');
    }

    function getCurrentState() {
        const cells = board.querySelectorAll('input');
        let state = '';
        cells.forEach(cell => {
            state += cell.value || '0';
        });
        return state;
    }

    function loadPuzzle(puzzle) {
        const cells = board.querySelectorAll('input');
        for (let i = 0; i < 81; i++) {
            cells[i].value = puzzle[i] === '0' ? '' : puzzle[i];
        }
        initialPuzzleState = puzzle;
        currentPuzzle = puzzle;
        statusBar.textContent = "Puzzle loaded.";
    }

    function resetPuzzle() {
        loadPuzzle(initialPuzzleState);
        statusBar.textContent = "Puzzle reset.";
    }

    function startTimer() {
        let seconds = 0;
        let minutes = 0;
        gameStartTime = new Date();
        timerInterval = setInterval(() => {
            if (!timerPaused) {
                seconds++;
                if (seconds === 60) {
                    seconds = 0;
                    minutes++;
                }

                const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                timerDisplay.textContent = `Time: ${formattedTime}`;
                timeSpentDisplay.textContent = formattedTime;
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerInterval);
        gameEndTime = new Date();
        const timeSpent = (gameEndTime - gameStartTime) / 1000; // in seconds
        statistics.totalTime += timeSpent;
        statistics.totalGames++;
        avgTimeDisplay.textContent = formatTime(statistics.totalTime / statistics.totalGames);
        avgMovesDisplay.textContent = (statistics.totalMoves / statistics.totalGames).toFixed(2);
    }

    function pauseTimer() {
        timerPaused = true;
        statusBar.textContent = "Timer paused.";
    }

    function resumeTimer() {
        timerPaused = false;
        statusBar.textContent = "Timer resumed.";
    }

    function validatePuzzle() {
        const cells = board.querySelectorAll('input');
        let userSolution = '';
        for (let i = 0; i < 81; i++) {
            userSolution += cells[i].value || '0';
        }

        const selectedDifficulty = difficultySelector.value;
        const isValid = puzzles[selectedDifficulty].some(p => p.solution === userSolution);

        if (isValid) {
            statusBar.textContent = "Congratulations! You have solved the puzzle correctly.";
            stopTimer();
        } else {
            statusBar.textContent = "Incorrect solution. Please check your entries.";
        }
    }

    function solvePuzzle() {
        const selectedDifficulty = difficultySelector.value;
        const puzzle = puzzles[selectedDifficulty][Math.floor(Math.random() * puzzles[selectedDifficulty].length)];
        loadPuzzle(puzzle.solution);
        stopTimer();
        statusBar.textContent = "Puzzle solved.";
    }

    function undoMove() {
        if (undoStack.length > 0) {
            redoStack.push(getCurrentState());
            loadPuzzle(undoStack.pop());
        }
    }

    function redoMove() {
        if (redoStack.length > 0) {
            loadPuzzle(redoStack.pop());
        }
    }

    function saveGame() {
        localStorage.setItem('sudokuGame', JSON.stringify({
            puzzle: getCurrentState(),
            timer: timerDisplay.textContent,
            initialPuzzleState
        }));
        statusBar.textContent = "Game saved.";
    }

    function loadGame() {
        const savedGame = JSON.parse(localStorage.getItem('sudokuGame'));
        if (savedGame) {
            loadPuzzle(savedGame.puzzle);
            timerDisplay.textContent = savedGame.timer;
            timeSpentDisplay.textContent = savedGame.timer;
            initialPuzzleState = savedGame.initialPuzzleState;
            statusBar.textContent = "Game loaded.";
        } else {
            statusBar.textContent = "No saved game found.";
        }
    }

    function saveProgress() {
        const cells = board.querySelectorAll('input');
        const progress = Array.from(cells).map(cell => cell.value || '0').join('');
        localStorage.setItem('sudokuProgress', JSON.stringify({
            progress,
            timer: timerDisplay.textContent,
            moveCount,
            hintCount
        }));
        statusBar.textContent = "Progress saved.";
    }

    function loadProgress() {
        const savedProgress = JSON.parse(localStorage.getItem('sudokuProgress'));
        if (savedProgress) {
            loadPuzzle(savedProgress.progress);
            timerDisplay.textContent = savedProgress.timer;
            timeSpentDisplay.textContent = savedProgress.timer;
            moveCount = savedProgress.moveCount;
            hintCount = savedProgress.hintCount;
            moveCountDisplay.textContent = moveCount;
            hintCountDisplay.textContent = hintCount;
            statusBar.textContent = "Progress loaded.";
        } else {
            statusBar.textContent = "No progress found.";
        }
    }

    function switchTheme() {
        if (themeSelector.value === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    createGrid();
    startTimer();

    generateButton.addEventListener('click', () => {
        const selectedDifficulty = difficultySelector.value;
        const puzzle = puzzles[selectedDifficulty][Math.floor(Math.random() * puzzles[selectedDifficulty].length)];
        loadPuzzle(puzzle.puzzle);
        statusBar.textContent = "Puzzle generated.";
    });

    resetButton.addEventListener('click', resetPuzzle);
    solveButton.addEventListener('click', solvePuzzle);
    pauseButton.addEventListener('click', pauseTimer);
    resumeButton.addEventListener('click', resumeTimer);
    undoButton.addEventListener('click', undoMove);
    redoButton.addEventListener('click', redoMove);
    saveButton.addEventListener('click', saveGame);
    loadButton.addEventListener('click', loadGame);
    hintButton.addEventListener('click', provideHint);
    saveProgressButton.addEventListener('click', saveProgress);
    loadCustomPuzzleButton.addEventListener('click', () => loadPuzzle(puzzleInput.value));
    themeSelector.addEventListener('change', switchTheme);
});
