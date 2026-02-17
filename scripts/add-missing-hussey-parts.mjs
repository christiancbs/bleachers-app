#!/usr/bin/env node
// Create 44 missing Hussey parts (part number + photo only) and upload their images
// Usage: node --env-file=../bleachers-api/.env.local scripts/add-missing-hussey-parts.mjs

import fs from 'fs';
import path from 'path';

const API_BASE = 'https://bleachers-api.vercel.app';
const API_KEY = process.env.ADMIN_API_KEY;
const PHOTOS_DIR = path.resolve(process.env.HOME, 'Desktop/HusseyPartPhotos');

if (!API_KEY) {
    console.error('Missing ADMIN_API_KEY.');
    process.exit(1);
}

const missing = [
    '2016678','2074000','2074106','2090645','2090646','2098693','2098694',
    '2099845','2099849','2099856','2099861','2099865','2099869','2099873',
    '2099877','2099881','2099885','2099889','2099897','2099924','2099952',
    '2099956','2100824','2102864','2108650','2132524','2132526','2132528',
    '2132529','2132531','2132535','2135419','2137084','2141145','2156885',
    '2156886','2156887','2156888','2156889','2156890','2156897','2156906',
    '2166350','2166475'
];

const headers = {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
};

let created = 0;
let photosUploaded = 0;
let errors = [];

for (const partNumber of missing) {
    // 1. Create the part
    try {
        const createRes = await fetch(`${API_BASE}/api/parts`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                partNumber,
                productName: `Hussey Part ${partNumber}`,
                description: null,
                price: null,
                vendor: 'Hussey Seating Co',
                priceNote: 'Photo only - description and price TBD'
            })
        });

        if (!createRes.ok) {
            const text = await createRes.text();
            console.error(`  SKIP ${partNumber}: ${text}`);
            errors.push({ partNumber, step: 'create', error: text });
            continue;
        }

        const part = await createRes.json();
        created++;
        process.stdout.write(`  ${partNumber} created`);

        // 2. Upload the photo
        const photoPath = path.join(PHOTOS_DIR, `${partNumber}.png`);
        if (fs.existsSync(photoPath)) {
            const buffer = fs.readFileSync(photoPath);
            const base64 = buffer.toString('base64');

            const imgRes = await fetch(`${API_BASE}/api/parts/images/bulk`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    images: [{
                        filename: `${partNumber}.png`,
                        imageData: `data:image/png;base64,${base64}`
                    }]
                })
            });

            if (imgRes.ok) {
                const result = await imgRes.json();
                if (result.uploaded > 0) {
                    photosUploaded++;
                    console.log(' + photo ✓');
                } else {
                    console.log(' (photo match failed)');
                }
            } else {
                console.log(' (photo upload failed)');
            }
        } else {
            console.log(' (no photo file)');
        }

    } catch (err) {
        console.error(`  ERROR ${partNumber}: ${err.message}`);
        errors.push({ partNumber, step: 'unknown', error: err.message });
    }

    // Small delay
    await new Promise(r => setTimeout(r, 300));
}

console.log('\n=== RESULTS ===');
console.log(`Parts created:    ${created} / ${missing.length}`);
console.log(`Photos uploaded:  ${photosUploaded}`);
console.log(`Errors:           ${errors.length}`);

if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(e => console.log(`  ${e.partNumber} (${e.step}): ${e.error}`));
}
