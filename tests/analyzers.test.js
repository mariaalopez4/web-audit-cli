const { describe, it } = require('node:test');
const assert = require('node:assert');
const { analyzeSecurity } = require('../src/analyzers/security');
const { analyzeSeo } = require('../src/analyzers/seo');
const { analyzeAccessibility } = require('../src/analyzers/accessibility');

describe('Security Analyzer', () => {
  it('should flag insecure HTTP url as FAIL', () => {
    const checks = analyzeSecurity('http://insecure-site.example', {});
    const httpsCheck = checks.find((c) => c.id === 'sec-https');
    assert.strictEqual(httpsCheck.status, 'FAIL');
  });

  it('should pass HTTPS with standard security headers', () => {
    const headers = {
      'strict-transport-security': 'max-age=31536000; includeSubDomains',
      'x-frame-options': 'DENY',
      'content-security-policy': "default-src 'self'",
    };
    const checks = analyzeSecurity('https://secure-site.example', headers);

    const httpsCheck = checks.find((c) => c.id === 'sec-https');
    const hstsCheck = checks.find((c) => c.id === 'sec-hsts');
    const xframeCheck = checks.find((c) => c.id === 'sec-xframe');
    const cspCheck = checks.find((c) => c.id === 'sec-csp');

    assert.strictEqual(httpsCheck.status, 'PASS');
    assert.strictEqual(hstsCheck.status, 'PASS');
    assert.strictEqual(xframeCheck.status, 'PASS');
    assert.strictEqual(cspCheck.status, 'PASS');
  });

  it('should warn when security headers are missing', () => {
    const checks = analyzeSecurity('https://missing-headers.example', {});
    const hstsCheck = checks.find((c) => c.id === 'sec-hsts');
    const cspCheck = checks.find((c) => c.id === 'sec-csp');

    assert.strictEqual(hstsCheck.status, 'WARN');
    assert.strictEqual(cspCheck.status, 'WARN');
  });
});

describe('SEO Analyzer', () => {
  it('should evaluate optimal title and meta description', () => {
    const domData = {
      title: 'Valid Document Title for Auditing Purposes',
      description: 'This is a valid meta description that contains between 50 and 160 characters for testing SEO accuracy.',
      h1Count: 1,
      hasOgTitle: true,
      hasOgImage: true,
      hasCanonical: true,
    };
    const checks = analyzeSeo(domData);
    const titleCheck = checks.find((c) => c.id === 'seo-title');
    const descCheck = checks.find((c) => c.id === 'seo-desc');
    const h1Check = checks.find((c) => c.id === 'seo-h1');

    assert.strictEqual(titleCheck.status, 'PASS');
    assert.strictEqual(descCheck.status, 'PASS');
    assert.strictEqual(h1Check.status, 'PASS');
  });

  it('should fail when title or h1 is missing', () => {
    const domData = {
      title: '',
      description: '',
      h1Count: 0,
      hasOgTitle: false,
      hasOgImage: false,
      hasCanonical: false,
    };
    const checks = analyzeSeo(domData);
    const titleCheck = checks.find((c) => c.id === 'seo-title');
    const h1Check = checks.find((c) => c.id === 'seo-h1');

    assert.strictEqual(titleCheck.status, 'FAIL');
    assert.strictEqual(h1Check.status, 'FAIL');
  });
});

describe('Accessibility Analyzer', () => {
  it('should pass when all images have alt attributes and viewport is defined', () => {
    const domData = {
      totalImages: 4,
      imagesWithoutAlt: 0,
      htmlLang: 'en',
      hasViewport: true,
    };
    const checks = analyzeAccessibility(domData);
    const altCheck = checks.find((c) => c.id === 'a11y-img-alt');
    const langCheck = checks.find((c) => c.id === 'a11y-html-lang');
    const viewportCheck = checks.find((c) => c.id === 'a11y-viewport');

    assert.strictEqual(altCheck.status, 'PASS');
    assert.strictEqual(langCheck.status, 'PASS');
    assert.strictEqual(viewportCheck.status, 'PASS');
  });

  it('should warn if images miss alt attributes or lang is missing', () => {
    const domData = {
      totalImages: 3,
      imagesWithoutAlt: 2,
      htmlLang: '',
      hasViewport: false,
    };
    const checks = analyzeAccessibility(domData);
    const altCheck = checks.find((c) => c.id === 'a11y-img-alt');
    const langCheck = checks.find((c) => c.id === 'a11y-html-lang');
    const viewportCheck = checks.find((c) => c.id === 'a11y-viewport');

    assert.strictEqual(altCheck.status, 'WARN');
    assert.strictEqual(langCheck.status, 'WARN');
    assert.strictEqual(viewportCheck.status, 'FAIL');
  });
});
