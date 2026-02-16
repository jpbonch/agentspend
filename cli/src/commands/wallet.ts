import { Command } from "commander";
import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { exec } from "node:child_process";
import { platform } from "node:process";
import type { WalletCreateResponse, WalletSetupStatusResponse } from "@agentspend/types";

const CONFIG_DIR = join(homedir(), ".agentspend");
const SETUP_FILE = join(CONFIG_DIR, "setup.json");
const WALLET_FILE = join(CONFIG_DIR, "wallet.json");
const API_BASE = process.env.AGENTSPEND_API_URL ?? "https://api.agentspend.co";

async function ensureConfigDir(): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
}

function openUrl(url: string): void {
  const cmd = platform === "darwin" ? "open" : platform === "win32" ? "start" : "xdg-open";
  exec(`${cmd} ${JSON.stringify(url)}`);
}

async function readSetupId(): Promise<string> {
  try {
    const data = JSON.parse(await readFile(SETUP_FILE, "utf-8"));
    if (typeof data.setup_id === "string" && data.setup_id) {
      return data.setup_id;
    }
  } catch {
    // file doesn't exist or is invalid
  }
  throw new Error("No setup_id found. Run 'agentspend wallet create' first.");
}

async function createWallet(): Promise<WalletCreateResponse> {
  const response = await fetch(`${API_BASE}/v1/wallet/create`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to create wallet (${response.status}): ${body}`);
  }

  return (await response.json()) as WalletCreateResponse;
}

async function getSetupStatus(setupId: string): Promise<WalletSetupStatusResponse> {
  const response = await fetch(`${API_BASE}/v1/wallet/setup/${encodeURIComponent(setupId)}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to get setup status (${response.status}): ${body}`);
  }

  return (await response.json()) as WalletSetupStatusResponse;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function registerWalletCommands(program: Command): void {
  const wallet = program
    .command("wallet")
    .description("Manage AgentSpend wallets");

  wallet
    .command("create")
    .description("Create a new wallet and open the setup URL in your browser")
    .action(async () => {
      try {
        const result = await createWallet();
        console.log(`Setup ID: ${result.setup_id}`);
        console.log(`Status:   ${result.status}`);
        console.log(`Opening setup URL in browser...`);
        openUrl(result.setup_url);

        await ensureConfigDir();
        await writeFile(SETUP_FILE, JSON.stringify({ setup_id: result.setup_id }, null, 2));
        console.log(`Setup ID saved to ${SETUP_FILE}`);
      } catch (err: unknown) {
        console.error(`Error: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });

  wallet
    .command("status")
    .description("Check the setup status of a pending wallet")
    .action(async () => {
      try {
        const setupId = await readSetupId();
        const status = await getSetupStatus(setupId);
        console.log(`Setup ID:  ${status.setup_id}`);
        console.log(`Status:    ${status.status}`);
        console.log(`Expires:   ${status.expires_at}`);
        if (status.wallet_id) {
          console.log(`Wallet ID: ${status.wallet_id}`);
        }
      } catch (err: unknown) {
        console.error(`Error: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });

  wallet
    .command("setup")
    .description("Create a wallet and wait until setup is complete")
    .action(async () => {
      try {
        const result = await createWallet();
        console.log(`Setup ID: ${result.setup_id}`);
        console.log(`Opening setup URL in browser...`);
        openUrl(result.setup_url);

        await ensureConfigDir();
        await writeFile(SETUP_FILE, JSON.stringify({ setup_id: result.setup_id }, null, 2));

        console.log("Waiting for setup to complete...");
        while (true) {
          await sleep(3000);
          const status = await getSetupStatus(result.setup_id);

          if (status.status === "ready") {
            console.log(`Wallet is ready!`);
            if (status.wallet_id) {
              await writeFile(WALLET_FILE, JSON.stringify({ wallet_id: status.wallet_id }, null, 2));
              console.log(`Wallet ID saved to ${WALLET_FILE}`);
            }
            // Clean up setup file
            await unlink(SETUP_FILE).catch(() => {});
            break;
          }

          if (status.status === "expired" || status.status === "failed") {
            await unlink(SETUP_FILE).catch(() => {});
            throw new Error(`Setup ${status.status}. Please try again.`);
          }

          process.stdout.write(".");
        }
      } catch (err: unknown) {
        console.error(`\nError: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });
}
