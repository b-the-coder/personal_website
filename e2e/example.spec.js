// @ts-check

import { test, expect } from "@playwright/test";

test("create annotation from selected text", async ({ page }) => {
  //go to localhost:5173
  await page.goto("/");

  //excuate selection behaviour on page and return selectionInfo
  const selectionInfo = await page.evaluate(() => {
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
    const rect = range.getBoundingClientRect();

    const selectedText = textNode.textContent.slice(0, 3);
    const selection = window.getSelection();

    selection.removeAllRanges();
    selection.addRange(range);
    return {
      selectedText,
      viewportPosition: { x: rect.right, y: rect.bottom },
      textId: element.getAttribute("data-text-id"),
      range: [range.startOffset, range.endOffset],
    };
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

  //get all the keys in annotationList before post new annotation
  const beforePostKeys = await page.evaluate(() =>
    Object.keys(JSON.parse(localStorage.getItem("annotationList") || "{}"))
  );
  //mimic user input annotation content and post
  await page
    .locator(".annotation-input__textarea")
    .fill("mock e2e annotation content");
  await page.locator(".annotation-input__post-btn").click();

  //get all the keys in annotationList  and updated annotationList after post new annotation
  const annotationList = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("annotationList") || "{}")
  );
  const afterPostKeys = Object.keys(annotationList);

  //verify added annotation object is match test assumption
  const newKeys = afterPostKeys.filter((key) => !beforePostKeys.includes(key));
  const newKey = newKeys[0];
  expect(annotationList[newKey].annotatedText).toBe(selectionInfo.selectedText);
  expect(annotationList[newKey].annotationContent).toBe(
    "mock e2e annotation content"
  );
  expect(annotationList[newKey].selectionPosition).toEqual({
    viewportPosition: selectionInfo.viewportPosition,
    textPosition: selectionInfo.textId,
    range: [0, 3],
  });
});

//to-do, priority-low
//test("does not show annotation offerer when selecting empty space", ...)
