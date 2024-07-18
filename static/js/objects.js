/*
    Populate the dropdown with the list of available devices
    Uses the /device_list endpoint to fetch the list of devices from the server.

    There are usually two dropdowns in the UI, each with a different hover color.
    The dropdowns are populated with the same list of devices fetched from the server.
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
fetch('/device_list')
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
            if (divId.includes('tagAccordion')) updateTagsTable(device.device_id, divId);
            if (divId.includes('addressAccordion')) updateAddressesTable(device.device_id, divId);
            if (divId.includes('addressGroupAccordion')) updateAddressGroupsTable(device.device_id, divId);
            if (divId.includes('applicationGroupAccordion')) updateApplicationGroupsTable(device.device_id, divId);
            if (divId.includes('serviceAccordion')) updateServicesTable(device.device_id, divId);
            if (divId.includes('serviceGroupAccordion')) updateServiceGroupsTable(device.device_id, divId);
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
 * @param {*} divId 
 */
function updateTagsTable(deviceId, divId) {
    // Create lists to track contents
    let tagList = [];

    // API call to fetch tags for the selected device
    fetch(`/get_tags?id=${encodeURIComponent(deviceId)}`)
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
            button.onclick = function() { expandList(divId + '_list_' + sanitizedId) };

            // Create list div
            const listDiv = document.createElement('div');
            listDiv.id = divId + '_list_' + sanitizedId;
            listDiv.className = 'w3-hide w3-border';

            // Create ul
            const ul = document.createElement('ul');
            ul.className = 'indented-list';

            // Create li elements for each address property
            const descriptionLi = document.createElement('li');
            descriptionLi.textContent = tag.description;
            const colourLi = document.createElement('li');
            colourLi.textContent = tag.colour;

            // Append li elements to ul
            ul.appendChild(descriptionLi);
            ul.appendChild(colourLi);

            // Append ul to div
            listDiv.appendChild(ul);

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
            tagList.push(tagObject);
        });
        if (divId.includes('tagAccordionA')) {
            tagListA = tagList;
        } else {
            tagListB = tagList;
        }
    })
    .catch(error => console.error('Error fetching tags:', error));
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

            // Create a div to hold the button and list
            parentDiv = document.createElement('div');
            parentDiv.id = divId + '_' + sanitizedId;

            // Create a new button element for each address
            const button = document.createElement('button');
            button.className = 'w3-button w3-block w3-left-align';
            button.textContent = address.name;
            button.onclick = function() { expandList(divId + '_list_' + sanitizedId) };

            // Create list div
            const listDiv = document.createElement('div');
            listDiv.id = divId + '_list_' + sanitizedId;
            listDiv.className = 'w3-hide w3-border';

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
            listDiv.appendChild(ul);

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
    })
    .catch(error => console.error('Error fetching addresses:', error));
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

    // API call to fetch address groups for the selected device
    fetch(`/get_address_groups?id=${encodeURIComponent(deviceId)}`)
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
            button.onclick = function() { expandList(divId + '_list_' + sanitizedId) };

            // Create list div
            const listDiv = document.createElement('div');
            listDiv.id = divId + '_list_' + sanitizedId;
            listDiv.className = 'w3-hide w3-border';

            // Create ul
            const ul = document.createElement('ul');
            ul.className = 'indented-list';

            // Create li elements for each address property
            const addressLi = document.createElement('li');
            addressLi.textContent = address.static.member.join(", ");
            const descriptionLi = document.createElement('li');
            descriptionLi.textContent = address.description;
            const tagLi = document.createElement('li');
            tagLi.textContent = address.tag.member.join(", ");

            // Append li elements to ul
            ul.appendChild(addressLi);
            ul.appendChild(descriptionLi);
            ul.appendChild(tagLi);

            // Append ul to div
            listDiv.appendChild(ul);

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
    })
    .catch(error => console.error('Error fetching addresses:', error));
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

    // API call to fetch application groups for the selected device
    fetch(`/get_application_groups?id=${encodeURIComponent(deviceId)}`)
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
            button.onclick = function() { expandList(divId + '_list_' + sanitizedId) };

            // Create list div
            const listDiv = document.createElement('div');
            listDiv.id = divId + '_list_' + sanitizedId;
            listDiv.className = 'w3-hide w3-border';

            // Create ul
            const ul = document.createElement('ul');
            ul.className = 'indented-list';

            // Create li elements for each address property
            const appLi = document.createElement('li');
            appLi.textContent = appGroup.members.member.join(", ");

            // Append li elements to ul
            ul.appendChild(appLi);

            // Append ul to div
            listDiv.appendChild(ul);

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
    })
    .catch(error => console.error('Error fetching application groups:', error));
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

    // API call to fetch service objects for the selected device
    fetch(`/get_service_objects?id=${encodeURIComponent(deviceId)}`)
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
            button.onclick = function() { expandList(divId + '_list_' + sanitizedId) };

            // Create list div
            const listDiv = document.createElement('div');
            listDiv.id = divId + '_list_' + sanitizedId;
            listDiv.className = 'w3-hide w3-border';

            // Create ul
            const ul = document.createElement('ul');
            ul.className = 'indented-list';

            // Create li elements for each service property
            const protocolLi = document.createElement('li');
            protocolLi.textContent = service.addr;
            const descriptionLi = document.createElement('li');
            descriptionLi.textContent = service.description;
            const tagLi = document.createElement('li');
            tagLi.textContent = service.tag.member.join(", ");

            // Append li elements to ul
            ul.appendChild(protocolLi);
            ul.appendChild(descriptionLi);
            ul.appendChild(tagLi);

            // Append ul to div
            listDiv.appendChild(ul);

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
    })
    .catch(error => console.error('Error fetching services:', error));
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

    // API call to fetch service groups for the selected device
    fetch(`/get_service_groups?id=${encodeURIComponent(deviceId)}`)
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
            button.onclick = function() { expandList(divId + '_list_' + sanitizedId) };

            // Create list div
            const listDiv = document.createElement('div');
            listDiv.id = divId + '_list_' + sanitizedId;
            listDiv.className = 'w3-hide w3-border';

            // Create ul
            const ul = document.createElement('ul');
            ul.className = 'indented-list';

            // Create li elements for each service property (confirming they are arrays first)
            const membersLi = document.createElement('li');
            membersLi.textContent = group.members.member.join(", ");

            const tagLi = document.createElement('li');
            if (Array.isArray(group.tag?.member)) {
                tagLi.textContent = group.tag.member.join(", ");
            } else {
                tagLi.textContent = 'No tags';
            }

            // Append li elements to ul
            ul.appendChild(membersLi);
            ul.appendChild(tagLi);

            // Append ul to div
            listDiv.appendChild(ul);

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
