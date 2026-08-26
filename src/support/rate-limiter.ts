const MIN_DELAY_MS = 4_000;
const MAX_DELAY_MS = 10_000;
const MIN_PAGE_DELAY_MS = 8_000;
const MAX_PAGE_DELAY_MS = 20_000;

let lastRequestAt = 0;

async function enforceDelay(minMs: number, maxMs: number): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestAt;
  const requiredDelay = Math.floor(Math.random() * (maxMs - minMs)) + minMs;

  if (elapsed < requiredDelay) {
    const wait = requiredDelay - elapsed;
    await new Promise((r) => setTimeout(r, wait));
  }

  lastRequestAt = Date.now();
}

export async function throttleAction(): Promise<void> {
  await enforceDelay(MIN_DELAY_MS, MAX_DELAY_MS);
}

export async function throttleNavigation(): Promise<void> {
  await enforceDelay(MIN_PAGE_DELAY_MS, MAX_PAGE_DELAY_MS);
}
