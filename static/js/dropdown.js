/*
    Populate the dropdown with the list of available devices
    Uses the /device_list endpoint to fetch the list of devices from the server.

    There are usually two dropdowns in the UI, each with a different hover color.
    The dropdowns are populated with the same list of devices fetched from the server.
*/

// Populate the dropdown with the provided list of devices
function populateDropdownWithData(selector, hoverColorClass, devices, tableId) {
    const dropdown = document.querySelector(selector);
    const button = dropdown.closest('.w3-dropdown-hover').querySelector('button h3');
    
    dropdown.innerHTML = '';
    devices.forEach(device => {
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
        dropdown.appendChild(link);
    });
}

// Fetch the device list once and populate both dropdowns with different hover colors
fetch('/device_list')
.then(response => response.json())
.then(devices => {
    populateDropdownWithData('#firstDropdown', 'w3-hover-blue', devices, 'firstTable');
    populateDropdownWithData('#secondDropdown', 'w3-hover-green', devices, 'secondTable');
})
.catch(error => console.error('Error:', error));

// Update the table with a list of tags for the selected device
function updateTagsTable(deviceId, tableId) {
    fetch(`/get_tags?id=${encodeURIComponent(deviceId)}`)
    .then(response => response.json())
    .then(tags => {
        const table = document.getElementById(tableId);
        table.innerHTML = table.rows[0].outerHTML; // Keep the header row

        tags.forEach(tag => {
            const row = table.insertRow(-1);
            const nameCell = row.insertCell(0);
            const descriptionCell = row.insertCell(1);
            const colorCell = row.insertCell(2);

            nameCell.textContent = tag.name;
            descriptionCell.textContent = tag.description || 'No description available';
            colorCell.textContent = tag.colour;
        });
    })
    .catch(error => console.error('Error fetching tags:', error));
}
