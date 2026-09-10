import { test, expect } from "@playwright/test";

test.describe("Text Selection & Click Interaction Behavior", () => {
  test("should not offer annotation when clicking on white space", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.playwright = true;
    });
    await page.goto("/");
    const headerElement = page.locator(".resumeHeader");
    const box = await headerElement.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    // const calculatedRange = await page.evaluate(
    //   () => window.__LAST_CALCULATED_RANGE__
    // );

    // // expect(calculatedRange).toBeUndefined();
    await expect(page.locator(".annotation-offerer")).toBeHidden();
  });
  test("should not offer annotation when dragging on white space", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.playwright = true;
    });
    await page.goto("/");
    const expBullet = page.locator('[data-text-id="exp-0-bullet-0"]');
    const box = await expBullet.boundingBox();
    // 获取元素实际的右内边距
    const paddingRight = await expBullet.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).paddingRight) || 0;
    });
    // 起点刚好落在右侧 padding 空白区域的中心
    const startX = box.x + box.width - (paddingRight / 2 || 5);
    const startY = box.y + box.height / 2; // 如果是单行或最后一行，直接取 Y 轴中点
    // 2. 终点：向右平移 30px（在纯空白区水平拖拽）
    const endX = startX + 30;
    const endY = startY;

    // 3. 执行拖拽
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(endX, endY, { steps: 5 });
    await page.mouse.up();

    // const calculatedRange = await page.evaluate(
    //   () => window.__LAST_CALCULATED_RANGE__
    // );

    // expect(calculatedRange).toBeUndefined();
    await expect(page.locator(".annotation-offerer")).toBeHidden();
  });

  test("should not offer annotation when dbclicking with out selection on white space", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.playwright = true;
    });
    await page.goto("/");
    const expBullet = page.locator('[data-text-id="exp-0-bullet-0"]');
    const box = await expBullet.boundingBox();

    console.log({
      x: box.x,
      width: box.width,
      y: box.y,
      height: box.height,
    });

    await page.mouse.dblclick(box.x + box.width - 10, box.y + box.height / 2);

    await expect(page.locator(".annotation-offerer")).toBeHidden();
  });
});
