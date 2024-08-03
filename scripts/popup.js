// Utility function to initialize and display messages
function initializeMessage() {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = 'Logger window...'; // Default message
        messageElement.style.color = 'gray';
    } else {
        console.error('Message element not found');
    }
}

// Utility function to display messages with HTML content
function displayMessage(message, color = 'black') {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.innerHTML = message.replace(/\n/g, '<br>'); // Convert new lines to <br>
        messageElement.style.color = color;
    } else {
        console.error('Message element not found');
    }
}

// Initialize the default message when the page loads
document.addEventListener('DOMContentLoaded', initializeMessage);

// Auto Sync Checkbox
document.getElementById('auto-sync-checkbox').addEventListener('change', (event) => {
    saveCheckboxState(event.target.checked);
    if (event.target.checked == true) {
        displayMessage('Auto Sync Enabled.<br>Click Submit on Leetcode for auto sync', 'green')
    }
    else {
        displayMessage('Auto Sync Disabled', 'gray')
    }

});

// Set initial checkbox state
setCheckboxState();

// Save checkbox state
function saveCheckboxState(isChecked) {
    chrome.storage.sync.set({ autoSync: isChecked }, () => {
        console.log('Auto Sync state saved:', isChecked);
    });
}

// Retrieve and set checkbox state
function setCheckboxState() {
    chrome.storage.sync.get(['autoSync'], (result) => {
        const autoSyncCheckbox = document.getElementById('auto-sync-checkbox');
        if (result.autoSync !== undefined) {
            autoSyncCheckbox.checked = result.autoSync;
        }
        if (result.autoSync == true) {
            displayMessage('Auto Sync Enabled.<br>Click Submit on Leetcode for auto sync', 'green');
        }
    });
}

// Check if the user is on the LeetCode website and logged in
const checkLeetCodeTab = (callback) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
            console.error('No active tab found');
            displayMessage('No active tab found.', 'red');
            return;
        }

        const tab = tabs[0];
        console.log('Active tab:', tab);  // Log the active tab details

        if (!tab.url) {
            console.error('Tab URL is undefined');
            displayMessage('Tab URL is undefined.', 'red');
            return;
        }

        let url;
        try {
            url = new URL(tab.url);
        } catch (e) {
            console.error('Invalid URL:', tab.url);
            displayMessage('Invalid URL.', 'red');
            return;
        }

        if (!url.hostname.endsWith('leetcode.com')) {
            console.error('Not on LeetCode website:', url.hostname);
            displayMessage('Please navigate to the LeetCode website.', 'red');
            return;
        }

        // Inject script to check if the user is logged in
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                // Check if the "Sign in" button exists
                return !!document.querySelector('#navbar_sign_in_button');
            }
        }, (results) => {
            if (chrome.runtime.lastError || !results || results.length === 0) {
                console.error('Error injecting script:', chrome.runtime.lastError);
                displayMessage(`Error: ${chrome.runtime.lastError.message}`, 'red');
                return;
            }

            const isNotLoggedIn = results[0].result;
            if (isNotLoggedIn) {
                console.error('User not logged into LeetCode.');
                displayMessage('Error: Please login to LeetCode.', 'red');
                return;
            }

            callback();
        });
    });
};

// Sync Last Submission
document.getElementById('sync-last-submission-button').addEventListener('click', () => {
    checkLeetCodeTab(() => {
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
});

// Sync Last 20 Submissions
document.getElementById('sync-last-20-submissions-button').addEventListener('click', () => {
    checkLeetCodeTab(() => {
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
    settingsModal.style.top = `${window.scrollY}px`;
});

closeButton.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});
