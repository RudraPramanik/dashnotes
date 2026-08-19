import { expect, test } from "@playwright/test";

test("register with a unique email lands on notes", async ({ page }) => {
  const email = `e2e.${Date.now()}@example.com`;
  const password = "testpass1";

  await page.goto("/auth/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByLabel("Workspace name").fill("E2E Workspace");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/notes/, { timeout: 15_000 });
  await expect(page.getByRole("main")).toContainText(
    /Notes|Start your workspace/,
  );
});

test("home redirects unauthenticated users to login", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(page.getByRole("heading", { name: "DashNotes" })).toBeVisible();
});
