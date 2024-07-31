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
const getSubmissions = async (offset = 0, limit = 20) => {
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
            const data = await response.json();
            if (data && Array.isArray(data.submissions_dump)) {
                // Sort submissions by ID in descending order to get the latest submissions first
                data.submissions_dump.sort((a, b) => b.id - a.id);
                return data.submissions_dump;
            } else {
                console.error("Unexpected data structure:", data);
                return [];
            }
        } else {
            throw new Error(`Failed to fetch data. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error('Error fetching submissions:', error);
        throw error;
    }
};

// Handle messages from popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Received message:', message); // Log received messages for debugging

    // Sync Last Submission
if (message.action === 'syncLastSubmission') {
    getConfig().then(async (config) => {
        if (config) {
            const { GITHUB_TOKEN, REPO_URL } = config;

            try {
                if (!GITHUB_TOKEN || !REPO_URL) {
                    console.error('GitHub token or repository URL is missing.\n Verify Settings!');
                    sendResponse({ status: 'error', message: 'GitHub token or repository URL is missing.\n Verify Settings!' });
                    return;
                }

                const submissions = await getSubmissions();

                if (submissions && submissions.length > 0) {
                    // Sort submissions by ID in descending order to get the latest submission first
                    submissions.sort((a, b) => b.id - a.id);
                    const lastSubmission = submissions[0]; // The latest submission
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
}

    // Sync Last 20 Submission
    else if (message.action === 'syncLast20Submissions') {
        getConfig().then(async (config) => {
            if (config) {
                const { GITHUB_TOKEN, REPO_URL } = config;
    
                try {
                    const submissions = await getSubmissions();
                    if (submissions && submissions.length > 0) {
                        // Sort submissions by ID in descending order to get the latest submissions first
                        submissions.sort((a, b) => b.id - a.id);
                        const last20Submissions = submissions.slice(0, 20); // Get the latest 20 submissions
    
                        await uploadLast20SubmissionsToGitHub(last20Submissions, GITHUB_TOKEN, REPO_URL);
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
        return true; 
    } 
    
    // Update Github Configuration
    else if (message.action === 'updateConfig') {
        const { githubToken, repoUrl } = message;

        if (githubToken && repoUrl) {
            // Save the updated configuration
            chrome.storage.local.set({ GITHUB_TOKEN: githubToken, REPO_URL: repoUrl }, () => {
                sendResponse({ status: 'success', data: 'Configuration updated successfully!' });
            });
        } else {
            sendResponse({ status: 'error', message: 'GitHub Token and Repo URL are required.' });
        }
        return true; 
    } else {
        sendResponse({ status: 'error', message: 'Unknown action.' });
        return true; 
    }
});

// Format the submission
const formatSubmission = (submission) => {
    const submission_id = submission.id;
    const title = submission.title.replace(/[/\\?%*:|"<>]/g, '_'); 
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
// Upload a single submission to GitHub
const uploadSubmissionToGitHub = async (submission, token, repoUrl) => {
    if (!token || !repoUrl) {
        console.error('Error: GitHub token or repository URL is missing.\n Verify Settings!');
        return;
    }

    const language = submission.lang.toLowerCase();
    const submission_id = submission.id;
    const title = submission.title.replace(/[/\\?%*:|"<>]/g, '_'); 

    // Dictionary for file extensions based on language
    const languageExtensions = {
        python: 'py',
        cpp: 'cpp',
        csharp: 'cs',
        ruby: 'rb',
        java: 'java',
        javascript: 'js',
        swift: 'swift',
        go: 'go',
        scala: 'scala',
        kotlin: 'kt',
        rust: 'rs',
        php: 'php',
        typescript: 'ts',
        racket: 'rkt',
        erlang: 'erl',
        elixir: 'ex',
        dart: 'dart',
        sql: 'sql'
    };

    // Determine file extension based on language
    const fileExtension = languageExtensions[language] || 'txt'; // Default to .txt if language is unknown

    const fileName = `${submission_id}.${fileExtension}`;
    const fileContent = formatSubmission(submission);

    try {
        // Extract owner and repo from the repo URL
        const [owner, repo] = repoUrl.replace('https://github.com/', '').split('/');
        if (!owner || !repo) {
            console.error('Error: Invalid GitHub repository URL. Could not extract owner and repository.');
            return; // Exit the function if repoUrl is not valid
        }

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
            // If file does not exist, proceed with upload
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
                console.error(`Failed to upload file. Status code: ${uploadResponse.status}`);
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
