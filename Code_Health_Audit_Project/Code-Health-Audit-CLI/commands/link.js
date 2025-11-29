import { saveApiKey } from "../core/auth/keyManager.js";

export default function linkCommand(apiKey) {
  if (!apiKey) {
    console.log("❌ Debes ingresar una API Key.");
    return;
  }

  const location = saveApiKey(apiKey);

  console.log(`🔐 API Key guardada de forma segura.`);
  console.log(`📁 Ubicación: ${location}`);
}
