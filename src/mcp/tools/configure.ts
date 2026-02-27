import { FerriteApiClient } from "../../lib/api.js";
import { resolveConfigureStatus } from "../../lib/configure-flow.js";
import { toolSuccess } from "../shared.js";

export async function runConfigureTool(apiClient: FerriteApiClient) {
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
}
