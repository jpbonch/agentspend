import { ApiError, AgentspendApiClient } from "../lib/api.js";
import { resolveApiKeyWithAutoClaim } from "../lib/auth-flow.js";

type JsonObject = Record<string, unknown>;

export interface AgentToolResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
  details?: unknown;
  isError?: boolean;
}

export interface AgentToolDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (toolCallId: string, params: Record<string, unknown>) => Promise<AgentToolResult>;
}

class PluginToolError extends Error {
  readonly code: string;
  readonly details: JsonObject | undefined;

  constructor(message: string, code: string, details?: JsonObject) {
    super(message);
    this.name = "PluginToolError";
    this.code = code;
    this.details = details;
  }
}

function toToolResult(payload: JsonObject, isError = false): AgentToolResult {
  return {
    isError,
    details: payload,
    content: [
      {
        type: "text",
        text: JSON.stringify(payload, null, 2),
      },
    ],
  };
}

export function toolSuccess(payload: JsonObject): AgentToolResult {
  return toToolResult({ ok: true, ...payload });
}

export function toolError(message: string, extra?: JsonObject): AgentToolResult {
  return toToolResult(
    {
      ok: false,
      error: message,
      ...(extra ?? {}),
    },
    true,
  );
}

export function withToolErrorHandling(handler: () => Promise<AgentToolResult>): Promise<AgentToolResult> {
  return handler().catch((error) => pluginErrorResult(error));
}

export function toJsonValue(body: unknown): unknown {
  if (body === null) {
    return null;
  }

  if (typeof body === "string" || typeof body === "number" || typeof body === "boolean") {
    return body;
  }

  if (Array.isArray(body)) {
    return body.map((entry) => toJsonValue(entry));
  }

  if (typeof body === "object") {
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      output[key] = toJsonValue(value);
    }
    return output;
  }

  return String(body);
}

function apiErrorCode(body: unknown): string | undefined {
  if (typeof body !== "object" || body === null) {
    return undefined;
  }

  const code = (body as Record<string, unknown>).code;
  return typeof code === "string" ? code : undefined;
}

export function pluginErrorResult(error: unknown): AgentToolResult {
  if (error instanceof PluginToolError) {
    return toolError(error.message, {
      code: error.code,
      details: error.details ?? null,
    });
  }

  if (error instanceof ApiError) {
    return toolError(error.message, {
      status: error.status,
      code: apiErrorCode(error.body) ?? null,
      details: toJsonValue(error.body),
    });
  }

  if (error instanceof Error) {
    return toolError(error.message);
  }

  return toolError(String(error));
}

export function assertRecord(value: unknown, errorMessage: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(errorMessage);
  }

  return value as Record<string, unknown>;
}

export function optionalStringRecord(value: unknown, fieldName: string): Record<string, string> | undefined {
  if (value === undefined) {
    return undefined;
  }

  const record = assertRecord(value, `${fieldName} must be an object with string values`);
  const output: Record<string, string> = {};

  for (const [key, recordValue] of Object.entries(record)) {
    if (typeof recordValue !== "string") {
      throw new Error(`${fieldName}.${key} must be a string`);
    }

    output[key] = recordValue;
  }

  return output;
}

export function optionalRecord(value: unknown, fieldName: string): Record<string, unknown> | undefined {
  if (value === undefined) {
    return undefined;
  }

  return assertRecord(value, `${fieldName} must be an object`);
}

export function requiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} is required and must be a string`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${fieldName} is required and must be non-empty`);
  }

  return trimmed;
}

export async function resolveApiKeyForTool(apiClient: AgentspendApiClient): Promise<string> {
  try {
    return await resolveApiKeyWithAutoClaim(apiClient);
  } catch (error) {
    if (!(error instanceof Error)) {
      throw error;
    }

    if (error.message.startsWith("Card setup required. Open this URL:\n")) {
      const configureUrl = error.message.split("\n")[1]?.trim() || null;
      throw new PluginToolError(
        "Card setup required. Run agentspend_configure and complete card setup before retrying this tool.",
        "CONFIGURE_REQUIRED",
        { configure_url: configureUrl },
      );
    }

    if (error.message.includes("No API key found")) {
      throw new PluginToolError(
        "No API key found. Run agentspend_configure first.",
        "CONFIGURE_REQUIRED",
      );
    }

    throw error;
  }
}
