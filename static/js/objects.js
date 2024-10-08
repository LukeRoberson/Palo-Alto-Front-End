/*
    Populate the dropdown with the list of available devices
    Uses the /device endpoint to fetch the list of devices from the server.

    There are usually two dropdowns in the UI, each with a different hover color.
    The dropdowns are populated with the same list of devices fetched from the server.

    Add refresh buttons to each dropdown to update the list of items when clicked.
*/

// Lists of items that are fetched from the server
let tagListA = [];
let tagListB = [];
let addressListA = [];
let addressListB = [];
let addressGroupListA = [];
let addressGroupListB = [];
let applicationGroupListA = [];
let applicationGroupListB = [];
let serviceListA = [];
let serviceListB = [];
let serviceGroupListA = [];
let serviceGroupListB = [];


// Fetch the device list once and populate dropdowns for all subpages
// The two lists use different hover colors
fetch('/api/device?action=list')
    .then(response => response.json())
    .then(devices => {
        populateDropdownWithData('#tagDropdownA', 'w3-hover-blue', devices, 'tagAccordionA');
        populateDropdownWithData('#tagDropdownB', 'w3-hover-green', devices, 'tagAccordionB');
        populateDropdownWithData('#addressDropdownA', 'w3-hover-blue', devices, 'addressAccordionA');
        populateDropdownWithData('#addressDropdownB', 'w3-hover-green', devices, 'addressAccordionB');
        populateDropdownWithData('#addressGroupDropdownA', 'w3-hover-blue', devices, 'addressGroupAccordionA');
        populateDropdownWithData('#addressGroupDropdownB', 'w3-hover-green', devices, 'addressGroupAccordionB');
        populateDropdownWithData('#applicationGroupDropdownA', 'w3-hover-blue', devices, 'applicationGroupAccordionA');
        populateDropdownWithData('#applicationGroupDropdownB', 'w3-hover-green', devices, 'applicationGroupAccordionB');
        populateDropdownWithData('#serviceDropdownA', 'w3-hover-blue', devices, 'serviceAccordionA');
        populateDropdownWithData('#serviceDropdownB', 'w3-hover-green', devices, 'serviceAccordionB');
        populateDropdownWithData('#serviceGroupDropdownA', 'w3-hover-blue', devices, 'serviceGroupAccordionA');
        populateDropdownWithData('#serviceGroupDropdownB', 'w3-hover-green', devices, 'serviceGroupAccordionB');
    })
    .catch(error => console.error('Error:', error));


/**
 * Register event listeners for the refresh buttons
 * 
 * @param {*} buttonId          - The ID of the button to add the event listener to
 * @param {*} accordionId       - The ID of the accordion to refresh when the button is clicked
 */
function registerRefreshButtonListener(buttonId, accordionId, functionName) {
    document.getElementById(buttonId).addEventListener('click', function () {
        const deviceId = document.getElementById(accordionId).dataset.deviceId;
        functionName(deviceId, accordionId);
    });
}

// Register event listeners for both buttons
registerRefreshButtonListener('refreshButtonTagA', 'tagAccordionA', updateTagsTable);
registerRefreshButtonListener('refreshButtonTagB', 'tagAccordionB', updateTagsTable);
registerRefreshButtonListener('refreshButtonAddressesA', 'addressAccordionA', updateAddressesTable);
registerRefreshButtonListener('refreshButtonAddressesB', 'addressAccordionB', updateAddressesTable);
registerRefreshButtonListener('refreshButtonAddressGroupsA', 'addressGroupAccordionA', updateAddressGroupsTable);
registerRefreshButtonListener('refreshButtonAddressGroupsB', 'addressGroupAccordionB', updateAddressGroupsTable);
registerRefreshButtonListener('refreshButtonApplicationsA', 'applicationGroupAccordionA', updateApplicationGroupsTable);
registerRefreshButtonListener('refreshButtonApplicationsB', 'applicationGroupAccordionB', updateApplicationGroupsTable);
registerRefreshButtonListener('refreshButtonServicesA', 'serviceAccordionA', updateServicesTable);
registerRefreshButtonListener('refreshButtonServicesB', 'serviceAccordionB', updateServicesTable);
registerRefreshButtonListener('refreshButtonServiceGroupsA', 'serviceGroupAccordionA', updateServiceGroupsTable);
registerRefreshButtonListener('refreshButtonServiceGroupsB', 'serviceGroupAccordionB', updateServiceGroupsTable);


/**
 * Populate the dropdown with the provided list of devices
 * This is run when a dropdown is clicked and the list is fetched from the device
 * 
 * @param {*} selector          - The selector for the dropdown element
 * @param {*} hoverColorClass   - The hover color class to apply to
 * @param {*} devices           - The list of devices to populate the dropdown with
 * @param {*} divId             - The ID of the table to update when a device is selected
 */
function populateDropdownWithData(selector, hoverColorClass, devices, divId) {
    // Get the dropdown and the button
    const dropdown = document.querySelector(selector);

    // Get the button by traversing the DOM
    const button = dropdown.closest('.w3-dropdown-hover').querySelector('button h3');

    // Clear the dropdown before populating it
    dropdown.innerHTML = '';

    // Populate the dropdown with the list of devices
    devices.forEach(device => {
        if (device.vendor == 'paloalto') {
            // Create a new link element for each device
            const link = document.createElement('a');
            link.href = '#';
            link.className = `w3-bar-item w3-button ${hoverColorClass} text`;
            link.textContent = device.device_name;

            // Add click event listener to each link
            link.addEventListener('click', function () {
                button.textContent = device.device_name;
                button.innerHTML += ' <i class="fa fa-caret-down"></i>';


                // Fetch tags for the selected device using device_id and update the specified table
                if (divId.includes('tagAccordion')) updateTagsTable(device.device_id, divId);
                if (divId.includes('addressAccordion')) updateAddressesTable(device.device_id, divId);
                if (divId.includes('addressGroupAccordion')) updateAddressGroupsTable(device.device_id, divId);
                if (divId.includes('applicationGroupAccordion')) updateApplicationGroupsTable(device.device_id, divId);
                if (divId.includes('serviceAccordion')) updateServicesTable(device.device_id, divId);
                if (divId.includes('serviceGroupAccordion')) updateServiceGroupsTable(device.device_id, divId);
            })

            // Append the link to the dropdown
            dropdown.appendChild(link);
        };
    });
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


/**
 * Update the table with a list of tags for the selected device
 * This is specific to the tags page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} divId 
 */
function updateTagsTable(deviceId, divId) {
    // Create lists to track contents
    let objectList = [];

    // Show loading spinner
    document.getElementById('tagLoadingSpinner').style.display = 'block';

    // The div element to populate with the list of addresses
    const divElement = document.getElementById(divId);

    // Clear any existing content in the div
    divElement.innerHTML = '';
    divElement.dataset.deviceId = deviceId;
    clearLines()

    // API call to fetch tags for the selected device
    fetch(`/api/objects?object=tags&id=${encodeURIComponent(deviceId)}`)
        .then(response => response.json())
        .then(tags => {
            // The div element to populate with the list of addresses
            const divElement = document.getElementById(divId);

            // Populate with the list of tags
            tags.forEach(tag => {
                // Sanitize the address name to use as an ID
                const sanitizedId = tag.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');

                // Create a div to hold the button and list
                parentDiv = document.createElement('div');
                parentDiv.id = divId + '_' + sanitizedId;

                // Create a new button element for each tag
                const button = document.createElement('button');
                button.className = 'w3-button w3-block w3-left-align';
                button.textContent = tag.name;
                button.onclick = function () { expandList(divId + '_list_' + sanitizedId) };

                // Create list div
                const listDiv = document.createElement('div');
                listDiv.id = divId + '_list_' + sanitizedId;
                listDiv.className = 'w3-hide w3-border';
                listDiv.style = 'overflow-x: auto;';

                // Table
                const table = document.createElement('table');
                table.className = 'w3-table indented-table';
                addChildTableItem(table, 'Description', tag.description);
                addChildTableItem(table, 'Colour', tag.colour);
                listDiv.appendChild(table);

                // Add items to the div element
                parentDiv.appendChild(button);
                parentDiv.appendChild(listDiv);
                divElement.appendChild(parentDiv);

                // Create an array of tags
                const tagObject = {
                    name: tag.name,
                    description: tag.description,
                    colour: tag.colour,
                };
                objectList.push(tagObject);
            });

            if (divId.includes('tagAccordionA')) {
                tagListA = objectList;
            } else {
                tagListB = objectList;
            }

            // Hide loading spinner when the response is received
            document.getElementById('tagLoadingSpinner').style.display = 'none';
        })

        .catch(error => {
            // Hide loading spinner when the response is received
            document.getElementById('tagLoadingSpinner').style.display = 'none';
            console.error('Error fetching tags:', error)
        });
}


/**
 * Update the table with a list of address objects for the selected device
 * This is specific to the addresses page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} divId 
 */
function updateAddressesTable(deviceId, divId) {
    // Create lists to track contents
    let addressList = [];

    // Show loading spinner
    document.getElementById('addressLoadingSpinner').style.display = 'block';

    // The div element to populate with the list of addresses
    const divElement = document.getElementById(divId);

    // Clear any existing content in the div
    divElement.innerHTML = '';
    divElement.dataset.deviceId = deviceId;
    clearLines()

    // API call to fetch addresses for the selected device
    fetch(`/api/objects?object=addresses&id=${encodeURIComponent(deviceId)}`)
        .then(response => response.json())
        .then(addresses => {
            // The div element to populate with the list of addresses
            const divElement = document.getElementById(divId);

            // Populate with the list of addresses
            addresses.forEach(address => {
                // Sanitize the address name to use as an ID
                const sanitizedId = address.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');

                // Create a div to hold the button and list
                parentDiv = document.createElement('div');
                parentDiv.id = divId + '_' + sanitizedId;

                // Create a new button element for each address
                const button = document.createElement('button');
                button.className = 'w3-button w3-block w3-left-align';
                button.textContent = address.name;
                button.onclick = function () { expandList(divId + '_list_' + sanitizedId) };

                // Create list div
                const listDiv = document.createElement('div');
                listDiv.id = divId + '_list_' + sanitizedId;
                listDiv.className = 'w3-hide w3-border';
                listDiv.style = 'overflow-x: auto;';

                // Table
                const table = document.createElement('table');
                table.className = 'w3-table indented-table';
                addChildTableItem(table, 'Address', address.addr);
                addChildTableItem(table, 'Description', address.description);
                addChildTableItem(table, 'Tag', address.tag.member.join(", "));
                listDiv.appendChild(table);

                // Add items to the div element
                parentDiv.appendChild(button);
                parentDiv.appendChild(listDiv);
                divElement.appendChild(parentDiv);

                // Create an array of addresses
                const addressObject = {
                    name: address.name,
                    addr: address.addr,
                    description: address.description,
                    tag: address.tag.member.join(", "),
                };
                addressList.push(addressObject);
            });

            if (divId.includes('addressAccordionA')) {
                addressListA = addressList;
            } else {
                addressListB = addressList;
            }
            // Hide loading spinner when the response is received
            document.getElementById('addressLoadingSpinner').style.display = 'none';

        })
        .catch(error => {
            // Hide loading spinner when the response is received
            document.getElementById('addressLoadingSpinner').style.display = 'none';
            console.error('Error fetching addresses:', error)
        });
}


/**
 * Update the table with a list of address groups for the selected device
 * This is specific to the address groups page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} divId 
 */
function updateAddressGroupsTable(deviceId, divId) {
    // Create a list to track contents
    let addressGroupList = [];

    // Show loading spinner
    document.getElementById('addressGroupLoadingSpinner').style.display = 'block';

    // The div element to populate with the list of addresses
    const divElement = document.getElementById(divId);

    // Clear any existing content in the div
    divElement.innerHTML = '';
    divElement.dataset.deviceId = deviceId;
    clearLines()

    // API call to fetch address groups for the selected device
    fetch(`/api/objects?object=address_groups&id=${encodeURIComponent(deviceId)}`)
        .then(response => response.json())
        .then(addresses => {
            // The div element to populate with the list of address groups
            const divElement = document.getElementById(divId);

            // Populate with the list of address groups
            addresses.forEach(address => {
                // Sanitize the address group name to use as an ID
                const sanitizedId = address.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');

                // Create a div to hold the button and list
                parentDiv = document.createElement('div');
                parentDiv.id = divId + '_' + sanitizedId;

                // Create a new button element for each address
                const button = document.createElement('button');
                button.className = 'w3-button w3-block w3-left-align';
                button.textContent = address.name;
                button.onclick = function () { expandList(divId + '_list_' + sanitizedId) };

                // Create list div
                const listDiv = document.createElement('div');
                listDiv.id = divId + '_list_' + sanitizedId;
                listDiv.className = 'w3-hide w3-border';
                listDiv.style = 'overflow-x: auto;';

                // Table
                const table = document.createElement('table');
                table.className = 'w3-table indented-table';
                addChildTableItem(table, 'Address', address.static.member.join(", "));
                addChildTableItem(table, 'Description', address.description);
                addChildTableItem(table, 'Tag', address.tag.member.join(", "));
                listDiv.appendChild(table);

                // Add items to the div element
                parentDiv.appendChild(button);
                parentDiv.appendChild(listDiv);
                divElement.appendChild(parentDiv);

                // Create an array of address groups
                const addressGroupObject = {
                    name: address.name,
                    static: address.static.member.join(", "),
                    description: address.description,
                    tag: address.tag.member.join(", "),
                };
                addressGroupList.push(addressGroupObject);
            });

            if (divId.includes('addressGroupAccordionA')) {
                addressGroupListA = addressGroupList;
            } else {
                addressGroupListB = addressGroupList;
            }

            // Hide loading spinner when the response is received
            document.getElementById('addressGroupLoadingSpinner').style.display = 'none';
        })
        .catch(error => {
            // Hide loading spinner when the response is received
            document.getElementById('addressGroupLoadingSpinner').style.display = 'none';
            console.error('Error fetching addresses:', error)
        });
}


/**
 * Update the table with a list of application groups for the selected device
 * This is specific to the application groups page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} divId 
 */
function updateApplicationGroupsTable(deviceId, divId) {
    // Create a list to track contents
    let applicationGroupList = [];

    // Show loading spinner
    document.getElementById('applicationsLoadingSpinner').style.display = 'block';

    // The div element to populate with the list of addresses
    const divElement = document.getElementById(divId);

    // Clear any existing content in the div
    divElement.innerHTML = '';
    divElement.dataset.deviceId = deviceId;
    clearLines()

    // API call to fetch application groups for the selected device
    fetch(`/api/objects?object=app_groups&id=${encodeURIComponent(deviceId)}`)
        .then(response => response.json())
        .then(appGroups => {
            // The div element to populate with the list of application groups
            const divElement = document.getElementById(divId);

            // Populate with the list of application groups
            appGroups.forEach(appGroup => {
                // Sanitize the address group name to use as an ID
                const sanitizedId = appGroup.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');

                // Create a div to hold the button and list
                parentDiv = document.createElement('div');
                parentDiv.id = divId + '_' + sanitizedId;

                // Create a new button element for each group
                const button = document.createElement('button');
                button.className = 'w3-button w3-block w3-left-align';
                button.textContent = appGroup.name;
                button.onclick = function () { expandList(divId + '_list_' + sanitizedId) };

                // Create list div
                const listDiv = document.createElement('div');
                listDiv.id = divId + '_list_' + sanitizedId;
                listDiv.className = 'w3-hide w3-border';
                listDiv.style = 'overflow-x: auto;';

                // Table
                const table = document.createElement('table');
                table.className = 'w3-table indented-table';
                addChildTableItem(table, 'Members', appGroup.members.member.join(", "));
                listDiv.appendChild(table);

                // Add items to the div element
                parentDiv.appendChild(button);
                parentDiv.appendChild(listDiv);
                divElement.appendChild(parentDiv);

                // Create an array of application groups
                const appGroupObject = {
                    name: appGroup.name,
                    members: appGroup.members.member.join(", "),
                };
                applicationGroupList.push(appGroupObject);
            });

            if (divId.includes('applicationGroupAccordionA')) {
                applicationGroupListA = applicationGroupList;
            } else {
                applicationGroupListB = applicationGroupList;
            }

            // Hide loading spinner when the response is received
            document.getElementById('applicationsLoadingSpinner').style.display = 'none';
        })
        .catch(error => {
            // Hide loading spinner when the response is received
            document.getElementById('applicationsLoadingSpinner').style.display = 'none';
            console.error('Error fetching application groups:', error)
        });
}


/**
 * Update the table with a list of service objects for the selected device
 * This is specific to the services page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} divId 
 */
function updateServicesTable(deviceId, divId) {
    // Create a list to track contents
    let serviceList = [];

    // Show loading spinner
    document.getElementById('serviceLoadingSpinner').style.display = 'block';

    // The div element to populate with the list of addresses
    const divElement = document.getElementById(divId);

    // Clear any existing content in the div
    divElement.innerHTML = '';
    divElement.dataset.deviceId = deviceId;
    clearLines()

    // API call to fetch service objects for the selected device
    fetch(`/api/objects?object=services&id=${encodeURIComponent(deviceId)}`)
        .then(response => response.json())
        .then(services => {
            // The div element to populate with the list of addresses
            const divElement = document.getElementById(divId);

            // Populate with the list of services
            services.forEach(service => {
                // Sanitize the address name to use as an ID
                const sanitizedId = service.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');

                // Create a div to hold the button and list
                parentDiv = document.createElement('div');
                parentDiv.id = divId + '_' + sanitizedId;

                // Create a new button element for each service
                const button = document.createElement('button');
                button.className = 'w3-button w3-block w3-left-align';
                button.textContent = service.name;
                button.onclick = function () { expandList(divId + '_list_' + sanitizedId) };

                // Create list div
                const listDiv = document.createElement('div');
                listDiv.id = divId + '_list_' + sanitizedId;
                listDiv.className = 'w3-hide w3-border';
                listDiv.style = 'overflow-x: auto;';

                // Table
                const protocolType = Object.keys(service.protocol)[0];
                const protocolPort = service.protocol[protocolType]['port'];

                const table = document.createElement('table');
                table.className = 'w3-table indented-table';
                addChildTableItem(table, 'Protocol', protocolType);
                addChildTableItem(table, 'Port', protocolPort);
                addChildTableItem(table, 'Description', service.description);
                addChildTableItem(table, 'Tag', service.tag.member.join(", "));
                listDiv.appendChild(table);

                // Add items to the div element
                parentDiv.appendChild(button);
                parentDiv.appendChild(listDiv);
                divElement.appendChild(parentDiv);

                // Create an array of services
                const serviceObject = {
                    name: service.name,
                    addr: service.addr,
                    description: service.description,
                    tag: service.tag.member.join(", "),
                };
                serviceList.push(serviceObject);
            });

            if (divId.includes('serviceAccordionA')) {
                serviceListA = serviceList;
            } else {
                serviceListB = serviceList;
            }

            // Hide loading spinner when the response is received
            document.getElementById('serviceLoadingSpinner').style.display = 'none';
        })
        .catch(error => {
            // Hide loading spinner when the response is received
            document.getElementById('serviceLoadingSpinner').style.display = 'none';
            console.error('Error fetching services:', error)
        });
}


/**
 * Update the table with a list of service groups for the selected device
 * This is specific to the service groups page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} divId 
 */
function updateServiceGroupsTable(deviceId, divId) {
    // Create a list to track contents
    let serviceGroupList = [];

    // Show loading spinner
    document.getElementById('serviceGroupLoadingSpinner').style.display = 'block';

    // The div element to populate with the list of addresses
    const divElement = document.getElementById(divId);

    // Clear any existing content in the div
    divElement.innerHTML = '';
    divElement.dataset.deviceId = deviceId;
    clearLines()

    // API call to fetch service groups for the selected device
    fetch(`/api/objects?object=service_groups&id=${encodeURIComponent(deviceId)}`)
        .then(response => response.json())
        .then(serviceGroups => {
            // The div element to populate with the list of groups
            const divElement = document.getElementById(divId);

            // Populate with the list of services
            serviceGroups.forEach(group => {
                // Sanitize the address name to use as an ID
                const sanitizedId = group.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');

                // Create a div to hold the button and list
                parentDiv = document.createElement('div');
                parentDiv.id = divId + '_' + sanitizedId;

                // Create a new button element for each service
                const button = document.createElement('button');
                button.className = 'w3-button w3-block w3-left-align';
                button.textContent = group.name;
                button.onclick = function () { expandList(divId + '_list_' + sanitizedId) };

                // Create list div
                const listDiv = document.createElement('div');
                listDiv.id = divId + '_list_' + sanitizedId;
                listDiv.className = 'w3-hide w3-border';
                listDiv.style = 'overflow-x: auto;';

                // Table
                const table = document.createElement('table');
                table.className = 'w3-table indented-table';
                addChildTableItem(table, 'Members', group.members.member.join(", "));
                addChildTableItem(table, 'Tag', group.tag.member?.join(", ") ?? 'No tags');
                listDiv.appendChild(table);

                // Add items to the div element
                parentDiv.appendChild(button);
                parentDiv.appendChild(listDiv);
                divElement.appendChild(parentDiv);

                // Create an array of services
                const serviceGroupObject = {
                    name: group.name,
                    members: group.members.member.join(", "),
                    tag: group.tag.member?.join(", ") ?? 'No tags',
                };
                serviceGroupList.push(serviceGroupObject);
            });

            if (divId.includes('serviceGroupAccordionA')) {
                serviceGroupListA = serviceGroupList;
            } else {
                serviceGroupListB = serviceGroupList;
            }

            // Hide loading spinner when the response is received
            document.getElementById('serviceGroupLoadingSpinner').style.display = 'none';
        })
        .catch(error => {
            // Hide loading spinner when the response is received
            document.getElementById('serviceGroupLoadingSpinner').style.display = 'none';
            console.error('Error fetching services:', error)
        });
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
