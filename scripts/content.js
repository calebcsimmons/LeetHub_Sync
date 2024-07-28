
// Detect Leetcode Submission on Website
document.addEventListener('click', (event) => {
    if (event.target && event.target.matches('.submit__button')) {
        chrome.storage.local.get('autoSubmit', (data) => {
            if (data.autoSubmit) {
                chrome.runtime.sendMessage({ action: 'syncLastSubmission' });
            }
        });
    }
});
