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

  const rawReport = fs.readFileSync(reportPath, "utf8");
  const jsonReport = JSON.parse(rawReport);

  try {
    const response = await fetch(`${apiUrl}/api/report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(jsonReport),
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
