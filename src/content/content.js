// Log to confirm that content script is loaded
console.log('Content.js script loaded and running on LeetCode');

// Check the Auto Submit state
const checkAutoSubmitAndSync = () => {
    chrome.storage.sync.get(['autoSync'], (result) => {
        console.log('Auto Submit checkbox state:', result.autoSync);
        
        if (result.autoSync) {
            console.log('Auto Sync is enabled. LeetHub Sync now syncing last submission.');
            chrome.runtime.sendMessage({ action: 'syncLastSubmission' }, (response) => {
                console.log('Response from background script:', response);
            });
        }
    });
};

// Listen for the "Submit" button click on LeetCode
document.addEventListener('click', (event) => {
    console.log('A click event occurred on the page.', event.target);

    // Check if the clicked element is the submit button or any of its children
    const submitButton = event.target.closest('button[data-e2e-locator="console-submit-button"], .submit__2ISl, .btn-content__2ISl, .fa-cloud-arrow-up');
    if (submitButton) {
        console.log('LeetCode submit button clicked. Waiting 5 seconds before syncing...');
        setTimeout(() => {
            checkAutoSubmitAndSync();
        }, 5000); // 5-second delay
    }
});
