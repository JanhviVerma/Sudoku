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
    const loadCustomPuzzleButton = document.getElementById('load-custom-puzzle');
    const difficultySelector = document.getElementById('difficulty');
    const timerDisplay = document.getElementById('timer');
    const moveCountDisplay = document.getElementById('move-count');
    const hintCountDisplay = document.getElementById('hint-count');
    const timeSpentDisplay = document.getElementById('time-spent');
    const puzzleInput = document.getElementById('puzzle-input');

    let initialPuzzleState = '';
    let timerInterval;
    let currentPuzzle = '';
    let timerPaused = false;
    let undoStack = [];
    let redoStack = [];
    let moveCount = 0;
    let hintCount = 0;

    // Predefined Sudoku puzzles and their solutions
    const puzzles = {
        easy: [
            {
                puzzle: '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
                solution: '534678912672195348198342567859761423426853791713924856961537284287419635345286179'
            },
            {
                puzzle: '002840900080090002010050000900000406340050091506000007000030060200010070007024500',
                solution: '672843915483197652915256834928731456341568791756942387149375268264819573537624149'
            }
        ],
        medium: [
            {
                puzzle: '600120384008459072000006005000264030070080006940003000310000050089700000502000190',
                solution: '675129384138459672492876315851264937273981546946537821317642598689715243524398169'
            },
            {
                puzzle: '030000050004005006008000000007903820000000000000781004200000000800300040010000080',
                solution: '137689254624735916598421763947613825265492371381279644279853161848392573953761428'
            }
        ],
        hard: [
            {
                puzzle: '002006000400000003000840000009020007000300000300070400500000200000100600004200000',
                solution: '572936418491758263683241579819423657724369851356174492518692734297146385163927'
            },
            {
                puzzle: '006000200000000000020040003000000080400600700800000000900070000000000800007000500',
                solution: '956734281473621598821459763291387645438962715786145932914278356742619287396154'
            }
        ]
    };

    // Function to create the Sudoku grid
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

    // Function to validate the input in a cell
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

    // Function to provide a hint
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

    // Function to select a cell
    function selectCell(cell) {
        const previouslySelected = board.querySelector('.selected');
        if (previouslySelected) {
            deselectCell(previouslySelected);
        }
        cell.classList.add('selected');
    }

    // Function to deselect a cell
    function deselectCell(cell) {
        cell.classList.remove('selected');
    }

    // Function to get the current state of the puzzle
    function getCurrentState() {
        const cells = board.querySelectorAll('input');
        let state = '';
        cells.forEach(cell => {
            state += cell.value || '0';
        });
        return state;
    }

    // Function to load a puzzle into the grid
    function loadPuzzle(puzzle) {
        const cells = board.querySelectorAll('input');
        for (let i = 0; i < 81; i++) {
            cells[i].value = puzzle[i] === '0' ? '' : puzzle[i];
        }
        initialPuzzleState = puzzle;
        currentPuzzle = puzzle;
        statusBar.textContent = "Puzzle loaded.";
    }

    // Function to reset the puzzle
    function resetPuzzle() {
        loadPuzzle(initialPuzzleState);
        statusBar.textContent = "Puzzle reset.";
    }

    // Function to start the timer
    function startTimer() {
        let seconds = 0;
        let minutes = 0;
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

    // Function to stop the timer
    function stopTimer() {
        clearInterval(timerInterval);
    }

    // Function to pause the timer
    function pauseTimer() {
        timerPaused = true;
        statusBar.textContent = "Timer paused.";
    }

    // Function to resume the timer
    function resumeTimer() {
        timerPaused = false;
        statusBar.textContent = "Timer resumed.";
    }

    // Function to validate the current puzzle solution
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

    // Function to auto-solve the puzzle
    function solvePuzzle() {
        const selectedDifficulty = difficultySelector.value;
        const puzzle = puzzles[selectedDifficulty][Math.floor(Math.random() * puzzles[selectedDifficulty].length)];
        loadPuzzle(puzzle.solution);
        stopTimer();
        statusBar.textContent = "Puzzle solved.";
    }

    // Function to undo the last move
    function undoMove() {
        if (undoStack.length > 0) {
            redoStack.push(getCurrentState());
            loadPuzzle(undoStack.pop());
        }
    }

    // Function to redo the last undone move
    function redoMove() {
        if (redoStack.length > 0) {
            loadPuzzle(redoStack.pop());
        }
    }

    // Function to save the current game state to localStorage
    function saveGame() {
        localStorage.setItem('sudokuGame', JSON.stringify({
            puzzle: getCurrentState(),
            timer: timerDisplay.textContent,
            initialPuzzleState
        }));
        statusBar.textContent = "Game saved.";
    }

    // Function to load the game state from localStorage
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

    // Event listeners
    generateButton.addEventListener('click', () => {
        const selectedDifficulty = difficultySelector.value;
        const puzzle = puzzles[selectedDifficulty][Math.floor(Math.random() * puzzles[selectedDifficulty].length)];
        loadPuzzle(puzzle.puzzle);
        statusBar.textContent = "New puzzle generated.";
        stopTimer();
        startTimer();
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
    loadCustomPuzzleButton.addEventListener('click', () => {
        loadPuzzle(puzzleInput.value);
        statusBar.textContent = "Custom puzzle loaded.";
    });
    board.addEventListener('input', validatePuzzle);

    createGrid(); // Initialize the grid on page load
});
