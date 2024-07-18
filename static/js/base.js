/*
    Base functions for all pages

    Dynamically adjust the body's margin-top to match the header's height
    Manage the navigation bar
    Pop up notifications
    Toggle between light and dark modes
*/

// Adjust the margins of the header and nav bar when the page loads or is resized
document.addEventListener('DOMContentLoaded', adjustBodyMargin);
document.addEventListener('DOMContentLoaded', adjustContentMargin);
window.addEventListener('resize', adjustContentMargin);
window.addEventListener('resize', adjustBodyMargin);

// Apply the saved theme when the page loads (waiting for the DOM to load)
document.addEventListener('DOMContentLoaded', applySavedTheme);

// Event listener for the mode toggle slider
const modeToggle = document.getElementById('mode-toggle');
modeToggle.addEventListener('change', toggleDarkMode);


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


/**
 * Show a notification message on the bottom right page
 * Green for good messages, red for bad
 * 
 * @param {string} message - The message to display.
 * @param {string} type - The type of message (Success or Failure).
 */
function showNotification(message, type) {
    // Create a new div element for the notification
    const notification = document.createElement('div');

    // Set the notification's properties
    notification.textContent = message;
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = 'green';
    notification.style.color = 'white';
    notification.style.padding = '10px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '1000';
    notification.style.opacity = '1';
    notification.style.transition = 'opacity 0.5s ease';

    // Set background color based on message type
    if (type === 'Success') {
        notification.style.backgroundColor = 'green';
    } else if (type === 'Failure') {
        notification.style.backgroundColor = 'red';
    }

    // Append the notification to the body
    document.body.appendChild(notification);

    // Start fade out after 2.5 seconds to complete before removal
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 2500);

    // Remove the notification after 3 seconds
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}


/**
 * Apply the saved theme when the page loads
 * This will depend on the theme saved in local storage (if there is one)
 */
function applySavedTheme() {
    // Read the saved theme from storage and put in variable
    const currentTheme = localStorage.getItem("theme");

    // Apply the theme to the body, defaulting to light-mode if no theme is saved
    if (currentTheme === "dark-mode") {
        document.documentElement.classList.add("dark-mode");
        document.documentElement.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
        modeToggle.checked = true;
    } else {
        document.documentElement.classList.add("light-mode");
        document.documentElement.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
        modeToggle.checked = false;
    }
}


/**
 * Toggle between light and dark mode when the mode toggle is clicked
 * This is shown as a slider, but behind the scenes it's a checkbox
 */
function toggleDarkMode() {
    // If the toggle is checked, add dark-mode class to body and remove light-mode
    if (modeToggle.checked) {
        document.documentElement.classList.add("dark-mode");
        document.documentElement.classList.remove("light-mode");
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
        localStorage.setItem("theme", "dark-mode");
    } else {
        document.documentElement.classList.add("light-mode");
        document.documentElement.classList.remove("dark-mode");
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light-mode");
    }
}
