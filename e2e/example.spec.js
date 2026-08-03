// @ts-check

import { test, expect } from "@playwright/test";

test("show annotation offerer after selecting text", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    const element = document.querySelector("[data-text-id]");

    if (!element) {
      throw new Error("No element with data-text-id found.");
    }

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);

    const textNode = walker.nextNode();

    if (!textNode || textNode.textContent.length < 3) {
      throw new Error("No suitable text node found.");
    }

    const range = document.createRange();

    range.setStart(textNode, 0);
    range.setEnd(textNode, 3);

    const selection = window.getSelection();

    selection.removeAllRanges();
    selection.addRange(range);
  });

  await page.locator(".resumeText").dispatchEvent("mouseup");

  await expect(page.locator(".annotation-offerer")).toBeVisible();
});
