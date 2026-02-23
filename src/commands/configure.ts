import { AgentspendApiClient } from "../lib/api.js";
import { resolveConfigureStatus } from "../lib/configure-flow.js";

export async function runConfigure(apiClient: AgentspendApiClient): Promise<void> {
  const result = await resolveConfigureStatus(apiClient);
  console.log(`Open this URL to configure settings:\n${result.status.configure_url}`);
}
