import fs from "fs";
import path from "path";
import os from "os";
import { encrypt, decrypt } from "./crypto.js";

const CONFIG_DIR = path.join(os.homedir(), ".codeaudit");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function saveApiKey(apiKey) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  const encrypted = encrypt(apiKey);

  fs.writeFileSync(
    CONFIG_FILE,
    JSON.stringify(
      {
        apiKey: encrypted,
        createdAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  return CONFIG_FILE;
}

export function loadApiKey() {
  if (!fs.existsSync(CONFIG_FILE)) return null;

  try {
    const data = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    return decrypt(data.apiKey);
  } catch (err) {
    return null;
  }
}

export function clearApiKey() {
  if (fs.existsSync(CONFIG_FILE)) {
    fs.unlinkSync(CONFIG_FILE);
  }
}