const OPEN_STATE = 'OPEN';
const HALF_OPEN_STATE = 'HALF_OPEN';
const CLOSED_STATE = 'CLOSED';

const BASE_COOLDOWN_MS = 30_000;
const MAX_COOLDOWN_MS = 120_000;

let state: string = CLOSED_STATE;
let lastFailureAt = 0;
let consecutiveFailures = 0;
let cooldownMs = BASE_COOLDOWN_MS;

export function report403(): void {
  consecutiveFailures++;
  lastFailureAt = Date.now();
  cooldownMs = Math.min(BASE_COOLDOWN_MS * Math.pow(2, consecutiveFailures - 1), MAX_COOLDOWN_MS);
  state = OPEN_STATE;
  console.log(
    `[circuit-breaker] OPEN — cooldown ${cooldownMs / 1000}s (failures: ${consecutiveFailures})`,
  );
}

export function reportSuccess(): void {
  if (state === HALF_OPEN_STATE) {
    state = CLOSED_STATE;
    consecutiveFailures = 0;
    cooldownMs = BASE_COOLDOWN_MS;
    console.log('[circuit-breaker] CLOSED — connection recovered');
  }
}

export async function waitForCooldown(): Promise<void> {
  if (state === CLOSED_STATE) return;

  const elapsed = Date.now() - lastFailureAt;
  if (elapsed >= cooldownMs) {
    state = HALF_OPEN_STATE;
    console.log('[circuit-breaker] HALF-OPEN — allowing probe request');
    return;
  }

  const remaining = cooldownMs - elapsed;
  console.log(`[circuit-breaker] waiting ${Math.ceil(remaining / 1000)}s before retry...`);
  await new Promise((r) => setTimeout(r, remaining));
  state = HALF_OPEN_STATE;
  console.log('[circuit-breaker] HALF-OPEN — allowing probe request');
}

export function getState(): string {
  return state;
}
