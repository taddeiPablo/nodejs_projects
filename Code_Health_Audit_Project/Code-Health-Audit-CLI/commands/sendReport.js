import fs from "fs";
import path from "path";
import { loadApiKey } from "../core/auth/keyManager.js";

export default async function sendReportCommand(reportPath, apiUrl) {
  console.log("📤 Enviando reporte al servidor...");

  const apiKey = loadApiKey();

  if (!apiKey) {
    console.log("❌ No tienes una API Key vinculada. Ejecuta:");
    console.log("   code-audit link <api-key>");
    return;
  }

  if (!fs.existsSync(reportPath)) {
    console.log(`❌ No se encontró el archivo del reporte en: ${reportPath}`);
    return;
  }

  const raw = fs.readFileSync(reportPath, "utf8");
  const report = JSON.parse(raw);

  // ⛔ El backend necesita raw_report OBLIGATORIO.
  const payload = {
    projectPath: report.projectPath,
    timestamp: report.timestamp || new Date().toISOString(),
    summary: report.summary,
    files: report.files || [],
    raw_report: report,  // <<<<<< IMPORTANTE
  };

  try {
    const response = await fetch(`${apiUrl}/api/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.log(`❌ Error del servidor (${response.status}):`);
      const err = await response.text();
      console.log(err);
      return;
    }

    const data = await response.json();
    console.log("✔ Reporte enviado correctamente.");
    console.log("🆔 ID del reporte:", data.id);

  } catch (err) {
    console.log("❌ Error al conectar con el servidor:");
    console.log(err.message);
  }
}
