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
    let repoUrl = document.getElementById('repo-url').value.trim();
    if (repoUrl.endsWith('.git')) {
        repoUrl = repoUrl.slice(0, -4);
    }
    const updateMessage = document.getElementById('update-message');

    chrome.storage.local.get(['GITHUB_TOKEN', 'REPO_URL'], (result) => {
        const existingToken = result.GITHUB_TOKEN || '';
        const existingRepoUrl = result.REPO_URL || '';

        // Ensure at least one field is provided
        if (!githubToken && !repoUrl) {
            updateMessage.textContent = 'Please enter at least one of GitHub Token or Repo URL.';
            updateMessage.style.color = 'red';
            return;
        }

        // Determine the new values
        const newToken = githubToken || existingToken;
        const newRepoUrl = repoUrl || existingRepoUrl;

        chrome.runtime.sendMessage({ action: 'updateConfig', githubToken: newToken, repoUrl: newRepoUrl }, (response) => {
            if (chrome.runtime.lastError) {
                console.error('Error sending message:', chrome.runtime.lastError);
                updateMessage.textContent = `Error: ${chrome.runtime.lastError.message}`;
                updateMessage.style.color = 'red';
                return;
            }

            if (response.status === 'success') {
                console.log('Response from background:', response.data);

                if (githubToken && !repoUrl) {
                    updateMessage.textContent = 'GitHub Token updated successfully!';
                    updateMessage.style.color = 'green';
                } else if (!githubToken && repoUrl) {
                    updateMessage.textContent = 'GitHub Repository URL updated successfully!';
                    updateMessage.style.color = 'green';
                } else {
                    updateMessage.textContent = 'Configuration updated successfully!';
                    updateMessage.style.color = 'green';
                }

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
    });
});

// Function to toggle token visibility
document.getElementById('toggle-token-visibility').addEventListener('click', () => {
    const githubTokenInput = document.getElementById('github-token');
    const isVisible = githubTokenInput.dataset.visible === 'true';

    if (isVisible) {
        // Switch to masked
        githubTokenInput.value = '*'.repeat(githubTokenInput.dataset.fullToken.length);
        document.getElementById('toggle-token-visibility').textContent = '👁️';
        githubTokenInput.dataset.visible = 'false';
    } else {
        // Switch to visible
        githubTokenInput.value = githubTokenInput.dataset.fullToken;
        document.getElementById('toggle-token-visibility').textContent = '🙈';
        githubTokenInput.dataset.visible = 'true';
    }
});

// Restore the visibility state on page load
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get('tokenVisible', (result) => {
        const tokenInput = document.getElementById('github-token');
        const toggleIcon = document.getElementById('toggle-token-visibility');

        if (result.tokenVisible) {
            tokenInput.type = 'text';
            toggleIcon.textContent = '👁️'; // Show the token
        } else {
            tokenInput.type = 'password';
            toggleIcon.textContent = '🙈'; // Hide the token
        }
    });
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

// Function to load settings from storage and populate the modal
const loadSettings = () => {
    chrome.storage.local.get(['GITHUB_TOKEN', 'REPO_URL'], (result) => {
        const githubTokenInput = document.getElementById('github-token');
        const repoUrlInput = document.getElementById('repo-url');
        const toggleVisibilityIcon = document.getElementById('toggle-token-visibility');

        // Set repository URL if available
        if (result.REPO_URL) {
            repoUrlInput.value = result.REPO_URL;
        }

        // Set GitHub token if available
        if (result.GITHUB_TOKEN) {
            githubTokenInput.dataset.fullToken = result.GITHUB_TOKEN;
            // Display token with asterisks initially
            const maskedToken = '*'.repeat(result.GITHUB_TOKEN.length);
            githubTokenInput.value = maskedToken;
            // Set default visibility to false (hidden)
            githubTokenInput.dataset.visible = 'false';
            
        }
    });
};

// Function to get the unmasked token value
const getUnmaskedToken = () => {
    const githubTokenInput = document.getElementById('github-token');
    return githubTokenInput.value.trim();
};

// Function to open the settings modal
const openSettingsModal = () => {
    loadSettings(); // Load and set stored values
    const modal = document.getElementById('settings-modal');
    modal.style.display = 'block'; // Show the modal
};

// Function to close the settings modal
const closeSettingsModal = () => {
    const modal = document.getElementById('settings-modal');
    modal.style.display = 'none'; // Hide the modal
};

// Event listener for the settings button (replace with your actual button ID)
document.getElementById('settings-button').addEventListener('click', openSettingsModal);

// Event listener for the close button in the modal
document.querySelector('#settings-modal .close').addEventListener('click', closeSettingsModal);

