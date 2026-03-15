// ==========================================
// CUSTOMERS API CLIENT
// Fetches customers from Postgres backend
// ==========================================

const CUSTOMERS_API_BASE = 'https://bleachers-api.vercel.app/api/customers';
const QB_CUSTOMERS_API_BASE = 'https://bleachers-api.vercel.app/api/qb/customers';

const CustomersAPI = {
    // Get headers with auth token (delegates to shared api-base.js)
    async getHeaders() {
        return getApiHeaders();
    },

    // List/search customers with nested locations + contacts
    async list(options = {}) {
        const { q, territory, type, active, limit = 200, offset = 0 } = options;

        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (territory) params.set('territory', territory);
        if (type) params.set('type', type);
        if (active) params.set('active', active);
        params.set('limit', limit);
        params.set('offset', offset);

        const response = await fetch(`${CUSTOMERS_API_BASE}?${params}`, {
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to fetch customers');
        }

        return response.json();
    },

    // Get single customer with locations + contacts
    async get(id) {
        const response = await fetch(`${CUSTOMERS_API_BASE}/${id}`, {
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to fetch customer');
        }

        return response.json();
    },

    // Create customer
    async create(customerData) {
        const response = await fetch(CUSTOMERS_API_BASE, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to create customer');
        }

        return response.json();
    },

    // Update customer
    async update(id, customerData) {
        const response = await fetch(`${CUSTOMERS_API_BASE}/${id}`, {
            method: 'PUT',
            headers: await this.getHeaders(),
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update customer');
        }

        return response.json();
    },

    // Delete customer
    async delete(id) {
        const response = await fetch(`${CUSTOMERS_API_BASE}/${id}`, {
            method: 'DELETE',
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to delete customer');
        }

        return response.json();
    },

    // Add location to customer
    async addLocation(customerId, locationData) {
        const response = await fetch(`${CUSTOMERS_API_BASE}/locations`, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify({ customerId, ...locationData })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to add location');
        }

        return response.json();
    },

    // Update location
    async updateLocation(locationId, locationData) {
        const response = await fetch(`${CUSTOMERS_API_BASE}/locations?id=${locationId}`, {
            method: 'PUT',
            headers: await this.getHeaders(),
            body: JSON.stringify(locationData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update location');
        }

        return response.json();
    },

    // Delete location
    async deleteLocation(locationId) {
        const response = await fetch(`${CUSTOMERS_API_BASE}/locations?id=${locationId}`, {
            method: 'DELETE',
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to delete location');
        }

        return response.json();
    },

    // Add contact
    async addContact(contactData) {
        const response = await fetch(`${CUSTOMERS_API_BASE}/contacts`, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify(contactData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to add contact');
        }

        return response.json();
    },

    // Update contact
    async updateContact(contactId, contactData) {
        const response = await fetch(`${CUSTOMERS_API_BASE}/contacts?id=${contactId}`, {
            method: 'PUT',
            headers: await this.getHeaders(),
            body: JSON.stringify(contactData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update contact');
        }

        return response.json();
    },

    // Delete contact
    async deleteContact(contactId) {
        const response = await fetch(`${CUSTOMERS_API_BASE}/contacts?id=${contactId}`, {
            method: 'DELETE',
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to delete contact');
        }

        return response.json();
    },

    // Search QuickBooks customers directly (live QB query)
    async searchQB(query) {
        const params = new URLSearchParams();
        if (query) params.set('search', query);
        params.set('limit', '50');

        const response = await fetch(`${QB_CUSTOMERS_API_BASE}?${params}`, {
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to search QB customers');
        }

        return response.json();
    },

    // Create customer in QuickBooks, then create local Postgres record with QB ID link
    async createInQB(customerData) {
        // Step 1: Push to QB
        const qbResponse = await fetch(QB_CUSTOMERS_API_BASE, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify(customerData)
        });

        if (!qbResponse.ok) {
            const err = await qbResponse.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to create customer in QuickBooks');
        }

        const qbResult = await qbResponse.json();

        // Step 2: Create local record with QB ID link
        var addressStr = '';
        if (customerData.address) {
            var parts = [customerData.address.line1, customerData.address.city, customerData.address.state, customerData.address.zip].filter(Boolean);
            addressStr = parts.join(', ');
        }

        const localResult = await this.create({
            name: customerData.displayName,
            companyName: customerData.companyName || customerData.displayName,
            address: addressStr,
            phone: customerData.phone,
            email: customerData.email,
            territory: customerData.territory,
            type: customerData.type || 'other',
            qbCustomerId: qbResult.id
        });

        return { qb: qbResult, local: localResult };
    },

    // Find local customer by QB Customer ID (for QB-to-local bridge)
    async findByQbId(qbId) {
        const params = new URLSearchParams({ qbId: qbId, limit: '1' });
        const response = await fetch(`${CUSTOMERS_API_BASE}?${params}`, {
            headers: await this.getHeaders()
        });

        if (!response.ok) return null;
        const data = await response.json();
        return data.customers && data.customers.length > 0 ? data.customers[0] : null;
    },

    // Search locations (schools) by name
    async searchLocations(query, limit = 20) {
        const params = new URLSearchParams({ q: query, limit: limit });
        const response = await fetch(`${CUSTOMERS_API_BASE}/locations?${params}`, {
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to search locations');
        }

        return response.json();
    },

    // Run QB -> Postgres migration
    async migrate() {
        const response = await fetch(`${CUSTOMERS_API_BASE}/migrate`, {
            method: 'POST',
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Migration failed');
        }

        return response.json();
    }
};

// Make available globally
window.CustomersAPI = CustomersAPI;
