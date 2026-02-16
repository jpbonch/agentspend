import { Command } from "commander";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".agentspend");
const WALLET_FILE = join(CONFIG_DIR, "wallet.json");

async function ensureConfigDir(): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
}

interface WalletConfig {
  address: string;
  network: string;
  private_key: string;
}

async function readWalletConfig(): Promise<WalletConfig | null> {
  try {
    const data = JSON.parse(await readFile(WALLET_FILE, "utf-8"));
    if (typeof data.address === "string" && data.address) {
      return data as WalletConfig;
    }
  } catch {
    // file doesn't exist or is invalid
  }
  return null;
}

export function registerWalletCommands(program: Command): void {
  const wallet = program
    .command("wallet")
    .description("Manage AgentSpend crypto wallets");

  wallet
    .command("create")
    .description("Generate a new crypto wallet for x402 payments")
    .option("--network <network>", "Chain identifier", "eip155:8453")
    .action(async (opts: { network: string }) => {
      try {
        const existing = await readWalletConfig();
        if (existing) {
          console.log(`Wallet already exists.`);
          console.log(`  Address: ${existing.address}`);
          console.log(`  Network: ${existing.network}`);
          console.log(`  Saved at: ${WALLET_FILE}`);
          process.exit(0);
        }

        const { generatePrivateKey, privateKeyToAccount } = await import("viem/accounts");
        const privateKey = generatePrivateKey();
        const account = privateKeyToAccount(privateKey);

        await ensureConfigDir();

        const config: WalletConfig = {
          address: account.address,
          network: opts.network,
          private_key: privateKey,
        };

        await writeFile(WALLET_FILE, JSON.stringify(config, null, 2));

        console.log(`Wallet created. Address: ${account.address} — Fund it with USDC on Base.`);
      } catch (err: unknown) {
        console.error(`Error: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });

  wallet
    .command("status")
    .description("Show wallet address, network, and USDC balance")
    .action(async () => {
      try {
        const config = await readWalletConfig();
        if (!config) {
          console.log("No wallet configured.");
          console.log("Run: agentspend wallet create");
          process.exit(0);
        }

        console.log(`Address: ${config.address}`);
        console.log(`Network: ${config.network}`);

        // Fetch USDC balance on Base
        try {
          const { createPublicClient, http, parseAbi } = await import("viem");
          const { base } = await import("viem/chains");

          const client = createPublicClient({
            chain: base,
            transport: http(),
          });

          const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`;
          const balance = await client.readContract({
            address: usdcAddress,
            abi: parseAbi(["function balanceOf(address) view returns (uint256)"]),
            functionName: "balanceOf",
            args: [config.address as `0x${string}`],
          });

          const usdcBalance = Number(balance) / 1e6;
          console.log(`USDC Balance: ${usdcBalance.toFixed(2)} USDC`);
        } catch {
          console.log("USDC Balance: (unable to fetch)");
        }
      } catch (err: unknown) {
        console.error(`Error: ${err instanceof Error ? err.message : err}`);
        process.exit(1);
      }
    });
}
