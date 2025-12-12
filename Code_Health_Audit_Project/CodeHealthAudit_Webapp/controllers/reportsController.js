// controllers/reportsController.js
const supabase = require('../src/lib/supabaseClient');
//const { supabase } = require("../src/services/supabase");
const PDFDocument = require("pdfkit");
const utils = require('../src/helpers/utils');
const { compararReportes } = require('../src/utils/reportDiff');

const reportsFindAll = async (req, res) => {
    try {
        const userId = req.user.id;
        //----------------------------------------------------------------
        // analizar si se debe separar esta consulta a una capa diferente
        //----------------------------------------------------------------
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
    } catch (error) {
        return res.status(500).send("Error inesperado");
    }
};
const reportFindById = async(req, res) => {
    try {
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
            filename: utils.getFileName(f.file),
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
            repoName: utils.getRepoName(raw.projectRoot),
            formattedDate: utils.formatDate(raw.generatedAt)
        });
    } catch (error) {
        return res.status(500).send("Error Inesperado");
    }
};
const exportReportPdf = async(req, res) => {
    try {
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
        doc.text(`Proyecto: ${utils.getFileName(raw.projectRoot) || "N/A"}`);
        doc.text(`Generado el: ${utils.formatDate(raw.generatedAt)}`);
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
            doc.fontSize(13).text(utils.getRepoName(f.file));
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
    } catch (error) {
        return res.status(500).send("Error inesperado");
    }
};
const createReport = async (req, res) => {
    try {
        const { projectPath, timestamp, summary, files, raw_report } = req.body;
        const userId = req.user.id;

        if (!raw_report) {
        return res.status(400).json({ error: "raw_report is required" });
        }

        const { data, error } = await supabase
            .from("reports")
            .insert({
                user_id: userId,
                project_root: projectPath,
                processed_at: timestamp,
                summary,
                raw_report: raw_report,
            })
            .select();

        if (error) {
            return res.status(500).json({ error: "DB error" });
        }

        return res.status(201).json({ success: true, report: data[0] });
    } catch (err) {
        return res.status(500).json({ error: "Server error" });
    }
};
const deleteReport = async (req, res) => {
    try {
        const reportId = req.params.id;
        const userId = req.user.id;

        const { error } = await supabase
            .from("reports")
            .delete()
            .eq("id", reportId)
            .eq("user_id", userId);

        if (error) {
            console.error("Error deleting report:", error);
            return res.status(500).send("No se pudo eliminar el reporte");
        }

        res.redirect("/reports");
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};
const compareReports = async (req, res) => {
    try {
        const userId = req.user.id;
        const baseId = req.params.id;
        const compareDate = req.query.date;

        if (!compareDate) {
            return res.status(400).send("Falta ?date=YYYY-MM-DD");
        }

        // Fetch base report
        const { data: baseReport, error: e1 } = await supabase
            .from("reports")
            .select("*")
            .eq("id", baseId)
            .eq("user_id", userId)
            .single();

        if (e1 || !baseReport) return res.status(404).send("Reporte base no encontrado");

        // Buscar reporte más cercano hacia atrás
        const { data: candidates, error: e2 } = await supabase
            .from("reports")
            .select("*")
            .eq("user_id", userId)
            .lte("created_at", compareDate)
            .order("created_at", { ascending: false })
            .limit(1);

        if (e2) return res.status(500).send("Error buscando reporte a comparar");

        if (!candidates || candidates.length === 0) {
            return res.status(404).send("No se encontró ningún reporte en esa fecha o anterior.");
        }

        const olderReport = candidates[0];

        // Reutilizamos tu algoritmo de diff
        const results = compararReportes(olderReport.raw_report, baseReport.raw_report);

        res.render("reports/compare", {
            base: baseReport,
            older: olderReport,
            results,
        });
    } catch (error) {
        console.error("💥 EXCEPCIÓN GENERAL EN compareReports:", error);
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports = {
    createReport,
    reportsFindAll,
    reportFindById,
    exportReportPdf,
    deleteReport,
    compareReports
}


