/*
    Populate the dropdown with the list of available devices
    Uses the /device_list endpoint to fetch the list of devices from the server.

    There are usually two dropdowns in the UI, each with a different hover color.
    The dropdowns are populated with the same list of devices fetched from the server.

    For now, this is specifically used in the tags page to populate the dropdowns with devices.
        This will be expanded to other pages in the future.
*/

// Fetch the device list once and populate dropdowns for all subpages
// The two lists use different hover colors
fetch('/device_list')
.then(response => response.json())
.then(devices => {
    populateDropdownWithData('#tagDropdownA', 'w3-hover-blue', devices, 'tagTableA');
    populateDropdownWithData('#tagDropdownB', 'w3-hover-green', devices, 'tagTableB');
    populateDropdownWithData('#addressDropdownA', 'w3-hover-blue', devices, 'addressAccordionA');
    populateDropdownWithData('#addressDropdownB', 'w3-hover-green', devices, 'addressAccordionB');
    populateDropdownWithData('#applicationDropdownA', 'w3-hover-blue', devices, 'applicationTableA');
    populateDropdownWithData('#applicationDropdownB', 'w3-hover-green', devices, 'applicationTableB');
    populateDropdownWithData('#serviceDropdownA', 'w3-hover-blue', devices, 'serviceTableA');
    populateDropdownWithData('#serviceDropdownB', 'w3-hover-green', devices, 'serviceTableB');
})
.catch(error => console.error('Error:', error));


/**
 * Populate the dropdown with the provided list of devices
 * This is run when a dropdown is clicked and the list is fetched from the device
 * 
 * @param {*} selector          - The selector for the dropdown element
 * @param {*} hoverColorClass   - The hover color class to apply to
 * @param {*} devices           - The list of devices to populate the dropdown with
 * @param {*} tableId           - The ID of the table to update when a device is selected
 */
function populateDropdownWithData(selector, hoverColorClass, devices, tableId) {
    // Get the dropdown and the button
    const dropdown = document.querySelector(selector);

    // Get the button by traversing the DOM
    const button = dropdown.closest('.w3-dropdown-hover').querySelector('button h3');
    
    // Clear the dropdown before populating it
    dropdown.innerHTML = '';

    // Populate the dropdown with the list of devices
    devices.forEach(device => {
        // Create a new link element for each device
        const link = document.createElement('a');
        link.href = '#';
        link.className = `w3-bar-item w3-button ${hoverColorClass}`;
        link.textContent = device.device_name;
        
        // Add click event listener to each link
        link.addEventListener('click', function() {
            button.textContent = device.device_name;

            // Fetch tags for the selected device using device_id and update the specified table
            if (tableId.includes('tag')) updateTagsTable(device.device_id, tableId);
            if (tableId.includes('address')) updateAddressesTable(device.device_id, tableId);
            if (tableId.includes('service')) updateServicesTable(device.device_id, tableId);
        });

        // Append the link to the dropdown
        dropdown.appendChild(link);
    });
}


/**
 * Update the table with a list of tags for the selected device
 * This is specific to the tags page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} tableId 
 */
function updateTagsTable(deviceId, tableId) {
    // API call to fetch tags for the selected device
    fetch(`/get_tags?id=${encodeURIComponent(deviceId)}`)
    .then(response => response.json())
    .then(tags => {
        // Get the table and clear it before populating it with the new tags
        const table = document.getElementById(tableId);

        // Keep the header row and clear the rest of the table
        table.innerHTML = table.rows[0].outerHTML;

        // Populate the table with the list of tags
        tags.forEach(tag => {
            // Create new rows and cells for each tag
            const row = table.insertRow(-1);
            const nameCell = row.insertCell(0);
            const descriptionCell = row.insertCell(1);
            const colorCell = row.insertCell(2);

            // Populate the cells with the tag data
            nameCell.textContent = tag.name;
            descriptionCell.textContent = tag.description || 'No description available';
            colorCell.textContent = tag.colour;
        });
    })
    .catch(error => console.error('Error fetching tags:', error));
}


/**
 * Update the table with a list of address objects for the selected device
 * This is specific to the addresses page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} tableId 
 */
function updateAddressesTable(deviceId, divId) {
    // API call to fetch addresses for the selected device
    fetch(`/get_address_objects?id=${encodeURIComponent(deviceId)}`)
    .then(response => response.json())
    .then(addresses => {
        // The div element to populate with the list of addresses
        const divElement = document.getElementById(divId);

        // Populate with the list of addresses
        addresses.forEach(address => {
            // Sanitize the address name to use as an ID
            const sanitizedId = address.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');

            // Create a new button element for each address
            const button = document.createElement('button');
            button.className = 'w3-button w3-block w3-left-align';
            button.textContent = address.name;
            button.onclick = function() { expandList(divId + '_' + sanitizedId) };

            // Create list div
            const div = document.createElement('div');
            div.id = divId + '_' + sanitizedId;
            div.className = 'w3-hide w3-border';

            // Create ul
            const ul = document.createElement('ul');
            ul.className = 'indented-list';

            // Create li elements for each address property
            const addressLi = document.createElement('li');
            addressLi.textContent = address.addr;
            const descriptionLi = document.createElement('li');
            descriptionLi.textContent = address.description;
            const tagLi = document.createElement('li');
            tagLi.textContent = address.tag.member.join(", ");

            // Append li elements to ul
            ul.appendChild(addressLi);
            ul.appendChild(descriptionLi);
            ul.appendChild(tagLi);

            // Append ul to div
            div.appendChild(ul);

            // Add items to the div element
            divElement.appendChild(button);
            divElement.appendChild(div);
        });
    })
    .catch(error => console.error('Error fetching addresses:', error));
}


/**
 * Update the table with a list of service objects for the selected device
 * This is specific to the services page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} tableId 
 */
function updateServicesTable(deviceId, tableId) {
    // API call to fetch service objects for the selected device
    fetch(`/get_service_objects?id=${encodeURIComponent(deviceId)}`)
    .then(response => response.json())
    .then(services => {
        // Get the table and clear it before populating it with the new services
        const table = document.getElementById(tableId);

        // Keep the header row and clear the rest of the table
        table.innerHTML = table.rows[0].outerHTML;

        // Populate the table with the list of services
        services.forEach(service => {
            // Create new rows and cells for each service
            const row = table.insertRow(-1);
            const nameCell = row.insertCell(0);
            const protocolCell = row.insertCell(1);
            const descriptionCell = row.insertCell(2);
            const tagCell = row.insertCell(4);

            // Populate the cells with the address data
            nameCell.textContent = address.name;
            protocolCell.textContent = address.protocol;
            descriptionCell.textContent = address.description || 'No description available';
            tagCell.textContent = address.tag;
        });
    })
    .catch(error => console.error('Error fetching services:', error));
}


/**
 * Manage an accordian list button
 * The 'button' the name of an object
 * Expands the object when clicked, displaying more information
 * 
 * @param {*} id 
 */
function expandList(id) {
    // Get the element with the specified ID
    var x = document.getElementById(id);

    // Toggle the 'w3-show' class to expand or collapse the element
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else { 
        x.className = x.className.replace(" w3-show", "");
    }
}
