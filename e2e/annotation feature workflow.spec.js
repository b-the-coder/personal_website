import { test, expect } from "@playwright/test";

test.describe("annotation feature workflow", () => {
  test("single annotation creation", async ({ page }) => {
    await page.goto("/");

    // Capture the annotation state before creating a new annotation
    const preCreationStorage = await page.evaluate(() => {
      const data = window.localStorage.getItem("annotationList");
      return data ? JSON.parse(data) : null;
    });
    expect(preCreationStorage).toEqual({});

    // Locate a random occurrence of "react" / "React" on the page
    const locator = page.getByText("React");
    const count = await locator.count();
    const idx = Math.floor(Math.random() * count);
    const target = locator.nth(idx);
    // Scroll target in viewport
    await target.scrollIntoViewIfNeeded();

    // Simulate text selection in the browser and capture selection details for later assertions
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
      // Return null if no matching text node is found
      return null;
    });

    // Trigger the mouseup event that normally follows a text selection
    await page.locator(".resumeText").dispatchEvent("mouseup");

    // Verify the annotation offerer is displayed at the expected position
    await expect(page.locator(".annotation-offerer")).toBeVisible();
    const offererBox = await page.locator(".annotation-offerer").boundingBox();
    expect(offererBox.x).toBeCloseTo(selectionInfo.viewportPosition.x, 0);
    expect(offererBox.y).toBeCloseTo(selectionInfo.viewportPosition.y, 0);

    // Verify the annotation input is displayed with the correct selected text
    await page.locator(".annotation-offerer").click();
    await expect(page.locator(".annotation-input")).toBeVisible();
    await expect(
      page.getByText(`On: ${selectionInfo.selectedText}`)
    ).toBeVisible();

    // Enter annotation content and submit it
    await page
      .locator(".annotation-input__textarea")
      .fill("e2e test mock annotation content");
    await page.locator(".annotation-input__post-btn").click();

    // Verify localStorage is updated after the annotation is created
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

    // Verify the correct "React" is being highlighted
    const annotation = page.locator(".highlight.highlight-1");
    const annotatedText = await annotation.textContent();
    expect(annotatedText).toBe("React");

    const highlightedIndex = await locator.evaluateAll(
      (elements, highlightedElement) => elements.indexOf(highlightedElement),
      await annotation.elementHandle()
    );
    expect(highlightedIndex).toBe(idx);
  });

  test("edit annotation", async ({ page }) => {
    await page.goto("/");

    // Seed localStorage with an existing annotation and reload the page
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

    //Locate annotation and click to open the annotation display
    const annotation = await page.locator(
      '[data-annotation-ids="c85f6bcb-db68-4a0d-9151-85530d786d61"]'
    );
    await annotation.click();

    // Verify the annotation display shows the expected annotation data
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

    // Click the edit button to open the annotation input
    await page
      .locator(".annotation-display  .annotation-display__edit-btn")
      .click();

    //Verify the anno input shows the expected annotation data
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
      annotationList["c85f6bcb-db68-4a0d-9151-85530d786d61"].annotationContent
    );
    // Update the annotation content and submit the changes
    const editedAnnotationContent =
      "edited" +
      annotationList["c85f6bcb-db68-4a0d-9151-85530d786d61"].annotationContent;
    await page
      .locator(".annotation-input__textarea")
      .fill(editedAnnotationContent);
    await page.locator(".annotation-input__post-btn").click();

    // Verify localStorage is updated after the annotation is edited
    const postEditAnnotationList = await page.evaluate(() => {
      return JSON.parse(window.localStorage.getItem("annotationList"));
    });

    expect(
      postEditAnnotationList["c85f6bcb-db68-4a0d-9151-85530d786d61"]
        .annotationContent
    ).toEqual(editedAnnotationContent);

    //Verify UI shows correct annotation content  after edit.
    const editedAnnotation = await page.locator(
      '[data-annotation-ids="c85f6bcb-db68-4a0d-9151-85530d786d61"]'
    );
    await editedAnnotation.click();
    await expect(
      page.getByText(`You annotated: ${editedAnnotationContent}`)
    ).toBeVisible();
  });

  test("Delete annotation", async ({ page }) => {
    await page.goto("/");

    // Seed localStorage with an existing annotation and reload the page
    const annotationList = {
      "c85f6bcb-db68-4a0d-9151-85530d786d61": {
        annotatedText: "Designed ",
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

    //Locate annotation and click to open the annotation display
    const annotation = await page.locator(
      '[data-annotation-ids="c85f6bcb-db68-4a0d-9151-85530d786d61"]'
    );
    await annotation.click();

    // Verify the annotation display shows the expected annotation data
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

    // Verify localStorage is updated after the annotation is deleted
    const postDeleteAnnotationList = await page.evaluate(() => {
      return JSON.parse(window.localStorage.getItem("annotationList"));
    });
    await expect(
      postDeleteAnnotationList["c85f6bcb-db68-4a0d-9151-85530d786d61"]
    ).toBeUndefined();
    await expect(postDeleteAnnotationList).toEqual({});

    // Verify the annotation highlight is removed from the UI
    await expect(
      page.locator(
        '[data-annotation-ids="c85f6bcb-db68-4a0d-9151-85530d786d61"]'
      )
    ).not.toBeAttached();
    await expect(page.locator(".highlight.highlight-1")).not.toBeAttached();
  });
});
