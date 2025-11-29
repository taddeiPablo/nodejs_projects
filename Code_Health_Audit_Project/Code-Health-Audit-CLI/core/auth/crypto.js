import crypto from "crypto";
import os from "os";

const SECRET = crypto
  .createHash("sha256")
  .update(os.userInfo().username + "_codeaudit_secret_key")
  .digest(); // 32 bytes

export function encrypt(text) {
  const iv = crypto.randomBytes(12); // recomendado para AES-GCM

  const cipher = crypto.createCipheriv("aes-256-gcm", SECRET, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return iv.toString("hex") + "." + tag.toString("hex") + "." + encrypted.toString("hex");
}

export function decrypt(payload) {
  const [ivHex, tagHex, dataHex] = payload.split(".");

  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", SECRET, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString("utf8");
}
