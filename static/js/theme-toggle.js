document.getElementById('mode-toggle').addEventListener('change', function(event) {
    if (event.target.checked) {
        document.body.classList.replace('light-mode', 'dark-mode');
    } else {
        document.body.classList.replace('dark-mode', 'light-mode');
    }
});
const toggleSwitch = document.getElementById('mode-toggle');
toggleSwitch.addEventListener('change', function() {
// Check if the slider (checkbox) is checked
if (this.checked) {
    // If checked, activate dark mode
    document.body.classList.add('dark-mode');
} else {
    // If not checked, deactivate dark mode
    document.body.classList.remove('dark-mode');
}
});
