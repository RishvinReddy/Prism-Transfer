import { test, expect } from "@playwright/test";

test.describe("Send Transfer Flow", () => {
  test("should load the send page and display UI elements", async ({ page }) => {
    await page.goto("/send");
    
    // Check main heading
    await expect(page.locator("h1")).toContainText("Send File");
    
    // Check file input exists
    const fileInput = page.locator('input[type="file"]');
    await expect(fileInput).toBeAttached();
  });
});
