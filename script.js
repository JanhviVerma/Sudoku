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
    const difficultySelector = document.getElementById('difficulty');
    const timerDisplay = document.getElementById('timer');

    let initialPuzzleState = '';
    let timerInterval;
    let currentPuzzle = '';
    let timerPaused = false;
    let undoStack = [];
    let redoStack = [];

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
                solution: '731689452294135876658472193147953628823614759965781324572846931886327514319524687'
            }
        ],
        hard: [
            {
                puzzle: '000000907000420180000705026100904000050000040000507009920108000034059000507000000',
                solution: '843621957765423189291785326172934865659871243384567219926148573438259671517396482'
            },
            {
                puzzle: '800000000003600000070090200050007000000045700000100030001000068008500010090000400',
                solution: '812354697543682971679791253954237186326845719187169532431976825768523149295418364'
            }
        ]
    };

    // Function to create the Sudoku grid
    function createGrid() {
        board.innerHTML = ''; // Clear the board
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;

            // Add event listeners
            input.addEventListener('input', handleInput);
            input.addEventListener('focus', () => selectCell(cell));
            input.addEventListener('blur', () => deselectCell(cell));

            cell.appendChild(input);
            board.appendChild(cell);
        }
    }

    // Function to handle input changes
    function handleInput(event) {
        const value = event.target.value;
        const cell = event.target.parentElement;
        if (!/^[1-9]$/.test(value)) {
            event.target.value = '';
            cell.classList.add('invalid');
            statusBar.textContent = "Invalid input. Please enter a number between 1 and 9.";
        } else {
            cell.classList.remove('invalid');
            cell.classList.add('valid');
        }
        undoStack.push(getCurrentState());
        redoStack = [];
    }

    // Function to select a cell
    function selectCell(cell) {
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
    board.addEventListener('input', validatePuzzle);

    createGrid(); // Initialize the grid on page load
});
