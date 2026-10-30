/**
 * Security & Headers Analyzer
 * Inspección de protocolos y cabeceras de respuesta HTTP.
 */

function analyzeSecurity(url, headers) {
  const checks = [];
  const isHttps = url.startsWith('https://');

  // HTTPS
  checks.push({
    id: 'sec-https',
    name: 'HTTPS Transport Encryption',
    status: isHttps ? 'PASS' : 'FAIL',
    value: isHttps ? 'TLS Enabled' : 'Insecure (HTTP)',
    details: isHttps ? 'Tráfico cifrado mediante TLS/SSL.' : 'La web transmite datos en texto claro sin cifrado.',
  });

  // Strict-Transport-Security (HSTS)
  const hsts = headers['strict-transport-security'];
  checks.push({
    id: 'sec-hsts',
    name: 'Strict-Transport-Security (HSTS)',
    status: hsts ? 'PASS' : 'WARN',
    value: hsts ? 'Enabled' : 'Missing',
    details: hsts ? `Cabecera presente: ${hsts}` : 'Fuerza a los navegadores a conectarse exclusivamente por HTTPS.',
  });

  // X-Frame-Options (Clickjacking)
  const xframe = headers['x-frame-options'];
  checks.push({
    id: 'sec-xframe',
    name: 'X-Frame-Options (Clickjacking)',
    status: xframe ? 'PASS' : 'WARN',
    value: xframe ? xframe.toUpperCase() : 'Missing',
    details: xframe ? `Protección contra iframes no autorizados.` : 'Previene ataques de Clickjacking impidiendo embeber el sitio.',
  });

  // Content-Security-Policy (CSP)
  const csp = headers['content-security-policy'];
  checks.push({
    id: 'sec-csp',
    name: 'Content-Security-Policy (CSP)',
    status: csp ? 'PASS' : 'WARN',
    value: csp ? 'Active' : 'Missing',
    details: csp ? 'Mitiga vulnerabilidades de Cross-Site Scripting (XSS).' : 'No se detectó política CSP en las cabeceras.',
  });

  return checks;
}

module.exports = { analyzeSecurity };
