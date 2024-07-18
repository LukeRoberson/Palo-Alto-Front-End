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
 * Update the table with a list of NAT Policies for the selected device
 * This is specific to the NAT Policies page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} divId 
 */
function updateNatTable(deviceId, divId) {
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

            // Create a new button element for each policy
            const button = document.createElement('button');
            button.className = 'w3-button w3-block w3-left-align';
            button.textContent = policy.name;
            button.onclick = function() { expandList(divId + '_' + sanitizedId) };

            // Create list div
            const div = document.createElement('div');
            div.id = divId + '_' + sanitizedId;
            div.className = 'w3-hide w3-border';

            // Create ul
            const ul = document.createElement('ul');
            ul.className = 'indented-list';

            // Create li elements for each service property (confirming they are arrays first)
            const sourceTransLi = document.createElement('li');
            if (Array.isArray(policy.source_trans?.member)) {
                sourceTransLi.textContent = policy.source_trans.member.join(", ");
            } else {
                sourceTransLi.textContent = 'No source translation';
            }

            const toLi = document.createElement('li');
            if (Array.isArray(policy.to?.member)) {
                toLi.textContent = policy.to.member.join(", ");
            } else {
                toLi.textContent = 'No to address';
            }

            const fromLi = document.createElement('li');
            if (Array.isArray(policy.from?.member)) {
                fromLi.textContent = policy.from.member.join(", ");
            } else {
                fromLi.textContent = 'No from address';
            }

            const sourceLi = document.createElement('li');
            if (Array.isArray(policy.source?.member)) {
                sourceLi.textContent = policy.source.member.join(", ");
            } else {
                sourceLi.textContent = 'No source address';
            }

            const destLi = document.createElement('li');
            if (Array.isArray(policy.destination?.member)) {
                destLi.textContent = policy.destination.member.join(", ");
            } else {
                destLi.textContent = 'No destination address';
            }

            const serviceLi = document.createElement('li');
            if (Array.isArray(policy.service?.member)) {
                serviceLi.textContent = policy.service.member.join(", ");
            } else {
                serviceLi.textContent = 'No service';
            }

            const descLi = document.createElement('li');
            if (Array.isArray(policy.description?.member)) {
                descLi.textContent = policy.description.member.join(", ");
            } else {
                descLi.textContent = 'No description';
            }

            const tagLi = document.createElement('li');
            if (Array.isArray(policy.tag?.member)) {
                tagLi.textContent = policy.tag.member.join(", ");
            } else {
                tagLi.textContent = 'No tags';
            }

            const tagGroupLi = document.createElement('li');
            if (Array.isArray(policy.tag_group?.member)) {
                tagGroupLi.textContent = policy.tag_group.member.join(", ");
            } else {
                tagGroupLi.textContent = 'No grouping by tags';
            }

            // Append li elements to ul
            ul.appendChild(sourceTransLi);
            ul.appendChild(toLi);
            ul.appendChild(fromLi);
            ul.appendChild(sourceLi);
            ul.appendChild(destLi);
            ul.appendChild(serviceLi);
            ul.appendChild(descLi);
            ul.appendChild(tagLi);
            ul.appendChild(tagGroupLi);

            // Append ul to div
            div.appendChild(ul);

            // Add items to the div element
            divElement.appendChild(button);
            divElement.appendChild(div);
        });
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

            // Create a new button element for each policy
            const button = document.createElement('button');
            button.className = 'w3-button w3-block w3-left-align';
            button.textContent = policy.name;
            button.onclick = function() { expandList(divId + '_' + sanitizedId) };

            // Create list div
            const div = document.createElement('div');
            div.id = divId + '_' + sanitizedId;
            div.className = 'w3-hide w3-border';

            // Create ul
            const ul = document.createElement('ul');
            ul.className = 'indented-list';

            // Create li elements for each service property (confirming they are arrays first)
            const toLi = document.createElement('li');
            if (Array.isArray(policy.to?.member)) {
                toLi.textContent = policy.to.member.join(", ");
            } else {
                toLi.textContent = 'No to address';
            }

            const fromLi = document.createElement('li');
            if (Array.isArray(policy.from?.member)) {
                fromLi.textContent = policy.from.member.join(", ");
            } else {
                fromLi.textContent = 'No from address';
            }

            const sourceLi = document.createElement('li');
            if (Array.isArray(policy.source?.member)) {
                sourceLi.textContent = policy.source.member.join(", ");
            } else {
                sourceLi.textContent = 'No source address';
            }

            const destLi = document.createElement('li');
            if (Array.isArray(policy.destination?.member)) {
                destLi.textContent = policy.destination.member.join(", ");
            } else {
                destLi.textContent = 'No destination address';
            }

            const srcUserLi = document.createElement('li');
            if (Array.isArray(policy.source_user?.member)) {
                srcUserLi.textContent = policy.source_user.member.join(", ");
            } else {
                srcUserLi.textContent = 'No source user';
            }

            const categoryLi = document.createElement('li');
            if (Array.isArray(policy.category?.member)) {
                categoryLi.textContent = policy.category.member.join(", ");
            } else {
                categoryLi.textContent = 'No source user';
            }

            const appLi = document.createElement('li');
            if (Array.isArray(policy.application?.member)) {
                appLi.textContent = policy.application.member.join(", ");
            } else {
                appLi.textContent = 'No source user';
            }

            const serviceLi = document.createElement('li');
            if (Array.isArray(policy.service?.member)) {
                serviceLi.textContent = policy.service.member.join(", ");
            } else {
                serviceLi.textContent = 'No service';
            }

            const actionLi = document.createElement('li');
            if (Array.isArray(policy.action?.member)) {
                actionLi.textContent = policy.action.member.join(", ");
            } else {
                actionLi.textContent = 'No service';
            }

            const typeLi = document.createElement('li');
            if (Array.isArray(policy.type?.member)) {
                typeLi.textContent = policy.type.member.join(", ");
            } else {
                typeLi.textContent = 'No service';
            }

            const logLi = document.createElement('li');
            if (Array.isArray(policy.log?.member)) {
                logLi.textContent = policy.log.member.join(", ");
            } else {
                logLi.textContent = 'No loging';
            }

            const logStartLi = document.createElement('li');
            if (Array.isArray(policy.log_start?.member)) {
                logStartLi.textContent = policy.log_start.member.join(", ");
            } else {
                logStartLi.textContent = 'No loging on start';
            }

            const logEndLi = document.createElement('li');
            if (Array.isArray(policy.log_end?.member)) {
                logEndLi.textContent = policy.log_end.member.join(", ");
            } else {
                logEndLi.textContent = 'No logging on end';
            }

            const disabledLi = document.createElement('li');
            if (Array.isArray(policy.disabled?.member)) {
                disabledLi.textContent = policy.disabled.member.join(", ");
            } else {
                disabledLi.textContent = 'No disabled setting';
            }

            const descLi = document.createElement('li');
            if (Array.isArray(policy.description?.member)) {
                descLi.textContent = policy.description.member.join(", ");
            } else {
                descLi.textContent = 'No description';
            }

            const tagLi = document.createElement('li');
            if (Array.isArray(policy.tag?.member)) {
                tagLi.textContent = policy.tag.member.join(", ");
            } else {
                tagLi.textContent = 'No tags';
            }

            const tagGroupLi = document.createElement('li');
            if (Array.isArray(policy.tag_group?.member)) {
                tagGroupLi.textContent = policy.tag_group.member.join(", ");
            } else {
                tagGroupLi.textContent = 'No grouping by tags';
            }

            // Append li elements to ul
            ul.appendChild(toLi);
            ul.appendChild(fromLi);
            ul.appendChild(sourceLi);
            ul.appendChild(destLi);
            ul.appendChild(srcUserLi);
            ul.appendChild(categoryLi);
            ul.appendChild(appLi);
            ul.appendChild(serviceLi);
            ul.appendChild(actionLi);
            ul.appendChild(typeLi);
            ul.appendChild(logLi);
            ul.appendChild(logStartLi);
            ul.appendChild(logEndLi);
            ul.appendChild(disabledLi);
            ul.appendChild(descLi);
            ul.appendChild(tagLi);
            ul.appendChild(tagGroupLi);

            // Append ul to div
            div.appendChild(ul);

            // Add items to the div element
            divElement.appendChild(button);
            divElement.appendChild(div);
        });
    })
    .catch(error => console.error('Error fetching NAT Policies:', error));
}


/**
 * Update the table with a list of QoS Policies for the selected device
 * This is specific to the QoS Policies page and is called when a device is selected from the dropdown
 * 
 * @param {*} deviceId 
 * @param {*} divId 
 */
function updateQosTable(deviceId, divId) {
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

            // Create a new button element for each policy
            const button = document.createElement('button');
            button.className = 'w3-button w3-block w3-left-align';
            button.textContent = policy.name;
            button.onclick = function() { expandList(divId + '_' + sanitizedId) };

            // Create list div
            const div = document.createElement('div');
            div.id = divId + '_' + sanitizedId;
            div.className = 'w3-hide w3-border';

            // Create ul
            const ul = document.createElement('ul');
            ul.className = 'indented-list';

            // Create li elements for each service property (confirming they are arrays first)
            const toLi = document.createElement('li');
            if (Array.isArray(policy.to?.member)) {
                toLi.textContent = policy.to.member.join(", ");
            } else {
                toLi.textContent = 'No to address';
            }

            const fromLi = document.createElement('li');
            if (Array.isArray(policy.from?.member)) {
                fromLi.textContent = policy.from.member.join(", ");
            } else {
                fromLi.textContent = 'No from address';
            }

            const sourceLi = document.createElement('li');
            if (Array.isArray(policy.source?.member)) {
                sourceLi.textContent = policy.source.member.join(", ");
            } else {
                sourceLi.textContent = 'No source address';
            }

            const destLi = document.createElement('li');
            if (Array.isArray(policy.destination?.member)) {
                destLi.textContent = policy.destination.member.join(", ");
            } else {
                destLi.textContent = 'No destination address';
            }

            const srcUserLi = document.createElement('li');
            if (Array.isArray(policy.source_user?.member)) {
                srcUserLi.textContent = policy.source_user.member.join(", ");
            } else {
                srcUserLi.textContent = 'No source user';
            }

            const categoryLi = document.createElement('li');
            if (Array.isArray(policy.category?.member)) {
                categoryLi.textContent = policy.category.member.join(", ");
            } else {
                categoryLi.textContent = 'No source user';
            }

            const appLi = document.createElement('li');
            if (Array.isArray(policy.application?.member)) {
                appLi.textContent = policy.application.member.join(", ");
            } else {
                appLi.textContent = 'No source user';
            }

            const serviceLi = document.createElement('li');
            if (Array.isArray(policy.service?.member)) {
                serviceLi.textContent = policy.service.member.join(", ");
            } else {
                serviceLi.textContent = 'No service';
            }

            const actionLi = document.createElement('li');
            if (Array.isArray(policy.action?.member)) {
                actionLi.textContent = policy.action.member.join(", ");
            } else {
                actionLi.textContent = 'No service';
            }

            const dscpLi = document.createElement('li');
            if (Array.isArray(policy.desp?.member)) {
                dscpLi.textContent = policy.dscp.member.join(", ");
            } else {
                dscpLi.textContent = 'No service';
            }

            const descLi = document.createElement('li');
            if (Array.isArray(policy.description?.member)) {
                descLi.textContent = policy.description.member.join(", ");
            } else {
                descLi.textContent = 'No description';
            }

            const tagLi = document.createElement('li');
            if (Array.isArray(policy.tag?.member)) {
                tagLi.textContent = policy.tag.member.join(", ");
            } else {
                tagLi.textContent = 'No tags';
            }

            const tagGroupLi = document.createElement('li');
            if (Array.isArray(policy.tag_group?.member)) {
                tagGroupLi.textContent = policy.tag_group.member.join(", ");
            } else {
                tagGroupLi.textContent = 'No grouping by tags';
            }

            // Append li elements to ul
            ul.appendChild(toLi);
            ul.appendChild(fromLi);
            ul.appendChild(sourceLi);
            ul.appendChild(destLi);
            ul.appendChild(srcUserLi);
            ul.appendChild(categoryLi);
            ul.appendChild(appLi);
            ul.appendChild(serviceLi);
            ul.appendChild(actionLi);
            ul.appendChild(dscpLi);
            ul.appendChild(descLi);
            ul.appendChild(tagLi);
            ul.appendChild(tagGroupLi);

            // Append ul to div
            div.appendChild(ul);

            // Add items to the div element
            divElement.appendChild(button);
            divElement.appendChild(div);
        });
    })
    .catch(error => console.error('Error fetching NAT Policies:', error));
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
