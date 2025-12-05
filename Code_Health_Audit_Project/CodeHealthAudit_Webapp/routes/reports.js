const express = require("express");
const router = express.Router();
const authRequired = require("../src/middleware/authGuard");
const reportsController = require("../controllers/reportsController");
/*const { supabase } = require("../src/services/supabase");
const PDFDocument = require("pdfkit");*/

//===================================
// ============ HELPERS =============
// == esto despues separarlo en una 
// capa a parte como utils para poder 
// utilizarlo en otros lados
//===================================
/*function getRepoName(path) {
  if (!path) return "N/A";
  const parts = path.split(/[/\\]+/);
  return parts[parts.length - 1];
}

function getFileName(path) {
  if (!path) return "Archivo";
  const parts = path.split(/[/\\]+/);
  return parts[parts.length - 1];
}

function formatDate(iso) {
  if (!iso) return "N/A";
  try {
    const d = new Date(iso);
    return d.toLocaleString("es-AR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}*/
//===================================

router.get("/", authRequired, reportsController.reportsFindAll);/*async (req, res) => {
  const userId = req.user.id;

  const { data: reports, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).send("Error al cargar reportes");
  }

  res.render("reports/index", {
    user: req.user,
    reports,
  });
});*/

router.get("/:id", authRequired, reportsController.reportFindById);/*async (req, res) => {
  const reportId = req.params.id;
  const userId = req.user.id;

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", reportId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    return res.status(404).send("Reporte no encontrado");
  }

  const raw = data.raw_report || {};
  const files = raw.issues || [];

    // Preprocesar archivos: agregar nombre, contadores, etc.
  const processedFiles = files.map(f => ({
    ...f,
    filename: getFileName(f.file),
    counts: {
      todos: f.todos?.length || 0,
      fixmes: f.fixmes?.length || 0,
      smells: f.smells?.length || 0,
      jsIssues: f.jsIssues?.length || 0,
      uiIssues: f.uiIssues?.length || 0,
      owaspIssues: f.owasp?.length || 0
    }
  }));

  res.render("reports/detail", {
    data,
    raw,
    processedFiles,
    summary: raw.summary || {},
    repoName: getRepoName(raw.projectRoot),
    formattedDate: formatDate(raw.generatedAt)
  });
});*/

router.get("/:id/pdf", authRequired, reportsController.exportReportPdf);/*async (req, res)=> {
  const id = req.params.id;

  const { data: report, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !report) {
    return res.status(404).send("Reporte no encontrado");
  }

  const raw = report.raw_report || {};
  const summary = raw.summary || {};
  const files = raw.issues || [];

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=reporte-${id}.pdf`
  );

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  // Título
  doc.fontSize(22).text(`Reporte de Auditoría #${id}`, { align: "center" });
  doc.moveDown();

  // Información general
  doc.fontSize(14).text("Información general", { underline: true });
  doc.moveDown(0.4);
  doc.fontSize(12);
  doc.text(`Proyecto: ${getFileName(raw.projectRoot) || "N/A"}`);
  doc.text(`Generado el: ${formatDate(raw.generatedAt)}`);
  doc.text(`Archivos con issues: ${raw.filesWithIssues || files.length}`);
  doc.moveDown();

  // Resumen
  doc.fontSize(14).text("Resumen del análisis", { underline: true });
  doc.moveDown(0.4);

  doc.fontSize(12);
  doc.text(`TODOs: ${summary.todos || 0}`);
  doc.text(`FIXMEs: ${summary.fixmes || 0}`);
  doc.text(`Smells: ${summary.smells || 0}`);
  doc.text(`JS Issues: ${summary.js || 0}`);
  doc.text(`UI Issues: ${summary.ui || 0}`);
  doc.text(`OWASP: ${summary.owasp || 0}`);
  doc.moveDown();

  // Archivos
  doc.fontSize(14).text("Archivos analizados", { underline: true });
  doc.moveDown(0.6);

  files.forEach((f) => {
    doc.fontSize(13).text(getRepoName(f.file));
    doc.moveDown(0.3);

    doc.fontSize(11);
    if (f.todos?.length) doc.text(`TODOs: ${f.todos.length}`);
    if (f.fixmes?.length) doc.text(`FIXMEs: ${f.fixmes.length}`);
    if (f.smells?.length) doc.text(`Smells: ${f.smells.length}`);
    if (f.jsIssues?.length) doc.text(`JS Issues: ${f.jsIssues.length}`);
    if (f.uiIssues?.length) doc.text(`UI Issues: ${f.uiIssues.length}`);
    if (f.owasp?.length) doc.text(`OWASP: ${f.owasp.length}`);

    doc.moveDown(0.7);

  // Detalle
    if (f.todos) {
      f.todos.forEach((t) =>
        doc.text(`• TODO: ${t.text} (línea ${t.line})`)
      );
    }

    if (f.fixmes) {
      f.fixmes.forEach((t) =>
        doc.text(`• FIXME: ${t.text} (línea ${t.line})`)
      );
    }

    if (f.smells) {
      f.smells.forEach((s) =>
        doc.text(`• Smell: ${s.text} (línea ${s.line})`)
      );
    }

    if (f.jsIssues) {
      f.jsIssues.forEach((j) =>
        doc.text(`• JS Issue: ${j.type} — ${j.occurrences} ocurrencias`)
      );
    }

    if (f.uiIssues) {
      f.uiIssues.forEach((u) =>
        doc.text(`• UI Issue: ${u.type}`)
      );
    }

    if (f.owasp) {
      f.owasp.forEach((o) =>
        doc.text(`• OWASP ${o.rule}: ${o.detail}`)
      );
    }

    doc.moveDown();
  });

  doc.end();
});*/

module.exports = router;