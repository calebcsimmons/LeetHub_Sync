# Setup Guide for LeetHub Sync

Welcome to the LeetHub Sync setup guide! This document will walk you through the steps required to install and configure the LeetHub Sync Chrome extension. By the end of this guide, you'll be able to automatically save your LeetCode submissions to your GitHub repository.

## Table of Contents

1. [Installation](#installation)
   - [Step 1: Install the Extension](#step-1-install-the-extension)
2. [Configuration](#configuration)
   - [Step 1: Set Your GitHub Token](#step-1-set-your-github-token)
   - [Step 2: Set Your GitHub Repository URL](#step-2-set-your-github-repository-url)
3. [Using the Extension](#using-the-extension)
   - [Syncing Your Last Submission](#syncing-your-last-submission)
   - [Syncing the Last 20 Submissions](#syncing-the-last-20-submissions)
4. [Troubleshooting](#troubleshooting)
5. [Support](#support)

---

## Installation

### Step 1: Install the Extension

1. Open Google Chrome and go to the [Chrome Web Store](https://chrome.google.com/webstore).
2. In the search bar, type **LeetHub Sync** and press Enter. <br><img src="img/LeetHub_ChromePage.png alt="LeetHub Sync Chrome Web Page" width="220"/>
2b. Alternatively, the current link to the extension can be found [here](https://chromewebstore.google.com/detail/leethub-sync/lgpbjdbepciblkallimlmjajfioghdde?hl=en-US&utm_source=ext_sidebar).
3. Find the LeetHub Sync extension in the search results and click **Add to Chrome**.
4. Confirm the installation by clicking **Add Extension** in the pop-up.

Once installed, the LeetHub Sync icon should appear in your browser’s toolbar.

---

## Configuration

After installing the extension, you'll need to configure it to sync your LeetCode submissions to your GitHub repository.

### Step 1: Set Your GitHub Token

1. Click on the LeetHub Sync icon in your Chrome toolbar to open the extension popup.
2. Click on the **Settings** icon in the popup window.
3. In the settings modal, paste your **GitHub Token** into the designated field.
   - If you don't have a GitHub Token yet, [create one here](https://github.com/settings/tokens/new) with `repo` scope enabled.
4. Click **Update Configuration** to save your token.

### Step 2: Set Your GitHub Repository URL

1. In the same settings modal, enter your GitHub repository URL in the designated field.
   - Ensure that the URL does not end with `.git`. If it does, remove the `.git` part.
2. Click **Update Configuration** to save your repository URL.

---

## Using the Extension

### Syncing Your Last Submission

1. Solve a problem on [LeetCode](https://leetcode.com).
2. After submission, click the LeetHub Sync icon in your Chrome toolbar.
3. In the popup window, click **Sync Last Submission**.
4. A success message will appear if the submission is successfully synced to your GitHub repository.

### Syncing the Last 20 Submissions

1. Click the LeetHub Sync icon in your Chrome toolbar.
2. In the popup window, click **Sync Last 20 Submissions**.
3. The extension will sync the last 20 submissions to your GitHub repository, and you’ll receive a confirmation message.

---

## Troubleshooting

If you encounter issues while using LeetHub Sync:

1. **Check Your Token and Repository URL:** Ensure both are correctly entered in the settings.
2. **Re-authenticate:** If your GitHub token has expired, generate a new one and update the configuration.
3. **Permissions:** Ensure the extension has the necessary permissions by checking in `chrome://extensions/`.

For more troubleshooting tips, visit our [FAQ](https://www.contributor-covenant.org/faq).

---

## Support

If you need further assistance, feel free to submit an [issue](https://github.com/calebcsimmons/LeetHub_Sync/issues/new/choose).
