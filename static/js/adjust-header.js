/*
    Dynamically adjust the body's margin-top to match the header's height
*/

// Function to adjust the body's margin-top to match the header's height
function adjustBodyMargin() {
    // Calculate the header's height
    var headerHeight = document.querySelector('.header').offsetHeight;
    // Set the body's margin-top to match the header's height
    document.body.style.marginTop = headerHeight + 'px';
}

// Adjust the margin when the page loads
window.onload = adjustBodyMargin;

// Adjust the margin whenever the window is resized
window.onresize = adjustBodyMargin;
document.querySelector('#main-content').style.paddingTop = '50px';
