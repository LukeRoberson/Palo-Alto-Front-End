/*
    Manage functionality on the devices page:
    - Open and close modals
    - Refresh the device list
    - Delete sites and devices
    - Edit sites and devices
    - Download configuration files
    - Add sites and devices

    Modal list:
    - Add Device modal
    - Add Site modal
    - Edit Device modal
    - Edit Site modal
*/

// Get modals as variables
var devModal = document.getElementById("deviceModal");                      // Add device modal
var siteModal = document.getElementById("siteModal");                       // Add site modal
var devEditModal = document.getElementById("deviceEditModal");              // Edit device modal
var siteEditModal = document.getElementById("siteEditModal");               // Edit site modal

// Get all buttons as variables
var siteBtn = document.getElementById("add_site");                          // Add site button
var devBtn = document.getElementById("add_device");                         // Add device button
var siteRefreshBtn = document.getElementById("refresh_site");               // Refresh site list button
var devRefreshBtn = document.getElementById("refresh_device");              // Refresh device list button
var closeButtons = document.getElementsByClassName("close");                // Regular close buttons
var siteSubmitBtn = document.getElementById("siteSubmit");                  // Submit button in 'add site' modal
var siteEditSubmitBtn = document.getElementById("siteEditSubmit");          // Submit button in 'edit site' modal
var deviceSubmitBtn = document.getElementById("deviceSubmit");              // Submit button in 'add device' modal
var deviceEditSubmitBtn = document.getElementById("deviceEditSubmit");      // Submit button in 'edit device' modal

// Event listeners
devBtn.addEventListener('click', () => openModal(devModal));                // Add device button
siteBtn.addEventListener('click', () => openModal(siteModal));              // Add site button
devRefreshBtn.addEventListener('click', refreshPageAndReload);              // Refresh device list button
siteRefreshBtn.addEventListener('click', refreshPageAndReload);             // Refresh site list button

for (var i = 0; i < closeButtons.length; i++) {                             // 'x' close buttons
    closeButtons[i].onclick = closeModal;
}

setupDeleteButton('.site-delete-button', '/delete_site');                   // Delete site buttons
setupDeleteButton('.device-delete-button', '/delete_device');               // Delete device buttons

siteSubmitBtn.addEventListener(                                             // Add site submit button
    'click', (event) => handleSubmitButtonClick(event, '/add_site', siteSubmitBtn)
);
siteEditSubmitBtn.addEventListener(                                         // Edit site submit button
    'click', (event) => handleSubmitButtonClick(event, '/update_site', siteEditSubmitBtn)
);
deviceSubmitBtn.addEventListener(                                           // Add device submit button
    'click', (event) => handleSubmitButtonClick(event, '/add_device', deviceSubmitBtn)
);
deviceEditSubmitBtn.addEventListener(                                       // Edit device submit button
    'click', (event) => handleSubmitButtonClick(event, '/update_device', deviceEditSubmitBtn)
);

document.querySelectorAll('.site-edit-button').forEach(button => {          // Site edit button (open modal)
    button.addEventListener('click', openSiteEditModal);
});
document.querySelectorAll('.device-edit-button').forEach(button => {        // Device edit button (open modal)
    button.addEventListener('click', openDeviceEditModal);
});


document.querySelectorAll('.device-download-button').forEach(button => {    // Attach event listener to each device download button
    button.addEventListener('click', downloadDeviceConfig);
});

document.addEventListener('DOMContentLoaded', function() {                  // Attach event listener to each collapsible header
    var collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    collapsibleHeaders.forEach(function(header) {
        header.addEventListener('click', toggleCollapsibleContent);
    });
});


/**
 * Handle the submit button click event for various forms
 * @param {*} event
 * @param {*} url 
 * @param {*} buttonElement 
 * @returns 
 */
function handleSubmitButtonClick(event, url, buttonElement) {
    // Prevent the default form submission
    event.preventDefault();

    // Get the form element from the button
    const form = buttonElement.closest('form');
    if (!form) {
        console.error('Form not found for button:', buttonElement.id);
        return;
    }

    // Collect data from the form
    const formData = new FormData(form);

    // POST the form data to the specified URL
    fetch(url, {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        // Check the 'result' field and display the message with appropriate color
        if (data.result === 'Success') {
            showNotification(data.message, 'Success');

            // Delay a little, then reload the page
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else if (data.result === 'Failure') {
            showNotification(data.message, 'Failure');
        }
    })
    .catch(error => console.error('Error:', error));

    // Close the open modal
    devModal.style.display = "none";
    siteModal.style.display = "none";
}


/**
 * Function to refresh the page and reload the device list
 * Shows a loading spinner while the request is in progress
 */
function refreshPageAndReload() {
    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';

    // Call the refresh_dev_site endpoint to refresh the device list
    fetch('/refresh_dev_site')
        .then(response => {
            // Hide loading spinner when the response is received
            document.getElementById('loadingSpinner').style.display = 'none';

            // Check if the response is OK and reload the page
            if (response.ok) {
                console.log('Device list fetched successfully');
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else {
                console.error('Failed to fetch device list');
            }
        })
        .catch(error => {
            // Hide loading spinner if there is an error
            document.getElementById('loadingSpinner').style.display = 'none';
            console.error('Error fetching device list:', error);
        });
}


/**
 * Open a modal by setting its display style to 'block'
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
    var modal = this.parentElement.parentElement;
    modal.style.display = "none";
}


/**
 * Unified function for delete buttons (for sites and devices)
 * This is called for each button to set up the event listener
 *  
 * @param {string} selector - The CSS selector (targets the buttons based on CSS class)
 * @param {string} deleteUrl - The URL to send the delete request to
 * @returns {void}
 */
function setupDeleteButton(selector, deleteUrl) {
    // Select all buttons with the given CSS selector, and loop through them
    document.querySelectorAll(selector).forEach(button => {
        // Add an event listener to each button
        button.addEventListener('click', function(event) {
            // Devices and sites have 'data-id' attributes
            var objectId = event.currentTarget.getAttribute(`data-id`);
            
            // POST to the delete URL with the objectId
            fetch(deleteUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ objectId }),
            })

            // Parse the response and display a notification
            .then(response => response.json())
            .then(data => {
                // Check the 'result' field and display the message with appropriate color
                if (data.result === 'Success') {
                    // Display a success message
                    showNotification(data.message, 'Success');

                    // Delay a little, then reload the page
                    setTimeout(() => {
                        location.reload();
                    }, 1000);
                } else if (data.result === 'Failure') {
                    // Failure message if needed
                    showNotification(data.message, 'Failure');
                }
            })
            .catch(error => console.error('Error:', error));
        });
    });
}


/**
 * Open the site edit modal and populate the input fields with the site data
 * @param {*} event 
 */
function openSiteEditModal(event) {
    // Directly use event.currentTarget to get the 'data-site-id' and 'data-site-name'
    var siteId = event.currentTarget.getAttribute('data-id');
    var siteName = event.currentTarget.getAttribute('data-site-name');

    // Select the input fields by their name attribute
    const siteEditIdInput = document.querySelector('input[name="siteEditId"]');
    const siteEditNameInput = document.querySelector('input[name="siteEditName"]');
    
    // Populate the input fields with siteId and siteName
    siteEditIdInput.value = siteId;
    siteEditNameInput.value = siteName;
    console.log(siteEditIdInput.value, siteEditNameInput.value);

    // Display the modal
    siteEditModal.style.display = "block";
}


/**
 * Open the device edit modal and populate the input fields with the device data
 * @param {*} event 
 */
function openDeviceEditModal(event) {
    // Directly use event.currentTarget to get the device attributes
    var deviceId = event.currentTarget.getAttribute('data-id');
    var deviceName = event.currentTarget.getAttribute('data-device-name');
    var deviceHostname = event.currentTarget.getAttribute('data-device-hostname');
    var deviceSite = event.currentTarget.getAttribute('data-device-site');
    var deviceKey = event.currentTarget.getAttribute('data-device-key');

    // Select the input fields
    const deviceEditIdInput = document.querySelector('input[name="deviceEditId"]');
    const deviceEditNameInput = document.querySelector('input[name="deviceEditName"]');
    const deviceHostNameInput = document.querySelector('input[name="hostNameEdit"]');
    const deviceSiteInput = document.querySelector('input[name="siteMemberEdit"]');
    const deviceKeyNameInput = document.querySelector('input[name="apiKeyEdit"]');
    
    // Populate the input fields
    deviceEditIdInput.value = deviceId;
    deviceEditNameInput.value = deviceName;
    deviceHostNameInput.value = deviceHostname;
    deviceSiteInput.value = deviceSite;
    deviceKeyNameInput.value = deviceKey;
    
    // Display the modal
    devEditModal.style.display = "block";
}


/** 
 * Download configuration files for devices
 * Calls the /download_config endpoint to get the configuration file
 * @param {*} event
 */
function downloadDeviceConfig(event) {
    // Get the device ID from the button's data-id attribute
    var deviceId = event.currentTarget.getAttribute('data-id');
    
    // POST to the download_config endpoint with the deviceId
    fetch('/download_config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId }),
    })

    // Extract the filename from the custom header and trigger the download
    .then(response => {
        const filename = response.headers.get('X-Filename') || 'default_filename.xml';
        return response.blob().then(blob => ({ blob, filename }));
    })

    // Create a URL for the blob and trigger the download
    .then(({ blob, filename }) => {
        // Create a new URL for the blob
        const url = window.URL.createObjectURL(blob);

        // Create a temporary anchor element
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;

        // Use the filename from the header
        a.download = filename;

        // Append the anchor to the document
        document.body.appendChild(a);

        // Trigger the download by simulating a click on the anchor
        a.click();

        // Clean up by revoking the object URL and removing the anchor
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    })

    // Log any errors to the console
    .catch(error => console.error('Error:', error));
}


/**
 * Collapse and expand the content of the collapsible cards
 * @param {*} event 
 */
function toggleCollapsibleContent(event) {
    // Determine the type of cards to toggle based on the header clicked
    var cardType = this.getAttribute('data-card-type');
    var cardsToToggle = document.querySelectorAll('.' + cardType);

    // Toggle the visibility of the corresponding cards
    cardsToToggle.forEach(function(card) {
        card.classList.toggle('collapsible-content');
    });

    // Toggle the rotation of the icon within the clicked header
    var collapseIcon = this.querySelector('.collapse-icon');
    if (collapseIcon) {
        collapseIcon.classList.toggle('rotate-icon');
    }
}
