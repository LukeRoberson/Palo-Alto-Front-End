/*
    Compare lists and highlight differences

    Starts by comparing the tables and adding missing entries
        Missing entries are added to the respective table, and highlighted in red
        Tables are then sorted alphabetically, so the entries line up
    
    Then, the tables are compared again, and entries that are different are highlighted in yellow
        Entries that are in both tables, but are different, are highlighted in yellow
*/


// Event listener for the compare button on the tags page
document.getElementById('tag_compare').addEventListener('click', function() {
    let listAContainer = document.getElementById('tagAccordionA');
    let listBContainer = document.getElementById('tagAccordionB');

    // Compare
    compareLists(tagListA, tagListB, listAContainer, listBContainer);

    // Call the function with the selector of the parent container
    sortDivsByIdSuffix('#tagAccordionA');
    sortDivsByIdSuffix('#tagAccordionB');

});


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
            // Create objects for the missing elements
            const sanitizedId = sanitizeId(object.name);
            const parentDiv = createElement('div', {id: firstContainer.id + '_' + sanitizedId});
            const button = createButton(object, secondContainer, sanitizedId);
            const listDiv = createDiv(secondContainer, sanitizedId);
            const ul = createElement('ul', {className: 'indented-list'});

            // Add the missing elements to the list div
            ul.appendChild(createElement('li', {textContent: object.description}));
            ul.appendChild(createElement('li', {textContent: object.colour}));

            // Append the list and button to the parent div
            listDiv.appendChild(ul);
            parentDiv.append(button, listDiv);
            console.log(parentDiv);

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
    console.log(listContainer + '_' + sanitizedId)

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
