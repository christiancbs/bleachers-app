// ==========================================
// CLERK AUTH MODULE
// Handles sign-in, session management, token retrieval
// ==========================================

const CLERK_PUBLISHABLE_KEY = 'pk_test_bGlrZWQtcmF5LTIxLmNsZXJrLmFjY291bnRzLmRldiQ';

// Clerk instance — set after initialization
let clerkInstance = null;

// Get JWT token for API calls
async function getAuthToken() {
    if (clerkInstance && clerkInstance.session) {
        try {
            return await clerkInstance.session.getToken();
        } catch (e) {
            console.error('Failed to get auth token:', e);
            return null;
        }
    }
    return null;
}

// Sign out and return to login screen
async function clerkLogout() {
    if (clerkInstance) {
        try {
            await clerkInstance.signOut();
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
        try { clerkInstance.unmountSignIn(signInEl); } catch (e) { /* ignore */ }
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

// Initialize Clerk auth
async function initAuth() {
    try {
        clerkInstance = new window.Clerk(CLERK_PUBLISHABLE_KEY);
        await clerkInstance.load();

        if (clerkInstance.user) {
            // Already signed in (session persisted)
            handleSignedIn(clerkInstance.user);
        } else {
            // Not signed in — mount sign-in form
            const signInEl = document.getElementById('clerk-sign-in');
            if (signInEl) {
                clerkInstance.mountSignIn(signInEl);
            }
        }

        // Listen for auth state changes
        clerkInstance.addListener(({ user, session }) => {
            if (user && session && !currentRole) {
                handleSignedIn(user);
            }
        });

    } catch (e) {
        console.error('Clerk init error:', e);
        // Show fallback message if Clerk fails to load
        const signInEl = document.getElementById('clerk-sign-in');
        if (signInEl) {
            signInEl.innerHTML = '<p style="color: #c62828; text-align: center; padding: 20px;">Unable to load sign-in. Please refresh the page.</p>';
        }
    }
}

// Wait for Clerk SDK script to load, then initialize
function waitForClerk() {
    if (window.Clerk) {
        initAuth();
    } else {
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
