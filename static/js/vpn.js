/*
    Javascript code related to VPN Tunnels
*/


// Get a list of devices
let devicesArray = [];
fetchAndStoreDevices();

setupPage();
vpnCard();
vpnCard();


/**
 * Function to get the list of VPN Tunnels
 */
function getVpnList() {
    console.log("Placeholder for VPN List");
}


/**
 * Function to display VPN details in a card
 */
function vpnCard() {
    const parentContainer = document.getElementById("vpnContainer");
    const card = document.createElement("div");
    card.className = "vpn-card";
    card.classList.add("w3-card");
    card.classList.add("w3-padding");
    card.innerHTML = `
        <h3>Sample VPN Tunnel</h3>
        <p>Placeholder text for VPN tunnel details.</p>
    `;
    parentContainer.appendChild(card);
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