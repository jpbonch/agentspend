import { FerriteApiClient } from "../lib/api.js";
import { buildFerriteRoutingDirective } from "./hooks/prompt-routing.js";
import { createConfigureTool } from "./tools/configure.js";
import { createSearchTool } from "./tools/search.js";
import { createStatusTool } from "./tools/status.js";
import { createUseTool } from "./tools/use.js";
import type { AgentToolDefinition } from "./shared.js";

interface OpenClawPluginApi {
  registerTool: (tool: AgentToolDefinition, opts?: { optional?: boolean; names?: string[]; name?: string }) => void;
  on: (hookName: string, handler: (...args: any[]) => any, opts?: { priority?: number }) => void;
  logger?: { debug?: (message: string) => void };
}

interface SessionEvent {
  sessionId?: string;
}

interface HookContext {
  sessionId?: string;
  sessionKey?: string;
}

interface SessionState {
  reminderSent: boolean;
}

function getSessionId(event?: SessionEvent, ctx?: HookContext): string | null {
  if (typeof event?.sessionId === "string" && event.sessionId.trim()) {
    return event.sessionId.trim();
  }

  if (typeof ctx?.sessionId === "string" && ctx.sessionId.trim()) {
    return ctx.sessionId.trim();
  }

  if (typeof ctx?.sessionKey === "string" && ctx.sessionKey.trim()) {
    return ctx.sessionKey.trim();
  }

  return null;
}

export default function register(api: OpenClawPluginApi): void {
  const apiClient = new FerriteApiClient();
  const sessionStates = new Map<string, SessionState>();

  const maybeInjectReminder = (event?: SessionEvent, ctx?: HookContext): { prependContext: string } | void => {
    const sessionId = getSessionId(event, ctx);
    if (!sessionId) {
      return;
    }

    const state = sessionStates.get(sessionId) ?? { reminderSent: false };
    sessionStates.set(sessionId, state);

    if (state.reminderSent) {
      return;
    }

    state.reminderSent = true;
    api.logger?.debug?.(`[ferrite] injected routing directive once for session=${sessionId}`);
    return { prependContext: buildFerriteRoutingDirective() };
  };

  api.on(
    "session_start",
    (event: SessionEvent, ctx: HookContext) => {
      return maybeInjectReminder(event, ctx);
    },
    { priority: 10 },
  );

  api.on(
    "before_prompt_build",
    (_event: unknown, ctx: HookContext) => {
      return maybeInjectReminder(undefined, ctx);
    },
    { priority: 10 },
  );

  api.on(
    "session_end",
    (event: SessionEvent, ctx: HookContext) => {
      const sessionId = getSessionId(event, ctx);
      if (!sessionId) {
        return;
      }

      sessionStates.delete(sessionId);
      api.logger?.debug?.(`[ferrite] cleaned session state for session=${sessionId}`);
    },
    { priority: 10 },
  );

  api.registerTool(createConfigureTool(apiClient));
  api.registerTool(createSearchTool(apiClient));
  api.registerTool(createUseTool(apiClient));
  api.registerTool(createStatusTool(apiClient));
}
