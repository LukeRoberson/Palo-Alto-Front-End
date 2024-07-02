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
attachFormSubmitListener(document.getElementById('settings-sql'), '/save_sql');
attachFormSubmitListener(document.getElementById('settings-web'), '/save_web');

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
