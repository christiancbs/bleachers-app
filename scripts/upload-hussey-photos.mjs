#!/usr/bin/env node
// Upload Hussey part photos to bleachers-app via bulk image API
// Usage: node --env-file=../bleachers-api/.env.local scripts/upload-hussey-photos.mjs

import fs from 'fs';
import path from 'path';

const API_BASE = 'https://bleachers-api.vercel.app';
const API_KEY = process.env.ADMIN_API_KEY;
const PHOTOS_DIR = path.resolve(process.env.HOME, 'Desktop/HusseyPartPhotos');
const BATCH_SIZE = 15; // images per request (stay under 50MB and serverless timeout)

if (!API_KEY) {
    console.error('Missing ADMIN_API_KEY. Run with: node --env-file=../bleachers-api/.env.local scripts/upload-hussey-photos.mjs');
    process.exit(1);
}

// Read all PNG files from directory
const files = fs.readdirSync(PHOTOS_DIR).filter(f => f.toLowerCase().endsWith('.png'));
console.log(`Found ${files.length} PNG files in ${PHOTOS_DIR}\n`);

// Split into batches
const batches = [];
for (let i = 0; i < files.length; i += BATCH_SIZE) {
    batches.push(files.slice(i, i + BATCH_SIZE));
}

let totalMatched = 0;
let totalUploaded = 0;
const allNotFound = [];
const allErrors = [];

for (let b = 0; b < batches.length; b++) {
    const batch = batches[b];
    console.log(`Batch ${b + 1}/${batches.length} (${batch.length} images)...`);

    // Build images array with base64 data
    const images = batch.map(filename => {
        const filePath = path.join(PHOTOS_DIR, filename);
        const buffer = fs.readFileSync(filePath);
        const base64 = buffer.toString('base64');
        return {
            filename,
            imageData: `data:image/png;base64,${base64}`
        };
    });

    try {
        const res = await fetch(`${API_BASE}/api/parts/images/bulk`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': API_KEY
            },
            body: JSON.stringify({ images })
        });

        if (!res.ok) {
            const text = await res.text();
            console.error(`  HTTP ${res.status}: ${text}`);
            allErrors.push(...batch.map(f => ({ filename: f, error: `HTTP ${res.status}` })));
            continue;
        }

        const result = await res.json();
        console.log(`  Matched: ${result.matched}, Uploaded: ${result.uploaded}, Not found: ${result.notFound?.length || 0}`);

        totalMatched += result.matched || 0;
        totalUploaded += result.uploaded || 0;
        if (result.notFound?.length) allNotFound.push(...result.notFound);
        if (result.errors?.length) allErrors.push(...result.errors);

    } catch (err) {
        console.error(`  Error: ${err.message}`);
        allErrors.push(...batch.map(f => ({ filename: f, error: err.message })));
    }

    // Small delay between batches to be nice to the API
    if (b < batches.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
    }
}

console.log('\n=== RESULTS ===');
console.log(`Total files:    ${files.length}`);
console.log(`Matched:        ${totalMatched}`);
console.log(`Uploaded:       ${totalUploaded}`);
console.log(`Not found:      ${allNotFound.length}`);
console.log(`Errors:         ${allErrors.length}`);

if (allNotFound.length > 0) {
    console.log(`\nPart numbers not in catalog (${allNotFound.length}):`);
    allNotFound.forEach(p => console.log(`  ${p}`));
}

if (allErrors.length > 0) {
    console.log(`\nErrors:`);
    allErrors.forEach(e => console.log(`  ${e.filename}: ${e.error}`));
}
