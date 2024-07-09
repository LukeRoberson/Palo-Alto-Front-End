/*
    Compare lists and highlight differences
*/

// Loop through each row and cell of both tables and compare cell values
function compareAndHighlight() {
    const firstTableRows = document.querySelector('#firstTable').rows;
    const secondTableRows = document.querySelector('#secondTable').rows;
    const minLength = Math.min(firstTableRows.length, secondTableRows.length);

    for (let i = 1; i < minLength; i++) { // Start from 1 to skip header row
        const firstCells = firstTableRows[i].cells;
        const secondCells = secondTableRows[i].cells;
        const minCellsLength = Math.min(firstCells.length, secondCells.length);

        for (let j = 0; j < minCellsLength; j++) {
            if (firstCells[j].innerText !== secondCells[j].innerText) {
                firstCells[j].classList.add('highlight');
                secondCells[j].classList.add('highlight');
            }
        }
    }
}

// Checks if both tables have more than just the header row
function isBothTablesPopulated() {
    const firstTableRows = document.querySelector('#firstTable').rows.length;
    const secondTableRows = document.querySelector('#secondTable').rows.length;
    console.log('First table rows:', firstTableRows);
    console.log('Second table rows:', secondTableRows);

    // Check if both tables have more than just the header row
    return firstTableRows > 1 && secondTableRows > 1;
}

// Event listener: Checks that (1) The DOM is fully loaded and (2) Both tables have more than just the header row
// Triggers when a device is selected from the dropdown list
document.addEventListener('DOMContentLoaded', function() {
    document.body.addEventListener('change', function(event) {
        const targetId = event.target.id;
        if (targetId === 'firstDropdown' || targetId === 'secondDropdown') {
            console.log(`${targetId} changed`);
            if (isBothTablesPopulated()) {
                console.log(`Comparing lists due to ${targetId} change`);
                compareAndHighlight();
            }
        }
    });
});
