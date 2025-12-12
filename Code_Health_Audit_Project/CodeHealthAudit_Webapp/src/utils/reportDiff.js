function compararReportes(oldReport, newReport) {
    // -----------------------------------------------------
    // 1) Extraer secciones
    // -----------------------------------------------------
    const oldIssues = oldReport.issues || [];
    const newIssues = newReport.issues || [];

    const oldSummary = oldReport.summary || {};
    const newSummary = newReport.summary || {};

    // -----------------------------------------------------
    // 2) Comparar SUMMARY (conteo global)
    // -----------------------------------------------------
    const summaryDiff = {
        todos: calcDiff(oldSummary.todos, newSummary.todos),
        fixmes: calcDiff(oldSummary.fixmes, newSummary.fixmes),
        smells: calcDiff(oldSummary.smells, newSummary.smells),
        js: calcDiff(oldSummary.js, newSummary.js),
        ui: calcDiff(oldSummary.ui, newSummary.ui),
        owasp: calcDiff(oldSummary.owasp, newSummary.owasp),
    };

    // -----------------------------------------------------
    // 3) Normalizar issues por archivo
    // -----------------------------------------------------
    const mapOld = mapByFile(oldIssues);
    const mapNew = mapByFile(newIssues);

    const allFiles = new Set([...Object.keys(mapOld), ...Object.keys(mapNew)]);

    const detailed = [];

    // -----------------------------------------------------
    // 4) Procesar archivo por archivo
    // -----------------------------------------------------
    for (const file of allFiles) {
        const oldF = mapOld[file] || emptyIssues();
        const newF = mapNew[file] || emptyIssues();

        detailed.push({
        file,

        todos: listDiff(oldF.todos, newF.todos),
        fixmes: listDiff(oldF.fixmes, newF.fixmes),
        smells: listDiff(oldF.smells, newF.smells),
        jsIssues: listDiff(oldF.jsIssues, newF.jsIssues, "js"),
        uiIssues: listDiff(oldF.uiIssues, newF.uiIssues),
        owasp: listDiff(oldF.owasp, newF.owasp, "owasp"),

        oldCounts: countsFor(oldF),
        newCounts: countsFor(newF),
        });
    }

    // -----------------------------------------------------
    // Resultado final
    // -----------------------------------------------------
    return {
        summaryDiff,
        detailed,
    };
}

// ===============================================
// Helpers
// ===============================================

// Diferencia de contadores simples
function calcDiff(oldVal = 0, newVal = 0) {
  return {
    old: oldVal,
    new: newVal,
    diff: newVal - oldVal
  };
}

// Crea un objeto vacío de issues
function emptyIssues() {
  return {
    todos: [],
    fixmes: [],
    smells: [],
    jsIssues: [],
    uiIssues: [],
    owasp: []
  };
}

// Mapea issues por filename
function mapByFile(files) {
  const map = {};
  for (const f of files) {
    map[f.file] = f;
  }
  return map;
}

// Convierte una lista a un set hash para comparar
function normalizeList(list, type = "generic") {
  return list.map(x => JSON.stringify(x));
}

// Resultado de comparar listas
function listDiff(oldList, newList, type = "issue") {
  const oldSet = new Set(normalizeList(oldList, type));
  const newSet = new Set(normalizeList(newList, type));

  const added = [...newSet].filter(x => !oldSet.has(x)).map(x => JSON.parse(x));
  const removed = [...oldSet].filter(x => !newSet.has(x)).map(x => JSON.parse(x));

  return {
    added,
    removed,
  };
}

// Conteo por archivo
function countsFor(fileObj) {
  return {
    todos: fileObj.todos.length,
    fixmes: fileObj.fixmes.length,
    smells: fileObj.smells.length,
    js: fileObj.jsIssues.length,
    ui: fileObj.uiIssues.length,
    owasp: fileObj.owasp.length
  };
}

module.exports = { compararReportes };