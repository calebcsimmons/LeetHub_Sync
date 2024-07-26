// Utility function to display messages
function displayMessage(message, color = 'black') {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.style.color = color;
}

// Sync Last Submission
document.getElementById('sync-last-submission-button').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'syncLastSubmission' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            displayMessage(`Error: ${chrome.runtime.lastError.message}`, 'red');
            return;
        }

        if (response && response.status === 'success') {
            displayMessage('Successfully synced the last submission!', 'green');
        } else if (response && response.status === 'error') {
            console.error('Error from background:', response.message);
            displayMessage(`Error: ${response.message}`, 'red');
        } else {
            console.error('Unexpected response:', response);
            displayMessage('Unexpected response format.', 'red');
        }
    });
});

// Sync Last 20 Submissions
document.getElementById('sync-last-20-submissions-button').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'syncLast20Submissions' }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            displayMessage(`Error: ${chrome.runtime.lastError.message}`, 'red');
            return;
        }

        if (response && response.status === 'success') {
            displayMessage('Successfully synced the last 20 submissions!', 'green');
        } else if (response && response.status === 'error') {
            console.error('Error from background:', response.message);
            displayMessage(`Error: ${response.message}`, 'red');
        } else {
            console.error('Unexpected response:', response);
            displayMessage('Unexpected response format.', 'red');
        }
    });
});

// Update Config
document.getElementById('update-config-button').addEventListener('click', () => {
    const githubToken = document.getElementById('github-token').value.trim();
    const repoUrl = document.getElementById('repo-url').value.trim();
    const updateMessage = document.getElementById('update-message');

    if (githubToken && repoUrl) {
        chrome.runtime.sendMessage({ action: 'updateConfig', githubToken, repoUrl }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                updateMessage.textContent = `Error: ${chrome.runtime.lastError.message}`;
                updateMessage.style.color = 'red';
                return;
            }

            if (response.status === 'success') {
                console.log('Response from background:', response.data);
                updateMessage.textContent = 'Configuration updated successfully!';
                updateMessage.style.color = 'green';
                setTimeout(() => {
                    settingsModal.style.display = 'none';
                    updateMessage.textContent = '';
                }, 2000);
            } else {
                console.error('Error updating configuration:', response.message);
                updateMessage.textContent = `Error: ${response.message}`;
                updateMessage.style.color = 'red';
            }
        });
    } else {
        updateMessage.textContent = 'Please enter both GitHub Token and Repo URL.';
        updateMessage.style.color = 'red';
    }
});

// Settings modal
const settingsModal = document.getElementById('settings-modal');
const settingsButton = document.getElementById('settings-button');
const closeButton = document.querySelector('.close');

settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'block';
    settingsModal.style.top = `${window.scrollY}px`; // Align with the current scroll position
});

closeButton.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});
