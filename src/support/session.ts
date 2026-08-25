import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { BrowserContext } from '@playwright/test';

const COOKIE_PATH = join('test-results', 'session-cookies.json');

export async function saveSessionCookies(context: BrowserContext): Promise<void> {
  const cookies = await context.cookies();
  const boniteCookies = cookies.filter((c) => c.domain.includes('bon-bonite'));
  if (boniteCookies.length === 0) return;
  mkdirSync(dirname(COOKIE_PATH), { recursive: true });
  writeFileSync(COOKIE_PATH, JSON.stringify(boniteCookies, null, 2));
}

export async function loadSessionCookies(context: BrowserContext): Promise<boolean> {
  try {
    const raw = readFileSync(COOKIE_PATH, 'utf-8');
    const cookies = JSON.parse(raw);
    if (!Array.isArray(cookies) || cookies.length === 0) return false;
    await context.addCookies(cookies);
    return true;
  } catch {
    return false;
  }
}
