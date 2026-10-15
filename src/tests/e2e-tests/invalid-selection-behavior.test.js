import { test, expect } from "@playwright/test";

test.describe("Text Selection & Click Interaction Behavior", () => {
  test("should not offer annotation when clicking on white space", async ({
    page,
  }) => {
    await page.goto("/");
    const headerElement = page.locator(".resumeHeader");
    const box = await headerElement.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator(".annotation-offerer")).toBeHidden();
  });

  test("should not offer annotation when dragging on white space", async ({
    page,
  }) => {
    await page.goto("/");
    const expBullet = page.locator('[data-text-id="exp-0-bullet-0"]');

    const box = await expBullet.boundingBox();
    const paddingRight = await expBullet.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).paddingRight) || 0;
    });
    const startX = box.x + box.width - (paddingRight / 2 || 5);
    const startY = box.y + box.height / 2;
    const endX = startX + 30;
    const endY = startY;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 5 });
    await page.mouse.up();

    await expect(page.locator(".annotation-offerer")).toBeHidden();
  });

  test("should not offer annotation when dbclicking with out selection on white space", async ({
    page,
  }) => {
    await page.goto("/");
    const expBullet = page.locator('[data-text-id="exp-0-bullet-0"]');

    const box = await expBullet.boundingBox();
    await page.mouse.dblclick(box.x + box.width - 10, box.y + box.height - 5);

    const selection = await page.evaluate(() => {
      const selection = window.getSelection();
      return {
        isCollapsed: selection.isCollapsed,
        text: selection.toString().trim(),
      };
    });

    if (selection.isCollapsed === true || !selection.text) {
      await expect(page.locator(".annotation-offerer")).toBeHidden();
    }
  });
});
