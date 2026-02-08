// ==========================================
// JOBS API CLIENT
// Connects to Vercel Postgres backend for jobs/work orders
// ==========================================

const JOBS_API_BASE = 'https://bleachers-api.vercel.app/api/jobs';

const JobsAPI = {
    // Get headers with user role for auth
    getHeaders() {
        const headers = { 'Content-Type': 'application/json' };
        if (typeof currentRole !== 'undefined' && currentRole) {
            headers['X-User-Role'] = currentRole;
        }
        return headers;
    },

    // List/search jobs
    async list(options = {}) {
        const params = new URLSearchParams();
        if (options.q) params.set('q', options.q);
        if (options.status) params.set('status', options.status);
        if (options.jobType) params.set('job_type', options.jobType);
        if (options.customerId) params.set('customer_id', options.customerId);
        if (options.assignedTo) params.set('assigned_to', options.assignedTo);
        if (options.limit) params.set('limit', options.limit);
        if (options.offset) params.set('offset', options.offset);

        const url = params.toString() ? `${JOBS_API_BASE}?${params}` : JOBS_API_BASE;
        const response = await fetch(url, { headers: this.getHeaders() });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to fetch jobs');
        }

        return response.json();
    },

    // Get single job with attachments and inspection banks
    async get(id) {
        const response = await fetch(`${JOBS_API_BASE}/${id}`, {
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to fetch job');
        }

        return response.json();
    },

    // Create a new job
    async create(jobData) {
        const response = await fetch(JOBS_API_BASE, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(jobData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to create job');
        }

        return response.json();
    },

    // Update a job
    async update(id, jobData) {
        const response = await fetch(`${JOBS_API_BASE}/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(jobData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update job');
        }

        return response.json();
    },

    // Delete a job
    async delete(id) {
        const response = await fetch(`${JOBS_API_BASE}/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to delete job');
        }

        return response.json();
    },

    // ==========================================
    // QB SYNC
    // ==========================================

    // Preview QB estimates available for import
    async syncPreview(limit = 50) {
        const response = await fetch(`${JOBS_API_BASE}/sync?limit=${limit}`, {
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to preview sync');
        }

        return response.json();
    },

    // Import QB estimates as jobs
    async syncImport(options = {}) {
        const response = await fetch(`${JOBS_API_BASE}/sync`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(options) // { all: true } or { estimateIds: [...] }
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Sync import failed');
        }

        return response.json();
    },

    // ==========================================
    // ATTACHMENTS
    // ==========================================

    // Upload attachment (photo, PDF, part spec form)
    async uploadAttachment(jobId, options) {
        const response = await fetch(`${JOBS_API_BASE}/attachments`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                jobId,
                type: options.type || 'photo',
                filename: options.filename,
                fileData: options.fileData, // base64 data URL
                partNumber: options.partNumber,
                vendor: options.vendor,
                uploadedBy: options.uploadedBy,
                metadata: options.metadata
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to upload attachment');
        }

        return response.json();
    },

    // Delete attachment
    async deleteAttachment(attachmentId) {
        const response = await fetch(`${JOBS_API_BASE}/attachments?id=${attachmentId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to delete attachment');
        }

        return response.json();
    },

    // ==========================================
    // INSPECTION BANKS
    // ==========================================

    // Add inspection bank to a job
    async addInspectionBank(jobId, bankData) {
        const response = await fetch(`${JOBS_API_BASE}/inspections`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify({
                jobId,
                bankName: bankData.bankName,
                bleacherType: bankData.bleacherType,
                rowCount: bankData.rowCount,
                seatCount: bankData.seatCount,
                checklistData: bankData.checklistData,
                issues: bankData.issues
            })
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to add inspection bank');
        }

        return response.json();
    },

    // Update inspection bank
    async updateInspectionBank(bankId, bankData) {
        const response = await fetch(`${JOBS_API_BASE}/inspections?id=${bankId}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(bankData)
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to update inspection bank');
        }

        return response.json();
    },

    // Delete inspection bank
    async deleteInspectionBank(bankId) {
        const response = await fetch(`${JOBS_API_BASE}/inspections?id=${bankId}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to delete inspection bank');
        }

        return response.json();
    }
};

// Status badge colors
JobsAPI.statusColors = {
    draft: '#6c757d',
    scheduled: '#007bff',
    in_progress: '#fd7e14',
    completed: '#28a745',
    cancelled: '#dc3545',
    on_hold: '#ffc107'
};

// Job type labels
JobsAPI.jobTypeLabels = {
    repair: 'Repair',
    inspection: 'Inspection',
    service_call: 'Service Call',
    go_see: 'Go-See'
};

// Make available globally
window.JobsAPI = JobsAPI;
