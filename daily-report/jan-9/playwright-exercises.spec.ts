import { test as base, expect } from "@playwright/test";

import { LoginPage } from "./page-objects/login.page";

/**
 * Setup: Custom Fixtures
 * Extend basic test to inject Page Objects automatically.
 */
type MyFixtures = {
  loginPage: LoginPage;
};

const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    // Inject LoginPage to tests
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});

/**
 * Locators & Navigation
 * Prefer user-centric locators: role > text > label > placeholder.
 */

test("Basic Locators & Navigation", async ({ page }) => {
  await page.goto("/sign-in");

  // Check main content visibility
  const signInButton = page.getByRole("button", { name: /Sign in/i });
  await expect(signInButton).toBeVisible();

  // Find by placeholder
  const emailInput = page.getByPlaceholder("you@example.com");
  await expect(emailInput).toBeVisible();

  // Find by text
  await expect(page.getByText(/Or continue with/i)).toBeVisible();
});

test("Login form interactions (Actions)", async ({ page }) => {
  await page.goto("/sign-in");

  // Fill credentials
  await page.getByPlaceholder("you@example.com").fill("test@example.com");
  await page.getByPlaceholder("Your password").fill("wrongpassword123");

  await page.getByRole("button", { name: "Sign In" }).click();

  // Check for error
  await expect(page.getByText(/Invalid/i)).toBeVisible();
});

test("Assertions & Debugging", async ({ page }) => {
  await page.goto("/sign-in");

  const emailInput = page.getByPlaceholder("you@example.com");

  // Value assertions
  await emailInput.fill("hoc-playwright@gmail.com");
  await expect(emailInput).toHaveValue("hoc-playwright@gmail.com");

  // Negative assertions
  await expect(page.getByText(/Invalid/i)).not.toBeVisible();

  // Status assertions
  const signInButton = page.getByRole("button", { name: "Sign In" });
  await expect(signInButton).toBeEnabled();
});

test("Advanced Selection (Filtering and Hierarchy)", async ({ page }) => {
  await page.goto("/sign-in");

  // Chained locators
  const loginCard = page.locator("div.w-full.max-w-sm");
  const googleBtnInCard = loginCard.getByRole("button", { name: /Google/i });
  await expect(googleBtnInCard).toBeVisible();

  // Filtering
  const signInBtn = page.getByRole("button").filter({ hasText: /^Sign In$/i });
  await expect(signInBtn).toBeVisible();

  // Positional locators
  const allButtons = page.getByRole("button");
  await expect(allButtons.first()).toBeVisible();
  await expect(allButtons.last()).toBeVisible();
});

test("Page Object Model (POM) Basics", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login("pom-user@test.com", "wrong-pass");
  await loginPage.verifyErrorIsVisible();
});

test("Network Interception (Mocking API)", async ({ page }) => {
  // Intercept API call
  await page.route("**/api/auth/callback*", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Mocked Unauthorized Error" }),
    });
  });

  await page.goto("/sign-in");
  await page.getByPlaceholder("you@example.com").fill("test@mock.com");
  await page.getByPlaceholder("Your password").fill("any-password");
  await page.getByRole("button", { name: "Sign In" }).click();

  // Verify UI handles mocked error
  await expect(page.getByText(/Invalid|Mocked/i)).toBeVisible();
});

test("Custom Fixtures (Dependency Injection)", async ({
  loginPage,
}) => {
  // loginPage is automatically injected via fixtures
  await loginPage.goto();
  await loginPage.login("fixture-user@test.com", "password123");
  await loginPage.verifyErrorIsVisible();
});

test("Visual Regression Testing (Snapshot)", async ({ page }) => {
  await page.goto("/sign-in");

  // Compare screenshot with baseline
  await expect(page).toHaveScreenshot("login-page.png", {
    mask: [page.locator("input")],
    maxDiffPixelRatio: 0.1,
  });
});

test("Authentication & Storage State (Shared Session)", async ({
  browser,
}) => {
  // Login and save state
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/sign-in");
  // ... login logic ...
  await context.storageState({ path: "auth.json" });

  // Reuse state in new context
  const adminContext = await browser.newContext({ storageState: "auth.json" });
  const _adminPage = await adminContext.newPage();
});

test("Playwright Trace Viewer", async ({ page }) => {
  // Use --trace on to record
  await page.goto("/");
});

test("API Testing (Combining UI and API)", async ({
  request,
  page,
}) => {
  // Create data via API
  await request.post("/api/auth/register", {
    data: {
      email: `user-${Date.now()}@test.com`,
      password: "password123",
    },
  });

  // Login via UI
  await page.goto("/sign-in");
});

const loginData = [
  { user: "user_1@test.com", pass: "123456", desc: "Ordinary user" },
  { user: "admin@test.com", pass: "admin123", desc: "Admin User" },
  { user: "guest@test.com", pass: "guest", desc: "Guest user" },
];

for (const data of loginData) {
  test(`Parameterized Test - ${data.desc}`, async ({ page }) => {
    // Loop through user types
    await page.goto("/sign-in");
    await page.getByPlaceholder("you@example.com").fill(data.user);
    await page.getByPlaceholder("Your password").fill(data.pass);
    await page.getByRole("button", { name: "Sign In" }).click();

    await expect(page.getByText(/Invalid/i)).toBeVisible();
  });
}

test("Handling Multiple Tabs", async ({ context, page }) => {
  await page.goto("/sign-in");

  // Track new tab creation
  const _pagePromise = context.waitForEvent("page");
  // const _newPage = await _pagePromise;
});

test("ARIA & Accessibility", async ({ page }) => {
  await page.goto("/sign-in");

  // Find by accessible role
  const loginBtn = page.getByRole("button", { name: /Sign In/i });
  await expect(loginBtn).toBeVisible();
  await expect(loginBtn).toBeEnabled();
});

test("CI/CD & Configurations", async ({
  page,
}) => {
  // Configs like Retries, Workers, and Headless mode are set in playwright.config.ts
  await page.goto("/");
});

test("Global Setup & Teardown", async ({ page }) => {
  // Set up global environment before tests
  await page.goto("/");
});

test("Mocking Time", async ({ page }) => {
  // Speed up time for testing timeouts
  const fakeNow = new Date("2026-01-01T10:00:00Z");
  // @ts-expect-error
  await page.clock.install({ now: fakeNow });

  await page.goto("/");

  // @ts-expect-error
  await page.clock.fastForward("02:00:00");
});

test("HAR Recording & Replay", async ({
  page,
}) => {
  // Replay network traffic from HAR file
  await page.goto("/");
});

test("Test Sharding", async ({ page }) => {
  // Splitting tests across multiple machines
  await page.goto("/");
});

test("Advanced DOM (Iframe & Shadow DOM)", async ({ page }) => {
  await page.goto("/sign-in");

  // Iframes
  const _stripeIframe = page.frameLocator("iframe[name='stripe-card']");

  // Shadow DOM
  const _shadowInput = page.locator("custom-input >> input");
});
