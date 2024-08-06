# LeetHub Sync Chrome Extension

![LeetCode Submission Syncer](images/lh_icon.png)

## Overview

The **LeetCode Submission Syncer** is a Chrome extension that allows you to sync your LeetCode submissions to a specified GitHub repository. This extension simplifies the process of backing up your coding solutions by automating the retrieval and organization of your submissions.

## Features

- **Sync Last Submission:** Quickly sync the most recent submission to your GitHub repository.
- **Sync Last 20 Submissions:** Sync the last 20 submissions with a single click.
- **Customizable Settings:** Configure your GitHub Token and Repository URL via the settings page.
- **Automatic File Organization:** Submissions are saved in directories based on the problem title and programming language used.
- **Error Handling:** Clear and concise error messages to help you troubleshoot issues.

## Installation

1. Navigate to the Chrome Web Store and add LeetHub Sync to Chrome!
   https://chromewebstore.google.com/detail/leethub-sync/lgpbjdbepciblkallimlmjajfioghdde?hl=en-US&utm_source=ext_sidebar

## Usage

1. **Open the Extension:** Click on the LeetCode Submission Syncer icon in your Chrome toolbar.
2. **Configure Settings:**
    - Click on the settings icon.
    - Enter your GitHub Token and Repository URL.
    - Ensure the Github Repository URL.
    - Click "Update Configuration" to save your settings.
3. **Sync Submissions:**
    - Use the "Sync Last Submission" button to sync your latest LeetCode submission.
    - Use the "Sync Last 20 Submissions" button to sync your most recent 20 submissions.
    - Enable "Auto Sync" for automatic syncing when the LeetCode "submit" button is clicked!
4. **View Status:** The popup will display success or error messages based on the sync status.

## File Structure

```plaintext
.
├── background.js
├── config
├── images
│   ├── lh_icon.png
│   └── settings_icon.png
├── manifest.json
├── popup
│   ├── main.css
│   └── main.html
└── scripts
    └── popup.js
