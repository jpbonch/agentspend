import { ApiError, FerriteApiClient } from "./api.js";
import { claimConfigureToken, getPendingConfigureStatus } from "./auth-flow.js";
import { clearPendingConfigureToken, readCredentials, savePendingConfigureToken } from "./credentials.js";
import type { ConfigureStatusResponse } from "../types.js";

async function tryAuthenticatedConfigure(
  apiClient: FerriteApiClient,
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

export interface ConfigureFlowResult {
  status: ConfigureStatusResponse;
  message: string;
}

export async function resolveConfigureStatus(apiClient: FerriteApiClient): Promise<ConfigureFlowResult> {
  const credentials = await readCredentials();

  if (credentials) {
    const authenticatedResponse = await tryAuthenticatedConfigure(apiClient, credentials.api_key);
    if (authenticatedResponse) {
      return {
        status: authenticatedResponse,
        message: "Existing API key is active.",
      };
    }
  }

  const pending = await getPendingConfigureStatus(apiClient);

  if (pending) {
    if (pending.status.claim_status === "ready_to_claim") {
      const apiKey = await claimConfigureToken(apiClient, pending.token);
      const claimedResponse = await tryAuthenticatedConfigure(apiClient, apiKey);

      if (claimedResponse) {
        return {
          status: claimedResponse,
          message: "Configure session ready and API key claimed.",
        };
      }

      throw new Error("API key was claimed, but configure session could not be created. Run ferrite configure again.");
    }

    await clearPendingConfigureToken();
  }

  const created = await apiClient.configure();
  await savePendingConfigureToken(created.token);

  return {
    status: created,
    message: "Configure session created.",
  };
}
