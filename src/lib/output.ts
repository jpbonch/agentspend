import type { PaymentRequirementInfo, StatusCharge, StatusResponse } from "../types.js";

const USD6_SCALE = 1_000_000;

function formatUsdNumber(value: number, minDecimals = 2, maxDecimals = 6): string {
  const fixed = value.toFixed(maxDecimals);
  const trimmed = fixed.replace(/(\.\d*?)0+$/, "$1").replace(/\.$/, "");

  if (!trimmed.includes(".")) {
    return minDecimals > 0 ? `${trimmed}.${"0".repeat(minDecimals)}` : trimmed;
  }

  const [whole, frac = ""] = trimmed.split(".");
  if (frac.length >= minDecimals) {
    return trimmed;
  }

  return `${whole}.${frac.padEnd(minDecimals, "0")}`;
}

export function usd6ToUsd(usd6: number): number {
  return usd6 / USD6_SCALE;
}

export function formatUsd(usd: number): string {
  if (!Number.isFinite(usd)) {
    return "unknown";
  }

  return `$${formatUsdNumber(usd, 2, 6)}`;
}

export function formatUsdEstimate(estimatedUsd: number | null | undefined, fallbackUsd?: number | null): string {
  if (typeof estimatedUsd === "number") {
    return formatUsd(estimatedUsd);
  }

  if (typeof fallbackUsd === "number") {
    return formatUsd(fallbackUsd);
  }

  return "unknown";
}

export function formatJson(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value, null, 2);
}

export function relativeTime(iso: string): string {
  const timestamp = new Date(iso).getTime();
  const diffMs = Date.now() - timestamp;
  const abs = Math.max(0, Math.floor(diffMs / 1000));

  if (abs < 60) {
    return `${abs}s ago`;
  }

  const minutes = Math.floor(abs / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function maybeLine(label: string, value: string | null | undefined): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return `${label}: ${value}`;
}

export function formatPaymentRequirementDetails(info: PaymentRequirementInfo): string {
  const lines: string[] = [];
  const amount =
    info.amount_display !== null && info.amount_display !== undefined
      ? `${info.amount_display} ${info.currency}`
      : info.amount_minor !== null && info.amount_minor !== undefined
        ? `${String(info.amount_minor)} minor units ${info.currency}`
        : null;

  const policyUsd = info.price_usd ?? (info.price_usd6 !== null ? usd6ToUsd(info.price_usd6) : null);
  const priceLine = policyUsd !== null ? formatUsd(policyUsd) : "unavailable";
  const estimateLine = formatUsdEstimate(info.estimated_usd, policyUsd);

  lines.push(`Policy price (USD-6): ${priceLine}`);
  lines.push(`Estimated USD value: ${estimateLine}`);

  const amountLine = maybeLine("Token amount", amount);
  if (amountLine) {
    lines.push(amountLine);
  }

  const decimalsLine = info.decimals !== null ? `Decimals: ${info.decimals}` : null;
  if (decimalsLine) {
    lines.push(decimalsLine);
  }

  const payToLine = maybeLine("Pay to", info.pay_to);
  if (payToLine) {
    lines.push(payToLine);
  }

  const networkLine = maybeLine("Network", info.network);
  if (networkLine) {
    lines.push(networkLine);
  }

  const schemeLine = maybeLine("Scheme", info.scheme);
  if (schemeLine) {
    lines.push(schemeLine);
  }

  const resourceLine = maybeLine("Resource", info.resource);
  if (resourceLine) {
    lines.push(resourceLine);
  }

  const descriptionLine = maybeLine("Description", info.description);
  if (descriptionLine) {
    lines.push(descriptionLine);
  }

  const timeoutLine = info.max_timeout_seconds !== null ? `Max timeout: ${info.max_timeout_seconds}s` : null;
  if (timeoutLine) {
    lines.push(timeoutLine);
  }

  const mimeTypeLine = maybeLine("Mime type", info.mime_type);
  if (mimeTypeLine) {
    lines.push(mimeTypeLine);
  }

  const noteLine = maybeLine("Pricing note", info.pricing_note);
  if (noteLine) {
    lines.push(noteLine);
  }

  return lines.map((line) => `  ${line}`).join("\n");
}

function formatCharge(charge: StatusCharge): string {
  const amountUsd = charge.amount_usd ?? usd6ToUsd(charge.amount_usd6);
  const amount = formatUsd(amountUsd).padEnd(10);
  const domain = charge.target_domain.padEnd(24);
  const when = relativeTime(charge.created_at);

  return `  ${amount} ${domain} ${when}`;
}

export function printStatus(status: StatusResponse): void {
  console.log(`Weekly budget:   ${formatUsd(status.weekly_budget_usd)}`);
  console.log(`Spent this week: ${formatUsd(status.spent_this_week_usd)}`);
  console.log(`Remaining:       ${formatUsd(status.remaining_budget_usd)}`);
  console.log("");

  if (status.recent_charges.length === 0) {
    console.log("Recent charges: none");
    return;
  }

  console.log("Recent charges:");
  for (const charge of status.recent_charges) {
    console.log(formatCharge(charge));
  }
}
