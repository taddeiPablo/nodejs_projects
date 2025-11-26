import fs from "fs";
import path from "path";

/**
 * Escanea un directorio recursivamente y devuelve
 * todos los archivos válidos según config.
 *
 * @param {string} baseDir - Directorio raíz donde comienza el escaneo.
 * @param {object} config  - Configuración cargada desde config.js
 * @returns {string[]} Lista de rutas absolutas de archivos válidos
 */
export function scanProject(baseDir, config) {
  const results = [];

  function scan(dir) {
    let files;

    try {
      files = fs.readdirSync(dir);
    } catch (error) {
      console.error(`❌ No se puede leer la carpeta: ${dir}`);
      return;
    }

    for (const file of files) {
      const fullPath = path.join(dir, file);

      let stat;
      try {
        stat = fs.statSync(fullPath);
      } catch {
        continue;
      }

      // --- Ignorar carpetas prohibidas ---
      if (stat.isDirectory()) {
        if (!config.ignore.includes(file)) {
          scan(fullPath);
        }
        continue;
      }

      // --- Validar extensión ---
      const ext = path.extname(file).toLowerCase();
      if (config.extensions.includes(ext)) {
        results.push(fullPath);
      }
    }
  }

  scan(baseDir);
  return results;
}
