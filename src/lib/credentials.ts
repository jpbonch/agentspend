import { mkdir, readFile, writeFile, chmod } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { Credentials } from "../types.js";

const CREDENTIALS_DIR = path.join(os.homedir(), ".agentspend");
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, "credentials.json");

export function getCredentialsPath(): string {
  return CREDENTIALS_FILE;
}

export async function readCredentials(): Promise<Credentials | null> {
  try {
    const raw = await readFile(CREDENTIALS_FILE, "utf-8");
    const parsed = JSON.parse(raw) as Credentials;

    if (!parsed.api_key || !parsed.api_key.startsWith("sk_agent_")) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function saveCredentials(apiKey: string): Promise<void> {
  const payload: Credentials = {
    api_key: apiKey,
    created_at: new Date().toISOString(),
  };

  await mkdir(CREDENTIALS_DIR, { recursive: true, mode: 0o700 });
  await writeFile(CREDENTIALS_FILE, `${JSON.stringify(payload, null, 2)}\n`, "utf-8");

  try {
    await chmod(CREDENTIALS_FILE, 0o600);
  } catch {
    // no-op when chmod is not available on the host filesystem
  }
}

export async function requireApiKey(): Promise<string> {
  const credentials = await readCredentials();

  if (!credentials) {
    throw new Error(`No API key found at ${CREDENTIALS_FILE}. Run \`agentspend setup\` first.`);
  }

  return credentials.api_key;
}
