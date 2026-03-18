// ==========================================
// ESTIMATES API CLIENT
// Fetches estimates from QuickBooks via backend
// ==========================================

const QB_API_BASE = 'https://bleachers-api.vercel.app/api/qb';

const EstimatesAPI = {
    // Get headers with auth token (delegates to shared api-base.js)
    async getHeaders() {
        return getApiHeaders();
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

    // Auto-paginating fetch — gets ALL results by looping through QB's 1000-per-page limit
    async listAll(options = {}) {
        const { status, customerName, customerId } = options;
        const pageSize = 1000;
        let allEstimates = [];
        let startPosition = 1;
        let hasMore = true;

        while (hasMore) {
            const params = new URLSearchParams();
            params.set('limit', pageSize);
            params.set('startPosition', startPosition);
            if (status) params.set('status', status);
            if (customerName) params.set('customerName', customerName);
            if (customerId) params.set('customerId', customerId);

            const response = await fetch(`${QB_API_BASE}/estimates?${params}`, {
                headers: await this.getHeaders()
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to fetch estimates');
            }

            const data = await response.json();
            const page = data.estimates || [];
            allEstimates = allEstimates.concat(page);

            // If we got fewer than pageSize, we've reached the end
            if (page.length < pageSize) {
                hasMore = false;
            } else {
                startPosition += pageSize;
            }
        }

        return { estimates: allEstimates, count: allEstimates.length };
    },

    // Fetch all estimates for a specific QB customer (uses auto-pagination)
    async listByCustomer(qbCustomerId) {
        return this.listAll({ customerId: qbCustomerId });
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
    },

    // ==========================================
    // LOCAL ESTIMATES (Postgres mirror)
    // For relationship queries and navigation
    // ==========================================

    _localBase: 'https://bleachers-api.vercel.app/api/estimates',

    // Upsert estimate to local Postgres table
    async upsertLocal(estimateData) {
        const response = await fetch(this._localBase, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify(estimateData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to upsert local estimate');
        }

        return response.json();
    },

    // Get local estimate by ID (includes relatedJobs)
    async getLocal(id) {
        const response = await fetch(`${this._localBase}/${id}`, {
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to fetch local estimate');
        }

        return response.json();
    },

    // List local estimates
    async listLocal(options = {}) {
        const { q, status, customer_id, limit = 50, offset = 0 } = options;

        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (status) params.set('status', status);
        if (customer_id) params.set('customer_id', customer_id);
        params.set('limit', limit);
        params.set('offset', offset);

        const response = await fetch(`${this._localBase}?${params}`, {
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to list local estimates');
        }

        return response.json();
    },

    // Sync QB estimates to local table
    async syncToLocal(options = {}) {
        const response = await fetch(`${this._localBase}/sync`, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify(options)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to sync estimates');
        }

        return response.json();
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

// ==========================================
// TRANSACTIONS API CLIENT
// Fetches Invoices, POs, Bills from QuickBooks
// ==========================================

const TransactionsAPI = {
    async getHeaders() {
        return getApiHeaders();
    },

    // Fetch transactions — optionally filtered by customer
    async listByCustomer(qbCustomerId, options = {}) {
        const { type } = options;
        const params = new URLSearchParams();
        if (qbCustomerId) params.set('customerId', qbCustomerId);
        params.set('limit', 1000);
        if (type) params.set('type', type);

        const response = await fetch(`${QB_API_BASE}/transactions?${params}`, {
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to fetch transactions');
        }

        return response.json();
    },

    // Fetch invoices for a customer
    async listInvoices(qbCustomerId) {
        return this.listByCustomer(qbCustomerId, { type: 'Invoice' });
    },

    // Fetch purchase orders (all — POs are vendor-addressed, not customer-addressed)
    async listPurchaseOrders(options = {}) {
        const { limit = 100 } = options;
        const params = new URLSearchParams();
        params.set('type', 'PurchaseOrder');
        params.set('limit', limit);

        const response = await fetch(`${QB_API_BASE}/transactions?${params}`, {
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to fetch purchase orders');
        }

        return response.json();
    }
};

window.TransactionsAPI = TransactionsAPI;
