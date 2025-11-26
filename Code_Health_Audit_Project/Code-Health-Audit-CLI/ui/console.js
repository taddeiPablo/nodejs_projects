import chalk from "chalk";

/**
 * Renderiza la salida en consola del análisis.
 * 
 * @param {Array} analysisReport - Reporte completo generado por analyzer
 */
export function printConsoleReport(analysisReport) {
  console.log("\n");
  console.log(chalk.blue.bold("========== 📊 CODEAUDIT RESULTADOS ==========\n"));

  if (analysisReport.length === 0) {
    console.log(chalk.green("✔ No se encontraron problemas en el proyecto."));
    return;
  }

  console.log(chalk.yellow(`⚠ Archivos con problemas: ${analysisReport.length}`));

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

  console.log("\n📌 Resumen General:\n");
  console.table(summary);

  console.log("\n📂 Detalle por archivo:\n");

  analysisReport.forEach((file) => {
    console.log(chalk.cyan.bold(`→ ${file.file}`));

    if (file.todos.length) console.log(chalk.yellow(`   TODOs: ${file.todos.length}`));
    if (file.fixmes.length) console.log(chalk.yellow(`   FIXMEs: ${file.fixmes.length}`));
    if (file.smells.length) console.log(chalk.magenta(`   Code Smells: ${file.smells.length}`));
    if (file.jsIssues.length) console.log(chalk.red(`   JS Issues: ${file.jsIssues.length}`));
    if (file.uiIssues.length) console.log(chalk.blue(`   UI Issues: ${file.uiIssues.length}`));
    if (file.owasp.length) console.log(chalk.redBright(`   OWASP Alerts: ${file.owasp.length}`));

    console.log();
  });

  console.log(chalk.blue.bold("========== 🟦 FIN DEL REPORTE ==========\n"));
}
