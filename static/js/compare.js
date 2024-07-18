/*
    Compare lists and highlight differences

    The structure of the items is:
        1. A parent containter, with a list of divs (divs are dynamically created in object.js and policies.js)
        2. Each div contains a button and a list div
        3. The button is the name of an object, and expands the list div when clicked
        4. The list div contains a list (ul) of properties for the object

    Compares the lists (arrays) and adding missing entries
        The arrays are global variables created in object.js
        Missing entries are added to the respective list and div, then highlighted in red
        The lists and parent divs are sorted alphabetically based on the name of the object
    
    Now the lists will align, so they are compared for differences
        The lists are compared for differences, and the buttons are highlighted in yellow
        The properties of the objects are compared, not just the name
*/


/**
 * Setup the comparison of two lists, as needed by the event listeners
 * 
 * @param {*} listAId 
 * @param {*} listBId 
 * @param {*} listA 
 * @param {*} listB 
 */
function setupComparison(listAId, listBId, listA, listB) {
    // Get the two parent containers
    let listAContainer = document.getElementById(listAId);
    let listBContainer = document.getElementById(listBId);

    // Find missing items, update the lists, and sort them
    compareLists(listA, listB, listAContainer, listBContainer);
    sortDivsByIdSuffix(`#${listAId}`);
    sortDivsByIdSuffix(`#${listBId}`);

    // Find differences and highlight them (need to sort first to ensure the lists are in the same order)
    listA.sort((a, b) => a.name.localeCompare(b.name));
    listB.sort((a, b) => a.name.localeCompare(b.name));
    highlightDifferences(listA, listB, listAContainer, listBContainer);
}


/**
 * Compare two lists and highlight differences
 * Just calls compareAndAppend twice, swapping the lists around
 * 
 * @param {*} listA 
 * @param {*} listB 
 * @param {*} listAContainer 
 * @param {*} listBContainer 
 */
function compareLists(listA, listB, listAContainer, listBContainer) {
    compareAndAppend(listA, listB, listAContainer, listBContainer);
    compareAndAppend(listB, listA, listBContainer, listAContainer);
}


/**
 * Add items to the tables
 * These are shown in the lists of objects like tags, addresses, etc.
 * 
 * @param {*} tableName 
 * @param {*} heading 
 * @param {*} value 
 */
function addChildTableItem(tableName, heading, value) {
    // Skip the name, as it is already displayed in the button
    if (heading == 'name') {
        return;
    }

    // Create the row
    const row = tableName.insertRow();

    // Create the heading cell
    cell = row.insertCell();
    cell.textContent = heading;
    cell.className = 'left-cell';

    // Create the value cell
    cell = row.insertCell();
    cell.textContent = value;
}


/**
 * Compare two lists
 * Find elements in the first list that are not in the second list
 * Append the missing item to the second list
 * 
 * @param {*} firstList 
 * @param {*} secondList 
 * @param {*} firstContainer 
 * @param {*} secondContainer 
 */
function compareAndAppend(firstList, secondList, firstContainer, secondContainer) {
    // Loop through the first list
    firstList.forEach(object => {
        // If the element is not in the second list, add it
        if (!secondList.find(element => element.name === object.name)) {
            // Add to the list
            secondList.push(object);

            // Create objects for the missing elements
            const sanitizedId = sanitizeId(object.name);
            const parentDiv = createElement('div', {id: firstContainer.id + '_' + sanitizedId});
            const button = createButton(object, secondContainer, sanitizedId);
            const listDiv = createDiv(secondContainer, sanitizedId);
            const table = createElement('table', {className: 'w3-table indented-table'});

            // const ul = createElement('ul', {className: 'indented-list'});

            // Add the missing elements to the list div
            Object.entries(object).forEach(([key, value]) => {
                // ul.appendChild(createElement('li', { textContent: `${key}: ${value}` }));
                addChildTableItem(table, key, value);
            });

            // Append the list and button to the parent div
            // listDiv.appendChild(ul);
            listDiv.appendChild(table);
            parentDiv.append(button, listDiv);

            // Append the parent div to the second container
            secondContainer.appendChild(parentDiv);
        }
    });
}


/**
 * Sanatize a name so it can be used in dynamically created IDs
 * 
 * @param {*} name 
 * @returns 
 */
function sanitizeId(name) {
    return name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');
}


/**
 * Creates HTML tags (elements) with properties
 * 
 * @param {*} tag 
 * @param {*} properties 
 * @returns 
 */
function createElement(tag, properties = {}) {
    const element = document.createElement(tag);
    
    // Create the element with the given properties
    Object.entries(properties).forEach(([key, value]) => element[key] = value);
    return element;
}


/**
 * Create a button element for a list item
 * 
 * @param {*} element 
 * @param {*} listContainer 
 * @param {*} sanitizedId 
 * @returns 
 */
function createButton (element, listContainer, sanitizedId) {
    const button = document.createElement('button');
    button.className = 'w3-button w3-block w3-left-align';
    button.textContent = element.name;
    button.classList.add('highlight-missing');
    button.onclick = function() { expandList(listContainer.id + '_' + sanitizedId) };

    return button;
}


/**
 * Create a div element for a list
 * This will be in parallel with the button in a parent div
 * 
 * @param {*} container 
 * @param {*} sanitizedId 
 * @returns 
 */
function createDiv(container, sanitizedId) {
    const listDiv = document.createElement('div');
    listDiv.id = container.id + '_' + sanitizedId;
    listDiv.className = 'w3-hide w3-border';

    return listDiv;
}


/**
 * Sorts parent divs based on the suffix of the 'id' attribute
 * These divs contain a button and a list div
 * 
 * @param {*} parentSelector 
 * @returns 
 */
function sortDivsByIdSuffix(parentSelector) {
    // Select the parent container
    const parent = document.querySelector(parentSelector);
    
    // Ensure the parent exists to avoid errors
    if (!parent) {
        console.error('Parent selector not found:', parentSelector);
        return;
    }

    // Get all divs as an array
    const divsArray = Array.from(parent.querySelectorAll(':scope > div'));
    
    // Sort the array based on the suffix of the 'id' attribute, safely handling missing attributes
    divsArray.sort((a, b) => {
        // Extract the part of the id after the underscore
        const idA = a.id.split('_')[1] || "";
        const idB = b.id.split('_')[1] || "";
        return idA.localeCompare(idB);
    });
    
    // Re-append the divs in sorted order
    divsArray.forEach(div => {
        parent.appendChild(div);
    });
}


/**
 * Finds objects that are different between two lists
 * Looks at properties, not just the name
 * 
 * @param {*} listA 
 * @param {*} listB 
 * @param {*} containerA 
 * @param {*} containerB 
 */
function highlightDifferences(listA, listB, containerA, containerB) {
    // Loop through the first list
    listA.forEach((itemA, index) => {
        // The corresponding item in the second list (to compare to)
        const itemB = listB[index];

        // Compare the two items
        if (areObjectsDifferent(itemA, itemB)) {
            // Select the two buttons, and apply CSS to highlight
            const buttonA = containerA.querySelector(`#${containerA.id}_${sanitizeId(itemA.name)} button`);
            const buttonB = containerB.querySelector(`#${containerB.id}_${sanitizeId(itemB.name)} button`);
            buttonA.classList.add('highlight-different');
            buttonB.classList.add('highlight-different');
        }
    });
}


/**
 * Compare if two JS objects are different
 * Return true or false depending on the result
 * 
 * @param {*} obj1 
 * @param {*} obj2 
 * @returns 
 */
function areObjectsDifferent(obj1, obj2) {
    // Get all keys from both objects
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    // Iterate over all keys to check for differences
    for (let key of allKeys) {
        if (obj1[key] !== obj2[key]) {
            // If any property is different, return true
            return true;
        }
    }

    // If no differences are found, return false
    return false;
}
