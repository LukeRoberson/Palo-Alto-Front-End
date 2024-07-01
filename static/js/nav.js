function toggleNav() {
    var nav = document.getElementById("navBar");
    nav.classList.toggle("collapsed");
    navBar.classList.toggle('shrink');
    adjustContentMargin();
}
// Function to adjust the main content's left margin to the nav bar's width
function adjustContentMargin() {
    const navBar = document.querySelector('.nav-bar');
    const mainContent = document.querySelector('#main-content');
    const isCollapsed = navBar.classList.contains('collapsed');
  
    if (navBar && mainContent) {
        // Controls the width of the nav bar
        let navWidth;
        
        // Hide the nav bar
        if (isCollapsed) {
            navWidth = 50;
        
        // Expand the nav bar
        } else {
            navWidth = 250;
        }

        // Set the left margin of the main content
        mainContent.style.paddingLeft = `${navWidth}px`;
    }
}
  
// Adjust the margin initially
adjustContentMargin();
  
// Adjust the margin whenever the window is resized
window.addEventListener('resize', adjustContentMargin);
document.querySelector('#main-content').style.paddingTop = '50px';
