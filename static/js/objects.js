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

// Flags to check table population
let tagFlagA = false;
let tagFlagB = false;
let addressFlagA = false;
let addressFlagB = false;
let addressGroupFlagA = false;
let addressGroupFlagB = false;
let applicationGroupFlagA = false;
let applicationGroupFlagB = false;
let serviceFlagA = false;
let serviceFlagB = false;
let serviceGroupFlagA = false;
let serviceGroupFlagB = false;


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
        const vendor = document.getElementById(accordionId).dataset.vendor;
        functionName(deviceId, accordionId, vendor);
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
    devices.sort((a, b) => a.device_name.localeCompare(b.device_name));
    devices.forEach(device => {
        if (selector.includes('tag') && device.vendor != 'paloalto') {
            return;
        }

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
            if (divId.includes('tagAccordion')) updateTagsTable(device.device_id, divId, device.vendor);
            if (divId.includes('addressAccordion')) updateAddressesTable(device.device_id, divId, device.vendor);
            if (divId.includes('addressGroupAccordion')) updateAddressGroupsTable(device.device_id, divId, device.vendor);
            if (divId.includes('applicationGroupAccordion')) updateApplicationGroupsTable(device.device_id, divId, device.vendor);
            if (divId.includes('serviceAccordion')) updateServicesTable(device.device_id, divId, device.vendor);
            if (divId.includes('serviceGroupAccordion')) updateServiceGroupsTable(device.device_id, divId, device.vendor);
        })

        // Append the link to the dropdown
        dropdown.appendChild(link);
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
function updateTagsTable(deviceId, divId, vendor) {
    // Create lists to track contents
    let objectList = [];

    // The div element to populate with the list of addresses
    const divElement = document.getElementById(divId);

    // Show the loading spinner
    showLoadingSpinner(divId);

    // Clear any existing content in the div
    divElement.innerHTML = '';
    divElement.dataset.deviceId = deviceId;
    divElement.dataset.vendor = vendor;
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

            // Store the list of tags in the appropriate list
            // Manage comparison button
            if (divId.includes('tagAccordionA')) {
                tagListA = objectList;
                tagFlagA = true;
            } else {
                tagListB = objectList;
                tagFlagB = true;
            }
            if (tagFlagA && tagFlagB) {
                document.getElementById('tagCompare').disabled = false;
            }

            // Hide loading spinner when the response is received
            hideLoadingSpinner(divId);
        })

        .catch(error => {
            // Hide loading spinner when the response is received
            hideLoadingSpinner(divId);
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
function updateAddressesTable(deviceId, divId, vendor) {
    // Create lists to track contents
    let addressList = [];

    // The div element to populate with the list of addresses
    const divElement = document.getElementById(divId);

    // Show the loading spinner
    showLoadingSpinner(divId);

    // Clear any existing content in the div
    divElement.innerHTML = '';
    divElement.dataset.deviceId = deviceId;
    divElement.dataset.vendor = vendor;
    clearLines()

    // API call to fetch addresses for the selected device
    fetch(`/api/objects?object=addresses&id=${encodeURIComponent(deviceId)}`)
        .then(response => response.json())
        .then(addresses => {
            // The div element to populate with the list of addresses
            const divElement = document.getElementById(divId);

            // Check that addresses were found
            if (addresses.message && addresses.message == 'No addresses found') {
                hideLoadingSpinner(divId);

                // Manage comparison button
                if (divId.includes('addressAccordionA')) {
                    addressListA = addressList;
                    addressFlagA = true;
                } else {
                    addressListB = addressList;
                    addressFlagB = true;
                }
                if (addressFlagA && addressFlagB) {
                    document.getElementById('addressObjectsCompare').disabled = false;
                }

                showNotification('No addresses found for the selected device', 'Failure');
                return;
            }

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
                if (address.tag) {
                    addChildTableItem(table, 'Tag', address.tag.member.join(", "));     // Tags do not exist on some platforms
                }
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
                    ...(address.tag && { tag: address.tag.member.join(", ") }),     // Tags do not exist on some platforms
                };
                addressList.push(addressObject);
            });

            // Store the list of addresses in the appropriate list
            // Manage comparison button
            if (divId.includes('addressAccordionA')) {
                addressListA = addressList;
                addressFlagA = true;
            } else {
                addressListB = addressList;
                addressFlagB = true;
            }
            if (addressFlagA && addressFlagB) {
                document.getElementById('addressObjectsCompare').disabled = false;
            }

            // Hide loading spinner when the response is received
            hideLoadingSpinner(divId);

        })
        .catch(error => {
            hideLoadingSpinner(divId);
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
function updateAddressGroupsTable(deviceId, divId, vendor) {
    // Create a list to track contents
    let addressGroupList = [];

    // The div element to populate with the list of addresses
    const divElement = document.getElementById(divId);

    // Show the loading spinner
    showLoadingSpinner(divId);

    // Clear any existing content in the div
    divElement.innerHTML = '';
    divElement.dataset.deviceId = deviceId;
    divElement.dataset.vendor = vendor;
    clearLines()

    // API call to fetch address groups for the selected device
    fetch(`/api/objects?object=address_groups&id=${encodeURIComponent(deviceId)}`)
        .then(response => response.json())
        .then(addresses => {
            // The div element to populate with the list of address groups
            const divElement = document.getElementById(divId);

            // Check that addresses were found
            if (addresses.message && addresses.message == 'No address groups found') {
                hideLoadingSpinner(divId);

                // Manage comparison button
                if (divId.includes('addressGroupAccordionA')) {
                    addressGroupFlagA = true;
                } else {
                    addressGroupFlagB = true;
                }
                if (addressGroupFlagA && addressGroupFlagB) {
                    document.getElementById('addressGroupCompare').disabled = false;
                }

                showNotification('No address groups found for the selected device', 'Failure');
                return;
            }

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
                if (address.static.member) {                            // Handle different ways the data is returned
                    addChildTableItem(table, 'Address', address.static.member.join(", "));
                } else {
                    addChildTableItem(table, 'Address', address.static.map(item => item.name).join(", "));
                }
                addChildTableItem(table, 'Description', address.description);
                if (address.tag) {
                    addChildTableItem(table, 'Tag', address.tag.member.join(", "));     // Tags do not exist on some platforms
                }
                listDiv.appendChild(table);

                // Add items to the div element
                parentDiv.appendChild(button);
                parentDiv.appendChild(listDiv);
                divElement.appendChild(parentDiv);

                // Create an array of address groups
                const addressGroupObject = {
                    name: address.name,
                    static: Array.isArray(address.static)                           // Handle different ways the data is returned
                        ? address.static.map(item => item.name ? item.name : item).join(", ")
                        : address.static.member.map(item => item.name ? item.name : item).join(", "),
                    description: address.description,
                    ...(address.tag && { tag: address.tag.member.join(", ") }),     // Tags do not exist on some platforms
                };
                addressGroupList.push(addressGroupObject);
            });

            // Store the list of address groups in the appropriate list
            // Manage comparison button
            if (divId.includes('addressGroupAccordionA')) {
                addressGroupListA = addressGroupList;
                addressGroupFlagA = true;
            } else {
                addressGroupListB = addressGroupList;
                addressGroupFlagB = true;
            }
            if (addressGroupFlagA && addressGroupFlagB) {
                document.getElementById('addressGroupCompare').disabled = false;
            }

            // Hide loading spinner when the response is received
            hideLoadingSpinner(divId);
        })
        .catch(error => {
            // Hide loading spinner when the response is received
            hideLoadingSpinner(divId);
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
function updateApplicationGroupsTable(deviceId, divId, vendor) {
    // Create a list to track contents
    let applicationGroupList = [];

    // The div element to populate with the list of addresses
    const divElement = document.getElementById(divId);

    // Show the loading spinner
    showLoadingSpinner(divId);

    // Clear any existing content in the div
    divElement.innerHTML = '';
    divElement.dataset.deviceId = deviceId;
    divElement.dataset.vendor = vendor;
    clearLines()

    // API call to fetch application groups for the selected device
    fetch(`/api/objects?object=app_groups&id=${encodeURIComponent(deviceId)}`)
        .then(response => response.json())
        .then(appGroups => {
            // The div element to populate with the list of application groups
            const divElement = document.getElementById(divId);

            // Check that addresses were found
            if (appGroups.message && appGroups.message == 'No application groups found') {
                hideLoadingSpinner(divId);

                // Manage comparison button
                if (divId.includes('applicationGroupAccordionA')) {
                    applicationGroupFlagA = true;
                } else {
                    applicationGroupFlagB = true;
                }
                if (applicationGroupFlagA && applicationGroupFlagB) {
                    document.getElementById('applicationGroupCompare').disabled = false;
                }

                showNotification('No application groups found for the selected device', 'Failure');
                return;
            }

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

                let membersString = '';
                if (appGroup.members && appGroup.members.member) {
                    // Case where appGroup has 'members' and 'member'
                    membersString = appGroup.members.member.join(", ");
                } else if (appGroup.name) {
                    // Case where appGroup has 'name'
                    membersString = appGroup.name;
                }

                addChildTableItem(table, 'Members', membersString);
                listDiv.appendChild(table);

                // Add items to the div element
                parentDiv.appendChild(button);
                parentDiv.appendChild(listDiv);
                divElement.appendChild(parentDiv);

                // Create an array of application groups
                const appGroupObject = {
                    name: appGroup.name,
                    members: appGroup.members && appGroup.members.member
                        ? appGroup.members.member.join(", ")
                        : appGroup.name || '',
                };
                applicationGroupList.push(appGroupObject);
            });

            // Store the list of application groups in the appropriate list
            // Manage comparison button
            if (divId.includes('applicationGroupAccordionA')) {
                applicationGroupListA = applicationGroupList;
                applicationGroupFlagA = true;
            } else {
                applicationGroupListB = applicationGroupList;
                applicationGroupFlagB = true;
            }
            if (applicationGroupFlagA && applicationGroupFlagB) {
                document.getElementById('applicationGroupCompare').disabled = false;
            }

            // Hide loading spinner when the response is received
            hideLoadingSpinner(divId);
        })
        .catch(error => {
            // Hide loading spinner when the response is received
            hideLoadingSpinner(divId);
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
function updateServicesTable(deviceId, divId, vendor) {
    // Create a list to track contents
    let serviceList = [];

    // The div element to populate with the list of addresses
    const divElement = document.getElementById(divId);

    // Show the loading spinner
    showLoadingSpinner(divId);

    // Clear any existing content in the div
    divElement.innerHTML = '';
    divElement.dataset.deviceId = deviceId;
    divElement.dataset.vendor = vendor;
    clearLines()

    // API call to fetch service objects for the selected device
    fetch(`/api/objects?object=services&id=${encodeURIComponent(deviceId)}`)
        .then(response => response.json())
        .then(services => {
            // The div element to populate with the list of addresses
            const divElement = document.getElementById(divId);

            // Check that addresses were found
            if (services.message && services.message == 'No services found') {
                hideLoadingSpinner(divId);

                // Manage comparison button
                if (divId.includes('serviceAccordionA')) {
                    serviceFlagA = true;
                } else {
                    serviceFlagB = true;
                }
                if (serviceFlagA && serviceFlagB) {
                    document.getElementById('serviceObjectCompare').disabled = false;
                }

                showNotification('No services found for the selected device', 'Failure');
                return;
            }

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
                let protocolType;
                let protocolPort;
                if (vendor == 'paloalto') {
                    protocolType = Object.keys(service.protocol)[0];
                    protocolPort = service.protocol[protocolType]['port'];
                } else if (vendor == 'juniper') {
                    protocolType = service.protocol;
                    protocolPort = service.dest_port;
                } else {
                    console.log("Unknown vendor");
                    return;
                }

                const table = document.createElement('table');
                table.className = 'w3-table indented-table';
                addChildTableItem(table, 'Protocol', protocolType);
                addChildTableItem(table, 'Port', protocolPort);
                addChildTableItem(table, 'Description', service.description);
                if (service.tag) {
                    addChildTableItem(table, 'Tag', service.tag.member.join(", "));         // Tags do not exist on some platforms
                }
                listDiv.appendChild(table);

                // Add items to the div element
                parentDiv.appendChild(button);
                parentDiv.appendChild(listDiv);
                divElement.appendChild(parentDiv);

                // Create an array of services
                const serviceObject = {
                    name: service.name,
                    protocol: protocolType,
                    port: protocolPort,
                    description: service.description,
                    ...(service.tag && { tag: service.tag.member.join(", ") }),             // Tags do not exist on some platforms
                };
                serviceList.push(serviceObject);
            });

            // Store the list of services in the appropriate list
            // Manage comparison button
            if (divId.includes('serviceAccordionA')) {
                serviceListA = serviceList;
                serviceFlagA = true;
            } else {
                serviceListB = serviceList;
                serviceFlagB = true;
            }
            if (serviceFlagA && serviceFlagB) {
                document.getElementById('serviceObjectCompare').disabled = false;
            }

            // Hide loading spinner when the response is received
            hideLoadingSpinner(divId);
        })
        .catch(error => {
            // Hide loading spinner when the response is received
            hideLoadingSpinner(divId);
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
function updateServiceGroupsTable(deviceId, divId, vendor) {
    // Create a list to track contents
    let serviceGroupList = [];

    // The div element to populate with the list of addresses
    const divElement = document.getElementById(divId);

    // Show the loading spinner
    showLoadingSpinner(divId);

    // Clear any existing content in the div
    divElement.innerHTML = '';
    divElement.dataset.deviceId = deviceId;
    divElement.dataset.vendor = vendor;
    clearLines()

    // API call to fetch service groups for the selected device
    fetch(`/api/objects?object=service_groups&id=${encodeURIComponent(deviceId)}`)
        .then(response => response.json())
        .then(serviceGroups => {
            // The div element to populate with the list of groups
            const divElement = document.getElementById(divId);

            // Check that addresses were found
            if (serviceGroups.message && serviceGroups.message == 'No service groups found') {
                hideLoadingSpinner(divId);

                // Manage comparison button
                if (divId.includes('serviceGroupAccordionA')) {
                    serviceGroupFlagA = true;
                } else {
                    serviceGroupFlagB = true;
                }
                if (serviceGroupFlagA && serviceGroupFlagB) {
                    document.getElementById('serviceGroupCompare').disabled = false;
                }

                showNotification('No service groups found for the selected device', 'Failure');
                return;
            }

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
                let membersString = '';

                if (group.members && Array.isArray(group.members.member)) {
                    // Case where group.members.member is a list of items
                    membersString = group.members.member.join(", ");
                } else if (group.members && Array.isArray(group.members)) {
                    // Case where group.members is a list of objects with a 'name' key
                    membersString = group.members.map(member => member.name).join(", ");
                }

                addChildTableItem(table, 'Members', membersString);
                if (group.tag) {
                    addChildTableItem(table, 'Tag', group.tag.member?.join(", ") ?? 'No tags');         // Tags do not exist on some platforms
                }
                listDiv.appendChild(table);

                // Add items to the div element
                parentDiv.appendChild(button);
                parentDiv.appendChild(listDiv);
                divElement.appendChild(parentDiv);

                // Create an array of services
                const serviceGroupObject = {
                    name: group.name,
                    members: group.members && Array.isArray(group.members.member)
                        ? group.members.member.join(", ")
                        : group.members && Array.isArray(group.members)
                            ? group.members.map(member => member.name).join(", ")
                            : '',
                    ...(group.tag && Array.isArray(group.tag.member) && { tag: group.tag.member.join(", ") }), // Tags do not exist on some platforms             // Tags do not exist on some platforms

                };
                serviceGroupList.push(serviceGroupObject);
            });

            // Store the list of service groups in the appropriate list
            // Manage comparison button
            if (divId.includes('serviceGroupAccordionA')) {
                serviceGroupListA = serviceGroupList;
                serviceGroupFlagA = true;
            } else {
                serviceGroupListB = serviceGroupList;
                serviceGroupFlagB = true;
            }
            if (serviceGroupFlagA && serviceGroupFlagB) {
                document.getElementById('serviceGroupCompare').disabled = false;
            }

            // Hide loading spinner when the response is received
            hideLoadingSpinner(divId);
        })
        .catch(error => {
            // Hide loading spinner when the response is received
            hideLoadingSpinner(divId);
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
