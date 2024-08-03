(() => {
    // Check if the user is logged in by looking for a specific element
    const isLoggedIn = !!document.querySelector('.nav-user-icon'); // Adjust the selector based on LeetCode's actual DOM structure

    // Return the result to the background script
    return isLoggedIn;
})();
