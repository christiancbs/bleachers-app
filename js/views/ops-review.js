// ==========================================
// OPS REVIEW
// List view, detail view, status flow
// ==========================================

let currentApprovedSubFilter = 'all'; // 'all', 'awaiting_estimate', 'complete'
let _opsDbInspections = []; // Cache of DB-backed inspections for ops review

async function loadOpsReview() {
    // 1) Local localStorage inspections (field staff submissions not yet in DB)
    const localJobs = inspectionJobs.filter(j => j.status === 'submitted' || j.status === 'under_review' || j.status === 'approved');

    // 2) Fetch all inspection-type jobs from the database
    var dbJobs = [];
    if (typeof JobsAPI !== 'undefined') {
        try {
            var data = await JobsAPI.list({ jobType: 'inspection', limit: 200 });
            var jobs = data.jobs || [];
            dbJobs = jobs.map(function(j) {
                return {
                    _fromDb: true,
                    _apiId: j.id,
                    jobNumber: j.jobNumber,
                    status: j.status === 'completed' ? 'approved' : (j.status || 'submitted'),
                    locationName: j.locationName || j.customerName || '',
                    customerName: j.customerName || '',
                    locationAddress: j.address || '',
                    inspectionType: (j.metadata && j.metadata.inspectionType) || 'bleacher',
                    inspectorName: (j.metadata && j.metadata.inspectorName) || '',
                    inspectorCertificate: (j.metadata && j.metadata.inspectorCertificate) || '',
                    banks: [],
                    selectedParts: [],
                    submittedAt: j.completedAt || j.createdAt,
                    reviewedAt: j.completedAt,
                    hasEstimate: !!(j.qbEstimateId || (j.childJobs && j.childJobs.length > 0)),
                    description: j.description || ''
                };
            });
            _opsDbInspections = dbJobs;
        } catch (err) {
            console.error('Failed to load DB inspections for ops review:', err);
            dbJobs = _opsDbInspections; // use cache on error
        }
    }

    // 3) Merge: DB jobs first, then local jobs not already in DB (by jobNumber)
    var dbJobNumbers = {};
    dbJobs.forEach(function(j) { dbJobNumbers[j.jobNumber] = true; });
    var localOnly = localJobs.filter(function(j) { return !dbJobNumbers[j.jobNumber]; });
    var allJobs = dbJobs.concat(localOnly);

    const submitted = allJobs.filter(j => j.status === 'submitted');
    const underReview = allJobs.filter(j => j.status === 'under_review');
    const approved = allJobs.filter(j => j.status === 'approved');

    // Count approved sub-categories
    const awaitingEstimate = approved.filter(j => !j.hasEstimate);
    const complete = approved.filter(j => j.hasEstimate);

    // Update stat cards
    document.getElementById('opsNeedsReviewCount').textContent = submitted.length;
    document.getElementById('opsUnderReviewCount').textContent = underReview.length;
    document.getElementById('opsApprovedCount').textContent = approved.length;

    // Update sidebar badge
    const badge = document.getElementById('opsReviewBadge');
    if (badge) {
        badge.textContent = submitted.length;
        badge.style.display = submitted.length > 0 ? 'inline-block' : 'none';
    }

    // Apply filter
    let filteredJobs = allJobs;
    if (currentOpsFilter !== 'all') {
        filteredJobs = allJobs.filter(j => j.status === currentOpsFilter);
    }

    // Apply approved sub-filter
    if (currentOpsFilter === 'approved' && currentApprovedSubFilter !== 'all') {
        if (currentApprovedSubFilter === 'awaiting_estimate') {
            filteredJobs = filteredJobs.filter(j => !j.hasEstimate);
        } else if (currentApprovedSubFilter === 'complete') {
            filteredJobs = filteredJobs.filter(j => j.hasEstimate);
        }
    }

    // Update filter tab active states
    document.getElementById('opsFilterAll').classList.toggle('active', currentOpsFilter === 'all');
    document.getElementById('opsFilterSubmitted').classList.toggle('active', currentOpsFilter === 'submitted');
    document.getElementById('opsFilterUnderReview').classList.toggle('active', currentOpsFilter === 'under_review');
    document.getElementById('opsFilterApproved').classList.toggle('active', currentOpsFilter === 'approved');

    // Show/hide approved sub-filters
    const subFiltersContainer = document.getElementById('approvedSubFilters');
    if (subFiltersContainer) {
        if (currentOpsFilter === 'approved') {
            subFiltersContainer.classList.remove('hidden');
            document.getElementById('subFilterAll').classList.toggle('active', currentApprovedSubFilter === 'all');
            document.getElementById('subFilterAwaitingEst').classList.toggle('active', currentApprovedSubFilter === 'awaiting_estimate');
            document.getElementById('subFilterComplete').classList.toggle('active', currentApprovedSubFilter === 'complete');
            document.getElementById('subAwaitingEstCount').textContent = awaitingEstimate.length;
            document.getElementById('subCompleteCount').textContent = complete.length;
        } else {
            subFiltersContainer.classList.add('hidden');
        }
    }

    const list = document.getElementById('opsReviewList');
    if (filteredJobs.length === 0) {
        const emptyMsg = currentOpsFilter === 'all' ? 'No inspections to review yet' :
            currentOpsFilter === 'submitted' ? 'No inspections awaiting review' :
            currentOpsFilter === 'under_review' ? 'No inspections currently under review' :
            currentApprovedSubFilter === 'awaiting_estimate' ? 'All approved inspections have estimates' :
            currentApprovedSubFilter === 'complete' ? 'No fully processed inspections yet' :
            'No approved inspections';
        list.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><p>${emptyMsg}</p></div>`;
        return;
    }

    list.innerHTML = filteredJobs.map(job => {
        const typeIcon = job.inspectionType === 'basketball' ? '🏀' :
                         job.inspectionType === 'bleacher' ? '🏟️' :
                         job.inspectionType === 'outdoor' ? '🪑' : '📋';
        const typeLabel = job.inspectionType === 'basketball' ? 'Basketball' :
                          job.inspectionType === 'bleacher' ? 'Indoor Bleacher' :
                          job.inspectionType === 'outdoor' ? 'Outdoor Bleacher' : 'Inspection';

        let statusBadge, statusStyle;
        if (job.status === 'submitted') {
            statusBadge = 'Needs Review';
            statusStyle = 'background: #fff3e0; color: #e65100;';
        } else if (job.status === 'under_review') {
            statusBadge = 'Under Review';
            statusStyle = 'background: #e3f2fd; color: #1565c0;';
        } else if (job.status === 'approved') {
            statusBadge = 'Approved';
            statusStyle = 'background: #e8f5e9; color: #2e7d32;';
        }

        const bankCount = job.banks?.length || 0;
        const issueCount = job.banks?.reduce((sum, bank) => {
            return sum + (bank.understructureIssues?.length || 0) + (bank.topSideIssues?.length || 0);
        }, 0) || 0;
        const partsCount = job.selectedParts?.length || 0;

        const submittedDate = job.submittedAt ? new Date(job.submittedAt).toLocaleDateString() : '';
        const reviewedInfo = job.reviewedAt ? `<span style="font-size: 12px; color: #1565c0;">Reviewed ${new Date(job.reviewedAt).toLocaleDateString()}</span>` : '';

        // DB-backed jobs open directly in unified detail view; local jobs use ops review detail
        const clickHandler = job._fromDb && job._apiId
            ? `viewWorkOrderDetail(${job._apiId}, 'opsReview')`
            : `openOpsReviewJob(${job.jobNumber})`;

        return `
        <div class="inspection-item" onclick="${clickHandler}" style="cursor: pointer; border-bottom: 1px solid #e9ecef; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span style="font-weight: 700; color: #0066cc; font-size: 15px;">${job.jobNumber}</span>
                        <span style="font-size: 12px; color: #6c757d;">${typeIcon} ${typeLabel}</span>
                    </div>
                    <div style="font-weight: 600; font-size: 15px;">${job.locationName}</div>
                    <div style="font-size: 13px; color: #6c757d; margin-top: 2px;">${job.customerName}</div>
                    ${job.description ? `<div style="font-size: 13px; color: #495057; margin-top: 4px;">${job.description.substring(0, 80)}${job.description.length > 80 ? '...' : ''}</div>` : ''}
                    <div style="font-size: 12px; color: #999; margin-top: 6px;">
                        ${bankCount > 0 ? bankCount + ' bank' + (bankCount !== 1 ? 's' : '') + ' &bull; ' : ''}
                        ${job.inspectorName ? 'Inspector: ' + job.inspectorName + ' &bull; ' : ''}
                        ${submittedDate ? submittedDate : ''}
                    </div>
                    ${reviewedInfo ? `<div style="margin-top: 4px;">${reviewedInfo}</div>` : ''}
                </div>
                <div style="text-align: right; flex-shrink: 0;">
                    <span class="badge" style="${statusStyle}">${statusBadge}</span>
                    <div style="color: #4CAF50; font-size: 20px; margin-top: 8px;">→</div>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function filterOpsReview(filter) {
    currentOpsFilter = filter;
    // Reset sub-filter when changing main filter
    if (filter !== 'approved') {
        currentApprovedSubFilter = 'all';
    }
    loadOpsReview().catch(function(err) { console.error('filterOpsReview error:', err); });
}

function filterApprovedSub(subFilter) {
    currentApprovedSubFilter = subFilter;
    loadOpsReview().catch(function(err) { console.error('filterApprovedSub error:', err); });
}

function openOpsReviewJob(jobNumber) {
    const job = inspectionJobs.find(j => j.jobNumber === jobNumber);
    if (!job) return;

    // Auto-set to under_review when office opens a submitted job
    if (job.status === 'submitted') {
        job.status = 'under_review';
        job.reviewStartedAt = new Date().toISOString();
        const idx = inspectionJobs.findIndex(j => j.jobNumber === jobNumber);
        if (idx >= 0) inspectionJobs[idx] = job;
        localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));
    }

    currentJob = job;
    renderOpsReviewDetail(job);
    showView('opsReviewDetail');
}

function renderOpsReviewDetail(job) {
    const container = document.getElementById('opsReviewDetailContent');

    // Status badge
    let statusBadge = '';
    if (job.status === 'under_review') {
        statusBadge = '<span class="badge" style="background: #e3f2fd; color: #1565c0; font-size: 13px; padding: 4px 12px;">Under Review</span>';
    } else if (job.status === 'approved') {
        statusBadge = '<span class="badge" style="background: #e8f5e9; color: #2e7d32; font-size: 13px; padding: 4px 12px;">Approved</span>';
    } else if (job.status === 'submitted') {
        statusBadge = '<span class="badge" style="background: #fff3e0; color: #e65100; font-size: 13px; padding: 4px 12px;">Needs Review</span>';
    }

    const typeLabel = job.inspectionType === 'basketball' ? 'Basketball Goal' :
                      job.inspectionType === 'bleacher' ? 'Indoor Bleacher' :
                      job.inspectionType === 'outdoor' ? 'Outdoor Bleacher' : 'Inspection';

    // Count issues
    let totalIssues = 0;
    job.banks.forEach(bank => {
        totalIssues += (bank.topSideIssues?.length || 0) + (bank.understructureIssues?.length || 0);
    });

    // Build banks HTML — compact thumbnail cards in a grid
    const banksHTML = job.banks.map((bank, idx) => {
        const underIssues = bank.understructureIssues || [];
        const topIssues = bank.topSideIssues || [];
        const bankTotal = underIssues.length + topIssues.length;
        const hasSafety = !!bank.safetyIssues;

        // Build expandable detail content
        let detailHTML = '';
        if (bank.safetyIssues) {
            detailHTML += `<div style="background: #ffebee; padding: 6px 10px; border-radius: 4px; margin-top: 8px; border-left: 3px solid #c62828;">
                <div style="font-size: 11px; font-weight: 600; color: #c62828;">SAFETY</div>
                <div style="font-size: 12px; margin-top: 2px;">${bank.safetyIssues}</div>
            </div>`;
        }
        if (bank.functionalIssues) {
            detailHTML += `<div style="background: #fff3e0; padding: 6px 10px; border-radius: 4px; margin-top: 4px; border-left: 3px solid #e65100;">
                <div style="font-size: 11px; font-weight: 600; color: #e65100;">FUNCTIONAL</div>
                <div style="font-size: 12px; margin-top: 2px;">${bank.functionalIssues}</div>
            </div>`;
        }
        if (bank.cosmeticIssues) {
            detailHTML += `<div style="background: #e3f2fd; padding: 6px 10px; border-radius: 4px; margin-top: 4px; border-left: 3px solid #1565c0;">
                <div style="font-size: 11px; font-weight: 600; color: #1565c0;">COSMETIC</div>
                <div style="font-size: 12px; margin-top: 2px;">${bank.cosmeticIssues}</div>
            </div>`;
        }
        if (underIssues.length > 0 || topIssues.length > 0) {
            detailHTML += `<div style="margin-top: 8px; font-size: 12px;">`;
            underIssues.forEach(issue => {
                detailHTML += `<div style="padding: 3px 0; border-bottom: 1px solid #f0f0f0;">
                    ${issue.frame ? `<span style="color: #e65100;">F${issue.frame}</span>` : ''}
                    ${issue.tier ? `<span style="color: #6c757d;"> T${issue.tier}</span>` : ''}
                    ${issue.frame || issue.tier ? ' — ' : ''}${issue.description}
                </div>`;
            });
            topIssues.forEach(issue => {
                detailHTML += `<div style="padding: 3px 0; border-bottom: 1px solid #f0f0f0;">
                    ${issue.section ? `<span style="color: #0066cc;">S${issue.section}</span>` : ''}
                    ${issue.row ? `<span style="color: #6c757d;"> R${issue.row}</span>` : ''}
                    ${issue.section || issue.row ? ' — ' : ''}${issue.description}
                </div>`;
            });
            detailHTML += `</div>`;
        }

        return `
        <details style="border: 1px solid ${hasSafety ? '#ef9a9a' : '#e9ecef'}; border-radius: 10px; overflow: hidden; background: white;">
            <summary style="cursor: pointer; padding: 12px; display: flex; align-items: center; gap: 10px; list-style: none;">
                <div style="width: 40px; height: 40px; border-radius: 8px; background: ${bankTotal > 0 ? (hasSafety ? '#ffebee' : '#fff3e0') : '#e8f5e9'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <span style="font-weight: 700; font-size: 16px; color: ${bankTotal > 0 ? (hasSafety ? '#c62828' : '#e65100') : '#2e7d32'};">${bankTotal}</span>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${bank.name}</div>
                    <div style="font-size: 11px; color: #6c757d;">${bank.bleacherType || 'Unknown'} &bull; ${bank.tiers || '?'}T &bull; ${bank.sections || '?'}S &bull; ${bank.aisles || '?'}A</div>
                </div>
                ${hasSafety ? '<span style="font-size: 10px; background: #c62828; color: white; padding: 2px 6px; border-radius: 4px; font-weight: 600;">SAFETY</span>' : ''}
                <span style="font-size: 18px; color: #aaa; transition: transform 0.2s;">▸</span>
            </summary>
            <div style="padding: 0 12px 12px; border-top: 1px solid #f0f0f0;">
                <div style="font-size: 11px; color: #999; margin: 8px 0 4px;">${bank.numberOfMotors || '?'} motors &bull; ${bank.wheelType || 'Unknown wheels'}</div>
                ${detailHTML}
            </div>
        </details>`;
    }).join('');

    // Parts HTML
    let partsHTML = '<p style="color: #6c757d; text-align: center;">No parts added yet</p>';
    if (job.selectedParts && job.selectedParts.length > 0) {
        partsHTML = job.selectedParts.map(part => `
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e9ecef;">
                <div>
                    <span style="font-weight: 600;">${part.partNumber}</span>
                    <span style="color: #6c757d;"> - ${part.description}</span>
                </div>
                <div>Qty: ${part.quantity}</div>
            </div>
        `).join('');
    }

    // Check if work order or estimate exists for this inspection
    const hasWorkOrder = job.workOrderId || job.hasWorkOrder;
    const hasEstimate = job.estimateId || job.hasEstimate;

    // Action buttons - approve and build estimate
    const actionsCard = job.status !== 'approved' ? `
        <div class="card" style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white;">
            <div class="card-body">
                <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Inspection Actions</h3>
                <p style="margin-bottom: 16px; opacity: 0.9; font-size: 14px;">
                    Review and approve this inspection, then build an estimate.
                </p>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button class="btn btn-lg" onclick="approveInspectionOnly()"
                        style="background: white; color: #4CAF50; font-weight: 700; flex: 1; min-width: 150px;">
                        Approve
                    </button>
                    <button class="btn btn-lg" onclick="buildEstimateFromInspection()" disabled
                        style="background: rgba(255,255,255,0.3); color: white; font-weight: 700; flex: 1; min-width: 150px; cursor: not-allowed;"
                        title="Approve inspection first">
                        Build Estimate
                    </button>
                </div>
            </div>
        </div>
    ` : `
        <div class="card" style="background: #e8f5e9; border: 2px solid #4CAF50;">
            <div class="card-body">
                <div style="margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="font-size: 20px;">✓</span>
                        <span style="font-weight: 600; color: #2e7d32;">Inspection Approved</span>
                    </div>
                    <p style="font-size: 13px; color: #6c757d; margin: 0;">
                        Reviewed ${job.reviewedAt ? new Date(job.reviewedAt).toLocaleDateString() : ''} ${job.reviewedBy ? 'by ' + job.reviewedBy : ''}
                    </p>
                </div>

                <!-- Status indicator -->
                <div style="display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 16px;">${job._apiId ? '✓' : '○'}</span>
                        <span style="color: ${job._apiId ? '#2e7d32' : '#e65100'};">${job._apiId ? 'Saved to Database' : 'Not Saved to Database'}</span>
                        ${!job._apiId ? '<button class="btn btn-outline" onclick="retryPersistInspection()" style="font-size: 11px; padding: 2px 8px; margin-left: 8px;">Retry Save</button>' : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 16px;">${hasEstimate ? '✓' : '○'}</span>
                        <span style="color: ${hasEstimate ? '#2e7d32' : '#6c757d'};">Estimate ${hasEstimate ? 'Created' : 'Pending'}</span>
                    </div>
                </div>

                <!-- Action buttons -->
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    ${!hasEstimate ? `
                        <button class="btn" onclick="buildEstimateFromInspection()"
                            style="background: #1565c0; color: white; font-weight: 600; flex: 1; min-width: 150px;">
                            Build Estimate
                        </button>
                    ` : `
                        <button class="btn btn-outline" onclick="viewEstimate('${job.estimateId}')"
                            style="flex: 1; min-width: 150px;">
                            View Estimate
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;

    // Keep backward compatibility
    const estimateBtn = actionsCard;

    container.innerHTML = `
        <div class="card" style="border-left: 4px solid #4CAF50;">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h2 class="card-title">Job ${job.jobNumber}</h2>
                ${statusBadge}
            </div>
            <div class="card-body">
                <p style="font-size: 18px; font-weight: 600;">${job.locationName}</p>
                <p style="color: #6c757d;">${job.customerName}</p>
                <p style="color: #999; font-size: 13px; margin-top: 4px;">${job.locationAddress}</p>
                <div style="margin-top: 16px; display: flex; gap: 16px; flex-wrap: wrap;">
                    <div style="background: #f0f4f8; padding: 12px 20px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: #6c757d;">Type</div>
                        <div style="font-weight: 600;">${typeLabel}</div>
                    </div>
                    <div style="background: #e8f5e9; padding: 12px 20px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 700; color: #2e7d32;">${job.banks.length}</div>
                        <div style="font-size: 12px; color: #2e7d32;">Banks</div>
                    </div>
                    <div style="background: #fff3e0; padding: 12px 20px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 700; color: #e65100;">${totalIssues}</div>
                        <div style="font-size: 12px; color: #e65100;">Issues</div>
                    </div>
                    <div style="background: #e3f2fd; padding: 12px 20px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 700; color: #1565c0;">${job.selectedParts?.length || 0}</div>
                        <div style="font-size: 12px; color: #1565c0;">Parts</div>
                    </div>
                </div>
                <div style="margin-top: 16px; font-size: 13px; color: #6c757d;">
                    Inspector: <strong>${job.inspectorName || 'Unknown'}</strong>
                    ${job.inspectorCertificate ? ` &bull; Cert: ${job.inspectorCertificate}` : ''}
                    &bull; Submitted ${job.submittedAt ? new Date(job.submittedAt).toLocaleDateString() : 'N/A'}
                </div>
                ${job._apiId ? `
                <div style="margin-top: 16px;">
                    <button class="btn btn-outline" onclick="viewWorkOrderDetail(${job._apiId}, 'opsReview')" style="font-size: 13px; padding: 8px 16px;">
                        View Full Job Detail
                    </button>
                </div>
                ` : ''}
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Banks Inspected (${job.banks.length})</h2>
            </div>
            <div class="card-body" style="display: flex; flex-direction: column; gap: 8px;">${banksHTML}</div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Parts Needed (${job.selectedParts?.length || 0})</h2>
            </div>
            <div class="card-body">${partsHTML}</div>
        </div>

        ${estimateBtn}
    `;
}

function backToOpsReview() {
    currentJob = null;
    showView('opsReview');
}

// Update ops review badge on page load
function updateOpsReviewBadge() {
    const submitted = inspectionJobs.filter(j => j.status === 'submitted');
    const badge = document.getElementById('opsReviewBadge');
    if (badge) {
        badge.textContent = submitted.length;
        badge.style.display = submitted.length > 0 ? 'inline-block' : 'none';
    }
}

// ==========================================
// INSPECTION ACTIONS
// ==========================================

// Persist inspection to DB as an independent billable job
async function persistInspectionToDB(job) {
    // Already persisted — return existing ID
    if (job._apiId) {
        return job._apiId;
    }

    if (typeof JobsAPI === 'undefined') {
        throw new Error('JobsAPI not available');
    }

    // Create the inspection job in Postgres
    const inspResult = await JobsAPI.create({
        jobType: 'inspection',
        status: 'completed',
        customerId: job.customerId,
        customerName: job.customerName,
        locationName: job.locationName,
        address: job.locationAddress,
        description: job.description || (job.inspectionType || 'Inspection') + ' - ' + (job.banks?.length || 0) + ' bank(s)',
        contactName: job.contactName,
        contactPhone: job.contactPhone,
        metadata: {
            inspectorName: job.inspectorName,
            inspectorCertificate: job.inspectorCertificate,
            inspectionType: job.inspectionType,
            source: 'ops-review-approve'
        }
    });

    const apiId = inspResult.job?.id;
    if (!apiId) {
        throw new Error('No job ID returned from API');
    }

    // Sync all inspection banks to the DB job
    if (job.banks && job.banks.length > 0) {
        for (const bank of job.banks) {
            try {
                await JobsAPI.addInspectionBank(apiId, {
                    bankName: bank.name,
                    bleacherType: bank.bleacherType,
                    rowCount: bank.tiers || bank.rows,
                    checklistData: {
                        understructure: bank.understructureChecklist,
                        topSide: bank.topSideChecklist
                    },
                    issues: [
                        ...(bank.understructureIssues || []).map(i => ({ ...i, location: 'understructure' })),
                        ...(bank.topSideIssues || []).map(i => ({ ...i, location: 'topside' }))
                    ]
                });
            } catch (bankErr) {
                console.warn('Failed to add inspection bank:', bankErr);
            }
        }
    }

    // Store the API ID back on the localStorage record
    job._apiId = apiId;
    const idx = inspectionJobs.findIndex(j => j.jobNumber === job.jobNumber);
    if (idx >= 0) {
        inspectionJobs[idx]._apiId = apiId;
        localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));
    }

    return apiId;
}

// Retry persisting inspection to DB (called from UI retry button)
async function retryPersistInspection() {
    if (!currentJob) return;
    try {
        await persistInspectionToDB(currentJob);
        alert('Inspection saved to database successfully!');
        renderOpsReviewDetail(currentJob);
    } catch (err) {
        alert('Failed to save: ' + err.message);
    }
}

// Approve inspection and persist to DB as a billable job
async function approveInspectionOnly() {
    if (!currentJob) {
        alert('No job selected');
        return;
    }

    const message = `Approve this inspection?\n\n` +
        `Job ${currentJob.jobNumber}\n` +
        `${currentJob.locationName}\n` +
        `${currentJob.banks?.length || 0} bank(s) inspected\n\n` +
        `This will save the inspection to the database as a billable job.`;

    if (!confirm(message)) return;

    // Mark inspection as approved
    currentJob.status = 'approved';
    currentJob.reviewedBy = currentRole === 'admin' ? 'Admin' : 'Office';
    currentJob.reviewedAt = new Date().toISOString();

    // Save inspection status to localStorage
    const idx = inspectionJobs.findIndex(j => j.jobNumber === currentJob.jobNumber);
    if (idx >= 0) inspectionJobs[idx] = currentJob;
    localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));

    // Persist to DB as an independent billable job
    try {
        await persistInspectionToDB(currentJob);
        alert(`Inspection ${currentJob.jobNumber} approved and saved to database!`);
    } catch (err) {
        console.error('Failed to persist inspection to DB:', err);
        alert(`Inspection ${currentJob.jobNumber} approved locally.\n\nWarning: Could not save to database. You can retry from the detail view.`);
    }

    // Refresh the view to show updated status
    renderOpsReviewDetail(currentJob);
    updateOpsReviewBadge();
}

// ==========================================
// WORK ORDER BUILDER
// ==========================================

// Open work order creation modal
function openCreateWorkOrderModal() {
    if (!currentJob) {
        alert('No job selected');
        return;
    }

    // Count issues for description
    let issueCount = 0;
    currentJob.banks?.forEach(bank => {
        issueCount += (bank.understructureIssues?.length || 0);
        issueCount += (bank.topSideIssues?.length || 0);
    });

    // Determine default job type
    const defaultJobType = currentJob.inspectionType === 'basketball' ? 'repair' :
                           (currentJob.selectedParts?.length > 0 ? 'repair' : 'inspection');

    // Build default description
    const typeLabel = currentJob.inspectionType === 'basketball' ? 'Basketball Goal' :
                      currentJob.inspectionType === 'bleacher' ? 'Indoor Bleacher' : 'Outdoor Bleacher';

    // Pre-fill the modal form (job number auto-assigned by API)
    document.getElementById('createWoJobNumber').value = '';
    document.getElementById('createWoCustomerName').value = currentJob.customerName || '';
    document.getElementById('createWoLocationName').value = currentJob.locationName || '';
    document.getElementById('createWoLocationAddress').value = currentJob.locationAddress || '';
    document.getElementById('createWoJobType').value = defaultJobType;
    document.getElementById('createWoDescription').value = `${typeLabel} - ${issueCount} issues found across ${currentJob.banks?.length || 0} bank(s).`;
    document.getElementById('createWoContactName').value = '';
    document.getElementById('createWoContactPhone').value = '';
    document.getElementById('createWoSpecialInstructions').value = '';
    document.getElementById('createWoNotes').value = `Inspector: ${currentJob.inspectorName || 'Unknown'}. Certificate: ${currentJob.inspectorCertificate || 'N/A'}`;

    // Show parts count
    const partsCount = currentJob.selectedParts?.length || 0;
    document.getElementById('createWoPartsInfo').textContent = partsCount > 0
        ? `${partsCount} part(s) from inspection will be attached`
        : 'No parts specified in inspection';

    // Show modal
    document.getElementById('createWorkOrderModal').classList.remove('hidden');
}

// Close work order modal
function closeCreateWorkOrderModal() {
    document.getElementById('createWorkOrderModal').classList.add('hidden');
}

// Submit work order from modal
async function submitWorkOrderFromModal() {
    const submitBtn = document.getElementById('createWoSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    try {
        // Get the parent inspection's DB ID (should already exist from approval)
        let parentJobId = currentJob._apiId || null;
        if (!parentJobId && typeof JobsAPI !== 'undefined') {
            // Fallback: persist now if not done during approval
            try {
                parentJobId = await persistInspectionToDB(currentJob);
            } catch (persistErr) {
                console.warn('Could not persist inspection to DB:', persistErr);
            }
        }

        const manualJobNumber = document.getElementById('createWoJobNumber').value.trim();
        const jobData = {
            ...(manualJobNumber ? { jobNumber: manualJobNumber } : {}),
            jobType: document.getElementById('createWoJobType').value,
            status: 'draft',  // Draft = unassigned/backlog
            customerId: currentJob.customerId,
            customerName: document.getElementById('createWoCustomerName').value,
            locationId: currentJob.locationId,
            locationName: document.getElementById('createWoLocationName').value,
            locationAddress: document.getElementById('createWoLocationAddress').value,
            description: document.getElementById('createWoDescription').value,
            contactName: document.getElementById('createWoContactName').value,
            contactPhone: document.getElementById('createWoContactPhone').value,
            specialInstructions: document.getElementById('createWoSpecialInstructions').value,
            notes: document.getElementById('createWoNotes').value,
            inspectionJobNumber: currentJob.jobNumber,
            parentJobId: parentJobId,
            partsNeeded: currentJob.selectedParts || [],
            createdBy: currentRole === 'admin' ? 'Admin' : 'Office'
        };

        const result = await JobsAPI.create(jobData);

        // Add inspection banks to the child work order
        if (result.job && result.job.id && currentJob.banks) {
            for (const bank of currentJob.banks) {
                try {
                    await JobsAPI.addInspectionBank(result.job.id, {
                        bankName: bank.name,
                        bleacherType: bank.bleacherType,
                        rowCount: bank.tiers || bank.rows,
                        checklistData: {
                            understructure: bank.understructureChecklist,
                            topSide: bank.topSideChecklist
                        },
                        issues: [
                            ...(bank.understructureIssues || []).map(i => ({ ...i, location: 'understructure' })),
                            ...(bank.topSideIssues || []).map(i => ({ ...i, location: 'topside' }))
                        ]
                    });
                } catch (bankErr) {
                    console.warn('Failed to add inspection bank:', bankErr);
                }
            }
        }

        // Mark inspection as having a work order
        currentJob.hasWorkOrder = true;
        currentJob.workOrderId = result.job?.id;
        const idx = inspectionJobs.findIndex(j => j.jobNumber === currentJob.jobNumber);
        if (idx >= 0) inspectionJobs[idx] = currentJob;
        localStorage.setItem('inspectionJobs', JSON.stringify(inspectionJobs));

        closeCreateWorkOrderModal();

        // Navigate to the new work order detail view
        viewWorkOrderDetail(result.job.id, 'opsReviewDetail');

    } catch (err) {
        console.error('Failed to create work order:', err);
        alert(`Failed to create work order: ${err.message}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Work Order';
    }
}

// View work order (placeholder)
function viewWorkOrder(workOrderId) {
    alert(`View work order: ${workOrderId}\n\nNavigating to Jobs view...`);
    showView('jobs');
}

// View estimate (placeholder)
function viewEstimate(estimateId) {
    alert(`View estimate: ${estimateId}\n\nNavigating to Estimates view...`);
    showView('estimates');
}

// ==========================================
// ESTIMATE BUILDER INTEGRATION
// ==========================================

// Open estimate builder with pre-filled inspection data
function buildEstimateFromInspection() {
    if (!currentJob) {
        alert('No job selected');
        return;
    }

    // Prepare data for estimate builder
    const prefillData = {
        jobNumber: currentJob.jobNumber,
        _apiId: currentJob._apiId || null,
        customerId: currentJob.customerId,
        customerName: currentJob.customerName,
        locationId: currentJob.locationId,
        locationName: currentJob.locationName,
        locationAddress: currentJob.locationAddress,
        selectedParts: currentJob.selectedParts || [],
        banks: currentJob.banks || [],
        inspectionType: currentJob.inspectionType
    };

    // Call the estimate builder (from estimate-builder.js)
    if (typeof openEstimateBuilderFromInspection === 'function') {
        openEstimateBuilderFromInspection(prefillData);
    } else {
        alert('Estimate builder not available');
    }
}
