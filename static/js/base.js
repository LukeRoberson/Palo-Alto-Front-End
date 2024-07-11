/*
    Base functions for all pages

    Dynamically adjust the body's margin-top to match the header's height
    Manage the navigation bar
*/

// Adjust the margins of the header and nav bar when the page loads or is resized
document.addEventListener('DOMContentLoaded', adjustBodyMargin);
document.addEventListener('DOMContentLoaded', adjustContentMargin);
window.addEventListener('resize', adjustContentMargin);
window.addEventListener('resize', adjustBodyMargin);


/**
 * Adjust the body's margin-top to match the header's height
 */
function adjustBodyMargin() {
    // Calculate the header's height
    var headerHeight = document.querySelector('.header').offsetHeight;
 
    // Set the body's margin-top to match the header's height
    document.body.style.marginTop = headerHeight + 'px';
}


/**
 * Adjust the main content's left margin to match the nav bar's width
 */
function adjustContentMargin() {
    // Get the nav bar and main content
    const navBar = document.querySelector('.nav-bar');
    const mainContent = document.querySelector('#main-content');
    const isCollapsed = navBar.classList.contains('collapsed');
  
    // 'if' to check if the navBar and mainContent exist (fully loaded)
    if (navBar && mainContent) {
        // Set navWidth based on whether the navBar is collapsed, using a ternary operator
        let navWidth = isCollapsed ? 50 : 250;

        // Set the left margin of the main content
        mainContent.style.paddingLeft = `${navWidth}px`;
    }
}


/**
 * Toggle between collapsed and expanded nav bar
 * Referenced directly in base.html
 * 
 * Called when the user clicks the hamburger icon
 */
function toggleNav() {
    // Get the nav bar and main content
    var nav = document.getElementById("navBar");

    // Toggle the 'collapsed' class on the nav bar
    nav.classList.toggle("collapsed");
    navBar.classList.toggle('shrink');

    // Adjust the main content's left margin
    adjustContentMargin();
}
