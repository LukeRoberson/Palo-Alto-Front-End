/*
    Populate the dropdown with the list of available devices
    Uses the /device_list endpoint to fetch the list of devices from the server.

    There are usually two dropdowns in the UI, each with a different hover color.
    The dropdowns are populated with the same list of devices fetched from the server.

    For now, this is specifically used in the tags page to populate the dropdowns with devices.
        This will be expanded to other pages in the future.
*/

// Fetch the device list once and populate both dropdowns with different hover colors
fetch('/device_list')
.then(response => response.json())
.then(devices => {
    populateDropdownWithData('#firstDropdown', 'w3-hover-blue', devices, 'firstTable');
    populateDropdownWithData('#secondDropdown', 'w3-hover-green', devices, 'secondTable');
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
            updateTagsTable(device.device_id, tableId);
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
