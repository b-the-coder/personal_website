import { test, expect } from "@playwright/test"; // 修改为直接使用官方 Playwright 包

test.describe("annotations creation", () => {
  test("single annotation creation", async ({ page }) => {
    await page.goto("/");

    const preCreationStorage = await page.evaluate(() => {
      const data = window.localStorage.getItem("annotationList");
      // 如果找不到，返回 null，避免 JSON.parse 解析或后续链式调用崩溃
      return data ? JSON.parse(data) : null;
    });
    expect(preCreationStorage).toEqual({});

    const locator = page.getByText(/react/i);
    const count = await locator.count();
    const idx = Math.floor(Math.random() * count);
    const target = locator.nth(idx);
    // scroll target in viewport
    await target.scrollIntoViewIfNeeded();

    const selectionInfo = await target.evaluate((el) => {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const idx = node.textContent.toLowerCase().indexOf("react");
        if (idx !== -1) {
          const range = document.createRange();
          range.setStart(node, idx);
          range.setEnd(node, idx + 5);

          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);

          const rect = range.getBoundingClientRect();
          const selectedText = window.getSelection().toString();

          return {
            selectedText: selectedText,
            viewportPosition: { x: rect.right, y: rect.bottom },
          };
        }
      }
      return null; // 没找到的情况也要处理,不然函数隐式返回undefined
    });

    // mimic mouseup in the resume section
    await page.locator(".resumeText").dispatchEvent("mouseup");
    //check if annotation offerer visible and at expected position
    await expect(page.locator(".annotation-offerer")).toBeVisible();
    const offererBox = await page.locator(".annotation-offerer").boundingBox();
    expect(offererBox.x).toBeCloseTo(selectionInfo.viewportPosition.x, 0);
    expect(offererBox.y).toBeCloseTo(selectionInfo.viewportPosition.y, 0);

    // check if annotation input visible with correct selectedText after annotation offerer been clicked
    await page.locator(".annotation-offerer").click();
    await expect(page.locator(".annotation-input")).toBeVisible();
    await expect(
      page.getByText(`On: ${selectionInfo.selectedText}`)
    ).toBeVisible();

    //mimic user input annotation content and post
    await page
      .locator(".annotation-input__textarea")
      .fill("mock e2e annotation content");
    await page.locator(".annotation-input__post-btn").click();

    //localStorage should be updated when annotationList changed.
    const postCreationStorage = await page.evaluate(() => {
      return JSON.parse(window.localStorage.getItem("annotationList"));
    });

    expect(postCreationStorage).not.toBeNull();
    const annotations = Object.values(postCreationStorage);
    expect(annotations).toHaveLength(1);

    expect(annotations).toContainEqual(
      expect.objectContaining({
        annotatedText: selectionInfo.selectedText,
      })
    );

    //verify the correct word is being highlighted
    // const highlights = page.locator('.resume-text .highlight');
  });
});
