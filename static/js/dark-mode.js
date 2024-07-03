// Applies a theme based on whatever has been saved in local storage
function applySavedTheme() {
    // Read the saved theme and put in variable
    const currentTheme = localStorage.getItem("theme");

    // Apply the theme to the body, defaulting to light-mode if no theme is saved
    if (currentTheme === "dark-mode") {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
    } else {
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
    }

    // Ensure the toggle switch matches the current theme
    updateToggleSwitch(currentTheme);
}

function toggleDarkMode() {
    const isChecked = modeToggle.checked; // Assuming modeToggle is your checkbox
    if (isChecked) {
        // Enable dark mode
        applyTheme("dark-mode");
    } else {
        // Disable dark mode
        applyTheme("light-mode");
    }
}

function applyTheme(theme) {
    // Apply theme to body
    document.body.classList.toggle("dark-mode", theme === "dark-mode");
    document.body.classList.toggle("light-mode", theme === "light-mode");
    
    // Apply theme to .w3-container
    const containers = document.querySelectorAll('.w3-container');
    containers.forEach(container => {
        container.classList.toggle("dark-mode", theme === "dark-mode");
        container.classList.toggle("light-mode", theme === "light-mode");
    });

    // Save theme to localStorage
    localStorage.setItem("theme", theme);
}

// Update the toggle switch based on the current theme
function updateToggleSwitch(currentTheme) {
    // Get the toggle switch
    const modeToggle = document.getElementById('mode-toggle');
    
    // Set the switch
    modeToggle.checked = currentTheme === "dark-mode";
}

// Ensure the DOM is fully loaded before executing any script
document.addEventListener('DOMContentLoaded', applySavedTheme);

// Assuming modeToggle is statically defined in the HTML
const modeToggle = document.getElementById('mode-toggle');
modeToggle.addEventListener('change', toggleDarkMode);
