// Function to attach a submit event listener to a form
function attachFormSubmitListener(formElement, endpoint) {
    formElement.addEventListener('submit', function(e) {
        e.preventDefault();

        const formData = new FormData(this);

        fetch(endpoint, {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            // Check the 'result' field and display the message with appropriate color
            if (data.result === 'Success') {
                showNotification(data.message, 'Success');
            } else if (data.result === 'Failure') {
                showNotification(data.message, 'Failure');
            }
        })
        .catch(error => console.error('Error:', error));
    });
}

// Attach the event listener to each form
attachFormSubmitListener(document.getElementById('settings-azure'), '/save_azure');
attachFormSubmitListener(document.getElementById('settings-web'), '/save_web');

// Function to attach a click event listener to a button
function attachButtonClickListener(buttonId, endpoint) {
    const button = document.getElementById(buttonId); // Correctly get the button element
    if (!button) {
        console.error('Button not found:', buttonId);
        return;
    }

    button.addEventListener('click', function(event) {
        event.preventDefault();

        // Assuming the form is the parent of the button
        // This might need adjustment based on your HTML structure
        const form = this.closest('form');
        if (!form) {
            console.error('Form not found for button:', buttonId);
            return;
        }

        const formData = new FormData(form);

        fetch(endpoint, {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
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
        .catch(error => console.error('Error:', error));
    });
}
attachButtonClickListener('saveSql', '/save_sql');
attachButtonClickListener('testSql', '/test_sql');

// Pop up a notification message at the bottom right of the screen
function showNotification(message, type) {
    const notification = document.createElement('div');
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
