import { FerriteApiClient } from "../../lib/api.js";
import { resolveConfigureStatus } from "../../lib/configure-flow.js";
import { type AgentToolDefinition, toolSuccess, withToolErrorHandling } from "../shared.js";

export function createConfigureTool(apiClient: FerriteApiClient): AgentToolDefinition {
  return {
    name: "ferrite_configure",
    description: "Start or resume Ferrite configure flow and return a non-blocking configure URL.",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: {},
    },
    execute: async () =>
      withToolErrorHandling(async () => {
        const result = await resolveConfigureStatus(apiClient);

        return toolSuccess({
          configure_url: result.status.configure_url,
          claim_status: result.status.claim_status,
          has_card_on_file: result.status.has_card_on_file,
          has_api_key: result.status.has_api_key,
          message: result.message,
        });
      }),
  };
}
