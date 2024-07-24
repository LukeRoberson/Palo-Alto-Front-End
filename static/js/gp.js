/*
    Javascript code related to Global Protect VPN
*/


/*
    Get a list of devices that might host Global Protect sessions
    This will ignore passive HA devices
*/
fetch('/device_list')
.then(response => response.json())
.then(devices => {
    // Find the div with the id 'div-gp-devices'
    const divGpDevices = document.getElementById('div-gp-devices');

    // Loop through the devices and create a checkbox for each
    for (const device of devices) {
        // Don't include passive devices
        if (device.ha_state === 'passive') {
            continue;
        }

        // Create a new div element for the device/checkbox
        const newDiv = document.createElement('div');
        newDiv.id = device.device_id;
        newDiv.style.display = 'flex';
        newDiv.style.alignItems = 'center';
        newDiv.style.marginBottom = '10px';

        // Create a checkbox
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('w3-check', 'w3-large');
        checkbox.style.marginBottom = '10px';
        checkbox.checked = true;
        checkbox.setAttribute('data-device-id', device.device_id);
        checkbox.setAttribute('data-device-name', device.device_name);

        // Create a label for the checkbox
        const label = document.createElement('label');
        label.textContent = device.device_name;
        label.style.fontSize = '20px';
        label.style.marginLeft = '20px';
        label.setAttribute('data-device-id', device.device_id);

        // Add objects to their parents
        newDiv.appendChild(checkbox);
        newDiv.appendChild(label);
        divGpDevices.appendChild(newDiv);
    };
})
.catch(error => console.error('Error:', error));


/* Event listener for the 'Get GP Sessions' button */
document.getElementById('gp-session-button').addEventListener('click', function() {
    // Select all checkboxes that are checked
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');

    // API call for each selected device
    // checkboxes.forEach(checkbox => {
    for (const checkbox of checkboxes) {
        const deviceId = checkbox.getAttribute('data-device-id');
        const deviceName = checkbox.getAttribute('data-device-name');
        const url = new URL('/get_gp_sessions', window.location.origin);
        url.searchParams.append('id', deviceId);

        // Skip if the device ID is null (this sometimes happens in dark mode; Magic!)
        if (deviceId === null) {
            continue;
        }

        // Get the div that will hold the session info, and clear it
        const sessionAccordion = document.getElementById('sessionAccordion');
        sessionAccordion.innerHTML = '';

        // Fetch the session info for the selected device
        fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => response.json())
        .then(data => {
            data.forEach(data => {
                // Create a new div element for the session info
                const parentDiv = document.createElement('div');
                parentDiv.id = data.host;

                // Create a button for each element
                const button = document.createElement('button');
                button.className = 'w3-button w3-block w3-left-align';
                button.textContent = data.name;
                button.onclick = function() {expandList('list_' + data.host)};

                // Create a div for the session info
                const listDiv = document.createElement('div');
                listDiv.id = 'list_' + data.host;
                listDiv.className = 'w3-hide w3-border';

                // Create a table for the session info
                const table = document.createElement('table');
                table.className = 'w3-table indented-table';
                addChildTableItem(table, 'Username', data.name);
                addChildTableItem(table, 'Alternate Username', data.username);
                addChildTableItem(table, 'Device Name', data.computer);
                addChildTableItem(table, 'Login Time', data.login);
                addChildTableItem(table, 'Region Code', data.region);
                addChildTableItem(table, 'IP Address', data.inside_ip);
                addChildTableItem(table, 'Public IP', data.outside_ip);
                addChildTableItem(table, 'Client OS', data.client);
                addChildTableItem(table, 'Client Version', data.version);
                addChildTableItem(table, 'Host ID', data.host);
                addChildTableItem(table, 'Device Name', deviceName);
                listDiv.appendChild(table);

                // Append to the parent div (id == 'sessionAccordion')
                parentDiv.appendChild(button);
                parentDiv.appendChild(listDiv);

                sessionAccordion.appendChild(parentDiv);
            });
        })
        .catch(error => console.error('Error:', error));
    };
});


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


/**
 * Add items to the tables
 * These are shown in the lists of objects like tags, addresses, etc.
 * 
 * @param {*} tableName 
 * @param {*} heading 
 * @param {*} value 
 */
function addChildTableItem(tableName, heading, value) {
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
