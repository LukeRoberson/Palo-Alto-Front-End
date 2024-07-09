/*
    Manage all modals (pop-up windows) and their associated buttons

    Modal list:
    - Add Device modal
    - Add Site modal
    - Edit Device modal
    - Edit Site modal
*/

// Get modals as global variables
var devModal = document.getElementById("deviceModal");
var siteModal = document.getElementById("siteModal");
var devEditModal = document.getElementById("deviceEditModal");
var siteEditModal = document.getElementById("siteEditModal");

// Get the buttons that open the modals, and add event listeners
var devBtn = document.getElementById("add_device");
var siteBtn = document.getElementById("add_site");
devBtn.addEventListener('click', () => openModal(devModal));
siteBtn.addEventListener('click', () => openModal(siteModal));

// Function to open a modal
function openModal(modal) {
    modal.style.display = "block";
}

// Get all <span> elements (close 'x') that closes modals, and add event listeners
var closeButtons = document.getElementsByClassName("close");
for (var i = 0; i < closeButtons.length; i++) {
    closeButtons[i].onclick = closeModal;
}

// Function to close the modal
function closeModal() {
    var modal = this.parentElement.parentElement;
    modal.style.display = "none";
}







// Add event listener for submit button in 'add site' modal
var siteSubmitBtn = document.getElementById("siteSubmit");
siteSubmitBtn.addEventListener("click", function(event) {
    event.preventDefault();

    const form = this.closest('form');
    if (!form) {
        console.error('Form not found for button:', buttonId);
        return;
    }

    const formData = new FormData(form);

    fetch('/add_site', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        // Check the 'result' field and display the message with appropriate color
        if (data.result === 'Success') {
            showNotification(data.message, 'Success');

            // Delay the reload slightly to allow the user to see the message
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

    // Reload the page to update the site list
    // location.reload();
});

// Add event listener for submit button in 'add device' modal
var deviceSubmitBtn = document.getElementById("deviceSubmit");
deviceSubmitBtn.addEventListener("click", function(event) {
    event.preventDefault();

    const form = this.closest('form');
    if (!form) {
        console.error('Form not found for button:', buttonId);
        return;
    }

    const formData = new FormData(form);

    fetch('/add_device', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        // Check the 'result' field and display the message with appropriate color
        if (data.result === 'Success') {
            showNotification(data.message, 'Success');
            
            // Delay the reload slightly to allow the user to see the message
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

    // Reload the page to update the device list
    location.reload();
});

// Button to delete sites
document.querySelectorAll('.site-delete-button').forEach(button => {
    button.addEventListener('click', function(event) {
        // Directly use event.currentTarget to get the 'data-site-id'
        var siteId = event.currentTarget.getAttribute('data-site-id');
        
        fetch('/delete_site', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ siteId }),
        })
        .then(response => response.json())
        .then(data => {
            // Check the 'result' field and display the message with appropriate color
            if (data.result === 'Success') {
                showNotification(data.message, 'Success');

                // Delay the reload slightly to allow the user to see the message
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else if (data.result === 'Failure') {
                showNotification(data.message, 'Failure');
            }
        })
        .catch(error => console.error('Error:', error));
    });
});

// Button to delete devices
document.querySelectorAll('.device-delete-button').forEach(button => {
    button.addEventListener('click', function(event) {
        // Directly use event.currentTarget to get the 'data-device-id'
        var deviceId = event.currentTarget.getAttribute('data-device-id');
        
        fetch('/delete_device', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deviceId }),
        })
        .then(response => response.json())
        .then(data => {
            // Check the 'result' field and display the message with appropriate color
            if (data.result === 'Success') {
                showNotification(data.message, 'Success');

                // Delay the reload slightly to allow the user to see the message
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else if (data.result === 'Failure') {
                showNotification(data.message, 'Failure');
            }
        })
        .catch(error => console.error('Error:', error));
    });
});

// Button to edit sites - Pop up the modal
document.querySelectorAll('.site-edit-button').forEach(button => {
    button.addEventListener('click', function(event) {
        // Directly use event.currentTarget to get the 'data-site-id' and 'data-site-name'
        var siteId = event.currentTarget.getAttribute('data-site-id');
        var siteName = event.currentTarget.getAttribute('data-site-name');

        // Select the input fields by their name attribute
        const siteEditIdInput = document.querySelector('input[name="siteEditId"]');
        const siteEditNameInput = document.querySelector('input[name="siteEditName"]');
        
        // Populate the input fields with siteId and siteName
        siteEditIdInput.value = siteId;
        siteEditNameInput.value = siteName;

        // Display the modal
        siteEditModal.style.display = "block";
    });
});

// Button to edit devices - Pop up the modal
document.querySelectorAll('.device-edit-button').forEach(button => {
    button.addEventListener('click', function(event) {
        // Directly use event.currentTarget to get the 'data-device-id'
        var deviceId = event.currentTarget.getAttribute('data-device-id');
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
        
        devEditModal.style.display = "block";
    });
});

// Add event listener for submit button in 'edit site' modal
var siteSubmitBtn = document.getElementById("siteEditSubmit");
siteSubmitBtn.addEventListener("click", function(event) {
    event.preventDefault();

    const form = this.closest('form');
    if (!form) {
        console.error('Form not found for button:', buttonId);
        return;
    }

    const formData = new FormData(form);

    fetch('/update_site', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        // Check the 'result' field and display the message with appropriate color
        if (data.result === 'Success') {
            showNotification(data.message, 'Success');

            // Delay the reload slightly to allow the user to see the message
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
});

// Add event listener for submit button in 'edit device' modal
var siteSubmitBtn = document.getElementById("deviceEditSubmit");
siteSubmitBtn.addEventListener("click", function(event) {
    event.preventDefault();

    const form = this.closest('form');
    if (!form) {
        console.error('Form not found for button:', buttonId);
        return;
    }

    const formData = new FormData(form);

    fetch('/update_device', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        // Check the 'result' field and display the message with appropriate color
        if (data.result === 'Success') {
            showNotification(data.message, 'Success');

            // Delay the reload slightly to allow the user to see the message
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
});

// Button to download configuration file
document.querySelectorAll('.device-download-button').forEach(button => {
    button.addEventListener('click', function(event) {
        var deviceId = event.currentTarget.getAttribute('data-device-id');
        
        fetch('/download_config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ deviceId }),
        })
        .then(response => {
            // Extract filename from the custom header
            const filename = response.headers.get('X-Filename') || 'default_filename.xml';
            return response.blob().then(blob => ({ blob, filename }));
        })
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
        .catch(error => console.error('Error:', error));
    });
});
