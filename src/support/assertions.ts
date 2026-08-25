import { expect as playwrightExpect } from '@playwright/test';
import { config } from './config';

export const expect = playwrightExpect.configure({ timeout: config.expectTimeout });
