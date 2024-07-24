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
 * @param {*} listAId       The ID of the first list container
 * @param {*} listBId       The ID of the second list container
 * @param {*} listA         The first list of objects
 * @param {*} listB         The second list of objects
 * @param {*} sort          Whether to sort the lists alphabetically (good for objects, bad for policies)
 */
function setupComparison(listAId, listBId, listA, listB, sort=true) {
    // Get the two parent containers
    let listAContainer = document.getElementById(listAId);
    let listBContainer = document.getElementById(listBId);

    // Find missing items, update the lists, and sort them
    compareAndAppend(listA, listB, listAContainer, listBContainer);
    if (sort) {
        sortDivsByIdSuffix(`#${listAId}`);
        sortDivsByIdSuffix(`#${listBId}`);
    }

    // Find differences and highlight them (need to sort first to ensure the lists are in the same order)
    if (sort) {
        listA.sort((a, b) => a.name.localeCompare(b.name));
        listB.sort((a, b) => a.name.localeCompare(b.name));
    }
    highlightDifferences(listA, listB, listAContainer, listBContainer);
}


/**
 * Add items to the tables
 * These are shown in the lists of objects like tags, addresses, etc.
 * Called for each item (row) in the table
 * 
 * @param {*} tableName     An existing table that needs an item added
 * @param {*} heading       The heading, which is in the left cell
 * @param {*} value         The value, which is in the right cell
 */
function addChildTableItem(tableName, heading, value) {
    // Skip the name, as it is already displayed in the button
    if (heading == 'name') {
        return;
    }

    // Create the row
    const row = tableName.insertRow();

    // Create the heading cell (left cell)
    cell = row.insertCell();
    cell.textContent = heading;
    cell.className = 'left-cell';

    // Create the value cell
    cell = row.insertCell();
    // cell.textContent = value;
    if (value && typeof value === 'object' && value.member && Array.isArray(value.member)) {
        // Handle cases where 'value' is an array containing 'member' as a property
        cell.textContent = value.member ? value.member.join(', ') : "None";
        
    } else if (value && typeof value === 'object' && value["static-ip"] && typeof value["static-ip"] === 'object') {
        // Correctly handle 'static-ip' as an object, not an array
        let bidirNat = value?.["static-ip"]?.["bi-directional"] ?? "None";
        let sourceTransIp = value?.["static-ip"]?.["translated-address"] ?? "None";

        cell.innerHTML = sourceTransIp + "<br>Bidirectional: " + bidirNat;

    } else {
        // Default case, just display the value
        cell.textContent = value;
    }
}


/**
 * Compares lists, and adds missing items
 *  - While loop to loop through items until we reach the end of both lists
 *  - Check if the item in ListA[index] is in ListB[index]
 *      - If not, add it to ListB at the same index
 *      - Create a div for the missing item, with a button and a list div
 *  - Repeat the process for ListB[index] in ListA
 * 
 * @param {*} listA             The first list of objects
 * @param {*} listB             The second list of objects
 * @param {*} listAContainer    The parent container for the first list
 * @param {*} listBContainer    The parent container for the second list
 */
function compareAndAppend(listA, listB, listAContainer, listBContainer) {
    let index = 0;

    // Loop as long as there are items in either list
    while (listA.length > index || listB.length > index) {
        // Handle getting to the end of listA while listB still has items
        if (listA[index] === undefined) {
            // Add the missing item to the end of the list
            listA.push(listB[index]);

            // Create objects for the missing elements
            const sanitizedId = sanitizeId(listA[index].name);
            const parentDiv = createElement('div', {id: listAContainer.id + '_' + sanitizedId});
            const button = createButton(listA[index], listAContainer, sanitizedId);
            const listDiv = createDiv(listAContainer, sanitizedId);
            const table = createElement('table', {className: 'w3-table indented-table'});

            // Add the missing elements to the list div
            Object.entries(listA[index]).forEach(([key, value]) => {
                addChildTableItem(table, key, value);
            });

            // Append the list and button to the parent div
            listDiv.appendChild(table);
            parentDiv.append(button, listDiv);

            // Insert the parent div into the second container at the correct index
            let referenceNode = listAContainer.children[index] || null;
            listAContainer.insertBefore(parentDiv, referenceNode);
        }

        // Handle getting to the end of listB while listA still has items
        if (listB[index] === undefined) {
            // Add the missing item to the end of the list
            listB.push(listA[index]);

            // Create objects for the missing elements
            const sanitizedId = sanitizeId(listB[index].name);
            const parentDiv = createElement('div', {id: listBContainer.id + '_' + sanitizedId});
            const button = createButton(listB[index], listBContainer, sanitizedId);
            const listDiv = createDiv(listBContainer, sanitizedId);
            const table = createElement('table', {className: 'w3-table indented-table'});

            // Add the missing elements to the list div
            Object.entries(listB[index]).forEach(([key, value]) => {
                addChildTableItem(table, key, value);
            });

            // Append the list and button to the parent div
            listDiv.appendChild(table);
            parentDiv.append(button, listDiv);

            // Insert the parent div into the second container at the correct index
            let referenceNode = listBContainer.children[index] || null;
            listBContainer.insertBefore(parentDiv, referenceNode);
        }

        // Check if the ListA item is anywhere in ListB
        if (!listB.some(item => item.name.toLowerCase() === listA[index].name.toLowerCase())) {
            // Add to the list (in the same index as the first list)
            listB.splice(index, 0, listA[index]);

            // Create objects for the missing elements
            const sanitizedId = sanitizeId(listA[index].name);
            const parentDiv = createElement('div', {id: listBContainer.id + '_' + sanitizedId});
            const button = createButton(listA[index], listBContainer, sanitizedId);
            const listDiv = createDiv(listBContainer, sanitizedId);
            const table = createElement('table', {className: 'w3-table indented-table'});

            // Add the missing elements to the list div
            Object.entries(listA[index]).forEach(([key, value]) => {
                addChildTableItem(table, key, value);
            });

            // Append the list and button to the parent div
            listDiv.appendChild(table);
            parentDiv.append(button, listDiv);

            // Insert the parent div into the second container at the correct index
            let referenceNode = listBContainer.children[index] || null;
            listBContainer.insertBefore(parentDiv, referenceNode);
        }

        // Check if the ListB item is anywhere in ListA
        if (!listA.some(item => item.name.toLowerCase() === listB[index].name.toLowerCase())) {
            // Add to the list (in the same index as the first list)
            listA.splice(index, 0, listB[index]);

            // Create objects for the missing elements
            const sanitizedId = sanitizeId(listB[index].name);
            const parentDiv = createElement('div', {id: listAContainer.id + '_' + sanitizedId});
            const button = createButton(listB[index], listAContainer, sanitizedId);
            const listDiv = createDiv(listAContainer, sanitizedId);
            const table = createElement('table', {className: 'w3-table indented-table'});

            // Add the missing elements to the list div
            Object.entries(listB[index]).forEach(([key, value]) => {
                addChildTableItem(table, key, value);
            });

            // Append the list and button to the parent div
            listDiv.appendChild(table);
            parentDiv.append(button, listDiv);

            // Insert the parent div into the second container at the correct index
            let referenceNode = listAContainer.children[index] || null;
            listAContainer.insertBefore(parentDiv, referenceNode);
        }

        index++;
    }
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
    button.onclick = function() { expandList(listContainer.id + '_list_' + sanitizedId) };

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
    listDiv.id = container.id + '_list_' + sanitizedId;
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

            // Check if there is an item elsewhere in listB that matches itemA and is not at the same index
            const matchingIndexB = listB.findIndex((item, index) => index !== listA.indexOf(itemA) && !areObjectsDifferent(item.name, itemA.name));
            if (matchingIndexB !== -1) {
                const iconB = document.createElement('i');
                iconB.className = 'fa-solid fa-arrows-up-down';
                iconB.style.color = 'blue';
                iconB.style.marginRight = '10px';
                buttonB.insertBefore(iconB, buttonB.firstChild);
            }

            // Similarly, check if there is an item elsewhere in listA that matches itemB and is not at the same index
            const matchingIndexA = listA.findIndex((item, index) => index !== listB.indexOf(itemB) && !areObjectsDifferent(item.name, itemB.name));
            if (matchingIndexA !== -1) {
                const iconA = document.createElement('i');
                iconA.className = 'fa-solid fa-arrows-up-down';
                iconA.style.color = 'blue';
                iconA.style.marginRight = '10px';
                buttonA.insertBefore(iconA, buttonA.firstChild);
            }
        }
    });
}


/**
 * Deep equality check for two objects
 * This is used to compare the properties of two objects when they contains arrays or other objects
 * 
 * @param {*} obj1      The first object
 * @param {*} obj2      The second object
 * @returns             True if the objects are deeply equal, false otherwise
 */
function areObjectsDeeplyEqual(obj1, obj2) {
    if (obj1 === obj2) {
        return true;
    }
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 == null || obj2 == null) {
        return false;
    }
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let key of keys1) {
        if (!keys2.includes(key) || !areObjectsDeeplyEqual(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
}


/**
 * Compares two objects and returns true if they are different
 * 
 * @param {*} obj1      The first object
 * @param {*} obj2      The second object
 * @returns             True if the objects are different, false otherwise
 */
function areObjectsDifferent(obj1, obj2) {
    // Get the unique keys from both
    const allKeys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);

    // Loop through all keys, and compare the values
    for (let key of allKeys) {
        // Skip the name key
        if (key == "name") {
            continue;
        }

        // Use the deep equality check for both array and non-array values
        const value1 = obj1[key];
        const value2 = obj2[key];
        if (!areObjectsDeeplyEqual(value1, value2)) {
            return true;
        }
    }

    return false;
}
