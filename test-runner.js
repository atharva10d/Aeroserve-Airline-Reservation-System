const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'qa-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR);
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

const clickByText = async (page, text) => {
  await page.evaluate((text) => {
    const elements = [...document.querySelectorAll('button')];
    const target = elements.find(e => e.innerText.includes(text));
    if (target) target.click();
  }, text);
  await sleep(1500); // wait for UI to update
};

(async () => {
  console.log('Starting QA Automation Script (Admin Focused)...');
  const browser = await puppeteer.launch({ headless: 'new', defaultViewport: { width: 1280, height: 800 } });
  const page = await browser.newPage();

  try {
    // --- TC-001: User Authentication ---
    console.log('Running User Side Scenarios...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', '10datharvazope@gmail.com');
    await page.type('input[type="password"]', '12345');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    
    // User Screenshots
    await sleep(2000); 
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'search-success.png') });
    
    await page.goto('http://localhost:5173/success', { waitUntil: 'networkidle0' });
    await sleep(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'boarding-pass.png') });

    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle0' });
    await clickByText(page, 'Booking History');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'cancel-success.png') });

    // --- Admin Dashboard Scenarios ---
    console.log('Running Admin Dashboard Scenarios...');
    await page.evaluate(() => localStorage.clear());
    
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
    await page.type('input[type="email"]', 'admin@aeroserve.com');
    await page.type('input[type="password"]', 'admin123');
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle0' })
    ]);
    await sleep(2000);

    // Default admin view is Reports
    console.log('Capturing Admin Reports...');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-dashboard.png') });

    // Manage Flights
    console.log('Capturing Admin Flights...');
    await clickByText(page, 'Manage Flights');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-flights.png') });

    // View Reservations
    console.log('Capturing Admin Reservations...');
    await clickByText(page, 'View Reservations');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-reservations.png') });

    // Manage Users
    console.log('Capturing Admin Users...');
    await clickByText(page, 'Manage Users');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-users.png') });

    // Backup & Restore
    console.log('Capturing Admin Backup...');
    await clickByText(page, 'Backup & Restore');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'admin-backup.png') });

    console.log('Screenshots captured successfully!');
  } catch (err) {
    console.error('Error during automation:', err);
  } finally {
    await browser.close();
  }
})();
