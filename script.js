document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('sudoku-board');
    const statusBar = document.createElement('div');
    statusBar.id = 'status-bar';
    document.body.appendChild(statusBar);

    // Function to create the Sudoku grid
    function createGrid() {
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

    // Initialize the grid
    createGrid();
});
