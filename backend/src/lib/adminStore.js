import bcrypt from "bcryptjs";
import { readJson, writeJson } from "./jsonStore.js";
import { ADMIN_PATH } from "./paths.js";

export function getAdmin() {
  return readJson(ADMIN_PATH, null);
}

export function isAdminConfigured() {
  return getAdmin() !== null;
}

export async function setAdminPassword(username, plainPassword) {
  const passwordHash = await bcrypt.hash(plainPassword, 12);
  writeJson(ADMIN_PATH, { username, passwordHash });
}

export async function verifyAdminPassword(username, plainPassword) {
  const admin = getAdmin();
  if (!admin) return false;
  if (admin.username !== username) return false;
  return bcrypt.compare(plainPassword, admin.passwordHash);
}
