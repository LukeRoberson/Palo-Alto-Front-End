/*
    Manage functionality on the devices page:
    - Open and close modals
    - Refresh the device list
    - Delete sites and devices
    - Edit sites and devices
    - Download configuration files
    - Add sites and devices
    - Show a confirmation modal before deleting

    Modal list:
    - Add Device modal
    - Add Site modal
    - Edit Device modal
    - Edit Site modal
    - Confirm modal
*/

// Get modals as variables
let devModal = document.getElementById("deviceModal");                      // Add device modal
let siteModal = document.getElementById("siteModal");                       // Add site modal
let devEditModal = document.getElementById("deviceEditModal");              // Edit device modal
let siteEditModal = document.getElementById("siteEditModal");               // Edit site modal

// Get all buttons as variables
let siteBtn = document.getElementById("add_site");                          // Add site button
let devBtn = document.getElementById("add_device");                         // Add device button
let siteRefreshBtn = document.getElementById("refresh_site");               // Refresh site list button
let devRefreshBtn = document.getElementById("refresh_device");              // Refresh device list button
let closeButtons = document.getElementsByClassName("close");                // Regular close buttons
let siteSubmitBtn = document.getElementById("siteSubmit");                  // Submit button in 'add site' modal
let siteEditSubmitBtn = document.getElementById("siteEditSubmit");          // Submit button in 'edit site' modal
let deviceSubmitBtn = document.getElementById("deviceSubmit");              // Submit button in 'add device' modal
let deviceEditSubmitBtn = document.getElementById("deviceEditSubmit");      // Submit button in 'edit device' modal

// Event listeners
devBtn.addEventListener('click', () => openModal(devModal));                // Add device button
siteBtn.addEventListener('click', () => openModal(siteModal));              // Add site button
devRefreshBtn.addEventListener('click', refreshPageAndReload);              // Refresh device list button
siteRefreshBtn.addEventListener('click', refreshPageAndReload);             // Refresh site list button

for (let i = 0; i < closeButtons.length; i++) {                             // 'x' close buttons
    closeButtons[i].onclick = closeModal;
}

setupDeleteButton('.site-delete-button', '/api/site?action=delete');        // Delete site buttons
setupDeleteButton('.device-delete-button', '/api/device?action=delete');               // Delete device buttons

siteSubmitBtn.addEventListener(                                             // Add site submit button
    'click', (event) => handleSubmitButtonClick(event, '/api/site?action=add', siteSubmitBtn)
);
siteEditSubmitBtn.addEventListener(                                         // Edit site submit button
    'click', (event) => handleSubmitButtonClick(event, '/api/site?action=update', siteEditSubmitBtn)
);
deviceSubmitBtn.addEventListener(                                           // Add device submit button
    'click', (event) => handleSubmitButtonClick(event, '/api/device?action=add', deviceSubmitBtn)
);
deviceEditSubmitBtn.addEventListener(                                       // Edit device submit button
    'click', (event) => handleSubmitButtonClick(event, '/api/device?action=update', deviceEditSubmitBtn)
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

document.addEventListener('DOMContentLoaded', function () {                  // Attach event listener to each collapsible header
    let collapsibleHeaders = document.querySelectorAll('.collapsible-header');
    collapsibleHeaders.forEach(function (header) {
        header.addEventListener('click', toggleCollapsibleContent);
    });
});

document.getElementById('confirmDelete').addEventListener('click', function () {     // Event listener for the 'Delete' button inside the confirm modal
    const objectId = this.getAttribute('data-object-id');
    const deleteUrl = this.getAttribute('data-delete-url');

    handleDelete(deleteUrl, objectId);
    closeConfirmModal();
});

document.getElementById('confirmCancel').addEventListener('click', function () {     // Event listener for the 'Cancel' button inside the confirm modal
    closeConfirmModal();
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

    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';

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
            // Hide loading spinner when the response is received
            document.getElementById('loadingSpinner').style.display = 'none';

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
        .catch(error => {
            // Hide loading spinner when the response is received
            document.getElementById('loadingSpinner').style.display = 'none';
            console.error('Error:', error)
        });

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
    fetch('/api/site?action=refresh')
        .then(response => {
            // Hide loading spinner when the response is received
            document.getElementById('loadingSpinner').style.display = 'none';

            // Check if the response is OK and reload the page
            if (response.ok) {
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
 * If this is the Add Device modal, load up the site list in the dropdown
 * @param {*} modal 
 */
function openModal(modal) {
    // Get the site list, for use with adding devices
    fetch('/api/site?action=list')
        .then(response => response.json())
        .then(data => {
            // Get the dropdown item, and clear it first
            const dropdown = document.getElementById('siteMember');
            dropdown.innerHTML = '';
            dropdown.add(new Option("Select a site", ""));

            // Populate dropdown with sites
            data.forEach(site => {
                const option = new Option(site['site_name'], site['site_id']);
                dropdown.add(option);
            });
        })
        .catch(error => console.error(error));

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
 * Function to set up delete buttons with a confirmation modal
 * @param {*} selector 
 * @param {*} deleteUrl 
 */
function setupDeleteButton(selector, deleteUrl) {
    // Attach event listener to each delete button
    document.querySelectorAll(selector).forEach(button => {
        button.addEventListener('click', function (event) {
            // Get the objectId from the button's data-id attribute (the thing we want to delete)
            let objectId = event.currentTarget.getAttribute(`data-id`);

            // Show the confirmation modal
            showConfirmModal(objectId, deleteUrl);
        });
    });
}


/**
 * Show the confirmation modal for deleting a site or device
 * @param {*} objectId 
 * @param {*} deleteUrl 
 */
function showConfirmModal(objectId, deleteUrl) {
    // Display the modal
    document.getElementById('confirmModal').style.display = 'block';

    // Set objectId and deleteUrl as attributes of the confirm delete button
    // These are the details we need to delete the object
    const confirmDeleteButton = document.getElementById('confirmDelete');
    confirmDeleteButton.setAttribute('data-object-id', objectId);
    confirmDeleteButton.setAttribute('data-delete-url', deleteUrl);
}


/**
 * Close the modal when needed
 */
function closeConfirmModal() {
    document.getElementById('confirmModal').style.display = 'none';
}


/**
 * Function to handle the delete operation for sites and devices
 * @param {*} deleteUrl
 * @param {*} objectId
 */
function handleDelete(deleteUrl, objectId) {
    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';

    // POST to the delete URL with the objectId
    fetch(deleteUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ objectId }),
    })
        .then(response => response.json())
        .then(data => {
            // Hide loading spinner when the response is received
            document.getElementById('loadingSpinner').style.display = 'none';

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
        .catch(error => {
            // Hide loading spinner when the response is received
            document.getElementById('loadingSpinner').style.display = 'none';
            console.error('Error:', error);
        });
}


/**
 * Open the site edit modal and populate the input fields with the site data
 * @param {*} event 
 */
function openSiteEditModal(event) {
    // Directly use event.currentTarget to get the 'data-site-id' and 'data-site-name'
    let siteId = event.currentTarget.getAttribute('data-id');
    let siteName = event.currentTarget.getAttribute('data-site-name');

    // Select the input fields by their name attribute
    const siteEditIdInput = document.querySelector('input[name="siteEditId"]');
    const siteEditNameInput = document.querySelector('input[name="siteEditName"]');

    // Populate the input fields with siteId and siteName
    siteEditIdInput.value = siteId;
    siteEditNameInput.value = siteName;

    // Display the modal
    siteEditModal.style.display = "block";
}


/**
 * Open the device edit modal and populate the input fields with the device data
 * Gets the site list and populates the dropdown
 * Finds the matching site and pre-selects it in the dropdown
 * 
 * @param {*} event 
 */
function openDeviceEditModal(event) {
    // Get the site list, for use with adding devices
    fetch('/api/site?action=list')
        .then(response => response.json())
        .then(data => {
            // Get the dropdown item, and clear it first
            const dropdown = document.getElementById('siteMemberEdit');
            dropdown.innerHTML = '';
            dropdown.add(new Option("Select a site", ""));

            // Populate dropdown with sites
            data.forEach(site => {
                const option = new Option(site['site_name'], site['site_id']);
                dropdown.add(option);
            });
        })
        .catch(error => console.error(error));

    // Directly use event.currentTarget to get the device attributes
    let deviceId = event.currentTarget.getAttribute('data-id');
    let deviceName = event.currentTarget.getAttribute('data-device-name');
    let deviceHostname = event.currentTarget.getAttribute('data-device-hostname');
    let deviceKey = event.currentTarget.getAttribute('data-device-key');
    let deviceSite = event.currentTarget.getAttribute('data-device-site');

    // Select the input fields
    const deviceEditIdInput = document.querySelector('input[name="deviceEditId"]');
    const deviceEditNameInput = document.querySelector('input[name="deviceEditName"]');
    const deviceHostNameInput = document.querySelector('input[name="hostNameEdit"]');
    const deviceKeyNameInput = document.querySelector('input[name="apiKeyEdit"]');

    // Select the dropdown element
    const dropdown = document.getElementById('siteMemberEdit');

    // Populate the input fields
    deviceEditIdInput.value = deviceId;
    deviceEditNameInput.value = deviceName;
    deviceHostNameInput.value = deviceHostname;
    deviceKeyNameInput.value = deviceKey;

    // Convert dropdown.options to an array and then loop through each option
    // A slight timeout is needed for asynchronous reasons
    setTimeout(() => {
        Array.from(dropdown.options).forEach(option => {
            if (option.value === deviceSite) {
                option.selected = true;
            }
        });
    }, 500)

    // Display the modal
    devEditModal.style.display = "block";
}


/** 
 * Download configuration files for devices
 * Calls the /api/device endpoint to get the configuration file
 * @param {*} event
 */
function downloadDeviceConfig(event) {
    // Get the device ID from the button's data-id attribute
    let deviceId = event.currentTarget.getAttribute('data-id');

    // Show loading spinner
    document.getElementById('loadingSpinner').style.display = 'block';

    // POST to the download_config endpoint with the deviceId
    fetch('/api/device?action=download', {
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

            // Hide loading spinner when the response is received
            document.getElementById('loadingSpinner').style.display = 'none';
        })

        // Log any errors to the console
        .catch(error => {
            console.error('Error:', error)
            document.getElementById('loadingSpinner').style.display = 'none';
        });
}


/**
 * Collapse and expand the content of the collapsible cards
 * @param {*} event 
 */
function toggleCollapsibleContent(event) {
    // Determine the type of cards to toggle based on the header clicked
    let cardType = this.getAttribute('data-card-type');
    let cardsToToggle = document.querySelectorAll('.' + cardType);

    // Toggle the visibility of the corresponding cards
    cardsToToggle.forEach(function (card) {
        card.classList.toggle('collapsible-content');
    });

    // Toggle the rotation of the icon within the clicked header
    let collapseIcon = this.querySelector('.collapse-icon');
    if (collapseIcon) {
        collapseIcon.classList.toggle('rotate-icon');
    }
}
