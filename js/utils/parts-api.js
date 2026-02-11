// ==========================================
// PARTS API CLIENT
// Replaces direct Airtable calls with backend API
// ==========================================

const PARTS_API_BASE = 'https://bleachers-api.vercel.app/api/parts';

const PartsAPI = {
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

    // Search parts catalog
    async search(query, category, vendor, limit = 50) {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (category) params.set('category', category);
        if (vendor) params.set('vendor', vendor);
        params.set('limit', limit);

        const response = await fetch(`${PARTS_API_BASE}/search?${params}`, {
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Search failed');
        }

        return response.json();
    },

    // Add a single part
    async addPart(partData) {
        const response = await fetch(PARTS_API_BASE, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify(partData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to add part');
        }

        return response.json();
    },

    // Update an existing part
    async updatePart(id, partData) {
        const response = await fetch(`${PARTS_API_BASE}/${id}`, {
            method: 'PUT',
            headers: await this.getHeaders(),
            body: JSON.stringify(partData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update part');
        }

        return response.json();
    },

    // Delete a part
    async deletePart(id) {
        const response = await fetch(`${PARTS_API_BASE}/${id}`, {
            method: 'DELETE',
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to delete part');
        }

        return response.json();
    },

    // Bulk import parts from CSV
    async importParts(parts, vendor) {
        const response = await fetch(`${PARTS_API_BASE}/import`, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify({ parts, vendor })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Import failed');
        }

        return response.json();
    },

    // Upload a single image
    async uploadImage(partId, partNumber, imageData) {
        const response = await fetch(`${PARTS_API_BASE}/images`, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify({ partId, partNumber, imageData })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Image upload failed');
        }

        return response.json();
    },

    // Bulk upload images (matched by filename = part number)
    async uploadImagesBulk(images) {
        const response = await fetch(`${PARTS_API_BASE}/images/bulk`, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify({ images })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Bulk upload failed');
        }

        return response.json();
    }
};

// Make available globally
window.PartsAPI = PartsAPI;
