/*
    Javascript code related to VPN Tunnels
*/


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
    // Display the modal by changing the style from 'none' to 'block'
    modal.style.display = "block";
}


/**
 * Close a modal by setting its display style to 'none'
 * @param {*} modal 
 */
function closeModal() {
    // Get the parent element of the close button and hide it
    let modal = this.parentElement.parentElement;
    modal.style.display = "none";
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