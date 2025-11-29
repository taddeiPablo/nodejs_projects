#!/usr/bin/env node

import { loadConfig } from "./core/config.js";
import { scanProject } from "./core/scanner.js";
import { analyzeFiles } from "./core/analyzer.js";
import { generateReport } from "./core/reporter.js";
import { printConsoleReport } from "./ui/console.js";

import linkCommand from "./commands/link.js";
import unlinkCommand from "./commands/unlink.js";
import sendReportCommand from "./commands/sendReport.js";

const args = process.argv.slice(2);

// ----------------------------
// 1) Link / Unlink
// ----------------------------
if (args[0] === "link") {
  const apiKey = args[1];
  linkCommand(apiKey);
  process.exit(0);
}

if (args[0] === "unlink") {
  unlinkCommand();
  process.exit(0);
}

// ----------------------------
// 2) Flags
// ----------------------------
const SEND = args.includes("--send-report") || args.includes("--sr");

// ----------------------------
// 3) Auditoría normal
// ----------------------------
console.log("🔍 Iniciando Code Health Audit...\n");

(async () => {
  const config = loadConfig();
  const files = scanProject(config.targetDir, config);
  const analysisReport = analyzeFiles(files, config);
  printConsoleReport(analysisReport);
  const reportPath = generateReport(analysisReport, config);

  // ----------------------------
  // 4) Enviar reporte al SaaS
  // ----------------------------
  if (SEND) {
    console.log("\n📡 Enviando reporte al SaaS...\n");

    // Este será tu dominio real cuando construyamos el backend
    const API_URL = "http://localhost:3000";

    await sendReportCommand(reportPath, API_URL);
  }

  console.log("\n🏁 Auditoría finalizada.");
})();
