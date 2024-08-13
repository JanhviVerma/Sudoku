document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('sudoku-board');

    function createGrid() {
        for (let i = 0; i < 81; i++) {
            const cell = document.createElement('div');
            cell.textContent = ''; // Empty cells for now
            board.appendChild(cell);
        }
    }

    createGrid();
});
