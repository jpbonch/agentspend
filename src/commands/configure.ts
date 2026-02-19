import { AgentspendApiClient } from "../lib/api.js";
import { requireApiKey } from "../lib/credentials.js";

export async function runConfigure(apiClient: AgentspendApiClient): Promise<void> {
  const apiKey = await requireApiKey();
  const response = await apiClient.configure(apiKey);

  console.log(`Open this URL to configure settings:\n${response.configure_url}`);
}
