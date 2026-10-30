/**
 * Technical Markdown Report Generator
 */

function generateMarkdownReport(data) {
  const allChecks = [
    ...(data.checks.http || []),
    ...(data.checks.security || []),
    ...(data.checks.seo || []),
    ...(data.checks.a11y || []),
  ];

  const passCount = allChecks.filter((c) => c.status === 'PASS').length;
  const warnCount = allChecks.filter((c) => c.status === 'WARN').length;
  const failCount = allChecks.filter((c) => c.status === 'FAIL').length;

  const checksTable = allChecks
    .map((c) => `| \`${c.status}\` | ${c.name} | \`${c.value}\` | ${c.details} |`)
    .join('\n');

  const consoleLogs =
    data.consoleErrors.length > 0
      ? data.consoleErrors.map((e) => `- \`${e}\``).join('\n')
      : '_No console errors detected._';

  const networkLogs =
    data.networkErrors.length > 0
      ? data.networkErrors.map((e) => `- \`${e}\``).join('\n')
      : '_No 4xx/5xx network errors detected._';

  const resourcesTable = Object.entries(data.resourcesByType)
    .map(([type, count]) => `| ${type} | ${count} |`)
    .join('\n');

  return `# Web Audit Report: ${data.targetUrl}

- **Date:** ${data.date}
- **HTTP Status:** ${data.mainHttpStatus}
- **Load Duration:** ${data.loadTimeMs} ms (${(data.loadTimeMs / 1000).toFixed(2)} s)
- **Total Requests:** ${data.totalRequests}
- **Transferred Bytes:** ${(data.totalTransferredBytes / 1024).toFixed(1)} KB
- **Summary:** ${passCount} passed, ${warnCount} warnings, ${failCount} failed

---

## Diagnostic Checks

| Status | Check | Observed Value | Details |
| :--- | :--- | :--- | :--- |
${checksTable}

---

## Resource Distribution

| Resource Type | Request Count |
| :--- | :--- |
${resourcesTable}

---

## Console Exceptions (${data.consoleErrors.length})

${consoleLogs}

---

## Failed Network Requests (${data.networkErrors.length})

${networkLogs}

---

## Artifacts
- **Interactive Report:** [report.html](report.html)
- **Full Page Screenshot:** [screenshot.png](screenshot.png)
`;
}

module.exports = { generateMarkdownReport };
