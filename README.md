# Bon-Bonite — E2E Test Suite

Automated end-to-end tests for [www.bon-bonite.com](https://www.bon-bonite.com) using **Cucumber + Playwright + TypeScript**. Runs directly with `tsx` — no build step required.

## Requirements

- Node.js 24+
- Chromium (installed automatically by Playwright, or manually with `npx playwright install`)

## Quick Start

```bash
npm install
cp .env.example .env   # fill in real values
npm test
```

## Environment Variables

Create a `.env` file in the project root. **Never commit real values.**

| Variable | Required | Description |
|----------|----------|-------------|
| `BB_TEST_PASSWORD` | Yes | Password for the test account |
| `BB_EXISTING_EMAIL` | Yes | Email of existing test account |
| `BB_EXISTING_ID_NUMBER` | Yes | ID number for the test account |
| `BB_NEW_PASSWORD` | No | Password for password-change test |
| `BB_HACKED_EMAIL` | No | Email for uneditable-field test |
| `BB_BILLING_FIRST_NAME` | No | Billing first name (edit-address tests) |
| `BB_BILLING_LAST_NAME` | No | Billing last name |
| `BB_BILLING_PHONE` | No | Billing phone |
| `BB_BILLING_ADDRESS_1` | No | Billing address |
| `BB_BILLING_CITY` | No | Billing city |
| `BB_SHIPPING_FIRST_NAME` | No | Shipping first name |
| `BB_SHIPPING_LAST_NAME` | No | Shipping last name |
| `BB_SHIPPING_ADDRESS_1` | No | Shipping address |
| `BB_SHIPPING_CITY` | No | Shipping city |
| `BB_BASE_URL` | No | Target URL (default: `https://www.bon-bonite.com`) |
| `BB_BROWSER` | No | `chromium` / `firefox` / `webkit` (default: `chromium`) |
| `BB_HEADLESS` | No | `true` / `false` (default: `true`, forced in CI) |
| `BB_TRACE` | No | `on` to record Playwright traces |

## Commands

```bash
npm test                # full suite — 2 workers, retry disabled
npm run test:debug      # chromium, see real failures
npm run test:single     # 1 worker, no retry
npm run report          # generate + open HTML report
npm run typecheck       # type-check without running tests
```

## Run a Single Feature or Scenario

Always use `--` before passing arguments to cucumber:

```bash
npm run test:feature -- features/checkout.feature                      # one feature
npm run test:feature -- --name "Place order completes the purchase"    # one scenario
npm run test:feature -- features/cart.feature --name "Add"             # feature + name
```

> Without `--`, npm ignores the flags.

## Tags

```bash
npm test -- --tags "@smoke"       # happy-path scenarios
npm test -- --tags "@regression"  # all scenarios
```

## Test Coverage

### Login — `features/login.feature` (4 scenarios)

| Scenario | Tag |
|----------|-----|
| Successful login with valid credentials | @smoke |
| Failed login with invalid password | @regression |
| Logout after login | @regression |
| Login form displays required fields | @regression |

### Registration — `features/registration.feature` + `features/registration-validation.feature` (6 scenarios)

| Scenario | Tag |
|----------|-----|
| Successful registration with valid data | @smoke |
| Form shows validation errors for empty fields | @regression |
| Form shows error for invalid email | @regression |
| Form shows error for short password | @regression |
| Form shows error for mismatched passwords | @regression |
| Form shows error for existing email | @regression |

### Edit Profile — `features/edit-profile.feature` (9 scenarios)

| Scenario | Tag |
|----------|-----|
| Profile form has pre-filled values | @regression |
| Edit first name | @regression |
| Edit last name | @regression |
| Edit email | @regression |
| Edit phone | @regression |
| Password change with valid passwords | @regression |
| Password change fails with wrong current password | @regression |
| Address tab is visible | @regression |
| Profile fields are not editable when hacked email | @regression |

### Edit Address — `features/edit-address.feature` (13 scenarios)

| Scenario | Tag |
|----------|-----|
| Address form has pre-filled values | @regression |
| Edit billing first name | @regression |
| Edit billing last name | @regression |
| Edit billing phone | @regression |
| Edit billing address | @regression |
| Edit billing city | @regression |
| Edit shipping first name | @regression |
| Edit shipping last name | @regression |
| Edit shipping address | @regression |
| Edit shipping city | @regression |
| Save billing changes | @regression |
| Save shipping changes | @regression |
| Address form shows required fields | @regression |

### Product Page — `features/product-page.feature` (8 scenarios)

| Scenario | Tag |
|----------|-----|
| Product page loads with title and price | @smoke |
| Product has variation selector | @regression |
| Product has add-to-cart button | @regression |
| Select a variation | @regression |
| Add product to cart shows confirmation | @regression |
| Add to cart updates cart count | @regression |
| Product has image gallery | @regression |
| Product has description section | @regression |

### Cart — `features/cart.feature` (5 scenarios)

| Scenario | Tag |
|----------|-----|
| Cart displays the added product | @smoke |
| Cart shows product quantity | @regression |
| Cart shows product subtotal | @regression |
| Cart shows totals section | @regression |
| Remove product from cart empties it | @regression |

### Checkout — `features/checkout.feature` (4 scenarios)

| Scenario | Tag |
|----------|-----|
| Cart summary shows product and totals | @smoke |
| Billing form has all required fields | @regression |
| Billing form fields can be filled | @regression |
| Place order completes the purchase | @regression |

**Total: 49 scenarios**

## Project Structure

```
bon-bonite/
├── features/                    # Gherkin feature files
│   ├── login.feature
│   ├── registration.feature
│   ├── registration-validation.feature
│   ├── edit-profile.feature
│   ├── edit-address.feature
│   ├── product-page.feature
│   ├── cart.feature
│   └── checkout.feature
├── src/
│   ├── pages/                   # Page Objects (locators + actions)
│   │   ├── cart.page.ts
│   │   ├── checkout.page.ts
│   │   ├── edit-account.page.ts
│   │   ├── login.page.ts
│   │   ├── product.page.ts
│   │   └── register.page.ts
│   ├── steps/                   # Cucumber step definitions
│   │   ├── cart.steps.ts
│   │   ├── checkout.steps.ts
│   │   ├── edit-address.steps.ts
│   │   ├── edit-profile.steps.ts
│   │   ├── login.steps.ts
│   │   ├── product-page.steps.ts
│   │   ├── registration-validation.steps.ts
│   │   ├── registration.steps.ts
│   │   └── shared-cart.steps.ts
│   └── support/                 # Infrastructure
│       ├── browser.ts           # Playwright + stealth plugin launcher
│       ├── circuit-breaker.ts   # 403 detection + cooldown
│       ├── config.ts            # Env var validation + timeouts
│       ├── hooks.ts             # Before/After hooks + anti-detection
│       ├── humanize.ts          # Random delays + human typing
│       ├── rate-limiter.ts      # Action/navigation throttling
│       ├── session.ts           # Cookie persistence per worker
│       ├── user-agent.ts        # User-agent rotation
│       └── world.ts             # Cucumber World type
├── cucumber.cjs                 # Cucumber profiles
├── scripts/
│   └── generate-report.mjs      # HTML report generator
└── package.json
```

## Architecture

### Browser Lifecycle

One browser instance is launched in `BeforeAll` and shared across all scenarios. Each scenario gets its own `BrowserContext` + `Page` (created in `Before`, destroyed in `After`). This keeps startup fast while isolating state between tests.

### Anti-Detection

The site's WAF blocks automated browsers with 403 errors. The framework applies multiple layers:

| Layer | What it does |
|-------|-------------|
| **Stealth plugin** | `playwright-extra` + `puppeteer-extra-plugin-stealth` hides automation fingerprints |
| **Init scripts** | Overrides `navigator.webdriver`, plugins, locale, hardware specs |
| **User-agent rotation** | 10 realistic Chrome/Firefox agents selected randomly per scenario |
| **Rate limiter** | Throttles actions (1-3s) and navigations (3-6s) |
| **Circuit breaker** | Detects 403 cascades, pauses 10-30s, recovers on success |
| **Human delays** | Randomized typing (70-150ms/char) and click intervals |
| **Cookie consent** | Auto-accepts cookie banner on every scenario |
| **Request filtering** | Only navigation 403s trigger the circuit breaker (not asset requests) |

### Circuit Breaker States

```
CLOSED → (403) → OPEN → (cooldown 10-30s) → HALF-OPEN → (success) → CLOSED
                                                    ↓ (403)
                                                  OPEN (backoff doubles)
```

### Session Persistence

Cookies are saved per-worker to `test-results/session-cookies-{workerId}.json` so logged-in state persists between scenarios within the same worker.

### Checkout Flow

The checkout feature tests the real multi-step purchase flow:

1. **Cart summary** — verifies product name, quantity, subtotal, total
2. **Login** — tries `BB_TEST_PASSWORD`, falls back to `BB_NEW_PASSWORD`
3. **Billing form** — verifies all required fields exist and can be filled
4. **Place order** — clicks terms checkbox, submits, verifies order confirmation (order number, total, payment method = Wompi)

Login fields are filled via `page.evaluate()` because the checkout stepper CSS hides them from Playwright's visibility check.

## Evidence

- **Failed steps** attach a full-page screenshot to `test-results/cucumber.json` (rendered by HTML report)
- **Traces**: `BB_TRACE=on npm test` records a Playwright trace per scenario in `test-results/traces/`
  - View with: `npx playwright show-trace test-results/traces/trace-<timestamp>.zip`

## HTML Report

```bash
npm run report
```

Opens `test-results/html/index.html` in the browser with pass/fail breakdown, duration, and screenshots for failed steps.

## Profiles

| Profile | Workers | Retry | Use case |
|---------|---------|-------|----------|
| `default` | 2 | 0 | Production runs |
| `no-retry` | 2 | 0 | Debug real failures |
| `single` | 1 | 0 | Isolate one scenario |

## Troubleshooting

### 403 errors / blocked by WAF

The circuit breaker will auto-pause. If it keeps failing:
- Increase cooldown in `src/support/circuit-breaker.ts`
- Check if the IP is temporarily banned
- Try a different browser: `BB_BROWSER=firefox npm test`

### Tests are slow

Each scenario navigates to a real production site with anti-detection delays. Expect ~45-60s per scenario. To run faster:
- Use `npm run test:feature -- --name "..."` for a single scenario
- Reduce delays in `src/support/rate-limiter.ts` and `src/support/humanize.ts` (risk: WAF blocks)

### Missing environment variables

The framework validates required vars at startup and exits with an error listing what's missing.

### Checkout login fails

The `#username` input is CSS-hidden by the checkout stepper. The framework uses `page.evaluate()` to bypass this — if the site changes its DOM structure, update `loginInCheckout()` in `src/pages/checkout.page.ts`.
