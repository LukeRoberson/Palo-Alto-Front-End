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
});

// When the user clicks the button, open the modal 
devBtn.onclick = function() {
  devModal.style.display = "block";
}
siteBtn.onclick = function() {
  siteModal.style.display = "block";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    devModal.style.display = "none";
    siteModal.style.display = "none";
  }
}
