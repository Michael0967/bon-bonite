export function humanDelay(minMs = 2_000, maxMs = 6_000): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function humanType(locator: import('@playwright/test').Locator, text: string): Promise<void> {
  await locator.click();
  await humanDelay(1_500, 3_000);
  await locator.pressSequentially(text, { delay: Math.floor(Math.random() * 80) + 60 });
}

export async function humanClick(locator: import('@playwright/test').Locator): Promise<void> {
  await humanDelay(2_000, 5_000);
  await locator.click();
  await humanDelay(1_500, 3_000);
}
