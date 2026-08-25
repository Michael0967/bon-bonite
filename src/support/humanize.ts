export function humanDelay(minMs = 300, maxMs = 1200): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function humanType(locator: import('@playwright/test').Locator, text: string): Promise<void> {
  await locator.click();
  await humanDelay(200, 500);
  for (const char of text) {
    await locator.type(char, { delay: Math.floor(Math.random() * 80) + 40 });
  }
}

export async function humanClick(locator: import('@playwright/test').Locator): Promise<void> {
  await humanDelay(300, 800);
  await locator.click();
  await humanDelay(200, 600);
}
