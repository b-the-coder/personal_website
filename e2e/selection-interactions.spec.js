import { test, expect } from "playwright/test";

test.describe("Text Selection & Click Interaction Behavior", () => {
  test("should handle forward text selection (Anchor to Focus)", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.playwright = true;
    });
    await page.goto("/");
    // 2. 确保目标容器已经加载
    const container = page.locator('[data-text-id="resume-header"]');
    await expect(container).toBeVisible();

    // 3. 在浏览器中精准执行 DOM Range 选择并触发 mouseup
    await page.evaluate(() => {
      const h2Element = document.querySelector(
        '[data-text-id="resume-header"] h2'
      );
      const p2Element = document.querySelector(
        '[data-text-id="resume-header"] p:nth-child(2)'
      );

      if (!h2Element || !p2Element) return;

      const startTextNode = h2Element.firstChild; // "Bin He"
      const endTextNode = p2Element.firstChild; // "Greater NYC Area"

      const range = document.createRange();
      const selection = window.getSelection();

      // 设置选择的起点和终点
      range.setStart(startTextNode, 11); // 从 "He" 开始
      range.setEnd(endTextNode, 7); // 到 "Greater" 结束
      selection?.removeAllRanges();
      selection?.addRange(range);

      // ✨ 关键步骤：在用户松开鼠标的结束元素上，手动触发 mouseup 事件
      p2Element.dispatchEvent(
        new MouseEvent("mouseup", {
          bubbles: true, // 允许事件向上传播（冒泡），这样你的 React 监听器才能抓到
          cancelable: true,
          view: window,
        })
      );
    });
    const calculatedRange = await page.evaluate(
      () => window.__LAST_CALCULATED_RANGE__
    );

    // 填入你算法对“正着选”期望得到的相对索引数字（这里假设是 4 和 7）
    expect(calculatedRange).toEqual([11, 38]);
  });

  test("should handle backward text selection (Focus to Anchor)", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.playwright = true;
    });
    await page.goto("/");
    // 2. 确保目标容器已经加载
    const container = page.locator('[data-text-id="resume-header"]');
    await expect(container).toBeVisible();

    // 3. 在浏览器中精准执行 倒着选 选择并触发 mouseup
    await page.evaluate(() => {
      const h2Element = document.querySelector(
        '[data-text-id="resume-header"] h2'
      );
      const p2Element = document.querySelector(
        '[data-text-id="resume-header"] p:nth-child(2)'
      );

      if (!h2Element || !p2Element) return;

      const startTextNode = h2Element.firstChild; // "Bin He"
      const endTextNode = p2Element.firstChild; // "Greater NYC Area"

      const selection = window.getSelection();
      selection?.removeAllRanges();

      // 💡 倒着选的核心：不能用 document.createRange()，必须用 collapse + extend
      // 先把光标固定在后面的结束位置（Greater 的末尾，索引 7）
      selection?.collapse(endTextNode, 7);

      // 然后把选区向前延伸到前面的起始位置（He 的开头，索引 11）
      selection?.extend(startTextNode, 11);

      // ✨ 关键步骤：在用户松开鼠标的结束元素上，手动触发 mouseup 事件
      p2Element.dispatchEvent(
        new MouseEvent("mouseup", {
          bubbles: true, // 允许事件向上传播（冒泡），这样你的 React 监听器才能抓到
          cancelable: true,
          view: window,
        })
      );
    });

    const calculatedRange = await page.evaluate(
      () => window.__LAST_CALCULATED_RANGE__
    );

    // 填入你算法对“正着选”期望得到的相对索引数字（这里假设是 4 和 7）
    expect(calculatedRange).toEqual([11, 38]);
  });

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
    await expect(page.locator(".annotation-offerer")).toBeHidden()
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
    // 获取元素实际的右内边距
    const paddingRight = await expBullet.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el).paddingRight) || 0;
    });
    //右侧 padding 空白区域的中心
    const startX = box.x + box.width - (paddingRight / 2 || 5);
    const startY = box.y + box.height / 2; // 如果是单行或最后一行，直接取 Y 轴中点
  
    await page.mouse.dblclick(startX, startY);

    // const calculatedRange = await page.evaluate(
    //   () => window.__LAST_CALCULATED_RANGE__
    // );

    // expect(calculatedRange).toBeUndefined();
    // await expect(page.locator(".annotation-offerer")).toBeHidden();
  });
});
