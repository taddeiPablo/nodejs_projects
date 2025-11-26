#!/usr/bin/env node

import { loadConfig } from "./core/config.js";
import { scanProject } from "./core/scanner.js";
import { analyzeFiles } from "./core/analyzer.js";
import { generateReport } from "./core/reporter.js";
import { printConsoleReport } from "./ui/console.js";

console.log("🔍 Iniciando Code Health Audit...\n");

(async () => {
  const config = loadConfig();
  const files = scanProject(config.targetDir, config);
  const analysisReport = analyzeFiles(files, config);
  printConsoleReport(analysisReport);
  generateReport(analysisReport, config);
  
  console.log("\n🏁 Auditoría finalizada.");
})();