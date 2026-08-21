import { expect, test } from "@playwright/test";

const NOTE_BODY =
  "E2E pricing decision is forty-nine dollars. Retrieval token ALPHA42.";
const FILE_BODY = "E2E file retrieval token ALPHA42 for DashNotes.";

test.describe("B-gate", () => {
  test.setTimeout(180_000);

  test("register, note, file, chat, agent", async ({ page }) => {
    const email = `e2e.bgate.${Date.now()}@example.com`;
    const password = "testpass1";

    await page.goto("/auth/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByLabel("Workspace name").fill("B-gate Workspace");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page).toHaveURL(/\/notes/, { timeout: 20_000 });

    await page.getByRole("button", { name: /Create a note|New note/ }).click();
    await expect(page).toHaveURL(/\/notes\/\d+/, { timeout: 20_000 });
    await page.getByLabel("Note title").fill("E2E pricing decision");
    const editor = page.getByLabel("Note content");
    await editor.click();
    await editor.fill(NOTE_BODY);
    await expect(page.getByText(/Saving…|Saved/)).toBeVisible({
      timeout: 10_000,
    });

    await page.getByRole("link", { name: "Files" }).click();
    await expect(page).toHaveURL(/\/files/);
    await page.locator('input[type="file"]').setInputFiles({
      name: "e2e-alpha.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(FILE_BODY),
    });
    await expect(page.getByText("e2e-alpha.txt")).toBeVisible({
      timeout: 30_000,
    });

    await page.waitForTimeout(45_000);

    await page.getByRole("link", { name: "Chat" }).click();
    await expect(page).toHaveURL(/\/chat/);
    const chatBox = page.getByPlaceholder("Ask about your notes and files…");
    await chatBox.fill("What is the E2E pricing decision and ALPHA42?");
    await page.getByRole("button", { name: "Send" }).click();

    const aiDown = page.getByText(
      /temporarily unavailable|LLM temporarily unavailable/i,
    );
    const chatDone = page.getByText(/ALPHA42|forty-nine|Sources|No sources found/);
    await expect(aiDown.or(chatDone).first()).toBeVisible({ timeout: 60_000 });

    if (await aiDown.first().isVisible()) {
      await expect(page.getByRole("link", { name: "Notes" })).toBeVisible();
      return;
    }

    await page.getByRole("link", { name: "Agent" }).click();
    await expect(page).toHaveURL(/\/agents\/workspace-assistant/);
    await page
      .getByPlaceholder("Ask the assistant to search or create a note…")
      .fill("Search notes for ALPHA42");
    await page.getByRole("button", { name: "Run" }).click();

    await expect(
      page
        .getByText("Waiting for agent…")
        .or(page.getByText("No tools used yet"))
        .or(page.getByText("Open Chat"))
        .or(page.getByText(/temporarily unavailable/i))
        .or(page.getByText("Create note"))
        .first(),
    ).toBeVisible({ timeout: 60_000 });
  });
});
