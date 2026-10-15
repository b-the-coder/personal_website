import { test, expect } from "@playwright/test";

test.describe("annotation feature workflow", () => {
  test("single annotation creation", async ({ page }) => {
    await page.goto("/");

    // Initialize annotation storage
    await page.localStorage.setItem("annotationList", JSON.stringify({}));

    // Select a random "React" occurrence
    const locator = page.getByText("React");
    const count = await locator.count();
    const idx = Math.floor(Math.random() * count);
    const target = locator.nth(idx);
    await target.scrollIntoViewIfNeeded();

    // Simulate text selection and capture details for later assertions
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
      return null;
    });

    // Open the annotation offerer at the selection
    await page.locator(".resumeText").dispatchEvent("mouseup");

    // Verify the annotation offerer is displayed at the expected position
    await expect(page.locator(".annotation-offerer")).toBeVisible();
    const offererBox = await page.locator(".annotation-offerer").boundingBox();
    expect(offererBox.x).toBeCloseTo(selectionInfo.viewportPosition.x, 0);
    expect(offererBox.y).toBeCloseTo(selectionInfo.viewportPosition.y, 0);

    // Open the annotation input and verify the selected text
    await page.locator(".annotation-offerer").click();
    await expect(page.locator(".annotation-input")).toBeVisible();
    await expect(
      page.getByText(`On: ${selectionInfo.selectedText}`)
    ).toBeVisible();

    // Submit an annotation
    await page
      .locator(".annotation-input__textarea")
      .fill("e2e test mock annotation content");
    await page.locator(".annotation-input__post-btn").click();

    // Verify the selected occurrence is highlighted
    const annotation = page.locator(".highlight.highlight-1");
    const annotatedText = await annotation.textContent();
    expect(annotatedText).toBe("React");

    const highlightedIndex = await locator.evaluateAll(
      (elements, highlightedElement) => elements.indexOf(highlightedElement),
      await annotation.elementHandle()
    );
    expect(highlightedIndex).toBe(idx);

    // Verify the annotation is persisted
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
  });

  test("edit annotation", async ({ page }) => {
    await page.goto("/");

    // Initialize annotation storage with an existing annotation
    const annotationList = {
      "c85f6bcb-db68-4a0d-9151-85530d786d61": {
        annotatedText: "Designed",
        annotationContent: "e2e test mock annotation content",
        selectionPosition: {
          viewportPosition: {
            x: 209.046875,
            y: 260.5,
          },
          textPosition: "exp-0-bullet-0",
          range: [0, 9],
        },
        timestamp: 1788286246196,
      },
    };
    await page.localStorage.setItem(
      "annotationList",
      JSON.stringify(annotationList)
    );
    await page.reload();

    // Open the existing annotation and verify its content
    const annotation = await page.locator(
      '[data-annotation-ids="c85f6bcb-db68-4a0d-9151-85530d786d61"]'
    );
    await annotation.click();

    await expect(page.locator(".annotation-display")).toBeVisible();
    await expect(
      page.getByText(
        `On: ${annotationList["c85f6bcb-db68-4a0d-9151-85530d786d61"].annotatedText}`
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        `You annotated: ${annotationList["c85f6bcb-db68-4a0d-9151-85530d786d61"].annotationContent}`
      )
    ).toBeVisible();

    // Open the input form and verify the existing annotation data
    await page
      .locator(".annotation-display  .annotation-display__edit-btn")
      .click();

    await expect(page.locator(".annotation-input")).toBeVisible();
    await expect(
      page.getByText(
        `On: ${annotationList["c85f6bcb-db68-4a0d-9151-85530d786d61"].annotatedText}`
      )
    ).toBeVisible();
    const annotationTextarea = page.locator(".annotation-input__textarea");
    await expect(annotationTextarea).toBeVisible();

    await expect(annotationTextarea).toHaveAttribute(
      "placeholder",
     "You annotated:"+  annotationList["c85f6bcb-db68-4a0d-9151-85530d786d61"].annotationContent
    );

    // Submit the updated annotation
    const editedAnnotationContent =
      "edited" +
      annotationList["c85f6bcb-db68-4a0d-9151-85530d786d61"].annotationContent;
    await page
      .locator(".annotation-input__textarea")
      .fill(editedAnnotationContent);
    await page.locator(".annotation-input__post-btn").click();

    // Verify the edited content is displayed
    const editedAnnotation = await page.locator(
      '[data-annotation-ids="c85f6bcb-db68-4a0d-9151-85530d786d61"]'
    );
    await editedAnnotation.click();
    await expect(
      page.getByText(`You annotated: ${editedAnnotationContent}`)
    ).toBeVisible();

    // Verify the edited annotation is persisted
    const postEditAnnotationList = await page.evaluate(() => {
      return JSON.parse(window.localStorage.getItem("annotationList"));
    });

    expect(
      postEditAnnotationList["c85f6bcb-db68-4a0d-9151-85530d786d61"]
        .annotationContent
    ).toEqual(editedAnnotationContent);
  });

  test("Delete annotation", async ({ page }) => {
    await page.goto("/");

    // Initialize annotation storage with an existing annotation
    const annotationList = {
      "c85f6bcb-db68-4a0d-9151-85530d786d61": {
        annotatedText: "Designed",
        annotationContent: "e2e test mock annotation content",
        selectionPosition: {
          viewportPosition: {
            x: 209.046875,
            y: 260.5,
          },
          textPosition: "exp-0-bullet-0",
          range: [0, 9],
        },
        timestamp: 1788286246196,
      },
    };
    await page.localStorage.setItem(
      "annotationList",
      JSON.stringify(annotationList)
    );
    await page.reload();

    // Open the existing annotation and verify its content
    const annotation = await page.locator(
      '[data-annotation-ids="c85f6bcb-db68-4a0d-9151-85530d786d61"]'
    );
    await annotation.click();

    await expect(page.locator(".annotation-display")).toBeVisible();
    await expect(
      page.getByText(
        `On: ${annotationList["c85f6bcb-db68-4a0d-9151-85530d786d61"].annotatedText}`
      )
    ).toBeVisible();
    await expect(
      page.getByText(
        `You annotated: ${annotationList["c85f6bcb-db68-4a0d-9151-85530d786d61"].annotationContent}`
      )
    ).toBeVisible();

    // Delete the annotation
    await page
      .locator(".annotation-display  .annotation-display__delete-btn")
      .click();

    // Verify the annotation is removed from the UI
    await expect(
      page.locator(
        '[data-annotation-ids="c85f6bcb-db68-4a0d-9151-85530d786d61"]'
      )
    ).not.toBeAttached();
    await expect(page.locator(".highlight.highlight-1")).not.toBeAttached();

    // Verify the deletion is persisted
    const postDeleteAnnotationList = await page.evaluate(() => {
      return JSON.parse(window.localStorage.getItem("annotationList"));
    });
    await expect(
      postDeleteAnnotationList["c85f6bcb-db68-4a0d-9151-85530d786d61"]
    ).toBeUndefined();
    await expect(postDeleteAnnotationList).toEqual({});
  });
});
