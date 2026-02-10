/**
 * ServicePal Data Migration Scraper
 *
 * One-time tool to extract all work order data from ServicePal
 * for migration to bleachers-app.
 *
 * Usage:
 *   npm run scrape         # Full scrape
 *   npm run scrape:test    # Test mode (first 10 jobs only)
 *   npm run scrape:resume  # Resume from last position
 */

import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'output');
const PROGRESS_FILE = path.join(OUTPUT_DIR, '_progress.json');

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
  // ServicePal URLs
  urls: {
    login: 'https://app.servicepal.com/Account/LogOn',
    jobs: 'https://app.servicepal.com/Job',
  },

  // Credentials - loaded from config.json
  credentials: null,

  // Timing (be polite to their servers)
  delays: {
    betweenPages: 2000,      // 2 sec between page navigations
    betweenJobs: 3000,       // 3 sec between job details
    afterLogin: 3000,        // 3 sec after login
  },

  // Limits
  testMode: process.argv.includes('--test'),
  resumeMode: process.argv.includes('--resume'),
  testLimit: 10,  // Jobs to process in test mode
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadCredentials() {
  try {
    const configPath = path.join(__dirname, 'config.json');
    const configData = await fs.readFile(configPath, 'utf-8');
    CONFIG.credentials = JSON.parse(configData);
    console.log('✓ Credentials loaded');
  } catch (err) {
    console.error('\n❌ Missing config.json file!');
    console.error('Create config.json with your ServicePal credentials:');
    console.error(`
{
  "email": "your-email@example.com",
  "password": "your-password"
}
`);
    process.exit(1);
  }
}

async function ensureOutputDir() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(path.join(OUTPUT_DIR, 'jobs'), { recursive: true });
  await fs.mkdir(path.join(OUTPUT_DIR, 'photos'), { recursive: true });
}

async function saveProgress(progress) {
  await fs.writeFile(PROGRESS_FILE, JSON.stringify(progress, null, 2));
}

async function loadProgress() {
  try {
    const data = await fs.readFile(PROGRESS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return {
      completedJobs: [],
      lastPageNumber: 1,
      stats: { jobs: 0, photos: 0, workOrders: 0 },
      formTypeCounts: {},
      territoryCounts: {},
    };
  }
}

async function saveJobData(jobNumber, data) {
  const filePath = path.join(OUTPUT_DIR, 'jobs', `${jobNumber}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

async function downloadPhoto(page, photoUrl, jobNumber, photoIndex) {
  try {
    // Create a new page for downloading to avoid navigation issues
    const downloadPage = await page.browser().newPage();
    const response = await downloadPage.goto(photoUrl, { waitUntil: 'networkidle2' });
    const buffer = await response.buffer();
    await downloadPage.close();

    // Determine extension from URL or default to jpg
    const ext = photoUrl.match(/\.(jpg|jpeg|png|gif|webp)/i)?.[1] || 'jpg';
    const filename = `${jobNumber}_photo_${photoIndex}.${ext}`;
    const filePath = path.join(OUTPUT_DIR, 'photos', filename);

    await fs.writeFile(filePath, buffer);
    console.log(`        ✓ Downloaded: ${filename}`);
    return filename;
  } catch (err) {
    console.error(`        ⚠ Failed to download photo: ${err.message}`);
    return null;
  }
}

// ============================================================
// SCRAPER FUNCTIONS
// ============================================================

async function login(page) {
  console.log('\n📋 Logging into ServicePal...');

  await page.goto(CONFIG.urls.login, { waitUntil: 'networkidle2' });
  await delay(1000);

  // Debug: Log what we see
  const pageTitle = await page.title();
  console.log(`  Page title: ${pageTitle}`);

  // Try various selectors for email field
  const emailSelectors = [
    'input[type="email"]',
    'input[name="Email"]',
    'input[name="email"]',
    '#Email',
    '#email',
    'input[placeholder*="email" i]',
    'input[placeholder*="Email" i]',
  ];

  let emailField = null;
  for (const sel of emailSelectors) {
    emailField = await page.$(sel);
    if (emailField) {
      console.log(`  Found email field: ${sel}`);
      break;
    }
  }

  if (!emailField) {
    // Debug: show available inputs
    const inputs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('input')).map(i => ({
        type: i.type,
        name: i.name,
        id: i.id,
        placeholder: i.placeholder,
      }));
    });
    console.log('  Available inputs:', JSON.stringify(inputs, null, 2));
    throw new Error('Could not find email input field');
  }

  await emailField.type(CONFIG.credentials.email, { delay: 50 });

  // Find password field
  const passwordSelectors = [
    'input[type="password"]',
    'input[name="Password"]',
    'input[name="password"]',
    '#Password',
    '#password',
  ];

  let passwordField = null;
  for (const sel of passwordSelectors) {
    passwordField = await page.$(sel);
    if (passwordField) {
      console.log(`  Found password field: ${sel}`);
      break;
    }
  }

  if (!passwordField) {
    throw new Error('Could not find password input field');
  }

  await passwordField.type(CONFIG.credentials.password, { delay: 50 });

  // Find and click submit button
  const submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    '.btn-primary',
    '#loginBtn',
  ];

  let submitButton = null;
  for (const sel of submitSelectors) {
    submitButton = await page.$(sel);
    if (submitButton) {
      console.log(`  Found submit button: ${sel}`);
      break;
    }
  }

  // If not found, search by text
  if (!submitButton) {
    submitButton = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
      return buttons.find(el => el.textContent?.includes('Log') || el.textContent?.includes('Sign') || el.value?.includes('Log'));
    });
    if (submitButton) {
      submitButton = submitButton.asElement();
      console.log('  Found submit button by text content');
    }
  }

  if (!submitButton) {
    throw new Error('Could not find submit button');
  }

  // Submit and wait for navigation
  await Promise.all([
    submitButton.click(),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
  ]);

  await delay(CONFIG.delays.afterLogin);

  // Verify login succeeded
  const url = page.url();
  console.log(`  Post-login URL: ${url}`);

  if (url.includes('LogOn') || url.includes('login') || url.includes('signin')) {
    throw new Error('Login failed - still on login page. Check credentials.');
  }

  console.log('✓ Logged in successfully');
}

async function getJobList(page) {
  console.log('\n📋 Getting job list from /Job...');

  await page.goto(CONFIG.urls.jobs, { waitUntil: 'networkidle2' });
  await delay(CONFIG.delays.betweenPages);

  // Debug: see what's on the page
  const pageTitle = await page.title();
  console.log(`  Page title: ${pageTitle}`);

  // Get all jobs from the table
  const jobs = await page.evaluate(() => {
    const rows = document.querySelectorAll('table tbody tr');
    return Array.from(rows).map(row => {
      const cells = row.querySelectorAll('td');
      const jobLink = row.querySelector('a');

      return {
        jobNumber: jobLink?.textContent?.trim() || cells[0]?.textContent?.trim(),
        jobUrl: jobLink?.href,
        type: cells[2]?.textContent?.trim(),
        description: cells[3]?.textContent?.trim(),
        customer: cells[4]?.textContent?.trim(),
        city: cells[5]?.textContent?.trim(),
        status: cells[6]?.textContent?.trim(),
        startDate: cells[8]?.textContent?.trim(),
        endDate: cells[9]?.textContent?.trim(),
      };
    }).filter(j => j.jobNumber && j.jobUrl);
  });

  console.log(`  Found ${jobs.length} jobs on this page`);

  // Check pagination info
  const paginationInfo = await page.evaluate(() => {
    const pager = document.querySelector('.pager, .pagination-info, [class*="pager"]');
    return pager?.textContent?.trim() || '';
  });

  if (paginationInfo) {
    console.log(`  Pagination: ${paginationInfo}`);
  }

  return jobs;
}

async function navigateToPage(page, targetPage) {
  // Kendo UI grid pagination - click the specific page number
  if (targetPage === 1) return true;

  console.log(`  → Navigating to page ${targetPage}...`);

  for (let currentPage = 1; currentPage < targetPage; currentPage++) {
    // Find and click the "next" button or the specific page number
    const clicked = await page.evaluate((target) => {
      // Try to find direct page number link first
      const pageLinks = document.querySelectorAll('.k-pager-numbers a, .k-pager-nav');
      for (const link of pageLinks) {
        if (link.textContent?.trim() === String(target)) {
          link.click();
          return true;
        }
      }

      // Otherwise click "next" button
      const nextBtn = document.querySelector('.k-pager-nav:not(.k-disabled) .k-i-arrow-e, .k-pager-nav[title="Go to the next page"]:not(.k-disabled), a[title="Go to the next page"]');
      if (nextBtn) {
        nextBtn.closest('a')?.click() || nextBtn.click();
        return true;
      }

      return false;
    }, currentPage + 1);

    if (!clicked) {
      console.log(`  ⚠ Could not navigate to page ${currentPage + 1}`);
      return false;
    }

    // Wait for grid to reload
    await delay(2000);
    await page.waitForSelector('tr[data-uid]', { timeout: 10000 }).catch(() => {});
  }

  return true;
}

async function scrapeAllJobs(page, progress) {
  console.log('\n📋 Starting job scrape...');

  await page.goto(CONFIG.urls.jobs, { waitUntil: 'networkidle2' });
  await delay(CONFIG.delays.betweenPages);

  let totalProcessed = 0;
  let pageNum = CONFIG.resumeMode ? progress.lastPageNumber : 1;
  let hasMorePages = true;

  // If resuming, navigate to the correct page
  if (CONFIG.resumeMode && pageNum > 1) {
    const navigated = await navigateToPage(page, pageNum);
    if (!navigated) {
      console.log('  ⚠ Could not navigate to resume page, starting from page 1');
      pageNum = 1;
    }
  }

  while (hasMorePages) {
    console.log(`\n📄 Page ${pageNum}...`);

    // Get jobs on current page - use Kendo grid selectors
    const jobs = await page.evaluate(() => {
      // Find all Kendo grid data rows (they have data-uid attribute)
      const rows = document.querySelectorAll('tr[data-uid]');
      const jobs = [];

      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 5) continue;

        // Find the job link - it contains /job/details/ (lowercase)
        const jobLink = row.querySelector('a[href*="/job/details/"]');
        if (!jobLink) continue;

        const jobNumber = jobLink.textContent?.trim();
        const jobUrl = jobLink.href;

        if (!jobNumber || !jobUrl) continue;

        // Debug: log cell contents for first row to verify column order
        if (jobs.length === 0) {
          console.log('DEBUG - First row cells:', Array.from(cells).map((c, i) => `[${i}]: ${c.textContent?.trim().slice(0,25)}`).join(' | '));
        }

        jobs.push({
          jobNumber: jobNumber,
          jobUrl: jobUrl,
          // Column order based on ServicePal Kendo grid:
          // [0]=Job# (link), [1]=Job# (text), [2]=Type, [3]=Description, [4]=Customer, [5]=City, [6]=Status, [7]=Resources, [8]=Starts, [9]=Ends
          // Note: cells[0] contains the job link, cells[1] repeats the job number as text
          jobType: cells[2]?.textContent?.trim(),
          description: cells[3]?.textContent?.trim(),
          customer: cells[4]?.textContent?.trim(),
          city: cells[5]?.textContent?.trim(),
          status: cells[6]?.textContent?.trim(),
          resources: cells[7]?.textContent?.trim(),
          startDate: cells[8]?.textContent?.trim(),
          endDate: cells[9]?.textContent?.trim(),
        });
      }

      return jobs;
    });

    console.log(`  Found ${jobs.length} jobs`);

    // Debug: show first few job numbers
    if (jobs.length > 0) {
      const sampleJobs = jobs.slice(0, 3).map(j => j.jobNumber).join(', ');
      console.log(`  Sample: ${sampleJobs}...`);
    }

    if (jobs.length === 0) {
      console.log('  No jobs found on page, stopping.');
      break;
    }

    // Process each job on this page
    for (let jobIndex = 0; jobIndex < jobs.length; jobIndex++) {
      const job = jobs[jobIndex];

      // Test mode limit
      if (CONFIG.testMode && totalProcessed >= CONFIG.testLimit) {
        console.log(`\n🧪 Test limit reached (${CONFIG.testLimit} jobs)`);
        return;
      }

      // Skip if already processed
      if (progress.completedJobs.includes(job.jobNumber)) {
        console.log(`  ⏭ Job ${job.jobNumber} already done, skipping`);
        continue;
      }

      try {
        await scrapeJob(page, job, progress);
        totalProcessed++;

        // Update progress
        progress.completedJobs.push(job.jobNumber);
        progress.stats.jobs++;
        progress.lastPageNumber = pageNum;
        await saveProgress(progress);

      } catch (err) {
        console.error(`  ❌ Error on job ${job.jobNumber}: ${err.message}`);
        // Continue to next job
      }

      // Navigate back to job list and correct page for next job
      await page.goto(CONFIG.urls.jobs, { waitUntil: 'networkidle2' });
      await delay(CONFIG.delays.betweenPages);

      if (pageNum > 1) {
        await navigateToPage(page, pageNum);
      }

      await delay(CONFIG.delays.betweenJobs);
    }

    // Try to go to next page - Kendo UI grid pagination
    const hasNextPage = await page.evaluate(() => {
      // Kendo UI uses .k-pager-nav with arrow icons for next/prev
      // Check if next button exists and is not disabled
      const nextBtn = document.querySelector(
        'a[title="Go to the next page"]:not(.k-disabled), ' +
        '.k-pager-nav:not(.k-disabled) .k-i-arrow-e, ' +
        '.k-pager-wrap a:not(.k-disabled)[aria-label="Go to the next page"]'
      );

      if (nextBtn) {
        // Click the anchor element
        const clickTarget = nextBtn.closest('a') || nextBtn;
        clickTarget.click();
        return true;
      }

      // Fallback: try generic pagination selectors
      const fallbackNext = document.querySelector('.next a, .pagination .next:not(.disabled) a, a[rel="next"]');
      if (fallbackNext) {
        fallbackNext.click();
        return true;
      }

      return false;
    });

    if (hasNextPage) {
      console.log('  → Going to next page...');
      // Wait for the grid to reload (Kendo does AJAX pagination)
      await delay(2000);
      await page.waitForSelector('tr[data-uid]', { timeout: 10000 }).catch(() => {});
      await delay(CONFIG.delays.betweenPages);
      pageNum++;
    } else {
      console.log('  No more pages.');
      hasMorePages = false;
    }
  }

  return totalProcessed;
}

async function scrapeJob(page, jobBasic, progress) {
  const jobNumber = jobBasic.jobNumber;
  console.log(`\n  🔧 Job #${jobNumber}: ${jobBasic.description?.slice(0, 50) || 'No description'}...`);

  // Navigate to job detail page
  await page.goto(jobBasic.jobUrl, { waitUntil: 'networkidle2' });
  await delay(CONFIG.delays.betweenPages);

  // Extract all visible job data from the page
  const jobData = await page.evaluate(() => {
    const getText = (sel) => document.querySelector(sel)?.textContent?.trim() || '';

    // Get all text content we can find
    const bodyText = document.body.innerText;

    // Try to extract structured data
    return {
      // Page content
      pageTitle: document.title,
      bodyText: bodyText.slice(0, 5000),  // First 5000 chars as backup

      // Try common selectors
      customerName: getText('a[href*="Customer"]') || getText('.customer-name'),
      address: getText('.address') || bodyText.match(/\d+\s+[\w\s]+(?:Ln|St|Ave|Dr|Rd|Blvd|Way|Ct)[\w\s,]+\d{5}/)?.[0],
      phone: bodyText.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/g)?.[0],

      // Status - look for status badge/indicator
      statusFromPage: getText('.status, .badge, [class*="status"]'),
    };
  });

  // Detect territory from address/city/description
  const territoryMatch = jobData.address?.match(/\b(TN|AL|FL|KY|GA|MS)\b/i) ||
                         jobBasic.city?.match(/\b(TN|AL|FL|KY|GA|MS)\b/i) ||
                         jobBasic.description?.match(/^(TN|AL|FL|KY|GA|MS)/i) ||
                         jobData.bodyText?.match(/\b(TN|AL|FL|KY|GA|MS)\s+\d{5}\b/i);
  const territory = territoryMatch?.[1]?.toUpperCase() || null;

  // Merge basic info from list with detail page
  const fullJobData = {
    jobNumber,
    jobType: jobBasic.jobType,
    status: jobBasic.status || jobData.statusFromPage,
    description: jobBasic.description,
    customer: jobBasic.customer,
    city: jobBasic.city,
    resources: jobBasic.resources,
    startDate: jobBasic.startDate,
    endDate: jobBasic.endDate,
    sourceUrl: jobBasic.jobUrl,

    // From detail page
    customerName: jobData.customerName,
    address: jobData.address,
    phone: jobData.phone,

    // Derived fields
    territory,

    // Metadata
    scrapedAt: new Date().toISOString(),
    rawPageText: jobData.bodyText,

    // Will be populated below
    activities: [],
    workOrders: [],
    photos: [],
  };

  // Try to get Activities - find tab by text content
  try {
    const activitiesTab = await page.evaluateHandle(() => {
      const links = Array.from(document.querySelectorAll('a, li a, .nav-tabs a'));
      return links.find(el => el.textContent?.includes('Activities'));
    });

    if (activitiesTab && activitiesTab.asElement()) {
      await activitiesTab.asElement().click();
      await delay(1500);

      fullJobData.activities = await page.evaluate(() => {
        const rows = document.querySelectorAll('table tbody tr');
        return Array.from(rows).map(row => {
          const cells = row.querySelectorAll('td');
          return {
            type: cells[0]?.textContent?.trim(),
            note: cells[1]?.textContent?.trim(),
            date: cells[2]?.textContent?.trim(),
          };
        }).filter(a => a.note);
      });
      console.log(`    📝 Found ${fullJobData.activities.length} activities`);
    }
  } catch (e) {
    // Activities tab not found or couldn't click - that's OK
  }

  // Find Work Order/Form documents - look for links to /JobForm/Details/
  const formUrls = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a[href*="JobForm/Details"], a[href*="jobform"]'));
    return links.map(link => ({
      url: link.href,
      text: link.textContent?.trim() || '',
    }));
  });

  if (formUrls.length > 0) {
    console.log(`    📄 Found ${formUrls.length} form(s)`);

    for (let i = 0; i < formUrls.length; i++) {
      const woData = await scrapeWorkOrder(page, formUrls[i].url, jobNumber, i, progress);
      if (woData) {
        fullJobData.workOrders.push(woData);
        progress.stats.workOrders++;
        // Track form type counts
        progress.formTypeCounts = progress.formTypeCounts || {};
        progress.formTypeCounts[woData.formType] = (progress.formTypeCounts[woData.formType] || 0) + 1;
      }
    }
  } else {
    console.log(`    📄 No forms found for this job`);
  }

  // Track territory counts
  if (fullJobData.territory) {
    progress.territoryCounts = progress.territoryCounts || {};
    progress.territoryCounts[fullJobData.territory] = (progress.territoryCounts[fullJobData.territory] || 0) + 1;
  }

  // Save job data
  await saveJobData(jobNumber, fullJobData);
  console.log(`    ✓ Saved job ${jobNumber} (${fullJobData.jobType || 'unknown type'}, ${fullJobData.territory || 'no territory'})`);

  // Don't navigate away - we'll handle page navigation in scrapeAllJobs
  return fullJobData;
}

async function scrapeWorkOrder(page, formUrl, jobNumber, index, progress) {
  console.log(`      📋 Form ${index + 1}: ${formUrl}`);

  try {
    // Navigate directly to the form URL
    await page.goto(formUrl, { waitUntil: 'networkidle2' });
    await delay(CONFIG.delays.betweenPages);

    // The work order content is inside an iframe - find and switch to it
    const iframeElement = await page.$('iframe');
    let frame = null;

    if (iframeElement) {
      try {
        frame = await iframeElement.contentFrame();

        if (frame) {
          // Scroll inside the iframe (with error handling for detached frames)
          try {
            await frame.evaluate(async () => {
              const scrollStep = 300;
              const scrollDelay = 150;

              // Scroll to bottom in steps
              let lastPos = -1;
              while (window.scrollY !== lastPos) {
                lastPos = window.scrollY;
                window.scrollBy(0, scrollStep);
                await new Promise(r => setTimeout(r, scrollDelay));
              }

              // Scroll back to top
              window.scrollTo(0, 0);
            });
            await delay(500);
          } catch (scrollErr) {
            console.log('      ⚠ Frame scroll failed, using main page');
            frame = null;
          }
        }
      } catch (frameErr) {
        console.log('      ⚠ Could not access iframe, using main page');
        frame = null;
      }
    } else {
      console.log('      ⚠ No iframe found, trying main page');
    }

    // Extract work order data from the iframe (or main page as fallback)
    const woData = await (frame || page).evaluate(() => {
      const bodyText = document.body.innerText;

      // Helper to find value after a label
      const findValue = (label) => {
        const regex = new RegExp(label + '[:\\s]*([^\\n]+)', 'i');
        const match = bodyText.match(regex);
        return match?.[1]?.trim() || '';
      };

      return {
        // All the fields from your screenshot
        confirmedWith: findValue('Confirmed with'),
        confirmedBy: findValue('Confirmed by'),
        date: findValue('^Date'),
        workDate: findValue('Work Date'),
        specialInstructions: findValue('Special Instructions'),

        // Customer info
        school: findValue('School'),
        customer: findValue('Customer'),
        address: findValue('Address'),
        contactName: findValue('Contact Name'),
        contactPhone: findValue('Contact Phone'),

        // Job info
        jobType: findValue('Job Type'),
        partsNeeded: findValue('Parts Needed'),
        jobReference: findValue('Job Reference'),

        // Completion info
        jobCompleted: findValue('Job Completed'),
        totalHoursWorked: findValue('Total Hours Worked'),
        completedBy: findValue('Job Completed By'),

        // Basketball/bleacher specific fields
        basketballGoals: findValue('How many Basketball Goals'),
        safetyStraps: findValue('How many Safety Straps'),
        edgePads: findValue('How many Edge Pads'),
        fixedGoals: findValue('How many are fixed goals'),

        // Technician notes - try to capture everything after "Technician Notes"
        technicianNotes: bodyText.match(/Technician Notes[^:]*:?\s*([\s\S]*?)(?=\n\n|\z)/i)?.[1]?.trim() || '',

        // Raw text as backup
        fullText: bodyText,
      };
    });

    woData.sourceUrl = formUrl;
    woData.scrapedAt = new Date().toISOString();

    // Detect form type and add parsed/normalized fields
    const formTypeMatch = woData.fullText.match(/^(Work Order|Go See[:\s]*Bleacher Parts Specification Form|Vehicle Check|Toolbox Checklist)/im);
    let formType = formTypeMatch?.[1]?.trim() || 'Unknown';

    // Detect inspection forms that start with company header
    if (formType === 'Unknown' && woData.fullText.includes('Bleachers and Seats.com')) {
      formType = 'Bleacher Inspection Form';
    }

    woData.formType = formType;
    woData.parsed = {
      formType,
      hoursWorked: parseFloat(woData.totalHoursWorked) || null,
      isComplete: woData.jobCompleted?.toLowerCase() === 'yes',
      requiresLift: /lift\s*(rental\s*)?required/i.test(woData.fullText),
      technicianNames: woData.completedBy?.split(/[,&]/).map(s => s.trim()).filter(Boolean) || [],
      hasPartsNeeded: !!woData.partsNeeded && woData.partsNeeded !== 'Job Reference:',
      basketballGoalCount: parseInt(woData.basketballGoals) || null,
      safetyStrapCount: parseInt(woData.safetyStraps) || null,
      edgePadCount: parseInt(woData.edgePads) || null,
    };

    // Find and download photos - check both iframe and main page
    const photos = [];

    // Get photos from iframe first (where the work order content is)
    if (frame) {
      try {
        const iframePhotos = await frame.evaluate(() => {
          return Array.from(document.querySelectorAll('img')).map(el => ({
            src: el.src,
            alt: el.alt,
            width: el.naturalWidth,
            height: el.naturalHeight,
          }));
        });

        for (const imgInfo of iframePhotos) {
          if (imgInfo.src &&
              imgInfo.width > 100 &&
              imgInfo.height > 100 &&
              !imgInfo.src.includes('logo') &&
              !imgInfo.src.includes('icon') &&
              !imgInfo.src.includes('servicepal.com/Content')) {

            const filename = await downloadPhoto(page, imgInfo.src, jobNumber, photos.length);
            if (filename) {
              photos.push({
                originalUrl: imgInfo.src,
                localFile: filename,
                alt: imgInfo.alt,
              });
              progress.stats.photos++;
            }
          }
        }
      } catch (photoErr) {
        console.log('      ⚠ Could not get iframe photos, checking main page only');
      }
    }

    // Also check main page for any photos outside iframe
    const mainPagePhotos = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(el => ({
        src: el.src,
        alt: el.alt,
        width: el.naturalWidth,
        height: el.naturalHeight,
      }));
    });

    for (const imgInfo of mainPagePhotos) {
      // Skip if already downloaded
      if (photos.some(p => p.originalUrl === imgInfo.src)) continue;

      if (imgInfo.src &&
          imgInfo.width > 100 &&
          imgInfo.height > 100 &&
          !imgInfo.src.includes('logo') &&
          !imgInfo.src.includes('icon') &&
          !imgInfo.src.includes('servicepal.com/Content')) {

        const filename = await downloadPhoto(page, imgInfo.src, jobNumber, photos.length);
        if (filename) {
          photos.push({
            originalUrl: imgInfo.src,
            localFile: filename,
            alt: imgInfo.alt,
          });
          progress.stats.photos++;
        }
      }
    }

    woData.photos = photos;
    console.log(`      ✓ Work order scraped (${photos.length} photos)`);

    // Go back to job detail page
    await page.goBack();
    await delay(CONFIG.delays.betweenPages);

    return woData;
  } catch (err) {
    console.error(`      ❌ Error scraping work order: ${err.message}`);
    return null;
  }
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ServicePal Data Migration Scraper v2');
  console.log('  Job-based approach');
  console.log('═══════════════════════════════════════════════════════════');

  if (CONFIG.testMode) {
    console.log(`🧪 TEST MODE: Will only process first ${CONFIG.testLimit} jobs`);
  }
  if (CONFIG.resumeMode) {
    console.log('🔄 RESUME MODE: Will skip already-processed jobs');
  }

  // Setup
  await loadCredentials();
  await ensureOutputDir();

  const progress = CONFIG.resumeMode ? await loadProgress() : {
    completedJobs: [],
    lastPageNumber: 1,
    stats: { jobs: 0, photos: 0, workOrders: 0 },
    formTypeCounts: {},
    territoryCounts: {},
  };

  if (CONFIG.resumeMode) {
    console.log(`  Previously completed: ${progress.completedJobs.length} jobs`);
  }

  // Launch browser
  console.log('\n🚀 Launching browser...');
  const browser = await puppeteer.launch({
    headless: false,  // Keep visible so you can watch/debug
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  // Set a realistic user agent
  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    // Login
    await login(page);

    // Scrape all jobs
    const totalProcessed = await scrapeAllJobs(page, progress);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  MIGRATION COMPLETE');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Jobs processed: ${progress.stats.jobs}`);
    console.log(`  Work orders extracted: ${progress.stats.workOrders}`);
    console.log(`  Photos downloaded: ${progress.stats.photos}`);

    if (progress.formTypeCounts && Object.keys(progress.formTypeCounts).length > 0) {
      console.log('\n  Form Types:');
      for (const [type, count] of Object.entries(progress.formTypeCounts)) {
        console.log(`    - ${type}: ${count}`);
      }
    }

    if (progress.territoryCounts && Object.keys(progress.territoryCounts).length > 0) {
      console.log('\n  Territories:');
      for (const [territory, count] of Object.entries(progress.territoryCounts)) {
        console.log(`    - ${territory}: ${count}`);
      }
    }

    console.log(`\n  Output saved to: ${OUTPUT_DIR}`);
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('\n❌ Fatal error:', err.message);
    console.error(err.stack);
    await saveProgress(progress);
    console.log('Progress saved. Run with --resume to continue.');
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
