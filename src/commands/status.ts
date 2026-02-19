import { AgentspendApiClient } from "../lib/api.js";
import { requireApiKey } from "../lib/credentials.js";
import { printStatus } from "../lib/output.js";

export async function runStatus(apiClient: AgentspendApiClient): Promise<void> {
  const apiKey = await requireApiKey();
  const status = await apiClient.status(apiKey);
  printStatus(status);
}
