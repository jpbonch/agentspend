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
        const needsSetup = !result.status.has_api_key;
        const message = needsSetup
          ? "Please finish setup using this link, then reply \"done\"."
          : "Setup is complete.";

        return toolSuccess({
          needs_setup: needsSetup,
          configure_url: result.status.configure_url,
          message,
        });
      }),
  };
}
