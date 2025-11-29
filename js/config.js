// Global configuration for TheIndianEthnic.sg
// This handles path resolution for GitHub Pages deployment

(function() {
    'use strict';

    // Detect if we're on GitHub Pages
    const isGitHubPages = window.location.hostname === 'vaibhavkmr.github.io';

    // Set the base path for the site
    const basePath = isGitHubPages ? '/theindianethnicsg' : '';

    // Create global config object
    window.SITE_CONFIG = {
        // Base path for all resources
        BASE_PATH: basePath,

        // Full URL base (useful for canonical URLs, etc.)
        BASE_URL: isGitHubPages
            ? 'https://vaibhavkmr.github.io/theindianethnicsg'
            : window.location.origin,

        // Helper function to get full path for a resource
        getPath: function(path) {
            // Remove leading slash if present to avoid double slashes
            const cleanPath = path.startsWith('/') ? path.substring(1) : path;
            return this.BASE_PATH ? `${this.BASE_PATH}/${cleanPath}` : `/${cleanPath}`;
        },

        // Helper function to get full URL for a resource
        getUrl: function(path) {
            return `${this.BASE_URL}${this.getPath(path)}`;
        },

        // Check if we're on GitHub Pages
        isGitHubPages: isGitHubPages
    };

    // Log configuration for debugging (only in development)
    if (!isGitHubPages && window.console) {
        console.log('Site Configuration:', window.SITE_CONFIG);
    }
})();

