import { spawn, spawnSync, type SpawnSyncReturns } from "node:child_process";
import { runConfigure } from "./configure.js";
import { FerriteApiClient } from "../lib/api.js";

const REQUIRED_TOOL_NAMES = [
  "ferrite_configure",
  "ferrite_search",
  "ferrite_use",
  "ferrite_status",
] as const;

interface InstallStep {
  label: string;
  run: () => Promise<void>;
}

interface InstallStepResult {
  label: string;
  status: "PASS" | "FAIL";
  detail?: string;
}

interface PluginInfoResponse {
  enabled?: unknown;
  status?: unknown;
  toolNames?: unknown;
}

interface CommandOutput {
  stdout: string;
  stderr: string;
}

class InstallCommandError extends Error {
  readonly retryable: boolean;

  constructor(message: string, retryable = true) {
    super(message);
    this.name = "InstallCommandError";
    this.retryable = retryable;
  }
}

function isAlreadyInstalledPluginMessage(message: string): boolean {
  return message.toLowerCase().includes("plugin already exists");
}

function formatCommand(command: string, args: string[]): string {
  return [command, ...args].join(" ");
}

function truncateOutput(output: string, maxLines = 40): string {
  const trimmed = output.trim();
  if (!trimmed) {
    return "";
  }

  const lines = trimmed.split("\n");
  if (lines.length <= maxLines) {
    return trimmed;
  }

  return `${lines.slice(0, maxLines).join("\n")}\n... (truncated)`;
}

function formatCommandFailure(
  command: string,
  args: string[],
  result: SpawnSyncReturns<string>,
): string {
  const lines: string[] = [`Command failed: ${formatCommand(command, args)}`];

  if (result.error) {
    lines.push(`Error: ${result.error.message}`);
  }

  if (typeof result.status === "number") {
    lines.push(`Exit code: ${result.status}`);
  }

  if (result.signal) {
    lines.push(`Signal: ${result.signal}`);
  }

  const stdout = truncateOutput(result.stdout ?? "");
  if (stdout) {
    lines.push(`stdout:\n${stdout}`);
  }

  const stderr = truncateOutput(result.stderr ?? "");
  if (stderr) {
    lines.push(`stderr:\n${stderr}`);
  }

  return lines.join("\n");
}

function runCommand(command: string, args: string[]): CommandOutput {
  console.log(`$ ${formatCommand(command, args)}`);

  const result = spawnSync(command, args, {
    encoding: "utf8",
  });

  if (command === "openclaw" && result.error && "code" in result.error && result.error.code === "ENOENT") {
    throw new InstallCommandError(
      "openclaw not found. Install OpenClaw CLI and ensure `openclaw` is on PATH.",
      false,
    );
  }

  if (result.error || result.status !== 0) {
    throw new InstallCommandError(formatCommandFailure(command, args, result));
  }

  return {
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function extractFirstJsonObject(value: string): string {
  const start = value.indexOf("{");
  if (start === -1) {
    throw new Error("Could not find JSON in plugin info output.");
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < value.length; i += 1) {
    const char = value[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      depth += 1;
      continue;
    }

    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return value.slice(start, i + 1);
      }
    }
  }

  throw new Error("Could not parse JSON from plugin info output.");
}

function firstLine(message: string): string {
  const line = message.split("\n", 1)[0]?.trim();
  return line || "Unknown error";
}

function scheduleGatewayRestart(): void {
  const deferredRestartScript = [
    "setTimeout(() => {",
    "  const cp = require('node:child_process');",
    "  const child = cp.spawn('openclaw', ['gateway', 'restart'], { detached: true, stdio: 'ignore' });",
    "  child.unref();",
    "}, 8000);",
  ].join("\n");

  const child = spawn(process.execPath, ["-e", deferredRestartScript], {
    detached: true,
    stdio: "ignore",
  });

  child.unref();
}

function verifyPluginTools(): void {
  const output = runCommand("openclaw", ["plugins", "info", "ferrite", "--json"]);
  const combined = `${output.stdout}\n${output.stderr}`;
  const jsonText = extractFirstJsonObject(combined);
  const pluginInfo = JSON.parse(jsonText) as PluginInfoResponse;

  if (pluginInfo.enabled !== true) {
    throw new Error("Ferrite plugin is not enabled.");
  }

  if (pluginInfo.status !== "loaded") {
    throw new Error(`Ferrite plugin status is "${String(pluginInfo.status)}" instead of "loaded".`);
  }

  const toolNames = Array.isArray(pluginInfo.toolNames)
    ? pluginInfo.toolNames.filter((value): value is string => typeof value === "string")
    : [];
  const missingTools = REQUIRED_TOOL_NAMES.filter((toolName) => !toolNames.includes(toolName));

  if (missingTools.length > 0) {
    throw new Error(`Ferrite plugin is missing required tools: ${missingTools.join(", ")}.`);
  }
}

async function runStepWithRetry(step: InstallStep, index: number, total: number): Promise<InstallStepResult> {
  const maxAttempts = 2;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const attemptSuffix = attempt > 1 ? " (retry 1/1)" : "";
    console.log(`\n[${index}/${total}] ${step.label}${attemptSuffix}`);

    try {
      await step.run();
      return {
        label: step.label,
        status: "PASS",
      };
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      console.error(detail);
      const retryable = error instanceof InstallCommandError ? error.retryable : true;

      if (retryable && attempt < maxAttempts) {
        console.log("Retrying step once...");
        continue;
      }

      return {
        label: step.label,
        status: "FAIL",
        detail: firstLine(detail),
      };
    }
  }

  return {
    label: step.label,
    status: "FAIL",
    detail: "Unknown error",
  };
}

export async function runInstall(apiClient: FerriteApiClient): Promise<void> {
  const steps: InstallStep[] = [
    {
      label: "Install Ferrite plugin package",
      run: async () => {
        try {
          runCommand("openclaw", ["plugins", "install", "@jpbonch/ferrite"]);
        } catch (error) {
          const detail = error instanceof Error ? error.message : String(error);
          if (isAlreadyInstalledPluginMessage(detail)) {
            console.log("Ferrite plugin is already installed. Continuing.");
            return;
          }

          throw error;
        }
      },
    },
    {
      label: "Enable Ferrite plugin",
      run: async () => {
        runCommand("openclaw", ["plugins", "enable", "ferrite"]);
      },
    },
    {
      label: "Disabling conflicting skills.",
      run: async () => {
        runCommand("openclaw", ["config", "set", "skills.entries.gog.enabled", "false", "--strict-json"]);
        runCommand("openclaw", ["config", "set", "skills.entries.weather.enabled", "false", "--strict-json"]);
      },
    },
    {
      label: "Verify Ferrite plugin tools",
      run: async () => {
        verifyPluginTools();
      },
    },
    {
      label: "Run Ferrite configure flow",
      run: async () => {
        await runConfigure(apiClient);
      },
    },
    {
      label: "Scheduling gateway restart",
      run: async () => {
        scheduleGatewayRestart();
      },
    },
  ];

  const results: InstallStepResult[] = [];

  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index];
    const result = await runStepWithRetry(step, index + 1, steps.length);
    results.push(result);

    if (result.status === "FAIL") {
      for (let i = index + 1; i < steps.length; i += 1) {
        results.push({
          label: steps[i].label,
          status: "FAIL",
          detail: "Not run because a previous step failed.",
        });
      }
      break;
    }
  }

  const hasFailures = results.some((result) => result.status === "FAIL");
  if (hasFailures) {
    throw new Error("Ferrite install failed.");
  }

  console.log("Ferrite install completed successfully.");
  console.log("Gateway will restart soon.");
}
