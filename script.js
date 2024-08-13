document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('sudoku-board');
    const statusBar = document.getElementById('status-bar');
    const generateButton = document.getElementById('generate-puzzle');
    const resetButton = document.getElementById('reset-puzzle');
    const solveButton = document.getElementById('solve-puzzle');
    const difficultySelector = document.getElementById('difficulty');
    const timerDisplay = document.getElementById('timer');

    let initialPuzzleState = '';
    let timerInterval;
    let currentPuzzle = '';

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
            input.addEventListener('input', validateInput);
            input.addEventListener('focus', () => selectCell(cell));
            input.addEventListener('blur', () => deselectCell(cell));

            cell.appendChild(input);
            board.appendChild(cell);
        }
    }

    // Function to validate input (only numbers 1-9)
    function validateInput(event) {
        const value = event.target.value;
        const cell = event.target.parentElement;
        if (!/^[1-9]$/.test(value)) {
            event.target.value = '';
            cell.classList.add('invalid');
            statusBar.textContent = "Invalid input! Please enter a number between 1 and 9.";
        } else {
            cell.classList.remove('invalid');
            statusBar.textContent = '';
        }
    }

    // Function to highlight the selected cell
    function selectCell(cell) {
        cell.classList.add('selected');
        statusBar.textContent = "Cell selected.";
    }

    // Function to remove the highlight from the selected cell
    function deselectCell(cell) {
        cell.classList.remove('selected');
        statusBar.textContent = '';
    }

    // Function to load a puzzle into the grid
    function loadPuzzle(puzzleString) {
        const cells = board.querySelectorAll('input');
        initialPuzzleState = puzzleString; // Save initial state for reset
        currentPuzzle = puzzleString;
        for (let i = 0; i < 81; i++) {
            cells[i].value = puzzleString[i] !== '0' ? puzzleString[i] : '';
            cells[i].disabled = puzzleString[i] !== '0'; // Disable cells with pre-filled values
        }
    }

    // Function to reset the puzzle to its initial state
    function resetPuzzle() {
        if (initialPuzzleState) {
            loadPuzzle(initialPuzzleState);
            statusBar.textContent = "Puzzle reset to initial state.";
        }
    }

    // Function to start the timer
    function startTimer() {
        let seconds = 0;
        let minutes = 0;

        timerInterval = setInterval(() => {
            seconds++;
            if (seconds >= 60) {
                seconds = 0;
                minutes++;
            }

            const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            timerDisplay.textContent = `Time: ${formattedTime}`;
        }, 1000);
    }

    // Function to stop the timer
    function stopTimer() {
        clearInterval(timerInterval);
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
    board.addEventListener('input', validatePuzzle);

    createGrid(); // Initialize the grid on page load
});
