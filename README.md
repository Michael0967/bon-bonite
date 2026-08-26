# bon-bonite

E2E automation framework for Bon-Bonite (Cucumber + Playwright + TypeScript).

Runs TypeScript directly with `tsx` — no build step needed.

## Requirements

- Node.js 24+
- Browsers installed: `npx playwright install`

## Setup

```bash
npm install
```

Create a `.env` file in the project root (never commit real values):

```env
BB_BASE_URL=https://www.bon-bonite.com
BB_TEST_PASSWORD=<test-password>
BB_NEW_PASSWORD=<new-password-for-password-change-test>
BB_EXISTING_EMAIL=<existing-email>
BB_EXISTING_ID_NUMBER=<existing-id-number>
BB_HACKED_EMAIL=<email-to-test-uneditable-field>

# Billing (used by edit-address tests)
BB_BILLING_FIRST_NAME=<first-name>
BB_BILLING_LAST_NAME=<last-name>
BB_BILLING_PHONE=<phone>
BB_BILLING_ADDRESS_1=<address>
BB_BILLING_CITY=<city>

# Shipping (used by edit-address tests)
BB_SHIPPING_FIRST_NAME=<first-name>
BB_SHIPPING_LAST_NAME=<last-name>
BB_SHIPPING_ADDRESS_1=<address>
BB_SHIPPING_CITY=<city>
```

## Commands

```bash
npm test              # run the full suite
npm run test:debug    # chromium, no retry — see real failures
npm run test:single   # 1 worker, no retry — isolate bugs
npm run report        # generate and open the HTML report
npm run typecheck     # check types without running
```

## Run a single feature or scenario

```bash
npm run test:feature -- features/cart.feature                         # one feature
npm run test:feature -- --name "Cart displays the added product"      # one scenario
npm run test:feature -- features/login.feature --name "Successful"    # feature + name
```

## Tags

```bash
npm test -- --tags "@smoke"       # happy-path scenarios only
npm test -- --tags "@regression"  # everything except registration success
```

## Browser

Select the engine with `BB_BROWSER` (`chromium` | `firefox` | `webkit`, default `chromium`):

```bash
BB_BROWSER=firefox npm test
```

## Profiles

| Profile | Workers | Retry | Use case |
|---------|---------|-------|----------|
| `default` | 2 | 2 | Production runs |
| `no-retry` | 2 | 0 | Debug — see real failures |
| `single` | 1 | 0 | Isolate one scenario |

## Features

```
features/
├── login.feature                    # 4 scenarios
├── registration.feature             # 1 scenario
├── registration-validation.feature  # 5 scenarios (Scenario Outline + 4)
├── edit-profile.feature             # 10 scenarios
├── edit-address.feature             # 11 scenarios
├── product-page.feature             # 8 scenarios
├── cart.feature                     # 6 scenarios
└── checkout.feature                 # 5 scenarios
```

## Architecture

```
src/
├── pages/              # Page Objects (Playwright locators + actions)
├── steps/              # Cucumber step definitions
└── support/            # Hooks, config, helpers, anti-detection
```

### Browser lifecycle

The browser is launched once via `BeforeAll` and reused across all scenarios. Each scenario gets its own `BrowserContext` + `Page` (created in `Before`, destroyed in `After`). This keeps startup fast (milliseconds per scenario) while isolating state between tests.

### Anti-detection

The site's WAF blocks automated browsers with 403 errors. The framework includes:

- **Stealth plugin** — `playwright-extra` + `puppeteer-extra-plugin-stealth`
- **User-agent rotation** — 10 realistic Chrome/Firefox agents
- **Rate limiter** — throttles actions (4-10s) and navigations (8-20s)
- **Circuit breaker** — detects 403 cascades, reports failures
- **Human delays** — randomized typing (70-150ms/char) and click delays
- **Anti-detection scripts** — injected via `Before` hook (`navigator.webdriver`, plugins, locale)
- **Resilient navigation** — all `page.goto` wrapped in try/catch with 15s timeout

### Session persistence

Cookies are saved per-worker to `test-results/session-cookies-{workerId}.json` so logged-in state persists between scenarios within the same worker.

## Evidence

- Failed steps attach a full-page screenshot to `test-results/cucumber.json` (rendered by the HTML report).
- `BB_TRACE=on npm test` records a Playwright trace per scenario (`test-results/traces/`), viewable with `npx playwright show-trace <file>`.
