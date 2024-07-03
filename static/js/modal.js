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

// When the user clicks the button, open the modal 
devBtn.onclick = function() {
  devModal.style.display = "block";
}
siteBtn.onclick = function() {
  siteModal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  devModal.style.display = "none";
  siteModal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    devModal.style.display = "none";
    siteModal.style.display = "none";
  }
}
