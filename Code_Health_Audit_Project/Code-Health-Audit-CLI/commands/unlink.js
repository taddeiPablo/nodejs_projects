import { clearApiKey } from "../core/auth/keyManager.js";

export default function unlinkCommand() {
  clearApiKey();
  console.log("🔓 API Key eliminada del sistema.");
}
