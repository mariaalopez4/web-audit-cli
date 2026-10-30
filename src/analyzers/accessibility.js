/**
 * Accessibility (A11y) Analyzer
 * Comprobaciones básicas de accesibilidad en el DOM.
 */

function analyzeAccessibility(domData) {
  const checks = [];

  // Image ALT attributes
  if (domData.totalImages === 0) {
    checks.push({
      id: 'a11y-img-alt',
      name: 'Image Alternative Text',
      status: 'PASS',
      value: 'No images',
      details: 'No se encontraron imágenes en el documento.',
    });
  } else if (domData.imagesWithoutAlt === 0) {
    checks.push({
      id: 'a11y-img-alt',
      name: 'Image Alternative Text',
      status: 'PASS',
      value: `All ${domData.totalImages} images have alt`,
      details: 'Todas las etiquetas <img> contienen atributo alt descriptivo.',
    });
  } else {
    checks.push({
      id: 'a11y-img-alt',
      name: 'Image Alternative Text',
      status: 'WARN',
      value: `${domData.imagesWithoutAlt} of ${domData.totalImages} missing alt`,
      details: 'Imágenes sin texto alternativo. Afecta a lectores de pantalla y accesibilidad.',
    });
  }

  // HTML Lang attribute
  if (domData.htmlLang && domData.htmlLang.trim() !== '') {
    checks.push({
      id: 'a11y-html-lang',
      name: 'Document Language (<html lang>)',
      status: 'PASS',
      value: `lang="${domData.htmlLang}"`,
      details: 'Atributo de idioma correctamente declarado.',
    });
  } else {
    checks.push({
      id: 'a11y-html-lang',
      name: 'Document Language (<html lang>)',
      status: 'WARN',
      value: 'Missing lang attribute',
      details: 'El elemento raíz <html> no declara el atributo lang.',
    });
  }

  // Viewport Meta Tag
  if (domData.hasViewport) {
    checks.push({
      id: 'a11y-viewport',
      name: 'Responsive Viewport Meta',
      status: 'PASS',
      value: 'Declared',
      details: 'Permite el escalado y renderizado correcto en dispositivos móviles.',
    });
  } else {
    checks.push({
      id: 'a11y-viewport',
      name: 'Responsive Viewport Meta',
      status: 'FAIL',
      value: 'Missing meta viewport',
      details: 'No se encontró etiqueta <meta name="viewport">.',
    });
  }

  return checks;
}

module.exports = { analyzeAccessibility };
