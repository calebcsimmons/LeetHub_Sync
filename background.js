// Fetch configuration values from chrome.storage.local
const getConfig = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(['GITHUB_TOKEN', 'REPO_URL'], (items) => {
            if (chrome.runtime.lastError) {
                console.error('Error fetching config:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                resolve(items);
            }
        });
    });
};

// Update configuration values in chrome.storage.local
const updateConfig = async (githubToken, repoUrl) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ GITHUB_TOKEN: githubToken, REPO_URL: repoUrl }, () => {
            if (chrome.runtime.lastError) {
                console.error('Error updating config:', chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
            } else {
                resolve({ status: 'success' });
            }
        });
    });
};

// Fetch submissions from LeetCode
const getSubmissions = async (offset = 0, limit = 30) => {
    const url = `https://leetcode.com/api/submissions/?offset=${offset}&limit=${limit}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'referer': 'https://leetcode.com',
                'origin': 'https://leetcode.com'
            }
        });

        if (response.ok) {
            return await response.json();
        } else {
            throw new Error(`Failed to fetch data. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching submissions:', error);
        throw error; // Ensure the error is thrown so it can be caught in the message handler
    }
};

// Handle messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message); // Log received messages for debugging

    if (message.action === 'syncLastSubmission') {
        getConfig().then(async (config) => {
            if (config) {
                const { GITHUB_TOKEN, REPO_URL } = config;

                try {
                    const data = await getSubmissions();
                    if (data && data.submissions_dump.length > 0) {
                        const lastSubmission = data.submissions_dump[data.submissions_dump.length - 1];
                        const formattedOutput = formatSubmission(lastSubmission);
                        console.log('Last submission:', formattedOutput);

                        await uploadSubmissionToGitHub(lastSubmission, GITHUB_TOKEN, REPO_URL);
                        sendResponse({ status: 'success', data: formattedOutput });
                    } else {
                        console.log('No submissions found.');
                        sendResponse({ status: 'success', data: 'No submissions found.' });
                    }
                } catch (error) {
                    console.error('Error processing submissions:', error);
                    sendResponse({ status: 'error', message: error.message });
                }
            } else {
                sendResponse({ status: 'error', message: 'Failed to load configuration.' });
            }
        }).catch(error => {
            console.error('Error fetching config:', error);
            sendResponse({ status: 'error', message: error.message });
        });
        return true; // Keep the message channel open for async response
    } else if (message.action === 'syncLast20Submissions') {
        getConfig().then(async (config) => {
            if (config) {
                const { GITHUB_TOKEN, REPO_URL } = config;

                try {
                    const data = await getSubmissions();
                    if (data && data.submissions_dump.length > 0) {
                        await uploadLast20SubmissionsToGitHub(data.submissions_dump, GITHUB_TOKEN, REPO_URL);
                        sendResponse({ status: 'success', data: 'Last 20 submissions uploaded to GitHub.' });
                    } else {
                        console.log('No submissions found.');
                        sendResponse({ status: 'success', data: 'No submissions found.' });
                    }
                } catch (error) {
                    console.error('Error processing submissions:', error);
                    sendResponse({ status: 'error', message: error.message });
                }
            } else {
                sendResponse({ status: 'error', message: 'Failed to load configuration.' });
            }
        }).catch(error => {
            console.error('Error fetching config:', error);
            sendResponse({ status: 'error', message: error.message });
        });
        return true; // Keep the message channel open for async response
    } else if (message.action === 'updateConfig') {
        const { githubToken, repoUrl } = message;

        if (githubToken && repoUrl) {
            // Save the updated configuration
            chrome.storage.local.set({ GITHUB_TOKEN: githubToken, REPO_URL: repoUrl }, () => {
                sendResponse({ status: 'success', data: 'Configuration updated successfully!' });
            });
        } else {
            sendResponse({ status: 'error', message: 'GitHub Token and Repo URL are required.' });
        }
        return true; // Keep the message channel open for async response
    } else {
        sendResponse({ status: 'error', message: 'Unknown action.' });
        return true; // Keep the message channel open for async response
    }
});

// Format the submission
const formatSubmission = (submission) => {
    const submission_id = submission.id;
    const title = submission.title.replace(/[/\\?%*:|"<>]/g, '_'); // Replace invalid characters for file names
    const status = submission.status_display;
    const code = submission.code;
    const timestamp = formatDate(submission.timestamp * 1000); // Convert to milliseconds

    return `# Title: ${title}\n# Submission ID: ${submission_id}\n# Status: ${status}\n# Date: ${timestamp}\n\n${code}`;
};

// Format date and time
const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
    return date.toLocaleString(undefined, options);
};

// Upload a single submission to GitHub
const uploadSubmissionToGitHub = async (submission, token, repoUrl) => {
    const language = submission.lang.toLowerCase();
    const submission_id = submission.id;
    const title = submission.title.replace(/[/\\?%*:|"<>]/g, '_'); // Replace invalid characters for file names
    
    // Determine file extension based on language
    let fileExtension;
    switch (language) {
        case 'python':
            fileExtension = 'py';
            break;
        case 'cpp':
            fileExtension = 'cpp';
            break;
        case 'java':
            fileExtension = 'java';
            break;
        case 'javascript':
            fileExtension = 'js';
            break;
        // Add more cases as needed
        default:
            fileExtension = 'txt'; // Default to .txt if language is unknown
    }

    const fileName = `${submission_id}.${fileExtension}`;
    const fileContent = formatSubmission(submission);

    // Extract owner and repo from the repo URL
    const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');

    try {
        // Check if the file already exists
        const checkResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/submissions/${title}/${fileName}`, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`
            }
        });

        if (checkResponse.ok) {
            console.log(`Submission ${fileName} already exists. Skipping upload.`);
            return; // Skip upload if file already exists
        } else if (checkResponse.status === 404) {
            // File does not exist, proceed with upload
            const uploadResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/submissions/${title}/${fileName}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `Add submission ${submission_id}`,
                    content: btoa(fileContent) // Encode content as base64
                })
            });

            if (uploadResponse.ok) {
                console.log('File uploaded to GitHub:', `submissions/${title}/${fileName}`);
            } else {
                console.log(`Failed to upload file. Status code: ${uploadResponse.status}`);
                const errorData = await uploadResponse.json();
                console.error('Error details:', errorData);
            }
        } else {
            // Handle other potential errors
            console.error(`Failed to check file existence. Status code: ${checkResponse.status}`);
            const errorData = await checkResponse.json();
            console.error('Error details:', errorData);
        }
    } catch (error) {
        console.error('Error checking file existence or uploading file to GitHub:', error);
    }
};

// Upload the last 20 submissions to GitHub
const uploadLast20SubmissionsToGitHub = async (submissions, token, repoUrl) => {
    const last20Submissions = submissions.slice(-20);

    for (const submission of last20Submissions) {
        await uploadSubmissionToGitHub(submission, token, repoUrl);
    }
};
