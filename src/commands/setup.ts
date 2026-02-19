import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { AgentspendApiClient } from "../lib/api.js";
import { saveCredentials } from "../lib/credentials.js";

const POLL_INTERVAL_MS = 2_000;
const SETUP_TIMEOUT_MS = 10 * 60 * 1000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateApiKey(): string {
  return `sk_agent_${crypto.randomBytes(32).toString("hex")}`;
}

export async function runSetup(apiClient: AgentspendApiClient): Promise<void> {
  const setup = await apiClient.createSetup();

  console.log(`Open this URL to complete setup:\n${setup.setup_url}\n`);
  console.log("Waiting for setup to complete...");

  const started = Date.now();

  while (Date.now() - started < SETUP_TIMEOUT_MS) {
    const status = await apiClient.getSetupStatus(setup.setup_id);

    if (status.status === "ready") {
      const apiKey = generateApiKey();
      const apiKeyHash = await bcrypt.hash(apiKey, 12);

      await apiClient.claimSetup(setup.setup_id, apiKeyHash);
      await saveCredentials(apiKey);

      console.log("Ready! Your agent can now spend.");
      return;
    }

    if (status.status === "claimed") {
      throw new Error("This setup session was already claimed. Run agentspend setup again.");
    }

    if (status.status === "expired") {
      throw new Error("Setup timed out. Run agentspend setup again.");
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error("Setup timed out. Run agentspend setup again.");
}
