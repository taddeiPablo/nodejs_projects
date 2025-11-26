import fs from "fs";
import path from "path";

/**
 * Este módulo ejecuta TODOS los análisis disponibles.
 * Cada análisis está modularizado para que sea fácil agregar más.
 */

// ============================
//  ANALIZADORES (Nivel Básico)
// ============================

// --- TODO/FIXME finder ---
function runTodoFixmeAnalysis(content) {
  const todos = [...content.matchAll(/\/\/\s*TODO/gi)];
  const fixmes = [...content.matchAll(/\/\/\s*FIXME/gi)];

  return {
    todos: todos.map(match => ({ line: getLine(content, match.index), text: match[0] })),
    fixmes: fixmes.map(match => ({ line: getLine(content, match.index), text: match[0] })),
  };
}

// --- Code Smells básicos ---
function runCodeSmellAnalysis(content) {
  const smells = [];

  // funciones largas
  const longFunctions = [...content.matchAll(/function\s+\w*\([^)]*\)\s*{([\s\S]{300,})}/g)];
  if (longFunctions.length) {
    smells.push({
      type: "long-function",
      occurrences: longFunctions.length,
    });
  }

  // console.log detectado
  const logs = [...content.matchAll(/console\.log/gi)];
  if (logs.length > 0) {
    smells.push({
      type: "console-log",
      occurrences: logs.length,
    });
  }

  return smells;
}

// --- Validador JS simple ---
function runJsValidator(content) {
  const issues = [];

  // var usage
  const vars = [...content.matchAll(/\bvar\b/g)];
  if (vars.length) {
    issues.push({
      type: "var-usage",
      occurrences: vars.length,
    });
  }

  return issues;
}

// --- UI Bugs (Nivel Básico) ---
function runUiBugDetector(content) {
  const issues = [];

  // uso de inline styles (malo para mantenimiento)
  const inline = [...content.matchAll(/style=\"/g)];
  if (inline.length) {
    issues.push({
      type: "inline-style",
      occurrences: inline.length,
    });
  }

  // HTML sin alt en imágenes
  const noAlt = [...content.matchAll(/<img[^>]*((?!alt=).)*>/g)];
  if (noAlt.length) {
    issues.push({
      type: "img-missing-alt",
      occurrences: noAlt.length,
    });
  }

  return issues;
}

// --- OWASP nivel básico (Top 10 estático) ---
function runOwaspChecks(content) {
  const findings = [];

  // XSS básico: innerHTML
  if (content.includes("innerHTML")) {
    findings.push({ rule: "XSS", detail: "Uso de innerHTML detectado" });
  }

  // SQL Injection: concatenación sospechosa
  if (/select\s+.+\+.+from/gi.test(content)) {
    findings.push({ rule: "SQL Injection", detail: "Concatenación peligrosa en query SQL" });
  }

  // LocalStorage sensible
  if (/localStorage\.setItem/gi.test(content)) {
    findings.push({ rule: "Sensitive Data Exposure", detail: "LocalStorage usado para datos sensibles" });
  }

  return findings;
}

// ============================
//  HERRAMIENTAS
// ============================

function getLine(content, index) {
  return content.substring(0, index).split("\n").length;
}

// ============================
//  ANALIZADOR PRINCIPAL
// ============================

export function analyzeFiles(fileList, config) {
  const report = [];

  console.log(`🔍 Ejecutando análisis sobre ${fileList.length} archivos...\n`);

  for (const file of fileList) {
    const content = fs.readFileSync(file, "utf-8");

    const fileReport = {
      file,
      todos: [],
      fixmes: [],
      smells: [],
      jsIssues: [],
      uiIssues: [],
      owasp: [],
    };

    // Ejecutar módulos según config
    if (config.analysis.todos) {
      const r = runTodoFixmeAnalysis(content);
      fileReport.todos = r.todos;
      fileReport.fixmes = r.fixmes;
    }

    if (config.analysis.codeSmells) {
      fileReport.smells = runCodeSmellAnalysis(content);
    }

    if (config.analysis.jsValidator) {
      fileReport.jsIssues = runJsValidator(content);
    }

    if (config.analysis.uiBugs) {
      fileReport.uiIssues = runUiBugDetector(content);
    }

    if (config.analysis.owasp) {
      fileReport.owasp = runOwaspChecks(content);
    }

    // Solo agregamos archivos que tengan issues
    const hasIssues =
      fileReport.todos.length ||
      fileReport.fixmes.length ||
      fileReport.smells.length ||
      fileReport.jsIssues.length ||
      fileReport.uiIssues.length ||
      fileReport.owasp.length;

    if (hasIssues) {
      report.push(fileReport);
    }
  }

  return report;
}
