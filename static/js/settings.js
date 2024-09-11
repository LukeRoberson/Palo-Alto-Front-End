/*
    Manage functionality on the devices page:
    - Attach event listeners to the forms
    - Functions to handle form submissions
*/


// Event listners for the forms and buttons
attachButtonClickListener('saveAzure', '/api/azure?action=save');
attachButtonClickListener('saveSql', '/api/sql?action=save');
attachButtonClickListener('testSql', '/api/sql?action=test');
attachButtonClickListener('saveWeb', '/api/web?action=save');

// Master PW button and modal
document.addEventListener('DOMContentLoaded', (event) => {
    let pwModal = document.getElementById("pwModal");
    let pwResetBtn = document.getElementById("resetMasterPw");
    let pwSaveBtn = document.getElementById("saveMasterPw");

    // Display the modal
    if (pwResetBtn) {
        pwResetBtn.addEventListener('click', () => {
            const randomString = generateRandomString(64);
            const input = document.getElementById('masterPassword');
            input.value = randomString;
            pwModal.style.display = "block"
        });
    } else {
        console.error('Button with ID "resetMasterPw" not found');
    }

    // Proceed to reset password
    if (pwResetBtn) {
        pwSaveBtn.addEventListener('click', () => {
            // Get the master password from the input field
            const masterPassword = document.getElementById('masterPassword').value;

            // Show loading spinner
            document.getElementById('loadingSpinner').style.display = 'block';

            // API call to reset password
            fetch('/api/device?action=reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password: masterPassword }),
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
                .catch(error => console.error('Error:', error))
                .finally(() => {
                    // Hide loading spinner and modal
                    document.getElementById('loadingSpinner').style.display = 'none';
                    pwModal.style.display = "none";
                    alert('Please remember to save the new master password, and update config.yaml\n\n' + masterPassword);
                });
        });
    } else {
        console.error('Button with ID "saveMasterPw" not found');
    }
});

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


function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
