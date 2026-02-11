// ==========================================
// CLERK AUTH MODULE
// Handles sign-in, session management, token retrieval
// ==========================================

// Get JWT token for API calls
async function getAuthToken() {
    if (window.Clerk && window.Clerk.session) {
        try {
            return await window.Clerk.session.getToken();
        } catch (e) {
            console.error('Failed to get auth token:', e);
            return null;
        }
    }
    return null;
}

// Sign out and return to login screen
async function clerkLogout() {
    if (window.Clerk) {
        try {
            await window.Clerk.signOut();
        } catch (e) {
            console.error('Clerk signOut error:', e);
        }
    }
}

// Handle successful sign-in — read role from Clerk user metadata and enter app
function handleSignedIn(user) {
    const role = user.publicMetadata?.role || 'technician';
    currentRole = role;

    // Update sidebar with real user info
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    const fullName = (firstName + ' ' + lastName).trim() || user.primaryEmailAddress?.emailAddress || 'User';
    const initials = firstName && lastName
        ? (firstName[0] + lastName[0]).toUpperCase()
        : fullName.substring(0, 2).toUpperCase();

    // Unmount sign-in form if mounted
    const signInEl = document.getElementById('clerk-sign-in');
    if (signInEl) {
        try { window.Clerk.unmountSignIn(signInEl); } catch (e) { /* ignore */ }
    }

    // Call existing login() which handles dashboard routing
    login(role);

    // Override the hardcoded names with real user info
    if (role === 'office' || role === 'admin') {
        const avatarEl = document.getElementById('officeUserAvatar');
        const nameEl = document.getElementById('officeUserName');
        if (avatarEl) avatarEl.textContent = initials;
        if (nameEl) nameEl.textContent = fullName;
    } else {
        const avatarEl = document.getElementById('techUserAvatar');
        const nameEl = document.getElementById('techUserName');
        if (avatarEl) avatarEl.textContent = initials;
        if (nameEl) nameEl.textContent = fullName;
    }
}

// Initialize Clerk auth — called when SDK is loaded
async function initAuth() {
    try {
        await window.Clerk.load();

        if (window.Clerk.user) {
            // Already signed in (session persisted)
            handleSignedIn(window.Clerk.user);
        } else {
            // Not signed in — mount sign-in form
            const signInEl = document.getElementById('clerk-sign-in');
            if (signInEl) {
                window.Clerk.mountSignIn(signInEl);
            }
        }

        // Listen for auth state changes
        window.Clerk.addListener(({ user, session }) => {
            if (user && session && !currentRole) {
                handleSignedIn(user);
            }
        });

    } catch (e) {
        console.error('Clerk init error:', e);
    }
}

// Wait for Clerk SDK script to load, then initialize
function waitForClerk() {
    if (window.Clerk) {
        initAuth();
    } else {
        // Clerk script is async — poll until available
        const interval = setInterval(() => {
            if (window.Clerk) {
                clearInterval(interval);
                initAuth();
            }
        }, 100);
    }
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForClerk);
} else {
    waitForClerk();
}
