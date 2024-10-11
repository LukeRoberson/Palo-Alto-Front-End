/*
    Javascript code related to VPN Tunnels
*/


// Get a list of devices
let devicesArray = [];
fetchAndStoreDevices();

setupPage();
getVpnList();


/**
 * Function to get the list of VPN Tunnels
 */
function getVpnList() {
    // API call to get the list of VPN tunnels
    fetch("/api/vpn?type=ipsec")
        .then((response) => response.json())
        .then((data) => {
            // Create cards for each VPN tunnel
            data.forEach((vpn) => {
                vpnCard(vpn);
            })
        })
        .catch((error) => {
            console.error("Error fetching VPN list:", error);
        });
}


// Function to show the tooltip
function showTooltip(event, tooltipDiv) {
    tooltipDiv.style.display = "block";
    tooltipDiv.style.position = "absolute";
    tooltipDiv.style.left = `${event.pageX + 10}px`;
    tooltipDiv.style.top = `${event.pageY + 10}px`;
}

// Function to hide the tooltip
function hideTooltip(tooltipDiv) {
    tooltipDiv.style.display = "none";
}


/**
 * Function to display VPN details in a card
 * 
 * @param {Array} vpnArray - Array of VPN tunnel details
 */
function vpnCard(vpnArray) {
    // Define Images
    const imgRouterA = document.createElement("img");
    imgRouterA.src = "static/img/router.png";
    imgRouterA.alt = "VPN Router A";
    imgRouterA.className = "vpn-router-image";

    const imgRouterB = document.createElement("img");
    imgRouterB.src = "static/img/router.png";
    imgRouterB.alt = "VPN Router B";
    imgRouterB.className = "vpn-router-image";

    const imgFirewallA = document.createElement("img");
    imgFirewallA.src = "static/img/firewall.png";
    imgFirewallA.alt = "Firewall A";
    imgFirewallA.className = "vpn-firewall-image";

    const imgFirewallB = document.createElement("img");
    imgFirewallB.src = "static/img/firewall.png";
    imgFirewallB.alt = "Firewall B";
    imgFirewallB.className = "vpn-firewall-image";

    const imgCloudB = document.createElement("img");
    imgCloudB.src = "static/img/cloud.png";
    imgCloudB.alt = "Cloud VPN Endpoint";
    imgCloudB.className = "vpn-cloud-image";

    const imgInternet = document.createElement("img");
    imgInternet.src = "static/img/internet.png";
    imgInternet.alt = "Internet";
    imgInternet.className = "vpn-cloud-image";

    // Create a card for the VPN tunnel
    const parentContainer = document.getElementById("vpnContainer");
    const card = document.createElement("div");
    card.className = "vpn-card";
    card.classList.add("w3-card-4");

    // Add a title to the card
    card.innerHTML = `
        <div class="w3-bar w3-light-grey w3-padding">
            <div class="w3-left">
                <h3>${vpnArray.name}</h3>
            </div>
            <div class="w3-right">
                <button class="w3-button w3-small w3-red w3-border w3-margin-right" onclick="deleteVpn('${vpnArray.name}')">Delete</button>
            </div>
        </div>
    `;

    // Create a container for the grid elements
    const divGridContainer = document.createElement("div");
    divGridContainer.className = "w3-row w3-padding-16 vpn-grid-container";

    // Grid for Endpoint A
    const divGridEndA = document.createElement("div");
    divGridEndA.className = "w3-col m2 l2 vpn-grid-item";
    divGridEndA.id = `gridEndA${sanitizeName(vpnArray.name)}`;
    divGridEndA.appendChild(imgRouterA);

    const divStatus = document.createElement("div");
    divStatus.className = "tooltip";
    divStatus.innerHTML = "Pending...";
    document.body.appendChild(divStatus);
    imgRouterA.addEventListener("mouseover", (event) => showTooltip(event, divStatus));
    imgRouterA.addEventListener("mouseout", () => hideTooltip(divStatus));

    const divEndAContent = document.createElement("div");
    divEndAContent.style = "text-align: center;";
    divEndAContent.innerHTML = `
        <b>${vpnArray.a_endpoint.name}</b>
        `;
    divGridEndA.appendChild(divEndAContent);

    divGridContainer.appendChild(divGridEndA);

    vpnStatus(vpnArray.a_endpoint.id, vpnArray).then((status) => {
        if (status == null) {
            const questionMarkIcon = document.createElement("img");
            questionMarkIcon.src = "static/img/question_mark.png";
            questionMarkIcon.alt = "Status Unknown";
            questionMarkIcon.className = "status-icon";
            divGridEndA.appendChild(questionMarkIcon);

            divStatus.innerHTML = `Status Unknown`;
        } else if (status.ipsec_status == 'up') {
            const greenIcon = document.createElement("img");
            greenIcon.src = "static/img/green_tick.png";
            greenIcon.alt = "Up";
            greenIcon.className = "status-icon";
            divGridEndA.appendChild(greenIcon);

            divStatus.innerHTML = `
                IPSec Name: ${status.ipsec_name}<br>
                Destination: ${status.destination}<br>
                Source Int: ${status.physical_if}<br>
                Tunnel Int: ${status.tunnel_if}<br>
            `;
        } else {
            const redIcon = document.createElement("img");
            redIcon.src = "static/img/red_cross.png";
            redIcon.alt = "Up";
            redIcon.className = "status-icon";
            divGridEndA.appendChild(redIcon);

            divStatus.innerHTML = `Down`;
        }
    }).catch((error) => {
        console.error("Error:", error);
    });

    // Grid for Firewall A
    const divGridFwA = document.createElement("div");
    divGridFwA.className = "w3-col m2 l2 vpn-grid-item";
    divGridFwA.id = `gridFwA${sanitizeName(vpnArray.name)}`;

    if (vpnArray.a_endpoint.fw_name == null) {
        vpnArray.a_endpoint.fw_name = 'None';
    }
    if (vpnArray.a_endpoint.nat_inside == null) {
        vpnArray.a_endpoint.nat_inside = 'None';
    }
    if (vpnArray.a_endpoint.nat_outside == null) {
        vpnArray.a_endpoint.nat_outside = 'None';
    }

    if (vpnArray.a_endpoint.fw_name == 'None') {
        divGridFwA.classList.add("grayscale-image");
    }
    divGridFwA.appendChild(imgFirewallA);

    const divFwAContent = document.createElement("div");
    divFwAContent.style = "text-align: center;";
    divFwAContent.innerHTML = `
        <b>${vpnArray.a_endpoint.fw_name}</b><br>
        `;
    if (vpnArray.a_endpoint.nat_outside != 'None' && vpnArray.a_endpoint.nat_inside != 'None') {
        divFwAContent.insertAdjacentHTML('beforeend', `${vpnArray.a_endpoint.nat_inside} ⇒ ${vpnArray.a_endpoint.nat_outside}`);
    }
    divGridFwA.appendChild(divFwAContent);

    divGridContainer.appendChild(divGridFwA);

    // Internet grid
    const divGridInternet = document.createElement("div");
    divGridInternet.className = "w3-col m2 l2 vpn-grid-item";
    divGridInternet.appendChild(imgInternet);

    const divTestContent = document.createElement("div");
    divTestContent.style = "text-align: center;";
    divGridInternet.appendChild(divTestContent);

    divGridContainer.appendChild(divGridInternet);

    // Grid for Firewall B
    const divGridFwB = document.createElement("div");
    divGridFwB.className = "w3-col m2 l2 vpn-grid-item";
    divGridFwB.id = `gridFwB${sanitizeName(vpnArray.name)}`;

    if (vpnArray.b_endpoint.fw_name == null) {
        vpnArray.b_endpoint.fw_name = 'None';
    }
    if (vpnArray.b_endpoint.nat_inside == null) {
        vpnArray.b_endpoint.nat_inside = 'None';
    }
    if (vpnArray.b_endpoint.nat_outside == null) {
        vpnArray.b_endpoint.nat_outside = 'None';
    }

    if (vpnArray.b_endpoint.fw_name == 'None') {
        divGridFwB.classList.add("grayscale-image");
    }
    divGridFwB.appendChild(imgFirewallB);

    const divFwBContent = document.createElement("div");
    divFwBContent.style = "text-align: center;";
    divFwBContent.innerHTML = `
        <b>${vpnArray.b_endpoint.fw_name}</b><br>
        `;
    if (vpnArray.b_endpoint.nat_outside != 'None' && vpnArray.b_endpoint.nat_inside != 'None') {
        divFwBContent.insertAdjacentHTML('beforeend', `${vpnArray.b_endpoint.nat_outside} ⇐ ${vpnArray.b_endpoint.nat_inside}`);
    }
    divGridFwB.appendChild(divFwBContent);

    divGridContainer.appendChild(divGridFwB);

    // Grid for Endpoint B
    const divGridEndB = document.createElement("div");
    divGridEndB.className = "w3-col m2 l2 vpn-grid-item";
    divGridEndB.id = `gridEndB${sanitizeName(vpnArray.name)}`;
    if (vpnArray.b_endpoint.id != 'None' && vpnArray.b_endpoint.id != null) {
        divGridEndB.appendChild(imgRouterB);
        endBName = vpnArray.b_endpoint.name;
    } else {
        divGridEndB.appendChild(imgCloudB);
        endBName = vpnArray.b_endpoint.cloud_ip;
    }

    const divEndBContent = document.createElement("div");
    divEndBContent.style = "text-align: center;";
    divEndBContent.innerHTML = `
        <b>${endBName}</b>
        `;
    divGridEndB.appendChild(divEndBContent);

    divGridContainer.appendChild(divGridEndB);

    // Append the card to the parent container
    card.appendChild(divGridContainer);
    parentContainer.appendChild(card);
}


/**
 * Function to get the status of a VPN tunnel on a given device
 * 
 * @param {string} id - Device ID
 * @param {Object} vpn - VPN tunnel details
 * @returns {Object} The status of the VPN tunnel
 */
async function vpnStatus(id, vpn) {
    try {
        // API call to get the status of the VPN tunnel
        const response = await fetch(`/api/vpn?type=ipsec&action=status&id=${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            return null;
        }

        // Wait for the response
        const body = await response.json();

        // Find the tunnel with the destination matching the VPN tunnel
        for (const tunnel of body) {
            if (tunnel.destination === vpn.a_endpoint.destination) {
                return tunnel;
            }
        }

        // If no matching tunnel is found, return null or an appropriate value
        return null;
    } catch (error) {
        console.error("Error getting tunnel status:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
}


/**
 * Sanitize a name by replacing invalid characters with underscores
 * 
 * @param {*} name 
 * @returns the sanitized name
 */
function sanitizeName(name) {
    return name.replace(/[^a-zA-Z0-9-_]/g, '_');
}


/**
 * Function to setup the page
 * Add event listeners to buttons
 */
function setupPage() {
    // Add event listener to Add VPN button
    const modalAddVpn = document.getElementById("modalAddVpn");
    const buttonAddVpn = document.getElementById("buttonAddVpn");
    buttonAddVpn.onclick = function () {
        openModal(modalAddVpn);
    };
}


/**
 * Open a modal by setting its display style to 'block'
 * If this is the Add Device modal, load up the site list in the dropdown
 * @param {*} modal 
 */
function openModal(modal) {
    // Select dropdowns
    const dropAddEndpointA = document.getElementById("addEndpointA");
    const dropAddFwA = document.getElementById("addFirewallA");
    const dropAddEndpointB = document.getElementById("addEndpointB");
    const dropAddFwB = document.getElementById("addFirewallB");

    // Clear fields
    document.getElementById("addTunnelName").value = "";
    document.getElementById("addTunnelDestA").value = "";
    document.getElementById("addFirewallAEnable").checked = false;
    document.getElementById("addFirewallATypeUnmanaged").checked = true;
    document.getElementById("addInsideNatA").value = "";
    document.getElementById("addOutsideNatA").value = "";
    document.getElementById("addEndpointBUnmanaged").checked = true;
    document.getElementById("addCloudIpB").value = "";
    document.getElementById("addTunnelDestB").value = "";
    document.getElementById("addFirewallBEnable").checked = false;
    document.getElementById("addFirewallBTypeUnmanaged").checked = true;
    document.getElementById("addInsideNatB").value = "";
    document.getElementById("addOutsideNatB").value = "";

    // Populate dropdowns with devices
    devicesArray.forEach((device) => {
        // Add devices to dropdowns
        const optionA = document.createElement("option");
        optionA.text = device.device_name;
        optionA.value = device.device_id;
        dropAddEndpointA.add(optionA);

        const optionB = document.createElement("option");
        optionB.text = device.device_name;
        optionB.value = device.device_id;
        dropAddEndpointB.add(optionB);

        const optionFirewallA = document.createElement("option");
        optionFirewallA.text = device.device_name;
        optionFirewallA.value = device.device_id;
        dropAddFwA.add(optionFirewallA);

        const optionFirewallB = document.createElement("option");
        optionFirewallB.text = device.device_name;
        optionFirewallB.value = device.device_id;
        dropAddFwB.add(optionFirewallB);
    });

    // Display the modal by changing the style from 'none' to 'block'
    modal.style.display = "block";
}


/**
 * Toggle checkboxes for adding external firewalls
 * Shows/hides additional fields for external firewalls
 * 
 * @param {*} item
 */
function toggleExternalFw(item) {
    // Get the checkbox element
    const checkbox = document.getElementById(item);

    // Decide if this is for endpoint A or B
    let aOrB
    if (item === "addFirewallAEnable") {
        aOrB = "A";
    } else {
        aOrB = "B";
    }

    // Get divs for the endpoint
    const divManaged = document.getElementById(`firewall${aOrB}TypeContainer`);
    const divInsideNat = document.getElementById(`firewall${aOrB}InsideNatContainer`);
    const divOutsideNat = document.getElementById(`firewall${aOrB}OutsideNatContainer`);

    if (checkbox.checked) {
        divManaged.style.display = "block";
        divInsideNat.style.display = "block";
        divOutsideNat.style.display = "block";
    } else {
        divManaged.style.display = "none";
        divInsideNat.style.display = "none";
        divOutsideNat.style.display = "none";
    }
}


/**
 * Toggle radio button for external managed firewall
 * Shows/hides additional fields for managed firewall
 * 
 * @param {*} item 
 */
function toggleManagedFw(item) {
    // Get the radio button element
    const radio = document.getElementById(item);

    // Decide if this is for endpoint A or B
    let aOrB
    if (item == "addFirewallATypeManaged" || item == "addFirewallATypeUnmanaged") {
        aOrB = "A";
    } else {
        aOrB = "B";
    }

    // Get divs for the endpoint
    const divManaged = document.getElementById(`firewall${aOrB}ManagedContainer`);

    // Show the managed firewall div if the radio button is checked
    if (radio.value == "managed") {
        divManaged.style.display = "block";
    } else {
        divManaged.style.display = "none";
    }
}


/**
 * Toggle radio button for external managed endpoint B
 * Shows/hides additional fields for managed endpoint B
 * 
 * @param {*} item 
 */
function toggleManagedEndpointB(item) {
    // Get the radio button element
    const radio = document.getElementById(item);

    // Get divs for the endpoint
    const divManaged = document.getElementById("devBManagedContainer");
    const divDestination = document.getElementById("devBManagedDest");
    const divCloudIp = document.getElementById("devBCloudIpContainer");

    // Show the managed device if the radio button is checked
    if (radio.value == "managed") {
        divManaged.style.display = "block";
        divDestination.style.display = "block";
        divCloudIp.style.display = "none";
    } else {
        divManaged.style.display = "none";
        divDestination.style.display = "none";
        divCloudIp.style.display = "block";
    }
}


/**
 * Get a list of devices asynchronously
 * 
 * @returns {Promise<Array>} A promise that resolves to an array of devices
 */
async function deviceList() {
    try {
        // API call to get the list of devices
        const response = await fetch("/api/device?action=list");
        const data = await response.json();

        // Return the array of devices
        return data;
    } catch (error) {
        console.error("Error fetching device list:", error);

        // Return an empty array in case of error
        return [];
    }
}


/**
 * Fetch and store the list of devices
 * Need this so we can use 'await' to get the list of devices
 */
async function fetchAndStoreDevices() {
    devicesArray = await deviceList();
}


/**
 * Add a VPN tunnel
 * Sends details from the form to the API
 */
function addVpn() {
    // Get the form elements
    const form = document.getElementById("addVpnForm");
    const formData = new FormData(form);

    // Get the form data
    const data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    // Add checkboxes (not included by default if they're not checked)
    const checkboxes = form.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (!formData.has(checkbox.name)) {
            data[checkbox.name] = checkbox.checked;
        }
    });

    // Sanity checking - Tunnel Name
    if (data.addTunnelName == "") {
        showNotification("Please enter a tunnel name", "Failure");
        return;
    }

    // Sanity checking - Endpoint A Destination
    if (data.addTunnelDestA == "") {
        showNotification("Please define an endpoint-A IP or FQDN", "Failure");
        return;
    }

    // Sanity checking - Managed FW A
    if (data.addFirewallAEnable == 'on') {
        // FW-A and Endpoint-A cannot be the same
        if ((data.addFirewallAType == 'managed') && (data.addEndpointA == data.addFirewallA)) {
            showNotification("Endpoint A device and firewall cannot be the same", "Failure");
            console.log("Endpoint A:", data.addEndpointA);
            console.log("Firewall A:", data.addFirewallA);
            return;
        }

        // Inside NAT and Outside NAT must be defined
        if (data.addInsideNatA == "") {
            showNotification("Please enter the inside NAT for Endpoint A", "Failure");
            return;
        }
        if (data.addOutsideNatA == "") {
            showNotification("Please enter the outside NAT for Endpoint A", "Failure");
            return;
        }
    }

    // Sanity checking - Unmanaged Endpoint B
    if ((data.addEndpointBManaged == 'managed') && (data.addOutsideNatA != "") && (data.addCloudIpB == data.addOutsideNatA)) {
        showNotification("Cloud VPN IP conflicts with NAT IP", "Failure");
        console.log(`Cloud VPN IP (${data.addCloudIpB}) conflicts with NAT IP (${data.addOutsideNatA})`)
        return;
    }

    // Sanity checking - Managed Endpoint B
    if (data.addEndpointBManaged == "managed") {
        // Endpoint-B cannot be the same as Endpoint-A
        if (data.addEndpointB == data.addEndpointA) {
            showNotification("Endpoint-A and Endpoint-B cannot be the same", "Failure");
            console.log("Endpoint A:", data.addEndpointA);
            console.log("Endpoint B:", data.addEndpointB);
            return;
        }

        // Endpoint-B and FW-A cannot be the same
        if ((data.addFirewallAEnable == 'on') && (data.addFirewallAType == 'managed') && (data.addFirewallA == data.addEndpointB)) {
            showNotification("Firewall A and Endpoint B cannot be the same", "Failure");
            console.log("Firewall A:", data.addFirewallA);
            console.log("Endpoint B:", data.addEndpointB);
            return;
        }

        // Endpoint-B must have a destination
        if (data.addTunnelDestB == "") {
            showNotification("Please define a destination for Endpoint-B", "Failure");
            return;
        }
    } else {
        // Unmanaged Endpoint-B must have a cloud IP
        if (data.addCloudIpB == "") {
            showNotification("Please define an IP for Endpoint-B", "Failure");
            return;
        }
    }

    // Sanity checking - Managed FW B
    if (data.addFirewallBEnable == 'on') {
        // Checks for a managed firewall
        if (data.addFirewallBType == 'managed') {
            // FW-B and Endpoint-B cannot be the same
            if ((data.addEndpointBManaged == 'managed') && (data.addEndpointB == data.addFirewallB)) {
                showNotification("Endpoint B device and firewall cannot be the same", "Failure");
                console.log("Endpoint B:", data.addEndpointB);
                console.log("Firewall B:", data.addFirewallB);
                return;
            }

            // FW-B and FW-A cannot be the same
            if ((data.addFirewallAType == 'managed') && (data.addFirewallA == data.addFirewallB)) {
                showNotification("Firewall A and Firewall B cannot be the same", "Failure");
                console.log("Firewall A:", data.addFirewallA);
                console.log("Firewall B:", data.addFirewallB);
                return;
            }

            // FW-B cannot be the same as Endpoint-A
            if ((data.addEndpointA == data.addFirewallB)) {
                showNotification("Endpoint A and firewall B cannot be the same", "Failure");
                console.log("Endpoint A:", data.addEndpointA);
                console.log("Firewall B:", data.addFirewallB);
                return;
            }
        }

        // Inside NAT and Outside NAT must be defined
        if (data.addInsideNatB == "") {
            showNotification("Please enter the inside NAT for Endpoint B", "Failure");
            return;
        }
        if (data.addOutsideNatB == "") {
            showNotification("Please enter the outside NAT for Endpoint B", "Failure");
            return;
        }
    }

    // API call
    showLoadingSpinner('modalAddVpn');
    fetch("/api/vpn?action=add&type=ipsec", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => {
            if (response.ok) {
                showNotification("VPN tunnel added successfully", "Success");
                const modalAddVpn = document.getElementById("modalAddVpn");
                modalAddVpn.style.display = "none";
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else {
                showNotification("Failed to add VPN tunnel", "Failure");
            }
        })
        .catch((error) => {
            console.error("Error adding VPN tunnel:", error);
            showNotification("Failed to add VPN tunnel", "Failure");
            hideLoadingSpinner('modalAddVpn');
        })
        .finally(() => {
            hideLoadingSpinner('modalAddVpn');
            const modalAddVpn = document.getElementById("modalAddVpn");
            modalAddVpn.style.display = "none";
        });
}


/**
 * Delete a VPN tunnel
 * 
 * @param {*} vpnName - Unique name of the VPN tunnel to delete
 */
async function deleteVpn(vpnName) {
    try {
        const result = await showConfirmModal();
        if (result) {
            // API call
            showLoadingSpinner('vpnContainer');
            fetch("/api/vpn", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(vpnName),
            })
                .then((response) => {
                    if (response.ok) {
                        showNotification("VPN tunnel removed successfully", "Success");
                        setTimeout(() => {
                            location.reload();
                        }, 1000);
                    } else {
                        showNotification("Failed to remove VPN tunnel", "Failure");
                    }
                })
                .catch((error) => {
                    console.error("Error removing VPN tunnel:", error);
                    showNotification("Failed to remove VPN tunnel", "Failure");
                    hideLoadingSpinner('vpnContainer');
                })
                .finally(() => {
                    hideLoadingSpinner('vpnContainer');
                });
        }
    } catch (error) {
        console.error("An error occurred:", error);
    }
}


/**
 * Show the confirmation modal for deleting a VPN
 */
function showConfirmModal() {
    return new Promise((resolve, reject) => {
        const confirmModal = document.getElementById('vpnConfirmModal');
        const confirmYes = document.getElementById('confirmDelete');
        const confirmCancel = document.getElementById('confirmCancel');

        confirmModal.style.display = 'block';

        function handleYes() {
            confirmModal.style.display = 'none';
            resolve(true);
            confirmYes.removeEventListener('click', handleYes);
            confirmCancel.removeEventListener('click', handleCancel);
        }

        function handleCancel() {
            confirmModal.style.display = 'none';
            resolve(false);
            confirmYes.removeEventListener('click', handleYes);
            confirmCancel.removeEventListener('click', handleCancel);
        }

        confirmYes.addEventListener('click', handleYes);
        confirmCancel.addEventListener('click', handleCancel);
    });
}
