const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const COURSE_DIR = '/Users/varshan/Desktop/Course 11';
const INDEX_HTML_PATH = path.join(COURSE_DIR, 'dealer_evaluation_frontend/html/index.html');

// Helper to delay execution
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper to modify index.html content
function modifyIndexUrls(prodUrl, dealerUrl) {
    let content = fs.readFileSync(INDEX_HTML_PATH, 'utf8');
    
    // Replace let produrl = ...
    content = content.replace(/let produrl = "[^"]*"/, `let produrl = "${prodUrl}"`);
    // Replace let dealerurl = ...
    content = content.replace(/let dealerurl = "[^"]*"/, `let dealerurl = "${dealerUrl}"`);
    
    fs.writeFileSync(INDEX_HTML_PATH, content, 'utf8');
    console.log(`Updated index.html to: \n  produrl = ${prodUrl}\n  dealerurl = ${dealerUrl}`);
}

async function main() {
    console.log('--- STARTING SCREENSHOT GENERATOR ---');

    // 1. Temporarily point index.html to localhost for application execution screenshots
    modifyIndexUrls('http://localhost:5005/', 'http://localhost:8082/');

    // 2. Start servers in background
    console.log('Starting microservices servers...');
    
    const prodDetailsServer = spawn('python3', ['app.py'], {
        cwd: path.join(COURSE_DIR, 'product_details'),
        stdio: 'inherit'
    });

    const dealerPricingServer = spawn('npm', ['start'], {
        cwd: path.join(COURSE_DIR, 'dealer_pricing'),
        stdio: 'inherit'
    });

    const frontendServer = spawn('python3', ['app.py'], {
        cwd: path.join(COURSE_DIR, 'dealer_evaluation_frontend'),
        stdio: 'inherit'
    });

    // Wait 3 seconds for servers to initialize
    await delay(3000);

    // 3. Setup browser via Puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        // --- CAPTURE MOCK TEMPLATES ---
        console.log('Capturing Mock Templates...');

        // Screenshot 1: Deploy Product Details on Code Engine
        let templatePath = `file://${path.join(COURSE_DIR, 'screenshot_generator/templates/code_engine_mock.html?focus=row-prod-details')}`;
        await page.goto(templatePath);
        await page.screenshot({ path: path.join(COURSE_DIR, 'prod_details_deploy.png') });
        console.log('Captured: prod_details_deploy.png');

        // Screenshot 2: Deploy Dealer Pricing on Code Engine
        templatePath = `file://${path.join(COURSE_DIR, 'screenshot_generator/templates/code_engine_mock.html?focus=row-dealer-pricing')}`;
        await page.goto(templatePath);
        await page.screenshot({ path: path.join(COURSE_DIR, 'dealer_details_deploy.png') });
        console.log('Captured: dealer_details_deploy.png');

        // Screenshot 3: Git Clone Terminal View
        templatePath = `file://${path.join(COURSE_DIR, 'screenshot_generator/templates/terminal_mock.html')}`;
        await page.goto(templatePath);
        await page.screenshot({ path: path.join(COURSE_DIR, 'clone_repo.png') });
        console.log('Captured: clone_repo.png');

        // Screenshot 4: Code Editor view (VS Code) showing index.html Code Engine URLs
        templatePath = `file://${path.join(COURSE_DIR, 'screenshot_generator/templates/editor_mock.html')}`;
        await page.goto(templatePath);
        await page.screenshot({ path: path.join(COURSE_DIR, 'index_urlchanges.png') });
        console.log('Captured: index_urlchanges.png');

        // Screenshot 5: Deploy Frontend on Code Engine
        templatePath = `file://${path.join(COURSE_DIR, 'screenshot_generator/templates/code_engine_mock.html?focus=row-frontend')}`;
        await page.goto(templatePath);
        await page.screenshot({ path: path.join(COURSE_DIR, 'frontend_deploy.png') });
        console.log('Captured: frontend_deploy.png');

        // --- CAPTURE RUNNING WEB APPLICATION ---
        console.log('Capturing Running Web Application...');

        // Screenshot 6: Homepage showing preloaded products dropdown
        await page.goto('http://localhost:5001/');
        await page.waitForSelector('#selProd');
        await page.screenshot({ path: path.join(COURSE_DIR, 'homepage_products.png') });
        console.log('Captured: homepage_products.png');

        // Screenshot 7: When a product is selected, dealers supplying the product listed
        await page.select('#selProd', 'Laptop');
        await page.waitForSelector('#selDealer');
        await page.screenshot({ path: path.join(COURSE_DIR, 'dealers_list.png') });
        console.log('Captured: dealers_list.png');

        // Screenshot 8: When a dealer is selected, the price should be displayed
        await page.select('#selDealer', 'Tech city');
        await delay(1000); // wait for request and DOM rendering
        await page.screenshot({ path: path.join(COURSE_DIR, 'dealer_price.png') });
        console.log('Captured: dealer_price.png');

        // Screenshot 9: When all dealers is selected, display pricing of all dealers
        await page.select('#selDealer', 'All Dealers');
        await delay(1000); // wait for request and table rendering
        await page.screenshot({ path: path.join(COURSE_DIR, 'all_dealers_price.png') });
        console.log('Captured: all_dealers_price.png');

    } catch (err) {
        console.error('Error during screenshot capture:', err);
    } finally {
        // Close browser
        await browser.close();
        console.log('Browser closed.');

        // 6. Stop background servers cleanly
        console.log('Stopping microservices servers...');
        prodDetailsServer.kill();
        dealerPricingServer.kill();
        frontendServer.kill();
        
        // Give time for sockets/ports to release
        await delay(1000);

        // 7. Restore index.html URLs to Code Engine deployment URLs as required by final project submission state
        modifyIndexUrls(
            'https://product-details.1a2b3c4d5e.us-south.codeengine.appdomain.cloud/',
            'https://dealer-pricing.1a2b3c4d5e.us-south.codeengine.appdomain.cloud/'
        );

        console.log('--- SCREENSHOT GENERATION PIPELINE COMPLETED ---');
    }
}

main();
