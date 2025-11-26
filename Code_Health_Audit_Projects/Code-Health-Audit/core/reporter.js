import fs from "fs";
import path from "path";

/**
 * Genera el reporte final en formato JSON.
 *
 * @param {Array} analysisReport - Resultado del analyzer (por archivo)
 * @param {Object} config        - Configuración global
 * @returns {string} Ruta del archivo generado
 */
export function generateReport(analysisReport, config) {
  const outputPath = config.output.json;

  // --- Build summary (igual que consola)
  const summary = {
    todos: 0,
    fixmes: 0,
    smells: 0,
    js: 0,
    ui: 0,
    owasp: 0,
  };

  for (const file of analysisReport) {
    summary.todos += file.todos.length;
    summary.fixmes += file.fixmes.length;
    summary.smells += file.smells.length;
    summary.js += file.jsIssues.length;
    summary.ui += file.uiIssues.length;
    summary.owasp += file.owasp.length;
  }

  // --- JSON payload final
  const payload = {
    generatedAt: new Date().toISOString(),
    projectRoot: process.cwd(),

    summary, // 👈 agregado
    filesWithIssues: analysisReport.length,

    issues: analysisReport, // 👈 lista por archivo, cruda + completa
  };

  try {
    fs.writeFileSync(outputPath, JSON.stringify(payload, null, 2), "utf-8");
    console.log(`\n📄 Reporte generado en: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error al guardar el reporte JSON:", error.message);
  }

  return outputPath;
}
