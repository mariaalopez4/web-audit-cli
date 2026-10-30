/**
 * SEO On-Page Analyzer
 * Extrae y valida metadatos esenciales para motores de búsqueda.
 */

function analyzeSeo(domData) {
  const checks = [];

  // Title
  if (!domData.title || domData.title.trim() === '') {
    checks.push({ id: 'seo-title', name: 'Document Title', status: 'FAIL', value: 'Missing tag', details: 'El documento no tiene etiqueta <title>.' });
  } else {
    const len = domData.title.length;
    const isOptimal = len >= 20 && len <= 70;
    checks.push({
      id: 'seo-title',
      name: 'Document Title',
      status: isOptimal ? 'PASS' : 'WARN',
      value: `"${domData.title.slice(0, 45)}${len > 45 ? '...' : ''}" (${len} chars)`,
      details: isOptimal ? 'Longitud adecuada (20-70 caracteres).' : `Longitud no óptima (${len} chars). Recomendado entre 20 y 70.`,
    });
  }

  // Meta Description
  if (!domData.description || domData.description.trim() === '') {
    checks.push({ id: 'seo-desc', name: 'Meta Description', status: 'WARN', value: 'Missing tag', details: 'No se encontró <meta name="description">.' });
  } else {
    const len = domData.description.length;
    const isOptimal = len >= 50 && len <= 160;
    checks.push({
      id: 'seo-desc',
      name: 'Meta Description',
      status: isOptimal ? 'PASS' : 'WARN',
      value: `${len} characters`,
      details: isOptimal ? 'Longitud recomendada (50-160 caracteres).' : `Longitud detectada: ${len} chars.`,
    });
  }

  // H1 Headings
  if (domData.h1Count === 0) {
    checks.push({ id: 'seo-h1', name: 'Heading <h1>', status: 'FAIL', value: '0 found', details: 'La página no tiene ningún encabezado <h1>.' });
  } else if (domData.h1Count === 1) {
    checks.push({ id: 'seo-h1', name: 'Heading <h1>', status: 'PASS', value: '1 found', details: 'Exactamente un encabezado <h1> principal.' });
  } else {
    checks.push({ id: 'seo-h1', name: 'Heading <h1>', status: 'WARN', value: `${domData.h1Count} found`, details: 'Múltiples etiquetas <h1> encontradas. Se recomienda una sola por página.' });
  }

  // Open Graph
  checks.push({
    id: 'seo-og',
    name: 'Open Graph Tags (og:title, og:image)',
    status: domData.hasOgTitle && domData.hasOgImage ? 'PASS' : domData.hasOgTitle || domData.hasOgImage ? 'WARN' : 'WARN',
    value: domData.hasOgTitle && domData.hasOgImage ? 'Configured' : 'Incomplete / Missing',
    details: 'Metadatos para previsualización en redes sociales.',
  });

  // Canonical
  checks.push({
    id: 'seo-canonical',
    name: 'Canonical Link',
    status: domData.hasCanonical ? 'PASS' : 'INFO',
    value: domData.hasCanonical ? 'Present' : 'Not declared',
    details: 'Evita problemas de contenido duplicado.',
  });

  return checks;
}

module.exports = { analyzeSeo };
