// ==========================================
// CLERK AUTH MODULE
// Handles sign-in, session management, token retrieval
// ==========================================

// Clerk instance — set after auto-init completes
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

// Called once Clerk is fully loaded — mount sign-in or enter app
function onClerkReady() {
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

    // Listen for auth state changes (sign-in, sign-out)
    clerkInstance.addListener(({ user, session }) => {
        if (user && session && !currentRole) {
            handleSignedIn(user);
        }
    });
}

// Wait for Clerk auto-init to finish loading (do NOT call .load() again)
function waitForClerk() {
    const check = setInterval(() => {
        if (window.Clerk) {
            clerkInstance = window.Clerk;
            // Auto-init calls .load() — wait for it to finish
            if (clerkInstance.loaded) {
                clearInterval(check);
                onClerkReady();
            }
        }
    }, 100);

    // Timeout after 15s — show error
    setTimeout(() => {
        clearInterval(check);
        if (!clerkInstance || !clerkInstance.loaded) {
            console.error('Clerk failed to load within 15 seconds');
            const signInEl = document.getElementById('clerk-sign-in');
            if (signInEl && !signInEl.hasChildNodes()) {
                signInEl.innerHTML = '<p style="color: #c62828; text-align: center; padding: 20px;">Unable to load sign-in. Please refresh the page.</p>';
            }
        }
    }, 15000);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForClerk);
} else {
    waitForClerk();
}
