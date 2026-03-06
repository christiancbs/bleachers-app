// ==========================================
// ACTIVITIES API CLIENT
// CRM activity tracking: calls, notes, follow-ups, system events
// ==========================================

const ACTIVITIES_API_BASE = 'https://bleachers-api.vercel.app/api/activities';
const USERS_API_BASE = 'https://bleachers-api.vercel.app/api/users';

const ActivitiesAPI = {
    async getHeaders() {
        return getApiHeaders();
    },

    // List activities with filters
    async list(options = {}) {
        var params = new URLSearchParams();
        if (options.entityType) params.set('entity_type', options.entityType);
        if (options.entityId) params.set('entity_id', options.entityId);
        if (options.customerId) params.set('customer_id', options.customerId);
        if (options.activityType) params.set('activity_type', options.activityType);
        params.set('limit', options.limit || 50);
        params.set('offset', options.offset || 0);

        var response = await fetch(ACTIVITIES_API_BASE + '?' + params, {
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            var err = await response.json().catch(function() { return {}; });
            throw new Error(err.error || 'Failed to fetch activities');
        }

        return response.json();
    },

    // Create a new activity (manual or system)
    async create(data) {
        var response = await fetch(ACTIVITIES_API_BASE, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            var err = await response.json().catch(function() { return {}; });
            throw new Error(err.error || 'Failed to create activity');
        }

        return response.json();
    },

    // Activity type display config
    typeConfig: {
        note:                   { icon: '\uD83D\uDCDD', label: 'Note',                 color: '#6c757d' },
        call:                   { icon: '\uD83D\uDCDE', label: 'Call',                  color: '#28a745' },
        follow_up:              { icon: '\uD83D\uDCC5', label: 'Follow-up',             color: '#17a2b8' },
        estimate_created:       { icon: '\uD83D\uDCCB', label: 'Estimate Created',      color: '#007bff' },
        estimate_sent:          { icon: '\uD83D\uDCE8', label: 'Estimate Sent',         color: '#6f42c1' },
        status_change:          { icon: '\uD83D\uDD04', label: 'Status Change',         color: '#fd7e14' },
        job_created:            { icon: '\uD83D\uDD27', label: 'Job Created',           color: '#007bff' },
        job_completed:          { icon: '\u2705',       label: 'Job Completed',         color: '#28a745' },
        inspection_submitted:   { icon: '\uD83D\uDD0D', label: 'Inspection Submitted',  color: '#6610f2' },
        ops_review_approved:    { icon: '\u2705',       label: 'Ops Review Approved',   color: '#28a745' }
    }
};

// ==========================================
// USERS API CLIENT
// User profiles for display names
// ==========================================

const UsersAPI = {
    async getHeaders() {
        return getApiHeaders();
    },

    // Upsert current user's profile (called on login)
    async upsertProfile(data) {
        var response = await fetch(USERS_API_BASE + '/profile', {
            method: 'POST',
            headers: await this.getHeaders(),
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            var err = await response.json().catch(function() { return {}; });
            throw new Error(err.error || 'Failed to upsert profile');
        }

        return response.json();
    },

    // List all user profiles (for dropdowns)
    async list() {
        var response = await fetch(USERS_API_BASE, {
            headers: await this.getHeaders()
        });

        if (!response.ok) {
            var err = await response.json().catch(function() { return {}; });
            throw new Error(err.error || 'Failed to fetch users');
        }

        return response.json();
    }
};

window.ActivitiesAPI = ActivitiesAPI;
window.UsersAPI = UsersAPI;
