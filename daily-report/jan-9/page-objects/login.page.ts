import { expect, type Page } from "@playwright/test";

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto("/sign-in");
  }

  async login(email: string, pass: string) {
    await this.page.getByPlaceholder("you@example.com").fill(email);
    await this.page.getByPlaceholder("Your password").fill(pass);
    await this.page.getByRole("button", { name: "Sign In" }).click();
  }

  async verifyErrorIsVisible() {
    await expect(this.page.getByText(/Invalid/i)).toBeVisible();
  }
}
