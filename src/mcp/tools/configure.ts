import { AgentspendApiClient } from "../../lib/api.js";
import { resolveConfigureStatus } from "../../lib/configure-flow.js";
import { toolSuccess } from "../shared.js";

export async function runConfigureTool(apiClient: AgentspendApiClient) {
  const result = await resolveConfigureStatus(apiClient);

  return toolSuccess({
    configure_url: result.status.configure_url,
    claim_status: result.status.claim_status,
    has_card_on_file: result.status.has_card_on_file,
    has_api_key: result.status.has_api_key,
    message: result.message,
  });
}
