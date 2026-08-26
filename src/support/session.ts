import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { BrowserContext } from '@playwright/test';

function cookiePath(): string {
  const workerId = process.env.CUCUMBER_WORKER_ID ?? 'default';
  return join('test-results', `session-cookies-${workerId}.json`);
}

export async function saveSessionCookies(context: BrowserContext): Promise<void> {
  const path = cookiePath();
  const cookies = await context.cookies();
  const boniteCookies = cookies.filter((c) => c.domain.includes('bon-bonite'));
  if (boniteCookies.length === 0) return;
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(boniteCookies, null, 2));
}

export async function loadSessionCookies(context: BrowserContext): Promise<boolean> {
  try {
    const raw = readFileSync(cookiePath(), 'utf-8');
    const cookies = JSON.parse(raw);
    if (!Array.isArray(cookies) || cookies.length === 0) return false;
    await context.addCookies(cookies);
    return true;
  } catch {
    return false;
  }
}
