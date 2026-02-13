// ==========================================
// CUSTOMERS API CLIENT
// Fetches customers from Postgres backend
// ==========================================

const CUSTOMERS_API_BASE = 'https://bleachers-api.vercel.app/api/customers';

const CustomersAPI = {
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
