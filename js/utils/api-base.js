// ==========================================
// API BASE - Shared auth headers
// All API clients delegate to this function
// ==========================================

async function getApiHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (typeof getAuthToken === 'function') {
        const token = await getAuthToken();
        if (token) {
            headers['Authorization'] = 'Bearer ' + token;
        }
    }
    return headers;
}
