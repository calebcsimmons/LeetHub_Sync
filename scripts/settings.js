document.getElementById('update-config-button').addEventListener('click', () => {
    const token = document.getElementById('github-token').value;
    const repoUrl = document.getElementById('repo-url').value;

    if (token && repoUrl) {
        chrome.storage.local.set({ GITHUB_TOKEN: token, REPO_URL: repoUrl }, () => {
            document.getElementById('message').textContent = 'Configuration updated successfully!';
            document.getElementById('message').style.color = 'green';
        });
    } else {
        document.getElementById('message').textContent = 'Please fill in both fields.';
        document.getElementById('message').style.color = 'red';
    }
});
