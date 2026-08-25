# bon-bonite

E2E automation framework for Bon-Bonite (Cucumber + Playwright + TypeScript).

## Requirements

- Node.js 24+
- Browsers installed: `npx playwright install`

## Setup

Create a `.env` file in the project root (never commit real values):

```env
# Store under test
BB_BASE_URL=<store-url>

# Password used for every test registration
BB_TEST_PASSWORD=<test-password>

# Email that already has an account (used by the duplicate-email scenario)
BB_EXISTING_EMAIL=<existing-email>

# ID number that already has an account (used by the duplicate-ID scenario)
BB_EXISTING_ID_NUMBER=<existing-id-number>
```

## Commands

```bash
npm test         # build + run the full suite
npm run report   # generate and open the HTML report
npm run build    # compile only
```

## Run a single scenario or feature

```bash
npm test -- --name "Email address already registered"   # one scenario by exact name
npm test -- features/registration-validation.feature    # a whole feature file
```

## Browser

Select the engine with `BB_BROWSER` (`chromium` | `firefox` | `webkit`, default `chromium`):

```bash
BB_BROWSER=firefox npm test
```

## Profiles

```bash
npx cucumber-js                       # default: sequential, current browser
npx cucumber-js --profile parallel    # 3 workers
```

### Sequential vs parallel

Against production, run **sequentially** — which is exactly what `npm test` does (it uses the `default` profile, no `--parallel` flag). Do not add `--parallel` or use the `parallel` profile against production: multiple workers fire requests simultaneously and the site's WAF answers with 403s mid-run.

Use `--profile parallel` only against staging or when you specifically need to validate concurrency.

## Evidence

- Failed steps attach a full-page screenshot to `test-results/cucumber.json` (rendered by the HTML report).
- `BB_TRACE=on npm test` records a Playwright trace per scenario (`test-results/traces/`), viewable with `npx playwright show-trace <file>`.
