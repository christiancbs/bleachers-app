// ==========================================
// OPS REVIEW
// List view, detail view, status flow
// ==========================================

function loadOpsReview() {
    const reviewJobs = inspectionJobs.filter(j => j.status === 'submitted' || j.status === 'under_review' || j.status === 'approved');
    const submitted = reviewJobs.filter(j => j.status === 'submitted');
    const underReview = reviewJobs.filter(j => j.status === 'under_review');
    const approved = reviewJobs.filter(j => j.status === 'approved');

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
    let filteredJobs = reviewJobs;
    if (currentOpsFilter !== 'all') {
        filteredJobs = reviewJobs.filter(j => j.status === currentOpsFilter);
    }

    // Update filter tab active states
    document.getElementById('opsFilterAll').classList.toggle('active', currentOpsFilter === 'all');
    document.getElementById('opsFilterSubmitted').classList.toggle('active', currentOpsFilter === 'submitted');
    document.getElementById('opsFilterUnderReview').classList.toggle('active', currentOpsFilter === 'under_review');
    document.getElementById('opsFilterApproved').classList.toggle('active', currentOpsFilter === 'approved');

    const list = document.getElementById('opsReviewList');
    if (filteredJobs.length === 0) {
        const emptyMsg = currentOpsFilter === 'all' ? 'No inspections to review yet' :
            currentOpsFilter === 'submitted' ? 'No inspections awaiting review' :
            currentOpsFilter === 'under_review' ? 'No inspections currently under review' :
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
        const reviewedInfo = job.reviewedAt ? `<span style="font-size: 12px; color: #1565c0;">Reviewed ${new Date(job.reviewedAt).toLocaleDateString()}${job.reviewedBy ? ' by ' + job.reviewedBy : ''}</span>` : '';

        return `
        <div class="inspection-item" onclick="openOpsReviewJob(${job.jobNumber})" style="cursor: pointer; border-bottom: 1px solid #e9ecef; padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                        <span style="font-weight: 700; color: #0066cc; font-size: 15px;">#${job.jobNumber}</span>
                        <span style="font-size: 12px; color: #6c757d;">${typeIcon} ${typeLabel}</span>
                    </div>
                    <div style="font-weight: 600; font-size: 15px;">${job.locationName}</div>
                    <div style="font-size: 13px; color: #6c757d; margin-top: 2px;">${job.customerName}</div>
                    <div style="font-size: 13px; color: #6c757d; margin-top: 8px;">
                        ${bankCount} bank${bankCount !== 1 ? 's' : ''} &bull; ${issueCount} issue${issueCount !== 1 ? 's' : ''} &bull; ${partsCount} part${partsCount !== 1 ? 's' : ''}
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 4px;">
                        Inspector: ${job.inspectorName || 'Unknown'} &bull; Submitted ${submittedDate}
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
    loadOpsReview();
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

    // Build banks HTML
    const banksHTML = job.banks.map(bank => {
        const underIssues = bank.understructureIssues || [];
        const topIssues = bank.topSideIssues || [];
        const bankTotal = underIssues.length + topIssues.length;

        let issuesHTML = '';
        if (bank.safetyIssues) {
            issuesHTML += `<div style="background: #ffebee; padding: 8px 12px; border-radius: 4px; margin-top: 8px; border-left: 3px solid #c62828;">
                <div style="font-size: 11px; font-weight: 600; color: #c62828; text-transform: uppercase;">Safety Issues</div>
                <div style="font-size: 13px; margin-top: 4px;">${bank.safetyIssues}</div>
            </div>`;
        }
        if (bank.functionalIssues) {
            issuesHTML += `<div style="background: #fff3e0; padding: 8px 12px; border-radius: 4px; margin-top: 8px; border-left: 3px solid #e65100;">
                <div style="font-size: 11px; font-weight: 600; color: #e65100; text-transform: uppercase;">Functional/Mechanical</div>
                <div style="font-size: 13px; margin-top: 4px;">${bank.functionalIssues}</div>
            </div>`;
        }
        if (bank.cosmeticIssues) {
            issuesHTML += `<div style="background: #e3f2fd; padding: 8px 12px; border-radius: 4px; margin-top: 8px; border-left: 3px solid #1565c0;">
                <div style="font-size: 11px; font-weight: 600; color: #1565c0; text-transform: uppercase;">Cosmetic</div>
                <div style="font-size: 13px; margin-top: 4px;">${bank.cosmeticIssues}</div>
            </div>`;
        }

        // Individual issues detail
        if (underIssues.length > 0 || topIssues.length > 0) {
            issuesHTML += `<details style="margin-top: 12px;">
                <summary style="cursor: pointer; font-size: 13px; color: #0066cc;">View ${bankTotal} detailed issue${bankTotal !== 1 ? 's' : ''}</summary>
                <div style="padding: 12px 0;">`;

            if (underIssues.length > 0) {
                issuesHTML += `<div style="font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; margin-bottom: 4px;">Understructure</div>`;
                underIssues.forEach(issue => {
                    issuesHTML += `<div style="font-size: 13px; padding: 4px 0; border-bottom: 1px solid #f0f0f0;">
                        ${issue.frame ? `<span style="color: #e65100;">Frame ${issue.frame}</span>` : ''}
                        ${issue.tier ? `<span style="color: #6c757d;"> Tier ${issue.tier}</span>` : ''}
                        ${issue.frame || issue.tier ? ' - ' : ''}${issue.description}
                    </div>`;
                });
            }

            if (topIssues.length > 0) {
                issuesHTML += `<div style="font-size: 11px; font-weight: 600; color: #6c757d; text-transform: uppercase; margin: 12px 0 4px;">Top Side</div>`;
                topIssues.forEach(issue => {
                    issuesHTML += `<div style="font-size: 13px; padding: 4px 0; border-bottom: 1px solid #f0f0f0;">
                        ${issue.section ? `<span style="color: #0066cc;">Section ${issue.section}</span>` : ''}
                        ${issue.row ? `<span style="color: #6c757d;"> Row ${issue.row}</span>` : ''}
                        ${issue.section || issue.row ? ' - ' : ''}${issue.description}
                    </div>`;
                });
            }

            issuesHTML += `</div></details>`;
        }

        return `
        <div style="border: 1px solid #e9ecef; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                    <div style="font-weight: 600; font-size: 16px;">${bank.name}</div>
                    <div style="font-size: 13px; color: #6c757d; margin-top: 4px;">
                        ${bank.bleacherType || 'Unknown'} &bull; ${bank.tiers || '?'} tiers &bull; ${bank.sections || '?'} sections &bull; ${bank.aisles || '?'} aisles
                    </div>
                    <div style="font-size: 12px; color: #999; margin-top: 2px;">
                        ${bank.numberOfMotors || '?'} motors &bull; ${bank.wheelType || 'Unknown wheels'}
                    </div>
                </div>
                <div style="background: ${bankTotal > 0 ? '#fff3e0' : '#e8f5e9'}; padding: 6px 12px; border-radius: 4px;">
                    <span style="font-weight: 600; color: ${bankTotal > 0 ? '#e65100' : '#2e7d32'};">${bankTotal}</span>
                    <span style="font-size: 12px; color: #6c757d;"> issues</span>
                </div>
            </div>
            ${issuesHTML}
        </div>`;
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

    // Generate estimate button (only for non-approved)
    const estimateBtn = job.status !== 'approved' ? `
        <div class="card" style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white;">
            <div class="card-body">
                <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 8px;">Generate QuickBooks Estimate</h3>
                <p style="margin-bottom: 16px; opacity: 0.9; font-size: 14px;">
                    Approve this inspection, create a work order, and push the estimate to QuickBooks.
                </p>
                <button class="btn btn-lg" onclick="generateEstimateFromJob()"
                    style="background: white; color: #4CAF50; font-weight: 700; width: 100%;">
                    Approve & Generate Estimate
                </button>
            </div>
        </div>
    ` : `
        <div class="card" style="background: #e8f5e9; border: 2px solid #4CAF50;">
            <div class="card-body" style="text-align: center;">
                <div style="font-size: 24px; margin-bottom: 8px;">&#10003;</div>
                <p style="font-weight: 600; color: #2e7d32;">This inspection has been approved</p>
                <p style="font-size: 13px; color: #6c757d; margin-top: 4px;">
                    Reviewed ${job.reviewedAt ? new Date(job.reviewedAt).toLocaleDateString() : ''} ${job.reviewedBy ? 'by ' + job.reviewedBy : ''}
                </p>
            </div>
        </div>
    `;

    container.innerHTML = `
        <div class="card" style="border-left: 4px solid #4CAF50;">
            <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
                <h2 class="card-title">Job #${job.jobNumber}</h2>
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
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h2 class="card-title">Banks Inspected</h2>
            </div>
            <div class="card-body">${banksHTML}</div>
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
