import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { ApiError, FerriteApiClient } from "./api.js";
import {
  clearPendingConfigureToken,
  readCredentials,
  readPendingConfigureToken,
  saveCredentials,
} from "./credentials.js";
import type { ConfigureStatusResponse } from "../types.js";

function generateApiKey(): string {
  return `sk_agent_${crypto.randomBytes(32).toString("hex")}`;
}

async function getConfigureStatusOrNull(
  apiClient: FerriteApiClient,
  token: string,
): Promise<ConfigureStatusResponse | null> {
  try {
    return await apiClient.configureStatus(token);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 401 || error.status === 404 || error.status === 410)) {
      return null;
    }

    throw error;
  }
}

export async function claimConfigureToken(apiClient: FerriteApiClient, token: string): Promise<string> {
  const apiKey = generateApiKey();
  const apiKeyHash = await bcrypt.hash(apiKey, 12);

  await apiClient.claimConfigure(token, apiKeyHash);
  await saveCredentials(apiKey);
  await clearPendingConfigureToken();

  return apiKey;
}

export async function getPendingConfigureStatus(
  apiClient: FerriteApiClient,
): Promise<{ token: string; status: ConfigureStatusResponse } | null> {
  const token = await readPendingConfigureToken();

  if (!token) {
    return null;
  }

  const status = await getConfigureStatusOrNull(apiClient, token);

  if (!status || status.claim_status === "expired") {
    await clearPendingConfigureToken();
    return null;
  }

  return { token, status };
}

export async function resolveApiKeyWithAutoClaim(apiClient: FerriteApiClient): Promise<string> {
  const credentials = await readCredentials();

  if (credentials) {
    return credentials.api_key;
  }

  const pending = await getPendingConfigureStatus(apiClient);

  if (!pending) {
    throw new Error("No API key found. Run `ferrite configure` first.");
  }

  if (pending.status.claim_status === "ready_to_claim") {
    return claimConfigureToken(apiClient, pending.token);
  }

  await clearPendingConfigureToken();
  throw new Error("Configure session is no longer claimable. Run `ferrite configure` again.");
}
