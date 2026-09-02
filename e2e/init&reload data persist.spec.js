import { test, expect } from './fixtures'

// annotationList
const annotationListData = {
  "2dd26233-7a4a-40b9-b156-b7215a788a5b": {
    annotatedText: "Frontend",
    annotationContent: "anno1",
    selectionPosition: {
      viewportPosition: { x: 166.3203125, y: 340.5 },
      textPosition: "skl-0",
      range: [0, 8],
    },
    timestamp: 1787242573772,
  },
  "3e846e11-a05a-4f63-9f0d-57005ea2a614": {
    annotatedText: "Designed",
    annotationContent: "anno2",
    selectionPosition: {
      viewportPosition: { x: 204.6015625, y: 511 },
      textPosition: "exp-0-bullet-0",
      range: [0, 8],
    },
    timestamp: 1787242589304,
  },
  "ead4742f-70e5-4c23-ad37-b4163e9afad5": {
    annotatedText: "Designed and implemented",
    annotationContent: "anno3",
    selectionPosition: {
      viewportPosition: { x: 331.7890625, y: 511 },
      textPosition: "exp-0-bullet-0",
      range: [0, 24],
    },
    timestamp: 1787242602185,
  },
  "0cd6695d-7bca-4d62-a726-1b1b62c890a6": {
    annotatedText: "2024-03 - 2024-06\n\n",
    annotationContent: "Anno4",
    selectionPosition: {
      viewportPosition: { x: 617.5, y: 502 },
      textPosition: "pjt-3-title",
      range: [41, 58],
    },
    timestamp: 1787242624379,
  },
  "6deb142a-43a9-49b9-a4a5-0f5c6fa2311c": {
    annotatedText: "2024-03",
    annotationContent: "Anno5",
    selectionPosition: {
      viewportPosition: { x: 870.0625, y: 190 },
      textPosition: "pjt-3-title",
      range: [41, 48],
    },
    timestamp: 1787242670442,
  },
};

test.describe("initialized and reload page correct ", () => {
  test("initialized and reload page with existing annotaitonList ", async ({
    page,
  }) => {
    await page.addInitScript((data) => {
      window.localStorage.setItem("annotationList", JSON.stringify(data));
    }, annotationListData);
    await page.goto("./");
    // find all the element have "highlight highlight-" in its className
    await expect(
      page.locator(".resumeText").locator('[class^="highlight highlight-"]')
    ).toHaveCount(5);
    await expect(page.locator(".annotation-offerer")).toBeHidden();

    await page.reload();
    await expect(
      page.locator(".resumeText").locator('[class^="highlight highlight-"]')
    ).toHaveCount(5);
    await expect(page.locator(".annotation-offerer")).toBeHidden();
  });

  test("initialized and reload page with no existing annotaitonList ", async ({
    page,
  }) => {
    await page.goto("./");

    await expect(
      page.locator(".resumeText").locator('[class^="highlight highlight-"]')
    ).toHaveCount(0);
    await expect(page.locator(".annotation-offerer")).toBeHidden();

    await page.reload();
    await expect(
      page.locator(".resumeText").locator('[class^="highlight highlight-"]')
    ).toHaveCount(0);
    await expect(page.locator(".annotation-offerer")).toBeHidden();
  });
});
