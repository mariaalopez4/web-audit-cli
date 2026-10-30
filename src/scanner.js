const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { analyzeSeo } = require('./analyzers/seo');
const { analyzeAccessibility } = require('./analyzers/accessibility');
const { analyzeSecurity } = require('./analyzers/security');
const { generateHtmlReport } = require('./reporters/htmlReporter');
const { generateMarkdownReport } = require('./reporters/markdownReporter');

/**
 * Executes a full headless browser audit against a given URL.
 * @param {string} targetUrl The target URL to audit.
 * @param {Object} options Configuration options.
 */
async function runAudit(targetUrl, options = {}) {
  const timeoutMs = options.timeout || 30000;
  const outputDir = options.outputDir || path.join(process.cwd(), 'reports');

  // Normalize URL
  let normalizedUrl = targetUrl.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const consoleErrors = [];
  const networkErrors = [];
  const resourcesByType = {};
  let totalTransferredBytes = 0;
  let totalRequests = 0;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 WebAuditCLI/1.0',
  });
  const page = await context.newPage();

  // Listen for console errors and exceptions
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[console.error] ${msg.text()}`);
    }
  });

  page.on('pageerror', (err) => {
    consoleErrors.push(`[uncaught] ${err.message}`);
  });

  // Track network responses
  page.on('response', (response) => {
    totalRequests++;
    const status = response.status();
    const req = response.request();
    const type = req.resourceType() || 'other';

    resourcesByType[type] = (resourcesByType[type] || 0) + 1;

    const headers = response.headers();
    if (headers['content-length']) {
      totalTransferredBytes += parseInt(headers['content-length'], 10) || 0;
    }

    if (status >= 400) {
      networkErrors.push(`[HTTP ${status}] ${req.method()} ${response.url()}`);
    }
  });

  let mainHttpStatus = null;
  let responseHeaders = {};
  let loadTimeMs = 0;
  let navigationSuccess = false;
  const startTime = Date.now();

  try {
    const response = await page.goto(normalizedUrl, {
      waitUntil: 'load',
      timeout: timeoutMs,
    });

    try {
      await page.waitForLoadState('networkidle', { timeout: 3000 });
    } catch (_) {
      // Non-blocking network settling timeout
    }

    loadTimeMs = Date.now() - startTime;
    mainHttpStatus = response ? response.status() : 'N/A';
    responseHeaders = response ? response.headers() : {};
    navigationSuccess = true;
  } catch (err) {
    loadTimeMs = Date.now() - startTime;
    mainHttpStatus = `Navigation Error: ${err.message}`;
  }

  // DOM Extraction
  let domData = {
    title: '',
    description: '',
    h1Count: 0,
    hasOgTitle: false,
    hasOgImage: false,
    hasCanonical: false,
    totalImages: 0,
    imagesWithoutAlt: 0,
    htmlLang: '',
    hasViewport: false,
  };

  if (navigationSuccess) {
    try {
      domData = await page.evaluate(() => {
        const title = document.title || '';
        const descMeta = document.querySelector('meta[name="description"]');
        const desc = descMeta ? descMeta.getAttribute('content') || '' : '';
        const h1s = document.querySelectorAll('h1');
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogImage = document.querySelector('meta[property="og:image"]');
        const canonical = document.querySelector('link[rel="canonical"]');

        const imgs = Array.from(document.querySelectorAll('img'));
        const noAlt = imgs.filter(
          (img) => !img.hasAttribute('alt') || img.getAttribute('alt').trim() === ''
        );

        const html = document.documentElement;
        const lang = html ? html.getAttribute('lang') || '' : '';
        const viewport = document.querySelector('meta[name="viewport"]');

        return {
          title,
          description: desc,
          h1Count: h1s.length,
          hasOgTitle: !!ogTitle,
          hasOgImage: !!ogImage,
          hasCanonical: !!canonical,
          totalImages: imgs.length,
          imagesWithoutAlt: noAlt.length,
          htmlLang: lang,
          hasViewport: !!viewport,
        };
      });
    } catch (e) {
      console.warn('Warning: DOM extraction failed:', e.message);
    }
  }

  // Setup storage directory
  const urlObj = new URL(normalizedUrl);
  const sanitizedHost = urlObj.hostname.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const sessionDir = path.join(outputDir, `${sanitizedHost}_${timestamp}`);

  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  // Screenshot capture
  const screenshotPathInDir = path.join(sessionDir, 'screenshot.png');
  const rootScreenshot = path.join(process.cwd(), 'screenshot.png');

  if (navigationSuccess) {
    try {
      await page.screenshot({ path: screenshotPathInDir, fullPage: true });
      fs.copyFileSync(screenshotPathInDir, rootScreenshot);
    } catch (e) {
      console.warn('Warning: Full-page screenshot failed:', e.message);
    }
  }

  await browser.close();

  // Run analytical rule engines
  const httpCheck = [
    {
      id: 'http-status',
      name: 'HTTP Response Status',
      status: mainHttpStatus === 200 ? 'PASS' : typeof mainHttpStatus === 'number' && mainHttpStatus < 400 ? 'PASS' : 'FAIL',
      value: String(mainHttpStatus),
      details: mainHttpStatus === 200 ? 'Server returned standard 200 OK.' : 'Unexpected response status.',
    },
  ];

  const securityChecks = analyzeSecurity(normalizedUrl, responseHeaders);
  const seoChecks = analyzeSeo(domData);
  const a11yChecks = analyzeAccessibility(domData);

  const auditResult = {
    targetUrl: normalizedUrl,
    date: new Date().toISOString(),
    mainHttpStatus,
    loadTimeMs,
    totalRequests,
    totalTransferredBytes,
    resourcesByType,
    consoleErrors,
    networkErrors,
    screenshotRelativePath: 'screenshot.png',
    checks: {
      http: httpCheck,
      security: securityChecks,
      seo: seoChecks,
      a11y: a11yChecks,
    },
  };

  // Generate output artifacts
  const htmlOutput = generateHtmlReport(auditResult);
  fs.writeFileSync(path.join(sessionDir, 'report.html'), htmlOutput, 'utf-8');
  fs.writeFileSync(path.join(process.cwd(), 'report.html'), htmlOutput, 'utf-8');

  const mdOutput = generateMarkdownReport(auditResult);
  fs.writeFileSync(path.join(sessionDir, 'report.md'), mdOutput, 'utf-8');
  fs.writeFileSync(path.join(process.cwd(), 'report.md'), mdOutput, 'utf-8');

  auditResult.outputDir = sessionDir;
  return auditResult;
}

module.exports = { runAudit };
