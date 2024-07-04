// Get the modal
var devModal = document.getElementById("deviceModal");
var siteModal = document.getElementById("siteModal");

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
        } else if (data.result === 'Failure') {
            showNotification(data.message, 'Failure');
        }
    })
    .catch(error => console.error('Error:', error));

    // Close the open modal
    devModal.style.display = "none";
    siteModal.style.display = "none";

    // Reload the page to update the site list
    location.reload();location.reload();
});

// Add event listener for submit button in 'add device' modal
var siteSubmitBtn = document.getElementById("deviceSubmit");
siteSubmitBtn.addEventListener("click", function(event) {
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
        } else if (data.result === 'Failure') {
            showNotification(data.message, 'Failure');
        }
    })
    .catch(error => console.error('Error:', error));

    // Close the open modal
    devModal.style.display = "none";
    siteModal.style.display = "none";

    // Reload the page to update the device list
    location.reload();location.reload();
});

// When the user clicks the button, open the modal 
devBtn.onclick = function() {
  devModal.style.display = "block";
}
siteBtn.onclick = function() {
  siteModal.style.display = "block";
}

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
                // Reload the page to update the site list
                location.reload();location.reload();
            } else if (data.result === 'Failure') {
                showNotification(data.message, 'Failure');
            }
        })
        .catch(error => console.error('Error:', error));

    });
});

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
                // Reload the page to update the site list
                location.reload();location.reload();
            } else if (data.result === 'Failure') {
                showNotification(data.message, 'Failure');
            }
        })
        .catch(error => console.error('Error:', error));
    });
});
