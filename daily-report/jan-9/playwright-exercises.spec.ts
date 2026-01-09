import { test as base, expect } from "@playwright/test";

import { LoginPage } from "./page-objects/login.page";

/**
 * [PRO TIP] Lesson 7 Setup: Custom Fixtures
 * We extend the basic test object to "inject" 
 * Page Objects into every test case automatically.
 */
type MyFixtures = {
  loginPage: LoginPage;
};

const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    // Initialize LoginPage once here
    const loginPage = new LoginPage(page);
    // "use" will provide this object to the test cases
    await use(loginPage);
  },
});

/**
 * Lesson 1: Locators & Basic Navigation
 *
 * Playwright encourages using locators that simulate how users find elements:
 * 1. getByRole: Find by role (button, heading, link, etc.) - THIS IS THE BEST WAY.
 * 2. getByText: Find by displayed text content.
 * 3. getByLabel: Find by input label.
 * 4. getByPlaceholder: Find by input placeholder.
 */

test("Lesson 1: Basic Locators & Navigation", async ({ page }) => {
  // 1. Navigate to the Sign-in page (as the homepage requires login and will redirect here)
  await page.goto("/sign-in");

  // 2. Check the Title or main content
  // We will search for the "Sign in" button or related content
  const signInButton = page.getByRole("button", { name: /Sign in/i });
  await expect(signInButton).toBeVisible();

  // 3. Use getByPlaceholder to find the Email input
  // The actual placeholder in auth.json is "you@example.com"
  const emailInput = page.getByPlaceholder("you@example.com");
  await expect(emailInput).toBeVisible();

  // 4. Check the displayed text (Using text from auth.json)
  await expect(page.getByText(/Or continue with/i)).toBeVisible();
});

test("Lesson 2: Interacting with the login form (Actions)", async ({ page }) => {
  // 1. Go to the login page
  await page.goto("/sign-in");

  // 2. Fill in the form info (Using fill)
  await page.getByPlaceholder("you@example.com").fill("test@example.com");
  await page.getByPlaceholder("Your password").fill("wrongpassword123");

  // 3. Click the Sign In button
  await page.getByRole("button", { name: "Sign In" }).click();

  // 4. Check the error message (Assertion)
  await expect(page.getByText(/Invalid/i)).toBeVisible();
});

test("Lesson 3: Professional Assertions & Debugging", async ({ page }) => {
  await page.goto("/sign-in");

  const emailInput = page.getByPlaceholder("you@example.com");

  // 1. Check the input value (toHaveValue)
  await emailInput.fill("hoc-playwright@gmail.com");
  await expect(emailInput).toHaveValue("hoc-playwright@gmail.com");

  // 2. Use "not" to invert the assertion
  // Example: Ensure the error message is NOT displayed when the page first loads
  await expect(page.getByText(/Invalid/i)).not.toBeVisible();

  // 3. Debugging Tip: page.pause()
  // If you uncomment the line below, Playwright will open an Inspector window
  // and pause the test here for you to "play" around.
  // await page.pause();

  // 4. Check attributes
  const signInButton = page.getByRole("button", { name: "Sign In" });
  await expect(signInButton).toBeEnabled(); // Ensure the button is not disabled
});

test("Lesson 4: Advanced Selection (Filtering and Hierarchy)", async ({ page }) => {
  await page.goto("/sign-in");

  // 1. Locator Chaining: Search for a button inside a specific Card tag
  const loginCard = page.locator("div.w-full.max-w-sm");
  const googleBtnInCard = loginCard.getByRole("button", { name: /Google/i });
  await expect(googleBtnInCard).toBeVisible();

  // 2. Filter: Find an element containing specific text
  const signInBtn = page.getByRole("button").filter({ hasText: /^Sign In$/i });
  await expect(signInBtn).toBeVisible();

  // 3. Position: Select an element by order
  const allButtons = page.getByRole("button");
  await expect(allButtons.first()).toBeVisible();
  await expect(allButtons.last()).toBeVisible();

  // 4. TIP: UI Mode
  // This is where you would use the command `pnpm -F vite-web exec playwright test --ui`
});

test("Lesson 5: Page Object Model (POM) Basics", async ({ page }) => {
  // 1. Initialize the Page Object
  const loginPage = new LoginPage(page);

  // 2. Use Page Object methods (Extremely clean!)
  await loginPage.goto();
  await loginPage.login("pom-user@test.com", "wrong-pass");

  // 3. Use assertions encapsulated in the Page Object
  await loginPage.verifyErrorIsVisible();

  // As you can see, the test code now reads like a story,
  // no longer distracted by messy CSS selectors or locators.
});

test("Lesson 6: Network Interception (Mocking API)", async ({ page }) => {
  // 1. Mock an API request
  // Assume that when the Sign In button is clicked, the browser calls API /api/auth/callback
  // We will "intercept" it and return a mocked error result.
  await page.route("**/api/auth/callback*", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Mocked Unauthorized Error" }),
    });
  });

  // 2. Perform actions leading to that API call
  await page.goto("/sign-in");
  await page.getByPlaceholder("you@example.com").fill("test@mock.com");
  await page.getByPlaceholder("Your password").fill("any-password");
  await page.getByRole("button", { name: "Sign In" }).click();

  // 3. Check if the UI correctly displays the error message from the mocked API
  // Note: Depending on how the application handles it, the message could be "Invalid credentials"
  // or exactly "Mocked Unauthorized Error" if the application displays the message from the API.
  // Here we just need to know that an error appears.
  await expect(page.getByText(/Invalid|Mocked/i)).toBeVisible();

  /**
   * WHY IS THIS METHOD IMPORTANT?
   * - You don't need to create a real User in the Database.
   * - You can test rare cases (such as Server 500, Timeout).
   * - Tests run extremely fast because they don't spend time on real network calls.
   */
});

test("Lesson 7: Custom Fixtures (Dependency Injection)", async ({
  loginPage,
}) => {
  /**
   * 1. Observe the test function arguments: { loginPage } instead of { page }.
   * Playwright automatically understands and initializes loginPage for us thanks to the "extend" part at the beginning of the file.
   */
  await loginPage.goto();

  // 2. Perform actions (Code is extremely concise)
  await loginPage.login("fixture-user@test.com", "password123");

  // 3. Verify
  await loginPage.verifyErrorIsVisible();

  /**
   * BENEFITS OF FIXTURES:
   * - DRY (Don't Repeat Yourself): No need to copy-paste `new LoginPage(page)` everywhere.
   * - Encapsulation: Logic initialization is centralized in one place.
   * - Lazy Loading: Fixtures are only initialized if the test case requires it.
   */
});

test("Lesson 8: Visual Regression Testing (Snapshot)", async ({ page }) => {
  await page.goto("/sign-in");

  /**
   * 1. Capture a screenshot and compare it with a "golden image".
   * The first time it runs, Playwright will report an error because there is no golden image yet,
   * and it will automatically create a new one in the learning.spec.ts-snapshots directory.
   */
  await expect(page).toHaveScreenshot("login-page.png", {
    mask: [page.locator("input")], // Mask elements that change frequently (like a blinking cursor)
    maxDiffPixelRatio: 0.1, // Allow a small 10% discrepancy (e.g., due to font aliasing)
  });

  /**
   * IMPORTANT NOTE:
   * - Visual tests are very sensitive to the operating system (Mac vs Windows vs Linux).
   * - Usually, people run this in Docker to ensure all environments are identical.
   * - Command to update golden images: `npx playwright test --update-snapshots`
   */
});

test("Lesson 9: Authentication & Storage State (Shared Session)", async ({
  browser,
}) => {
  /**
   * SCENARIO: You have 100 test cases that require login.
   * Filling in the email/password every time would be very slow.
   * SOLUTION: Log in once, save the Cookie/Local Storage to a JSON file,
   * and then have other test cases "load" that file.
   */

  // 1. Create a new context and perform login (Simulated)
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/sign-in");
  // ... perform actual login here ...

  // 2. Save the login state to a file
  await context.storageState({ path: "auth.json" });

  // 3. Create another context using the saved state
  const adminContext = await browser.newContext({ storageState: "auth.json" });
  const _adminPage = await adminContext.newPage();

  // Now _adminPage has the Cookie/Token ready, no need to log in again!
  // await _adminPage.goto("/dashboard");

  /**
   * TIP: In practice, people configure `storageState` in the `playwright.config.ts`
   * file so that all tests are automatically logged in.
   */
});

test("Lesson 10: Playwright Trace Viewer (Flight Recorder)", async ({
  page,
}) => {
  /**
   * This is not code to run, but knowledge about the tool.
   * Playwright Trace Viewer allows you to review:
   * 1. Every action (Action) and where it clicked.
   * 2. The browser's console log.
   * 3. Which APIs the network called.
   * 4. The source code at the time of the error.
   */

  // To use it, run the command:
  // npx playwright test --trace on
  // After the test is complete, open the report:
  // npx playwright show-report

  await page.goto("/");
  console.log(
    "Try enabling UI Mode by adding `--ui` to the test run command!",
  );
});

test("Lesson 11: API Testing (Combining UI and API)", async ({
  request,
  page,
}) => {
  /**
   * Playwright doesn't just test the Web UI; it can also call APIs.
   * SCENARIO: Before testing the UI, you want to create a new user via the API to ensure a clean environment.
   */

  // 1. Call a POST API to create data (simulated)
  const _response = await request.post("/api/auth/register", {
    data: {
      email: `user-${Date.now()}@test.com`,
      password: "password123",
    },
  });

  // 2. Check if the API returns success (201 Created)
  // expect(_response.ok()).toBeTruthy();

  // 3. Then use the UI to log in with the newly created user
  await page.goto("/sign-in");
  // await page.fill('...', userEmail);

  /**
   * WHY USE A COMBINATION?
   * - Creating data via API is 10 times faster than via the UI.
   * - Helps make test cases independent, not relying on existing data in the DB.
   */
});

const loginData = [
  { user: "user_1@test.com", pass: "123456", desc: "Ordinary user" },
  { user: "admin@test.com", pass: "admin123", desc: "Admin User" },
  { user: "guest@test.com", pass: "guest", desc: "Guest user" },
];

for (const data of loginData) {
  test(`Lesson 12: Parameterized Test - ${data.desc}`, async ({ page }) => {
    /**
     * SCENARIO: You want to test the login functionality with different types of users.
     * Instead of writing three identical test cases, we use a loop.
     */
    await page.goto("/sign-in");
    await page.getByPlaceholder("you@example.com").fill(data.user);
    await page.getByPlaceholder("Your password").fill(data.pass);
    await page.getByRole("button", { name: "Sign In" }).click();

    // Check the UI response (e.g., displaying an error message for a wrong password)
    await expect(page.getByText(/Invalid/i)).toBeVisible();
  });
}

test("Lesson 13: Handling Multiple Tabs", async ({ context, page }) => {
  /**
   * SCENARIO: You click a link and it opens a new tab.
   * How do you control that new tab?
   */
  await page.goto("/sign-in");

  // 1. Wait for the event of a new page opening upon clicking
  const _pagePromise = context.waitForEvent("page");

  // Suppose there is a "Terms of Service" link that opens a new tab
  // await page.getByText('Terms of Service').click();

  // 2. Get the object of the new tab
  // const _newPage = await _pagePromise;

  // 3. Now you can interact with the new tab as usual
  // await expect(newPage).toHaveTitle(/Terms/);

  /**
   * NOTE: Playwright manages tabs by context.
   * You can switch between `page` and `newPage` extremely easily.
   */
});

test("Lesson 14: ARIA & Accessibility Testing", async ({ page }) => {
  /**
   * Playwright prioritizes locators that benefit accessibility (supporting visually impaired users).
   * Instead of finding by CSS class, search by "Role".
   */
  await page.goto("/sign-in");

  // Search for a button with the meaning "Sign In" instead of searching for a button with the class "btn-blue"
  const loginBtn = page.getByRole("button", { name: /Sign In/i });
  await expect(loginBtn).toBeVisible();

  // Check the ARIA status (e.g., is the button currently disabled?)
  await expect(loginBtn).toBeEnabled();

  /**
   * TIP: You can install the @axe-core/playwright library
   * to automatically scan the entire website and find accessibility issues.
   */
});

test("Lesson 15: CI/CD & Playwright Config (Mastering Configuration)", async ({
  page,
}) => {
  /**
   * In this final lesson, we don't code much but focus on systems thinking.
   * The `playwright.config.ts` file is the heart of the project.
   */

  await page.goto("/");

  // Parameters to remember when running CI (GitHub Actions):
  const configTips = [
    "Retries: Automatically rerun tests if they fail randomly (flaky).",
    "Workers: How many tests to run in parallel (depending on CPU).",
    "Headless: Run anonymously (no browser window) to save resources.",
    "Projects: Configure to run on Chrome, Firefox, and Mobile Safari simultaneously.",
  ];

  console.log("Final advice:");
  for (const tip of configTips) console.log(`- ${tip}`);

  /**
   * END OF PATH:
   * Congratulations on completing the 15 core lessons of Playwright!
   * Start applying them to your real projects today.
   */
});

test("Lesson 16: Global Setup & Teardown (General Configuration)", async ({
  page,
}) => {
  /**
   * SCENARIO: You want to reset the database or clear the cache before the ENTIRE test suite starts.
   */
  await page.goto("/");

  // Explanation of thought process:
  // 1. You create a `global-setup.ts` file.
  // 2. In `playwright.config.ts`, you add: `globalSetup: require.resolve('./global-setup')`.

  console.log(
    "Global setup helps you prepare a 'clean' environment for every test case.",
  );
});

test("Lesson 17: Mocking Time (Controlling Time)", async ({ page }) => {
  /**
   * SCENARIO: You want to test if the "Session expired" notification appears after 2 hours.
   * Instead of waiting for 2 real hours, we "speed up" the browser's time.
   */

  // 1. Install a fake clock for the page (suppose today is January 1, 2026)
  const fakeNow = new Date("2026-01-01T10:00:00Z");
  // @ts-expect-error - The new Clock API is supported in recent Playwright versions
  await page.clock.install({ now: fakeNow });

  await page.goto("/");

  // 2. Jump to 2 hours later
  // @ts-expect-error
  await page.clock.fastForward("02:00:00");

  // Check the UI to see if the expiration message appears
  // await expect(page.getByText('Session expired')).toBeVisible();
});

test("Lesson 18: HAR Recording & Replay (Traffic Recording and Playback)", async ({
  page,
}) => {
  /**
   * HAR (HTTP Archive) is a file containing all network requests/responses.
   * BENEFIT: You can run tests WITHOUT INTERNET, using only the recorded data.
   */

  // Usage in code:
  // await page.routeFromHAR('tests/e2e/api-mocks.har', {
  //   url: '**/api/**',
  //   update: false, // If true, it will overwrite with a new HAR file
  // });

  await page.goto("/");
  console.log(
    "HAR helps you test stably even when the backend server is undergoing maintenance.",
  );
});

test("Lesson 19: Test Sharding (Divide and Conquer)", async ({ page }) => {
  /**
   * This is a technique used to run 1000 test cases in 5 minutes.
   * You split 1000 tests across 4 machines running in parallel (Shards).
   */
  await page.goto("/");

  // Command to run on machine 1: npx playwright test --shard=1/4
  // Command to run on machine 2: npx playwright test --shard=2/4
  // ...

  console.log("Sharding is an essential skill when working on large projects (Enterprise).");
});

test("Lesson 20: Advanced DOM (Iframe & Shadow DOM)", async ({ page }) => {
  /**
   * Playwright is powerful because it can "see through" Iframes and Shadow DOM.
   */
  await page.goto("/sign-in");

  // 1. Interacting with Iframes (e.g., a Stripe payment frame)
  const _stripeIframe = page.frameLocator("iframe[name='stripe-card']");
  // await _stripeIframe.getByPlaceholder('Card number').fill('4242...');

  // 2. Interacting with Shadow DOM (modern Web Components)
  // Playwright automatically finds its way into the Shadow DOM without additional configuration!
  const _shadowInput = page.locator("custom-input >> input");
  // await _shadowInput.fill('Data located within the Shadow DOM');

  /**
   * CONGRATULATIONS! You have completed the 20 Playwright tutorials.
   * You are now ready to build world-class automated testing systems.
   */
});
