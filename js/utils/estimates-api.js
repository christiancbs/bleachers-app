// ==========================================
// ESTIMATES API CLIENT
// Fetches estimates from QuickBooks via backend
// ==========================================

const QB_API_BASE = 'https://bleachers-api.vercel.app/api/qb';

const EstimatesAPI = {
    // Get headers with auth token
    async getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (typeof getAuthToken === 'function') {
            const token = await getAuthToken();
            if (token) {
                headers['Authorization'] = 'Bearer ' + token;
            }
        }
        return headers;
    },

    // Cache for estimates
    _cache: null,
    _cacheTime: null,
    _cacheDuration: 60000, // 1 minute cache

    // Fetch all estimates from QB
    async list(options = {}) {
        const { limit = 100, status, forceRefresh = false } = options;

        // Check cache
        if (!forceRefresh && this._cache && this._cacheTime && (Date.now() - this._cacheTime < this._cacheDuration)) {
            let estimates = this._cache;
            if (status) {
                estimates = estimates.filter(e => e.status === status);
            }
            return { estimates, count: estimates.length, fromCache: true };
        }

        const params = new URLSearchParams();
        params.set('limit', limit);
        if (status) params.set('status', status);

        const response = await fetch(`${QB_API_BASE}/estimates?${params}`, {
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to fetch estimates');
        }

        const data = await response.json();

        // Cache full list
        if (!status) {
            this._cache = data.estimates;
            this._cacheTime = Date.now();
        }

        return data;
    },

    // Get estimates by status
    async getByStatus(status) {
        const data = await this.list({ limit: 500 });
        return {
            estimates: data.estimates.filter(e => e.status === status),
            count: data.estimates.filter(e => e.status === status).length
        };
    },

    // Get pending estimates
    async getPending() {
        return this.getByStatus('Pending');
    },

    // Get accepted estimates
    async getAccepted() {
        return this.getByStatus('Accepted');
    },

    // Search estimates
    async search(query) {
        const data = await this.list({ limit: 500 });
        const q = query.toLowerCase();

        const filtered = data.estimates.filter(e =>
            (e.docNumber || '').toLowerCase().includes(q) ||
            (e.customerName || '').toLowerCase().includes(q) ||
            (e.email || '').toLowerCase().includes(q)
        );

        return { estimates: filtered, count: filtered.length };
    },

    // Create new estimate in QB
    async create(estimateData) {
        const response = await fetch(`${QB_API_BASE}/estimates`, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify(estimateData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to create estimate');
        }

        // Clear cache
        this._cache = null;

        return response.json();
    },

    // Get customers for estimate creation
    async getCustomers(search = '') {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        params.set('limit', 100);

        const response = await fetch(`${QB_API_BASE}/customers?${params}`, {
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to fetch customers');
        }

        return response.json();
    },

    // Clear cache
    clearCache() {
        this._cache = null;
        this._cacheTime = null;
    }
};

// Status display helpers
EstimatesAPI.statusColors = {
    'Pending': { bg: '#fff3e0', color: '#e65100' },
    'Accepted': { bg: '#c8e6c9', color: '#2e7d32' },
    'Closed': { bg: '#e0e0e0', color: '#616161' },
    'Rejected': { bg: '#ffcdd2', color: '#c62828' },
    'Converted': { bg: '#bbdefb', color: '#1565c0' }
};

// Make available globally
window.EstimatesAPI = EstimatesAPI;
