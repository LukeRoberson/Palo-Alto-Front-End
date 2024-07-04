// Get the modal
var devModal = document.getElementById("deviceModal");
var siteModal = document.getElementById("siteModal");
var devEditModal = document.getElementById("deviceEditModal");
var siteEditModal = document.getElementById("siteEditModal");

// Get the button that opens the modal
var devBtn = document.getElementById("add_device");
var siteBtn = document.getElementById("add_site");

// Get the <span> element that closes the modal
var closeButtons = document.getElementsByClassName("close");

// Iterate over all close buttons to add click event listeners
for (var i = 0; i < closeButtons.length; i++) {
  closeButtons[i].onclick = function() {
      // Assuming each close button is a direct child of the modal content
      // which is a direct child of the modal itself
      var modal = this.parentElement.parentElement;
      modal.style.display = "none";
  }
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

// When the user clicks the button, open the modal 
devBtn.onclick = function() {
  devModal.style.display = "block";
}

siteBtn.onclick = function() {
  siteModal.style.display = "block";
}

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
