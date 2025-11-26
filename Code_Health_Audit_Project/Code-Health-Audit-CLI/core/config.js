import path from "path";
import { fileURLToPath } from "url";

// Necesario para obtener correctamente __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function loadConfig() {
  return {
    // Carpeta objetivo: "src" por defecto , "src"
    targetDir: path.join(process.cwd(), "src" ),

    // Extensiones que se analizarán
    extensions: [".js", ".ts", ".tsx", ".jsx", ".html", ".css", ".scss", ".dart"],

    // Carpetas que se ignorarán durante el escaneo
    ignore: [
      "node_modules",
      "dist",
      "build",
      ".git",
      ".next",
      "coverage",
      ".angular",
      "out",
      "android",
      "ios"
    ],

    // Configs de análisis por categoría
    analysis: {
      todos: true,
      codeSmells: true,
      uiBugs: true,
      jsValidator: true,
      owasp: true,
    },

    // Ruta para guardar el reporte JSON
    output: {
      json: path.join(process.cwd(), "audit-report.json")
    }
  };
}
