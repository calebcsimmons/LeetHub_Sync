# <img src="images/lh_icon.png" alt="LeetHub Sync" width="50" style="vertical-align: middle;"/> LeetHub Sync Chrome Extension

<img src="images/main_GUI.png" alt="LeetHub Sync Main GUI" width="5600"/>


## Overview

**LeetHub Sync** is a Chrome extension that allows you to sync your LeetCode submissions to a specified GitHub repository. This extension simplifies the process of backing up your coding solutions by automating the retrieval and organization of your submissions.

## Features

- **Auto Sync:** Enable automated syncing upon each LeetCode submission.
- **Sync Last Submission:** Quickly sync the most recent submission to your GitHub repository.
- **Sync Last 20 Submissions:** Sync the last 20 submissions with a single click.
- **Customizable Settings:** Configure your GitHub Token and Repository URL via the settings page.
- **Automatic File Organization:** Submissions are saved in directories based on the problem title and programming language used.
- **Error Handling:** Clear and concise error messages to help you troubleshoot issues.

## Installation

1. Navigate to the Chrome Web Store and add LeetHub Sync to Chrome!
   
   https://chromewebstore.google.com/detail/leethub-sync/lgpbjdbepciblkallimlmjajfioghdde?hl=en-US&utm_source=ext_sidebar

## Usage

1. **Open the Extension:**
    - Click on the LeetHub Sync icon in your Chrome toolbar.
   
3. **Configure Settings:**
    - Click on the settings icon.
    - Generate a Github Token (https://github.com/settings/tokens)
    - Enter your GitHub Token and desired Github Repository URL in the settings modal.
    - Click "Update Configuration" to save your settings. <br><img src="images/settings_modal.png" alt="LeetHub Sync Settings Modal" width="220"/>
      
4. **Sync Submissions:**
    - Use the "Sync Last Submission" button to sync your latest LeetCode submission.
    - Use the "Sync Last 20 Submissions" button to sync your most recent 20 submissions.
    - Enable "Auto Sync" for automatic syncing when the LeetCode "submit" button is clicked! <br><img src="images/main_GUI.png" alt="LeetHub Sync Main GUI" width="220"/>
      
5. **View Status:** The popup will display success or error messages based on the sync status.

## File Structure

```plaintext
.
├── manifest.json
├── background.js
├── images
│   ├── lh_icon.png
│   └── settings_icon.png
├── popup
│   ├── main.css
│   └── main.html
└── scripts
    └── content.js
    └── popup.js
```

## RoadMap
Planned Features and Fixes
- Sync skipped message for already synced submissions.
- Clear and concise error messages for troubleshooting.
