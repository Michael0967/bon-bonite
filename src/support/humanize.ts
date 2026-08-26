export function humanDelay(minMs = 3_000, maxMs = 8_000): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function humanType(locator: import('@playwright/test').Locator, text: string): Promise<void> {
  await locator.click();
  await humanDelay(2_000, 4_000);
  await locator.pressSequentially(text, { delay: Math.floor(Math.random() * 80) + 70 });
}

export async function humanClick(locator: import('@playwright/test').Locator): Promise<void> {
  await humanDelay(3_000, 6_000);
  await locator.click();
  await humanDelay(2_000, 4_000);
}
