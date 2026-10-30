#!/usr/bin/env node

const { runAudit } = require('../src/scanner');
const path = require('path');
const pkg = require('../package.json');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
web-audit-cli v${pkg.version}
Automated web auditor using headless Chromium and Playwright.

Usage:
  web-audit <url> [options]

Options:
  --timeout <ms>     Navigation timeout in milliseconds (default: 30000)
  --help, -h         Show help menu
  --version, -v      Show version number

Examples:
  node bin/cli.js https://news.ycombinator.com
  node bin/cli.js example.com --timeout 15000
`);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log(`v${pkg.version}`);
  process.exit(0);
}

// Extract target URL
const urlArg = args.find((a) => !a.startsWith('-')) || 'https://example.com';

// Parse options
let timeout = 30000;
const timeoutIndex = args.indexOf('--timeout');
if (timeoutIndex !== -1 && args[timeoutIndex + 1]) {
  timeout = parseInt(args[timeoutIndex + 1], 10) || 30000;
}

async function main() {
  console.log(`\n[web-audit] Auditing ${urlArg} (timeout: ${timeout}ms)...`);

  try {
    const result = await runAudit(urlArg, { timeout });

    const allChecks = [
      ...(result.checks.http || []),
      ...(result.checks.security || []),
      ...(result.checks.seo || []),
      ...(result.checks.a11y || []),
    ];

    const passCount = allChecks.filter((c) => c.status === 'PASS').length;
    const warnCount = allChecks.filter((c) => c.status === 'WARN').length;
    const failCount = allChecks.filter((c) => c.status === 'FAIL').length;
    const errorsCount = result.consoleErrors.length + result.networkErrors.length;

    console.log(`[web-audit] Completed in ${(result.loadTimeMs / 1000).toFixed(2)}s`);
    console.log(`--------------------------------------------------`);
    console.log(`Status:       ${result.mainHttpStatus}`);
    console.log(`Checks:       ${passCount} passed, ${warnCount} warnings, ${failCount} failed`);
    console.log(`Transferred:  ${(result.totalTransferredBytes / 1024).toFixed(1)} KB (${result.totalRequests} requests)`);
    console.log(`Exceptions:   ${errorsCount} (${result.consoleErrors.length} console, ${result.networkErrors.length} network)`);
    console.log(`--------------------------------------------------`);
    console.log(`HTML Report:  file:///${path.join(process.cwd(), 'report.html').replace(/\\/g, '/')}`);
    console.log(`Markdown:     ${path.join(process.cwd(), 'report.md')}`);
    console.log(`Session Dir:  ${result.outputDir}\n`);
  } catch (err) {
    console.error(`[web-audit] Fatal error:`, err.message);
    process.exit(1);
  }
}

main();
