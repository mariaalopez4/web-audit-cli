/**
 * Technical HTML Report Generator
 * Autocontenido, sin dependencias de CDNs externas, con diseño utilitario y sobrio.
 */

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function generateHtmlReport(data) {
  const allChecks = [
    ...(data.checks.http || []),
    ...(data.checks.security || []),
    ...(data.checks.seo || []),
    ...(data.checks.a11y || []),
  ];

  const passCount = allChecks.filter((c) => c.status === 'PASS').length;
  const warnCount = allChecks.filter((c) => c.status === 'WARN').length;
  const failCount = allChecks.filter((c) => c.status === 'FAIL').length;
  const totalErrors = data.consoleErrors.length + data.networkErrors.length;

  const checksRows = allChecks
    .map((c) => {
      const badgeClass =
        c.status === 'PASS'
          ? 'badge-pass'
          : c.status === 'WARN'
          ? 'badge-warn'
          : c.status === 'FAIL'
          ? 'badge-fail'
          : 'badge-info';
      return `
      <tr class="check-row" data-status="${c.status}">
        <td class="col-status"><span class="badge ${badgeClass}">${c.status}</span></td>
        <td class="col-name font-medium">${escapeHtml(c.name)}</td>
        <td class="col-val font-mono">${escapeHtml(c.value)}</td>
        <td class="col-desc text-muted">${escapeHtml(c.details)}</td>
      </tr>`;
    })
    .join('');

  const networkRows = Object.entries(data.resourcesByType)
    .map(
      ([type, count]) => `
      <tr>
        <td class="font-medium text-capitalize">${escapeHtml(type)}</td>
        <td class="font-mono text-right">${count}</td>
      </tr>`
    )
    .join('');

  const consoleLogs =
    data.consoleErrors.length > 0
      ? data.consoleErrors
          .map((e, idx) => `<div class="log-line log-error"><span class="log-num">${idx + 1}</span>${escapeHtml(e)}</div>`)
          .join('')
      : '<div class="log-empty">No console errors or unhandled exceptions recorded.</div>';

  const networkErrorLogs =
    data.networkErrors.length > 0
      ? data.networkErrors
          .map((e, idx) => `<div class="log-line log-error"><span class="log-num">${idx + 1}</span>${escapeHtml(e)}</div>`)
          .join('')
      : '<div class="log-empty">No 4xx/5xx network responses recorded.</div>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Audit Report: ${escapeHtml(data.targetUrl)}</title>
  <style>
    :root {
      --bg: #0f141c;
      --surface: #161d27;
      --surface-border: #242f3e;
      --text: #e1e7ef;
      --text-muted: #8b99ad;
      --text-subtle: #5a687c;
      --pass: #22c55e;
      --pass-bg: rgba(34, 197, 94, 0.12);
      --warn: #eab308;
      --warn-bg: rgba(234, 179, 8, 0.12);
      --fail: #ef4444;
      --fail-bg: rgba(239, 68, 68, 0.14);
      --info: #38bdf8;
      --info-bg: rgba(56, 189, 248, 0.12);
      --terminal-bg: #0a0d13;
      --mono-font: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      --sans-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--sans-font);
      font-size: 13px;
      line-height: 1.5;
      padding-bottom: 48px;
    }
    header {
      background: var(--surface);
      border-bottom: 1px solid var(--surface-border);
      padding: 14px 24px;
    }
    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-title {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: #fff;
    }
    .brand-meta {
      font-size: 12px;
      color: var(--text-muted);
      font-family: var(--mono-font);
    }
    .container {
      max-width: 1200px;
      margin: 24px auto;
      padding: 0 24px;
    }
    /* Summary Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .summary-card {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      padding: 12px 16px;
    }
    .card-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted);
      margin-bottom: 4px;
    }
    .card-value {
      font-size: 20px;
      font-weight: 600;
      font-family: var(--mono-font);
      color: #fff;
    }
    .card-sub {
      font-size: 11px;
      color: var(--text-subtle);
      margin-top: 2px;
    }
    /* Tabs and Section */
    .panel {
      background: var(--surface);
      border: 1px solid var(--surface-border);
      border-radius: 6px;
      margin-bottom: 24px;
      overflow: hidden;
    }
    .panel-header {
      padding: 12px 18px;
      border-bottom: 1px solid var(--surface-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    .panel-title {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
    }
    .filter-buttons {
      display: flex;
      gap: 6px;
    }
    .btn-filter {
      background: #1f2937;
      border: 1px solid var(--surface-border);
      color: var(--text-muted);
      padding: 3px 9px;
      font-size: 11px;
      border-radius: 4px;
      cursor: pointer;
      font-family: var(--sans-font);
    }
    .btn-filter.active {
      background: #374151;
      color: #fff;
      border-color: #4b5563;
    }
    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    th {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--text-muted);
      background: rgba(0, 0, 0, 0.15);
      padding: 8px 16px;
      border-bottom: 1px solid var(--surface-border);
      font-weight: 500;
    }
    td {
      padding: 9px 16px;
      border-bottom: 1px solid var(--surface-border);
    }
    tr:last-child td { border-bottom: none; }
    .col-status { width: 90px; }
    .col-name { width: 280px; }
    .col-val { width: 260px; }
    .text-muted { color: var(--text-muted); }
    .text-right { text-align: right; }
    .text-capitalize { text-transform: capitalize; }
    .font-mono { font-family: var(--mono-font); font-size: 12px; }
    .font-medium { font-weight: 500; }
    /* Badges */
    .badge {
      display: inline-block;
      font-family: var(--mono-font);
      font-size: 11px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
      letter-spacing: 0.02em;
    }
    .badge-pass { background: var(--pass-bg); color: var(--pass); border: 1px solid rgba(34, 197, 94, 0.25); }
    .badge-warn { background: var(--warn-bg); color: var(--warn); border: 1px solid rgba(234, 179, 8, 0.25); }
    .badge-fail { background: var(--fail-bg); color: var(--fail); border: 1px solid rgba(239, 68, 68, 0.25); }
    .badge-info { background: var(--info-bg); color: var(--info); border: 1px solid rgba(56, 189, 248, 0.25); }
    /* Split Layout */
    .grid-2 {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 20px;
    }
    @media (max-width: 860px) {
      .grid-2 { grid-template-columns: 1fr; }
    }
    /* Terminal logs */
    .terminal-box {
      background: var(--terminal-bg);
      border-radius: 4px;
      padding: 12px;
      font-family: var(--mono-font);
      font-size: 12px;
      color: #cbd5e1;
      max-height: 220px;
      overflow-y: auto;
      border: 1px solid var(--surface-border);
    }
    .log-line {
      display: flex;
      gap: 10px;
      padding: 3px 0;
      word-break: break-all;
    }
    .log-error { color: #f87171; }
    .log-num { color: var(--text-subtle); user-select: none; min-width: 20px; text-align: right; }
    .log-empty { color: var(--text-subtle); font-style: italic; }
    /* Screenshot container */
    .screenshot-viewer {
      padding: 16px;
      background: #000;
      display: flex;
      justify-content: center;
      max-height: 480px;
      overflow-y: auto;
    }
    .screenshot-viewer img {
      max-width: 100%;
      height: auto;
      border: 1px solid var(--surface-border);
      border-radius: 4px;
    }
    footer {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      font-size: 11px;
      color: var(--text-subtle);
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>

  <header>
    <div class="header-inner">
      <div class="brand">
        <span class="brand-title">web-audit-cli / technical report</span>
        <span class="brand-meta">${escapeHtml(data.targetUrl)}</span>
      </div>
      <div class="brand-meta">
        ${escapeHtml(data.date)} | Headless Chromium
      </div>
    </div>
  </header>

  <div class="container">

    <!-- Summary KPI Cards -->
    <div class="summary-grid">
      <div class="summary-card">
        <div class="card-label">HTTP Status</div>
        <div class="card-value" style="color: ${data.mainHttpStatus === 200 ? 'var(--pass)' : 'var(--fail)'}">
          ${data.mainHttpStatus}
        </div>
        <div class="card-sub">Navigation response</div>
      </div>
      <div class="summary-card">
        <div class="card-label">Load Time</div>
        <div class="card-value">${(data.loadTimeMs / 1000).toFixed(2)}s</div>
        <div class="card-sub">${data.loadTimeMs} ms total duration</div>
      </div>
      <div class="summary-card">
        <div class="card-label">Network Transfer</div>
        <div class="card-value">${formatBytes(data.totalTransferredBytes)}</div>
        <div class="card-sub">${data.totalRequests} total requests</div>
      </div>
      <div class="summary-card">
        <div class="card-label">Audit Checks</div>
        <div class="card-value">
          <span style="color: var(--pass)">${passCount}</span>
          <span style="color: var(--text-subtle); font-size: 14px;">/</span>
          <span style="color: var(--warn)">${warnCount}</span>
          <span style="color: var(--text-subtle); font-size: 14px;">/</span>
          <span style="color: var(--fail)">${failCount}</span>
        </div>
        <div class="card-sub">Pass / Warn / Fail</div>
      </div>
      <div class="summary-card">
        <div class="card-label">Exceptions & Errors</div>
        <div class="card-value" style="color: ${totalErrors > 0 ? 'var(--fail)' : 'var(--pass)'}">
          ${totalErrors}
        </div>
        <div class="card-sub">${data.consoleErrors.length} console, ${data.networkErrors.length} net</div>
      </div>
    </div>

    <!-- Diagnostic Checks Table -->
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">Diagnostic Checks (${allChecks.length})</span>
        <div class="filter-buttons">
          <button class="btn-filter active" onclick="filterChecks('ALL')">All (${allChecks.length})</button>
          <button class="btn-filter" onclick="filterChecks('ISSUES')">Issues (${warnCount + failCount})</button>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Check</th>
            <th>Observed Value</th>
            <th>Details & Recommendation</th>
          </tr>
        </thead>
        <tbody id="checks-tbody">
          ${checksRows}
        </tbody>
      </table>
    </div>

    <!-- 2-Column Section: Console/Logs & Network Breakdown -->
    <div class="grid-2">

      <!-- Console and Network Errors -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Console & Network Logs</span>
          <span class="font-mono text-muted" style="font-size: 11px;">stderr / uncaught</span>
        </div>
        <div style="padding: 14px; display: flex; flex-direction: column; gap: 14px;">
          <div>
            <div class="card-label">Console Exceptions (${data.consoleErrors.length})</div>
            <div class="terminal-box">${consoleLogs}</div>
          </div>
          <div>
            <div class="card-label">Failed HTTP Requests (${data.networkErrors.length})</div>
            <div class="terminal-box">${networkErrorLogs}</div>
          </div>
        </div>
      </div>

      <!-- Network Breakdown -->
      <div class="panel">
        <div class="panel-header">
          <span class="panel-title">Resource Distribution</span>
          <span class="font-mono text-muted" style="font-size: 11px;">by mime/type</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th class="text-right">Requests</th>
            </tr>
          </thead>
          <tbody>
            ${networkRows}
          </tbody>
        </table>
      </div>

    </div>

    <!-- Full Page Screenshot -->
    <div class="panel">
      <div class="panel-header">
        <span class="panel-title">Full Page Screenshot</span>
        <a href="${data.screenshotRelativePath}" target="_blank" class="font-mono text-muted" style="font-size: 11px; text-decoration: underline;">
          Open raw screenshot.png
        </a>
      </div>
      <div class="screenshot-viewer">
        <img src="${data.screenshotRelativePath}" alt="Screenshot of ${escapeHtml(data.targetUrl)}" loading="lazy">
      </div>
    </div>

  </div>

  <footer>
    <span>Generated by <strong>web-audit-cli</strong></span>
    <span>Node.js & Playwright Automated Browser Engine</span>
  </footer>

  <script>
    function filterChecks(type) {
      document.querySelectorAll('.btn-filter').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      const rows = document.querySelectorAll('.check-row');
      rows.forEach(r => {
        const st = r.getAttribute('data-status');
        if (type === 'ALL') {
          r.style.display = '';
        } else if (type === 'ISSUES') {
          r.style.display = (st === 'WARN' || st === 'FAIL') ? '' : 'none';
        }
      });
    }
  </script>

</body>
</html>`;
}

module.exports = { generateHtmlReport };
