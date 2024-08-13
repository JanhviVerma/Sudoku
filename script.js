document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('sudoku-board');
    const statusBar = document.getElementById('status-bar');
    const generateButton = document.getElementById('generate-puzzle');
    const resetButton = document.getElementById('reset-puzzle');
    const difficultySelector = document.getElementById('difficulty');
    const timerDisplay = document.getElementById('timer');

    let initialPuzzleState = '';
    let timerInterval;

    // Predefined Sudoku puzzles for different difficulty levels
    const puzzles = {
        easy: [
            '530070000600195000098000060800060003400803001700020006060000280000419005000080079',
            '002840900080090002010050000900000406340050091506000007000030060200010070007024500',
        ],
        medium: [
            '600120384008459072000006005000264030070080006940003000310000050089700000502000190',
            '030000050004005006008000000007903820000000000000781004200000000800300040010000080',
        ],
        hard: [
            '000000907000420180000705026100904000050000040000507009920108000034059000507000000',
            '800000000003600000070090200050007000000045700000100030001000068008500010090000400',
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

            // Display the timer in mm:ss format
            timerDisplay.textContent = `Time: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // Function to stop the timer
    function stopTimer() {
        clearInterval(timerInterval);
    }

    // Event listener for the "Generate Puzzle" button
    generateButton.addEventListener('click', () => {
        const difficulty = difficultySelector.value;
        const puzzleString = puzzles[difficulty][Math.floor(Math.random() * puzzles[difficulty].length)];
        loadPuzzle(puzzleString);
        stopTimer();  // Stop any existing timer
        startTimer(); // Start the timer for the new puzzle
        statusBar.textContent = `Loaded a ${difficulty} puzzle.`;
    });

    // Event listener for the "Reset Puzzle" button
    resetButton.addEventListener('click', resetPuzzle);

    // Initialize the grid on page load
    createGrid();
});
