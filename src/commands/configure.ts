import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { ApiError, AgentspendApiClient } from "../lib/api.js";
import {
  clearPendingConfigureToken,
  readCredentials,
  readPendingConfigureToken,
  saveCredentials,
  savePendingConfigureToken,
} from "../lib/credentials.js";
import type { ConfigureStatusResponse } from "../types.js";

const POLL_INTERVAL_MS = 2_000;
const CONFIGURE_TIMEOUT_MS = 10 * 60 * 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateApiKey(): string {
  return `sk_agent_${crypto.randomBytes(32).toString("hex")}`;
}

function isExpiredStatus(status: ConfigureStatusResponse): boolean {
  return status.claim_status === "expired";
}

async function getStatusOrNull(
  apiClient: AgentspendApiClient,
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

async function tryAuthenticatedConfigure(
  apiClient: AgentspendApiClient,
  apiKey: string,
): Promise<ConfigureStatusResponse | null> {
  try {
    return await apiClient.configure(undefined, apiKey);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}

async function claimAndSaveCredentials(apiClient: AgentspendApiClient, token: string): Promise<void> {
  const apiKey = generateApiKey();
  const apiKeyHash = await bcrypt.hash(apiKey, 12);

  await apiClient.claimConfigure(token, apiKeyHash);
  await saveCredentials(apiKey);
  await clearPendingConfigureToken();
}

export async function runConfigure(apiClient: AgentspendApiClient): Promise<void> {
  const credentials = await readCredentials();

  if (credentials) {
    const authenticatedResponse = await tryAuthenticatedConfigure(apiClient, credentials.api_key);
    if (authenticatedResponse) {
      console.log(`Open this URL to configure settings:\n${authenticatedResponse.configure_url}`);
      return;
    }
  }

  let token: string | null = await readPendingConfigureToken();
  let status: ConfigureStatusResponse | null = null;

  if (token) {
    status = await getStatusOrNull(apiClient, token);
    if (!status || isExpiredStatus(status)) {
      token = null;
      status = null;
      await clearPendingConfigureToken();
    }
  }

  if (!token) {
    const created = await apiClient.configure();
    token = created.token;
    await savePendingConfigureToken(token);
    status = created;
  }

  if (!status) {
    throw new Error("Unable to initialize configure session. Run agentspend configure again.");
  }

  console.log(`Open this URL to configure settings:\n${status.configure_url}\n`);
  console.log("Waiting for card setup and API key claim...");

  const started = Date.now();

  while (Date.now() - started < CONFIGURE_TIMEOUT_MS) {
    if (status.claim_status === "ready_to_claim") {
      await claimAndSaveCredentials(apiClient, token);
      console.log("Ready! Your agent can now spend.");
      return;
    }

    if (status.claim_status === "expired") {
      await clearPendingConfigureToken();
      throw new Error("Configure session expired. Run agentspend configure again.");
    }

    if (status.claim_status === "claimed") {
      await clearPendingConfigureToken();
      throw new Error("Configure session already claimed. Run agentspend configure again.");
    }

    await sleep(POLL_INTERVAL_MS);
    const polled = await getStatusOrNull(apiClient, token);

    if (!polled) {
      await clearPendingConfigureToken();
      throw new Error("Configure session expired. Run agentspend configure again.");
    }

    status = polled;
  }

  throw new Error("Configure timed out. Run agentspend configure again.");
}
