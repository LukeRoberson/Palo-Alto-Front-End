/*
    Populate the dropdown with the list of available devices
    Uses the /device_list endpoint to fetch the list of devices from the server.

    There are usually two dropdowns in the UI, each with a different hover color.
    The dropdowns are populated with the same list of devices fetched from the server.
*/

// Lists of items that are fetched from the server
let natListA = [];
let natListB = [];
let securityListA = [];
let securityListB = [];
let qosListA = [];
let qosListB = [];


// Fetch the device list once and populate dropdowns for all subpages
// The two lists use different hover colors
fetch('/device_list')
.then(response => response.json())
.then(devices => {
    populateDropdownWithData('#natDropdownA', 'w3-hover-blue', devices, 'natAccordionA');
    populateDropdownWithData('#natDropdownB', 'w3-hover-green', devices, 'natAccordionB');
    populateDropdownWithData('#securityDropdownA', 'w3-hover-blue', devices, 'securityAccordionA');
    populateDropdownWithData('#securityDropdownB', 'w3-hover-green', devices, 'securityAccordionB');
    populateDropdownWithData('#qosDropdownA', 'w3-hover-blue', devices, 'qosAccordionA');
    populateDropdownWithData('#qosDropdownB', 'w3-hover-green', devices, 'qosAccordionB');
})
.catch(error => console.error('Error:', error));


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
        // Create a new link element for each device
        const link = document.createElement('a');
        link.href = '#';
        link.className = `w3-bar-item w3-button ${hoverColorClass}`;
        link.textContent = device.device_name;
        
        // Add click event listener to each link
        link.addEventListener('click', function() {
            button.textContent = device.device_name;

            // Fetch tags for the selected device using device_id and update the specified table
            if (divId.includes('tag')) updateTagsTable(device.device_id, divId);
            if (divId.includes('addressAccordion')) updateAddressesTable(device.device_id, divId);
            if (divId.includes('addressGroupAccordion')) updateAddressGroupsTable(device.device_id, divId);
            if (divId.includes('applicationGroupAccordion')) updateApplicationGroupsTable(device.device_id, divId);
            if (divId.includes('serviceAccordion')) updateServicesTable(device.device_id, divId);
            if (divId.includes('serviceGroupAccordion')) updateServiceGroupsTable(device.device_id, divId);
            if (divId.includes('natAccordion')) updateNatTable(device.device_id, divId);
            if (divId.includes('securityAccordion')) updateSecurityTable(device.device_id, divId);
            if (divId.includes('qosAccordion')) updateQosTable(device.device_id, divId);
        });

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
 * Update the table with a list of NAT Policies for the selected device
 * This is specific to the NAT Policies page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} divId 
 */
function updateNatTable(deviceId, divId) {
    let natList = [];

    // API call to fetch NAT policies for the selected device
    fetch(`/get_nat_policies?id=${encodeURIComponent(deviceId)}`)
    .then(response => response.json())
    .then(natPolicies => {
        // The div element to populate with the list of groups
        const divElement = document.getElementById(divId);

        // Populate with the list of NAT policies
        natPolicies.forEach(policy => {
            // Sanitize the policy name to use as an ID
            const sanitizedId = policy.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');

            // Create a div to hold the button and list
            parentDiv = document.createElement('div');
            parentDiv.id = divId + '_' + sanitizedId;
            
            // Create a new button element for each policy
            const button = document.createElement('button');
            button.className = 'w3-button w3-block w3-left-align';
            button.textContent = policy.name;
            button.onclick = function() { expandList(divId + '_list_' + sanitizedId) };

            // Create list div
            const listDiv = document.createElement('div');
            listDiv.id = divId + '_list_' + sanitizedId;
            listDiv.className = 'w3-hide w3-border';

            // Table - Lots of items to parse through
            //  Some of these are nested objects, so we need to check if they exist before accessing them
            const table = document.createElement('table');
            table.className = 'w3-table indented-table';
            let bidirNat = policy.source_trans?.["static-ip"]?.["bi-directional"] ?? "None";
            let sourceTransIp = policy.source_trans?.["static-ip"]?.["translated-address"] ?? "None";

            addChildTableItem(table, 'Source Translation', sourceTransIp + "\nBidirectional: " + bidirNat);
            addChildTableItem(table, 'Dest Zone', policy.to.member ? policy.to.member.join(", ") : "None");
            addChildTableItem(table, 'Src Zone', policy.from.member ? policy.from.member.join(", ") : "None");
            addChildTableItem(table, 'Source Address', policy.source.member ? policy.source.member.join(", ") : "None");
            addChildTableItem(table, 'Destination Address', policy.destination.member ? policy.destination.member.join(", ") : "None");
            addChildTableItem(table, 'Service', policy.service ? policy.service : "None");
            addChildTableItem(table, 'Description', policy.description ? policy.description : "None");
            addChildTableItem(table, 'Tags', policy.tag.member ? policy.tag.member.join(", ") : "None");
            addChildTableItem(table, 'Tag Group', policy.tag_group ? policy.tag_group : "None");

            listDiv.appendChild(table);

            // Add items to the div element
            parentDiv.appendChild(button);
            parentDiv.appendChild(listDiv);
            divElement.appendChild(parentDiv);

            // Create an array of objects
            const natObject = {
                name: policy.name,
                source_trans: policy.source_trans,
                to: policy.to,
                from: policy.from,
                source: policy.source,
                destination: policy.destination,
                service: policy.service,
                description: policy.description,
                tag: policy.tag,
                tag_group: policy.tag_group
            };
            natList.push(natObject);
        });

        if (divId.includes('natAccordionA')) {
            natListA = natList;
        } else {
            natListB = natList;
        }
    })
    .catch(error => console.error('Error fetching NAT Policies:', error));
}


/**
 * Update the table with a list of Security Policies for the selected device
 * This is specific to the Security Policies page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} divId 
 */
function updateSecurityTable(deviceId, divId) {
    let securityList = []

    // API call to fetch security policies for the selected device
    fetch(`/get_security_policies?id=${encodeURIComponent(deviceId)}`)
    .then(response => response.json())
    .then(securityPolicies => {
        // The div element to populate with the list of groups
        const divElement = document.getElementById(divId);

        // Populate with the list of security policies
        securityPolicies.forEach(policy => {
            // Sanitize the policy name to use as an ID
            const sanitizedId = policy.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');

            // Create a div to hold the button and list
            parentDiv = document.createElement('div');
            parentDiv.id = divId + '_' + sanitizedId;
            
            // Create a new button element for each policy
            const button = document.createElement('button');
            button.className = 'w3-button w3-block w3-left-align';
            button.textContent = policy.name;
            button.onclick = function() { expandList(divId + '_list_' + sanitizedId) };

            // Create list div
            const listDiv = document.createElement('div');
            listDiv.id = divId + '_list_' + sanitizedId;
            listDiv.className = 'w3-hide w3-border';

            // Table
            const table = document.createElement('table');
            table.className = 'w3-table indented-table';
            addChildTableItem(table, 'To Zone', policy.to.member ? policy.to.member.join(", ") : "None");
            addChildTableItem(table, 'From Zone', policy.from.member ? policy.from.member.join(", ") : "None");
            addChildTableItem(table, 'Source Address', policy.source.member ? policy.source.member.join(", ") : "None");
            addChildTableItem(table, 'Destination Address', policy.destination.member ? policy.destination.member.join(", ") : "None");
            addChildTableItem(table, 'Source User', policy.source_user.member ? policy.source_user.member.join(", ") : "None");
            addChildTableItem(table, 'Category', policy.category.member ? policy.category.member.join(", ") : "None");
            addChildTableItem(table, 'Application', policy.application.member ? policy.application.member.join(", ") : "None");
            addChildTableItem(table, 'Service', policy.service.member ? policy.service.member.join(", ") : "None");
            addChildTableItem(table, 'Action', policy.action);
            addChildTableItem(table, 'Log', policy.log ? policy.log : "None");
            addChildTableItem(table, 'Log Start', policy.log_start ? policy.log_start : "None");
            addChildTableItem(table, 'Log End', policy.log_end ? policy.log_end : "None");
            addChildTableItem(table, 'Disabled', policy.disabled ? policy.disabled : "None");
            addChildTableItem(table, 'Description', policy.description ? policy.description : "None");
            addChildTableItem(table, 'Tags', policy.tag.member ? policy.tag.member.join(", ") : "None");
            addChildTableItem(table, 'Tag Group', policy.tag_group ? policy.tag_group : "None");
            listDiv.appendChild(table);

            // Add items to the div element
            parentDiv.appendChild(button);
            parentDiv.appendChild(listDiv);
            divElement.appendChild(parentDiv);

            // Create an array of objects
            const securityObject = {
                name: policy.name,
                to: policy.to,
                from: policy.from,
                source: policy.source,
                destination: policy.destination,
                source_user: policy.source_user,
                category: policy.category,
                application: policy.application,
                service: policy.service,
                action: policy.action,
                type: policy.type,
                log: policy.log,
                log_start: policy.log_start,
                log_end: policy.log_end,
                disabled: policy.disabled,
                description: policy.description,
                tag: policy.tag,
                tag_group: policy.tag_group
            };
            securityList.push(securityObject);
        });
        if (divId.includes('securityAccordionA')) {
            securityListA = securityList;
        } else {
            securityListB = securityList;
        }
    })
    .catch(error => console.error('Error fetching Security Policies:', error));
}


/**
 * Update the table with a list of QoS Policies for the selected device
 * This is specific to the QoS Policies page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} divId 
 */
function updateQosTable(deviceId, divId) {
    let qosList = [];

    // API call to fetch QoS policies for the selected device
    fetch(`/get_qos_policies?id=${encodeURIComponent(deviceId)}`)
    .then(response => response.json())
    .then(qosPolicies => {
        // The div element to populate with the list of groups
        const divElement = document.getElementById(divId);

        // Populate with the list of QoS policies
        qosPolicies.forEach(policy => {
            // Sanitize the policy name to use as an ID
            const sanitizedId = policy.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9-_]/g, '');

            // Create a div to hold the button and list
            parentDiv = document.createElement('div');
            parentDiv.id = divId + '_' + sanitizedId;
            
            // Create a new button element for each policy
            const button = document.createElement('button');
            button.className = 'w3-button w3-block w3-left-align';
            button.textContent = policy.name;
            button.onclick = function() { expandList(divId + '_list_' + sanitizedId) };

            // Create list div
            const listDiv = document.createElement('div');
            listDiv.id = divId + '_list_' + sanitizedId;
            listDiv.className = 'w3-hide w3-border';

            // Table
            const table = document.createElement('table');
            table.className = 'w3-table indented-table';
            let dscpCodepoints = policy.dscp.codepoints?.entry?.['0']?.['@name'] ?? "None";

            addChildTableItem(table, 'To Address', policy.to.member ? policy.to.member.join(", ") : "None");
            addChildTableItem(table, 'From Address', policy.from.member ? policy.from.member.join(", ") : "None");
            addChildTableItem(table, 'Source Address', policy.source.member ? policy.source.member.join(", ") : "None");
            addChildTableItem(table, 'Destination Address', policy.destination.member ? policy.destination.member.join(", ") : "None");
            addChildTableItem(table, 'Source User', policy.source_user.member ? policy.source_user.member.join(", ") : "None");
            addChildTableItem(table, 'Category', policy.category.member ? policy.category.member.join(", ") : "None");
            addChildTableItem(table, 'Application', policy.application.member ? policy.application.member.join(", ") : "None");
            addChildTableItem(table, 'Service', policy.service.member ? policy.service.member.join(", ") : "None");
            addChildTableItem(table, 'DSCP', dscpCodepoints);
            addChildTableItem(table, 'Description', policy.description ? policy.description : "None");
            addChildTableItem(table, 'Tags', policy.tag.member ? policy.tag.member.join(", ") : "None");
            addChildTableItem(table, 'Tag Group', policy.tag_group ? policy.tag_group : "None");
            listDiv.appendChild(table);

            // Add items to the div element
            parentDiv.appendChild(button);
            parentDiv.appendChild(listDiv);
            divElement.appendChild(parentDiv);

            // Create an array of objects
            const qosObject = {
                name: policy.name,
                to: policy.to,
                from: policy.from,
                source: policy.source,
                destination: policy.destination,
                source_user: policy.source_user,
                category: policy.category,
                application: policy.application,
                service: policy.service,
                action: policy.action,
                dscp: policy.dscp,
                description: policy.description,
                tag: policy.tag,
                tag_group: policy.tag_group
            };
            qosList.push(qosObject);
        });

        if (divId.includes('qosAccordionA')) {
            qosListA = qosList;
        } else {
            qosListB = qosList;
        }

    })
    .catch(error => console.error('Error fetching QoS Policies:', error));
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
