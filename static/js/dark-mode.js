// Applies a theme based on whatever has been saved in local storage
function applySavedTheme() {
    // Read the saved theme and put in variable
    const currentTheme = localStorage.getItem("theme");

    // Apply the theme to the body, defaulting to light-mode if no theme is saved
    if (currentTheme === "dark-mode") {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
        modeToggle.checked = true;
    } else {
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
        modeToggle.checked = false;
    }
}

function toggleDarkMode() {
    if (modeToggle.checked) {
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");

        localStorage.setItem("theme", "dark-mode");
    } else {
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");

        localStorage.setItem("theme", "light-mode");
    }
}

// Ensure the DOM is fully loaded before executing any script
document.addEventListener('DOMContentLoaded', applySavedTheme);

// Assuming modeToggle is statically defined in the HTML
const modeToggle = document.getElementById('mode-toggle');
modeToggle.addEventListener('change', toggleDarkMode);
