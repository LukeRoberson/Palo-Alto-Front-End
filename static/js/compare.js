/*
    Compare lists and highlight differences

    Starts by comparing the tables and adding missing entries
        Missing entries are added to the respective table, and highlighted in red
        Tables are then sorted alphabetically, so the entries line up
    
    Then, the tables are compared again, and entries that are different are highlighted in yellow
        Entries that are in both tables, but are different, are highlighted in yellow
*/


// Event listener for the compare button
document.getElementById('tag_compare').addEventListener('click', function() {
    let listAContainer = document.getElementById('tagAccordionA');
    let listBContainer = document.getElementById('tagAccordionB');

    // Compare
    compareLists(tagListA, tagListB, listAContainer, listBContainer);

    // Call the function with the selector of the parent container
    sortDivsByIdSuffix('#tagAccordionA');
    sortDivsByIdSuffix('#tagAccordionB');

});


function compareLists(listA, listB, listAContainer, listBContainer) {
    // Loop through each object in listA
    listA.forEach(tag => {
        // Check if this tag is in listB; If not, 'foundInB' will be undefined
        const foundInB = listB.find(bElement => bElement.name === tag.name);

        // When an entry is missing, create the elements for comparison
        if (!foundInB) {
            // Sanitize the ID, which will be used for the div and button IDs
            const sanitizedId = tag.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');

            // Create HTML elements
            parentDiv = document.createElement('div');
            parentDiv.id = listAContainer.id + '_' + sanitizedId;
            button = createButton(tag, listBContainer, sanitizedId);
            listDiv = createDiv(listBContainer, sanitizedId);
            ul = createUl();

            // Create li elements
            const descriptionLi = document.createElement('li');
            const colourLi = document.createElement('li');
            descriptionLi.textContent = tag.description;
            colourLi.textContent = tag.colour;
            ul.appendChild(descriptionLi);
            ul.appendChild(colourLi);

            // Append elements
            listDiv.appendChild(ul);
            parentDiv.appendChild(button);
            parentDiv.appendChild(listDiv);
            listBContainer.appendChild(parentDiv);
        }
    });

    // Loop through each object in listB
    listB.forEach(tag => {
        // Check if this tag is in listA; If not, 'foundInA' will be undefined
        const foundInA = listA.find(aElement => aElement.name === tag.name);

        // When an entry is missing, create the elements for comparison
        if (!foundInA) {
            // Sanitize the ID, which will be used for the div and button IDs
            const sanitizedId = tag.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');

            // Create HTML elements
            parentDiv = document.createElement('div');
            parentDiv.id = listBContainer.id + '_' + sanitizedId;
            button = createButton(tag, listAContainer, sanitizedId);
            listDiv = createDiv(listAContainer, sanitizedId);
            ul = createUl();

            // Create li elements
            const descriptionLi = document.createElement('li');
            const colourLi = document.createElement('li');
            descriptionLi.textContent = tag.description;
            colourLi.textContent = tag.colour;
            ul.appendChild(descriptionLi);
            ul.appendChild(colourLi);

            // Append elements
            listDiv.appendChild(ul);
            parentDiv.appendChild(button);
            parentDiv.appendChild(listDiv);
            listAContainer.appendChild(parentDiv);
        }
    });
}


function createButton (element, listContainer, sanitizedId) {
    // Create a button
    const button = document.createElement('button');
    button.className = 'w3-button w3-block w3-left-align';
    button.textContent = element.name;
    button.classList.add('highlight-missing');
    button.onclick = function() { expandList(listContainer + '_' + sanitizedId) };

    return button;
}


function createDiv(container, sanitizedId) {
    // Create list div
    const div = document.createElement('div');
    div.id = container.id + '_' + sanitizedId;
    div.className = 'w3-hide w3-border';

    return div;
}


function createUl() {
    const ul = document.createElement('ul');
    ul.className = 'indented-list';

    return ul;
}


function sortDivsByIdSuffix(parentSelector) {
    // Select the parent container
    const parent = document.querySelector(parentSelector);
    
    // Ensure the parent exists to avoid errors
    if (!parent) {
        console.error('Parent selector not found:', parentSelector);
        return;
    }

    // Get all divs as an array
    const divsArray = Array.from(parent.querySelectorAll('div'));
    
    // Sort the array based on the suffix of the 'id' attribute, safely handling missing attributes
    divsArray.sort((a, b) => {
        // Extract the part of the id after the underscore
        const idA = a.id.split('_')[1] || "";
        const idB = b.id.split('_')[1] || "";
        return idA.localeCompare(idB);
    });
    
    // Clear existing content in the parent container
    // while (parent.firstChild) {
    //     parent.removeChild(parent.firstChild);
    // }
    console.log(divsArray)

    // Re-append the divs in sorted order
    divsArray.forEach(div => {
        parent.appendChild(div);
    });
}
