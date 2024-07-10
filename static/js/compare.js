/*
    Compare lists and highlight differences

    Missing entries are added to the respective table, and highlighted in red
    Entries that are in both tables, but are different, are highlighted in yellow
*/

// Event listener for the compare button
document.getElementById('tag_compare').addEventListener('click', function() {
    console.log('Comparing tags');

    // Call the compareTables function
    compareTables();
});

/**
 * Compares two tables and adds missing items to the respective table
 */
function compareTables() {
    // Get the tables and their values, get ready to look for missing items
    var firstTable = document.getElementById('firstTable');
    var secondTable = document.getElementById('secondTable');
    var firstTableItems = getTableItems(firstTable);
    var secondTableItems = getTableItems(secondTable);

    // Create two arrays to store the missing items in each table
    // One is missing items in the first table, the other is missing items in the second table
    var missingItemsInFirstTable = getMissingItems(firstTableItems, secondTableItems);
    var missingItemsInSecondTable = getMissingItems(secondTableItems, firstTableItems);

    // Update tables with missing items (highlighted)
    // Include the table to update
    appendMissingItemsToTable(missingItemsInFirstTable, 'secondTable');
    appendMissingItemsToTable(missingItemsInSecondTable, 'firstTable');
    sortTable(firstTable);
    sortTable(secondTable);

    // Refresh the table items, get ready to look for differences
    var firstTable = document.getElementById('firstTable');
    var secondTable = document.getElementById('secondTable');
    var firstTableItems = getTableItems(firstTable);
    var secondTableItems = getTableItems(secondTable);

    // Determine the shorter length to avoid index out of range errors
    var minLength = Math.min(firstTableItems.length, secondTableItems.length);

    // Compare the items in the tables and highlight differences
    for (var i = 0; i < minLength; i++) {
        if (!arraysEqual(firstTableItems[i], secondTableItems[i])) {
            // Assuming each item is a row in the table, highlight the row
            highlightRow(firstTable.rows[i]);
            highlightRow(secondTable.rows[i]);
        }
    }
}

/**
 * Gets the items in a table.
 * @param {HTMLTableElement[]} table - The table from which to get items.
 * @return {string[][]} The items in the table.
 */
function getTableItems(table) {
    // Create an empty array to store the items
    var items = [];

    // Get the rows in the table
    var rows = table.getElementsByTagName('tr');

    // Loop through the rows
    for (var i = 0; i < rows.length; i++) {
        // Get the cells in the row
        var cells = rows[i].getElementsByTagName('td');
        var item = [];

        // Loop through the cells
        for (var j = 0; j < cells.length; j++) {
            // Add the cell text to the item array
            item.push(cells[j].innerText);
        }

        // Add the item array to the items array
        items.push(item);
    }

    // Return the items array (a 2D array of items in the table)
    return items;
}

/**
 * Compares two arrays and returns the items that are in the source array but not in the target array.
 * @param {string[][]} sourceItems - The source array of items.
 * @param {string[][]} targetItems - The target array of items to compare against.
 * @return {string[][]} The items that are in the source array but not in the target array.
 */
function getMissingItems(sourceItems, targetItems) {
    // Array to store the missing items
    var missingItems = [];

    // Loop through the source items
    for (var i = 0; i < sourceItems.length; i++) {
        // Variable to store whether the item was found in the target items
        var found = false;

        // Loop through the target items
        for (var j = 0; j < targetItems.length; j++) {
            // If the items are equal, set found to true and break out of the loop
            if (sourceItems[i][0] === targetItems[j][0]) {
                found = true;
                break;
            }
        }

        // If the item was not found, add it to the missing items array
        if (!found) {
            missingItems.push(sourceItems[i]);
        }
    }

    return missingItems;
}

/**
 * Compares two items and returns whether they are equal.
 * @param {string[]} arr1 - The first item to compare.
 * @param {string[]} arr2 - The second item to compare.
 * @return {boolean} Whether the items are equal.
 */
function arraysEqual(arr1, arr2) {
    // If the arrays are different lengths, they are not equal
    // A quick check to avoid unnecessary comparisons
    if (arr1.length !== arr2.length) {
        return false;
    }

    // Loop through the arrays and compare each element
    for (var i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) {
            return false;
        }
    }

    // If all elements are equal, return true
    return true;
}

/**
 * Adds missing items to the table and highlights them.
 * @param {string[][]} missingItems - The missing items to print.
 * @param {string} tableName - The name of the table.
 */
function appendMissingItemsToTable(missingItems, tableName) {
    // Check if there are missing items
    if (missingItems.length > 0) {
        // Get the table by ID
        var table = document.getElementById(tableName);
        
        // Loop through the missing items and add them
        missingItems.forEach(item => {
            // Create a new row at the end of the table
            var row = table.insertRow(-1);
            
            // Add each value in the item to a new cell in the row
            item.forEach(value => {
                var cell = row.insertCell(-1);
                cell.textContent = value;
            });

            // Apply the 'highlight-missing' class to the row
            row.classList.add('highlight-missing');
        });

        // Sort the table alphabetically
        var rows = table.rows;
        var sortedRows = Array.from(rows).slice(1).sort((a, b) => {
            var textA = a.innerText.toLowerCase();
            var textB = b.innerText.toLowerCase();
            if (textA < textB) {
                return -1;
            }
            if (textA > textB) {
                return 1;
            }
            return 0;
        });

        // Remove existing rows from the table
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }

        // Append the sorted rows back to the table
        sortedRows.forEach(row => {
            table.appendChild(row);
        });
    }
}

/**
 * Sorts a table alphabetically.
 * @param {HTMLTableElement} table - The table to sort.
 */
function sortTable(table) {
    var rows = table.rows;
    var sortedRows = Array.from(rows).slice(1).sort((a, b) => {
        var textA = a.innerText.toLowerCase();
        var textB = b.innerText.toLowerCase();
        if (textA < textB) {
            return -1;
        }
        if (textA > textB) {
            return 1;
        }
        return 0;
    });

    // Remove existing rows from the table
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }

    // Append the sorted rows back to the table
    sortedRows.forEach(row => {
        table.appendChild(row);
    });
}

/**
 * Highlights a row in a table.
 * @param {HTMLTableRowElement} row - The row to highlight.
 */
function highlightRow(row) {
    row.classList.add('highlight-different');
}