import { Command } from "commander";
import { readFile, writeFile, mkdir, unlink } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { exec } from "node:child_process";
import { platform } from "node:process";
type CardSetupStatus = "awaiting_card" | "ready" | "expired" | "failed";

interface CardCreateResponse {
  setup_id: string;
  setup_url: string;
  status: CardSetupStatus;
  expires_at: string;
}

interface CardSetupStatusResponse {
  setup_id: string;
  status: CardSetupStatus;
  expires_at: string;
  card_id?: string;
  card_secret?: string;
}

interface CardConfigureResponse {
  setup_id: string;
  configure_url: string;
}

interface CardStatusResponse {
  card_id: string;
  weekly_limit_cents: number;
  weekly_spent_cents: number;
  weekly_remaining_cents: number;
  services: { name: string; status: string; created_at: string }[];
  recent_charges: { service_name: string; amount_cents: number; created_at: string }[];
}

const CONFIG_DIR = join(homedir(), ".agentspend");
const SETUP_FILE = join(CONFIG_DIR, "setup.json");
const CARD_FILE = join(CONFIG_DIR, "card.json");
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
  throw new Error("No setup_id found. Run 'agentspend card configure' first.");
}

async function readCardFile(): Promise<{ card_id: string; card_secret: string } | null> {
  try {
    const data = JSON.parse(await readFile(CARD_FILE, "utf-8"));
    if (typeof data.card_id === "string" && typeof data.card_secret === "string") {
      return { card_id: data.card_id, card_secret: data.card_secret };
    }
  } catch {
    // file doesn't exist or is invalid
  }
  return null;
}

async function createCard(): Promise<CardCreateResponse> {
  const response = await fetch(`${API_BASE}/v1/card/create`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to create card (${response.status}): ${body}`);
  }

  return (await response.json()) as CardCreateResponse;
}

async function requestConfigure(cardId: string, cardSecret: string): Promise<CardConfigureResponse> {
  const response = await fetch(`${API_BASE}/v1/card/configure`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ card_id: cardId, card_secret: cardSecret })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to open configure page (${response.status}): ${body}`);
  }

  return (await response.json()) as CardConfigureResponse;
}

async function getSetupStatus(setupId: string): Promise<CardSetupStatusResponse> {
  const response = await fetch(`${API_BASE}/v1/card/setup/${encodeURIComponent(setupId)}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to get setup status (${response.status}): ${body}`);
  }

  return (await response.json()) as CardSetupStatusResponse;
}

async function getCardStatus(cardId: string, cardSecret: string): Promise<CardStatusResponse> {
  const response = await fetch(`${API_BASE}/v1/card/${encodeURIComponent(cardId)}/status`, {
    headers: { "x-card-secret": cardSecret }
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Failed to get card status (${response.status}): ${body}`);
  }

  return (await response.json()) as CardStatusResponse;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export function registerCardCommands(program: Command): void {
  const card = program
    .command("card")
    .description("Manage AgentSpend cards");

  card
    .command("status")
    .description("Show card dashboard: weekly budget, services, and recent charges")
    .action(async () => {
      try {
        // If card.json exists, show full dashboard
        const cardData = await readCardFile();
        if (cardData) {
          const status = await getCardStatus(cardData.card_id, cardData.card_secret);

          console.log(`Card ID:   ${status.card_id}`);
          console.log(`Weekly budget: ${formatCents(status.weekly_spent_cents)} / ${formatCents(status.weekly_limit_cents)} used this week`);
          console.log(`Remaining: ${formatCents(status.weekly_remaining_cents)}`);

          console.log();
          if (status.services.length > 0) {
            console.log("Authorized services:");
            for (const svc of status.services) {
              console.log(`  - ${svc.name} (${svc.status}, since ${new Date(svc.created_at).toLocaleDateString()})`);
            }
          } else {
            console.log("Authorized services: No services authorized yet");
          }

          console.log();
          if (status.recent_charges.length > 0) {
            console.log("Recent charges:");
            for (const ch of status.recent_charges) {
              console.log(`  - ${ch.service_name}: ${formatCents(ch.amount_cents)} on ${new Date(ch.created_at).toLocaleDateString()}`);
            }
          } else {
            console.log("Recent charges: No charges yet");
          }

          return;
        }

        // Fall back to checking pending setup status
        const setupId = await readSetupId();
        const status = await getSetupStatus(setupId);
        console.log(`Setup ID:  ${status.setup_id}`);
        console.log(`Status:    ${status.status}`);
        console.log(`Expires:   ${status.expires_at}`);
        if (status.card_id) {
          console.log(`Card ID: ${status.card_id}`);
        }
      } catch (err: unknown) {
        console.error(`Error: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });

  card
    .command("configure")
    .description("Set up or reconfigure your card — opens the configuration page in your browser")
    .action(async () => {
      try {
        // Check if card.json exists — reconfigure flow
        const cardData = await readCardFile();
        if (cardData) {
          const result = await requestConfigure(cardData.card_id, cardData.card_secret);
          console.log("Opened configuration page in browser.");
          openUrl(result.configure_url);
          return;
        }

        // First-time setup flow
        const result = await createCard();
        console.log(`Setup ID: ${result.setup_id}`);
        console.log(`Opening configuration page in browser...`);
        openUrl(result.setup_url);

        await ensureConfigDir();
        await writeFile(SETUP_FILE, JSON.stringify({ setup_id: result.setup_id }, null, 2));

        console.log("Waiting for setup to complete...");
        while (true) {
          await sleep(3000);
          const status = await getSetupStatus(result.setup_id);

          if (status.status === "ready") {
            console.log(`Card is ready!`);
            if (status.card_id) {
              await writeFile(CARD_FILE, JSON.stringify({
                card_id: status.card_id,
                card_secret: status.card_secret,
              }, null, 2));
              console.log(`Card ID saved to ${CARD_FILE}`);
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
