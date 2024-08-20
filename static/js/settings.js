/*
    Manage functionality on the devices page:
    - Attach event listeners to the forms
    - Functions to handle form submissions
*/


// Event listners for the forms
attachButtonClickListener('saveAzure', '/save_azure');
attachButtonClickListener('saveSql', '/save_sql');
attachButtonClickListener('testSql', '/test_sql');
attachButtonClickListener('saveWeb', '/save_web');



/**
 * Handle clicks on buttons by sending a POST request to the server
 * A different endpoint is used for each button
 * @param {*} buttonId 
 * @param {*} endpoint 
 * @returns 
 */
function attachButtonClickListener(buttonId, endpoint) {
    // Get the button by ID
    const button = document.getElementById(buttonId);

    // Sanity check to see if the button exists
    if (!button) {
        console.error('Button not found:', buttonId);
        return;
    }

    // Register the listener for the button
    button.addEventListener('click', function (event) {
        // Prevent the default form submission
        event.preventDefault();

        // Get the form that contains the button
        const form = this.closest('form');
        if (!form) {
            console.error('Form not found for button:', buttonId);
            return;
        }

        // Get the form data
        const formData = new FormData(form);

        // Send a POST request to the server
        fetch(endpoint, {
            method: 'POST',
            body: formData,
        })
            .then(response => {
                // Check the response status
                if (!response.ok) {
                    showNotification('REST API Failure', 'Failure');
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Check the 'result' field and display the message with appropriate color
                if (data.result === 'Success') {
                    showNotification(data.message, 'Success');
                } else if (data.result === 'Failure') {
                    showNotification(data.message, 'Failure');
                }
            })

            // Catch any errors and log them to the console
            .catch(error => console.error('Error:', error));
    });
}
