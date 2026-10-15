import { describe, expect, test, afterEach, vi, beforeEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { JSDOM } from "jsdom";
import "@testing-library/jest-dom/vitest";

import {
  initializeAnnotationList,
  getRelativeOffsets,
  getNextModeOnSelection,
  upsertAnnotation,
  deleteAnnotation,
  groupAnnotationsByTextId,
  renderSegments,
  computeSegments,
  processTextSegments,
  getHighlightLevel,
} from "../../utils";
import {
  mockAnnotation1,
  mockAnnotation2,
  mockAnnotation3,
} from "../fixtures/annotation-fixtures";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const expectedAnnotationsByTextId = {
  "paragraph one": { "anno-1": [0, 1], "anno-2": [0, 1] },
  "paragraph two": { "anno-3": [0, 1] },
};
const mockResumeHeaderSectionText = "namelocationemail";

const createSegment = (start, end, ids = []) => ({
  start,
  end,
  count: ids.length,
  ids,
});

const mockAnnotationList = {
  "anno-1": mockAnnotation1,
  "anno-2": mockAnnotation2,
  "anno-3": mockAnnotation3,
};
const mockAnnotationRangesForTextId = {
  "anno-1": [0, 1],
  "anno-2": [0, 1],
};

const mockNewAnnotationData = {
  annotatedText: "newly selected text",
  annotationContent: "new note",
  selectionPosition: {
    viewportPosition: { x: 100, y: 100 },
    textPosition: "1",
    range: [0, 1],
  },
};

const mockCurrentAnnotationId = "anno-1";

describe("getRelativeOffsets", () => {
  test("calculates the correct relative offsets for ranges", () => {
    const dom = new JSDOM(
      `<div className="resumeHeader" data-text-id="resume-header"><h2>abcdefg</h2><div><p>hijklmn</p><p>opqrst</p></div></div>`
    );
    const document = dom.window.document;
    const container = document.querySelector('[data-text-id="resume-header"]');
    const h2Text = container.querySelector("h2").firstChild;
    const p1Text = container.querySelectorAll("p")[0].firstChild;
    const p2Text = container.querySelectorAll("p")[1].firstChild;

    const range1 = document.createRange();
    range1.setStart(h2Text, 0);
    range1.setEnd(h2Text, 3);

    const range2 = document.createRange();
    range2.setStart(h2Text, 2);
    range2.setEnd(p1Text, 3);

    const range3 = document.createRange();
    range3.setStart(h2Text, 2);
    range3.setEnd(p2Text, 2);

    const range4 = document.createRange();
    range4.setStart(p1Text, 0);
    range4.setEnd(p2Text, 2);

    const range5 = document.createRange();
    range5.setStart(p2Text, 1);
    range5.setEnd(p2Text, 4);

    expect(getRelativeOffsets(range1, container)).toEqual([0, 3]);
    expect(getRelativeOffsets(range2, container)).toEqual([2, 10]);
    expect(getRelativeOffsets(range3, container)).toEqual([2, 16]);
    expect(getRelativeOffsets(range4, container)).toEqual([7, 16]);
    expect(getRelativeOffsets(range5, container)).toEqual([15, 18]);
  });
});

describe("groupAnnotationsByTextId", () => {
  test("groups annotations by textId and keeps only their ranges", () => {
    expect(groupAnnotationsByTextId(mockAnnotationList)).toEqual(
      expectedAnnotationsByTextId
    );
  });
});

describe("getNextModeOnSelection", () => {
  test("returns text_selected for a valid selection", () => {
    const userSelection = {
      isCollapsed: false,
      toString: () => "React",
    };

    expect(getNextModeOnSelection(userSelection)).toBe("text_selected");
  });

  test("returns idle when the selection contains only a newline", () => {
    const userSelection = {
      isCollapsed: false,
      toString: () => "\n",
    };

    expect(getNextModeOnSelection(userSelection)).toBe("idle");
  });

  test("returns idle when the selection is empty", () => {

    const userSelection = {
      isCollapsed: true,
      toString: () => "",
    };

    expect(getNextModeOnSelection(userSelection)).toBe("idle");
  });
});

describe("deleteAnnotation", () => {
  test("removes the annotation with the given ID", () => {
    const afterDeleteAnnotationList = deleteAnnotation(
      mockAnnotationList,
      mockCurrentAnnotationId
    );
    expect(Object.keys(afterDeleteAnnotationList)).toHaveLength(
      Object.keys(mockAnnotationList).length - 1
    );
    expect(afterDeleteAnnotationList[mockCurrentAnnotationId]).toBeUndefined();
  });
});

describe("upsertAnnotation", () => {
  test("inserts a new annotation", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("mock-id");
    const currentAnnotationId = undefined;
    const updatedAnnotationList = upsertAnnotation(
      mockAnnotationList,
      currentAnnotationId,
      mockNewAnnotationData
    );

    expect(updatedAnnotationList).toEqual({
      ...mockAnnotationList,
      "mock-id": expect.objectContaining({
        annotatedText: mockNewAnnotationData.annotatedText,
        annotationContent: mockNewAnnotationData.annotationContent,
        selectionPosition: mockNewAnnotationData.selectionPosition,
      }),
    });
    expect(Object.keys(updatedAnnotationList)).toHaveLength(
      Object.keys(mockAnnotationList).length + 1
    );
  });
  test("updates an existing annotation", () => {
    const updatedAnnotationList = upsertAnnotation(
      mockAnnotationList,
      mockCurrentAnnotationId,
      mockNewAnnotationData
    );
    expect(Object.keys(updatedAnnotationList)).toHaveLength(
      Object.keys(mockAnnotationList).length
    );
    expect(
      updatedAnnotationList[mockCurrentAnnotationId].annotationContent
    ).toEqual(mockNewAnnotationData.annotationContent);
    expect(
      updatedAnnotationList[mockCurrentAnnotationId].annotatedText
    ).toEqual(mockAnnotationList[mockCurrentAnnotationId].annotatedText);
    expect(
      updatedAnnotationList[mockCurrentAnnotationId].annotationPosition
    ).toEqual(mockAnnotationList[mockCurrentAnnotationId].annotationPosition);
    expect(updatedAnnotationList[mockCurrentAnnotationId].timestamp).toEqual(
      mockAnnotationList[mockCurrentAnnotationId].timestamp
    );
  });
});

describe("computeSegments", () => {
  describe("invalid input handling", () => {
    test.each([
      ["undefined", undefined],
      ["null", null],
      ["an empty string", ""],
      ["a whitespace-only string", "    "],
    ])("throws when text is %s", (_, text) => {
      expect(() => {
        computeSegments(text, {});
      }).toThrow(
        new TypeError("computeSegments: text must be a non-empty string.")
      );
    });
    test.each([
      ["null", null],
      ["an object", {}],
      ["a string", "string"],
    ])("throws when extra boundary is not an array", (_, chunkBoundaries) => {
      expect(() => {
        computeSegments(mockResumeHeaderSectionText, {}, chunkBoundaries);
      }).toThrow(
        new TypeError("computeSegments: chunkBoundaries must be an array.")
      );
    });
    test("throws when any extra boundary exceeds text.length", () => {
      const chunkBoundaries = [3, 18];
      expect(() => {
        computeSegments(mockResumeHeaderSectionText, {}, chunkBoundaries);
      }).toThrow(
        new RangeError(
          "computeSegments: chunkBoundaries must not contain values greater than text.length."
        )
      );
    });
  });

  describe("two overlapping annotation ranges", () => {
    const overlappingAnnotations = {
      a: [2, 8],
      b: [5, 12],
    };
    test.each([
      [
        "with a boundary inside the overlapping area",
        [6],
        [
          createSegment(0, 2),
          createSegment(2, 5, ["a"]),
          createSegment(5, 6, ["a", "b"]),
          createSegment(6, 8, ["a", "b"]),
          createSegment(8, 12, ["b"]),
          createSegment(12, 17),
        ],
      ],
      [
        "with a boundary inside one range but outside the overlapping area",
        [4],
        [
          createSegment(0, 2),
          createSegment(2, 4, ["a"]),
          createSegment(4, 5, ["a"]),
          createSegment(5, 8, ["a", "b"]),
          createSegment(8, 12, ["b"]),
          createSegment(12, 17),
        ],
      ],
      [
        "with a boundary outside both ranges",
        [15],
        [
          createSegment(0, 2),
          createSegment(2, 5, ["a"]),
          createSegment(5, 8, ["a", "b"]),
          createSegment(8, 12, ["b"]),
          createSegment(12, 15),
          createSegment(15, 17),
        ],
      ],
      [
        "without extra boundaries",
        [],
        [
          createSegment(0, 2),
          createSegment(2, 5, ["a"]),
          createSegment(5, 8, ["a", "b"]),
          createSegment(8, 12, ["b"]),
          createSegment(12, 17),
        ],
      ],
    ])("%s", (_, chunkBoundaries, expected) => {
      expect(
        computeSegments(
          mockResumeHeaderSectionText,
          overlappingAnnotations,
          chunkBoundaries
        )
      ).toEqual(expected);
    });
  });

  describe("a smaller range inside a bigger range", () => {
    const nestedAnnotations = {
      big: [2, 12],
      small: [5, 8],
    };
    test.each([
      [
        "without extra boundaries",
        [],
        [
          createSegment(0, 2),
          createSegment(2, 5, ["big"]),
          createSegment(5, 8, ["big", "small"]),
          createSegment(8, 12, ["big"]),
          createSegment(12, 17),
        ],
      ],
      [
        "with a boundary inside the smaller range",
        [6],
        [
          createSegment(0, 2),
          createSegment(2, 5, ["big"]),
          createSegment(5, 6, ["big", "small"]),
          createSegment(6, 8, ["big", "small"]),
          createSegment(8, 12, ["big"]),
          createSegment(12, 17),
        ],
      ],
      [
        "with a boundary inside the bigger range but outside the smaller range",
        [10],
        [
          createSegment(0, 2),
          createSegment(2, 5, ["big"]),
          createSegment(5, 8, ["big", "small"]),
          createSegment(8, 10, ["big"]),
          createSegment(10, 12, ["big"]),
          createSegment(12, 17),
        ],
      ],
      [
        "with a boundary outside the bigger range",
        [15],
        [
          createSegment(0, 2),
          createSegment(2, 5, ["big"]),
          createSegment(5, 8, ["big", "small"]),
          createSegment(8, 12, ["big"]),
          createSegment(12, 15),
          createSegment(15, 17),
        ],
      ],
    ])("%s", (_, chunkBoundaries, expected) => {
      expect(
        computeSegments(
          mockResumeHeaderSectionText,
          nestedAnnotations,
          chunkBoundaries
        )
      ).toEqual(expected);
    });
  });

  describe("one annotation range", () => {
    const singleAnnotation = {
      a: [2, 12],
    };
    test.each([
      [
        "without extra boundaries",
        [],
        [
          createSegment(0, 2),
          createSegment(2, 12, ["a"]),
          createSegment(12, 17),
        ],
      ],
      [
        "with a boundary inside the range",
        [6],
        [
          createSegment(0, 2),
          createSegment(2, 6, ["a"]),
          createSegment(6, 12, ["a"]),
          createSegment(12, 17),
        ],
      ],
      [
        "with a boundary outside the range",
        [15],
        [
          createSegment(0, 2),
          createSegment(2, 12, ["a"]),
          createSegment(12, 15),
          createSegment(15, 17),
        ],
      ],
    ])("%s", (_, chunkBoundaries, expected) => {
      expect(
        computeSegments(
          mockResumeHeaderSectionText,
          singleAnnotation,
          chunkBoundaries
        )
      ).toEqual(expected);
    });
  });
});

describe("renderSegments", () => {
  test.each([
    ["undefined", undefined],
    ["null", null],
    ["an empty string", ""],
    ["a whitespace-only string", "    "],
  ])("throws when text is %s", (_, text) => {
    expect(() => {
      renderSegments(text, []);
    }).toThrow(new TypeError("Can not render empty text or undefined."));
  });

  test.each([
    ["undefined", undefined],
    ["null", null],
    ["an empty array", []],
  ])(
    "render full text when segments are undefined, null, or empty",
    (_, segs) => {
      render(renderSegments(mockResumeHeaderSectionText, segs));

      expect(screen.getByText(mockResumeHeaderSectionText)).toBeInTheDocument();
    }
  );
  test("render text correctly with valid segments", () => {
    const overlappingAnnotationsWithoutBoundarySegments = [
      createSegment(0, 2),
      createSegment(2, 5, ["a"]),
      createSegment(5, 8, ["a", "b"]),
      createSegment(8, 12, ["b"]),
      createSegment(12, 17),
    ];
    render(
      renderSegments(
        mockResumeHeaderSectionText,
        overlappingAnnotationsWithoutBoundarySegments
      )
    );
    // "na" should render without highlight
    // const plainText = screen.getByText("na");
    // expect(plainText).toBeInTheDocument();
    // expect(plainText).not.toHaveClass("highlight");
    // expect(plainText).not.toHaveAttribute("data-annotation-ids");

    // "mel" should have highlight and annotation id "a"
    const firstAnnotation = screen.getByText("mel");
    expect(firstAnnotation).toHaveClass("highlight highlight-1");
    expect(firstAnnotation).toHaveAttribute("data-annotation-ids", "a");

    // "oca" should have annotation ids "a,b"
    const overlappingAnnotation = screen.getByText("oca");
    expect(overlappingAnnotation).toHaveClass("highlight highlight-2");
    expect(overlappingAnnotation).toHaveAttribute("data-annotation-ids", "a,b");

    // "tion" should have annotation id "b"
    const secondAnnotation = screen.getByText("tion");
    expect(secondAnnotation).toHaveClass("highlight highlight-1");
    expect(secondAnnotation).toHaveAttribute("data-annotation-ids", "b");

    // "email" should render without highlight
    // const lastText = screen.getByText("email");
    // expect(lastText).toBeInTheDocument();
    // expect(lastText).not.toHaveClass("highlight");
    // expect(lastText).not.toHaveAttribute("data-annotation-ids");
  });
});

describe("initializeAnnotationList", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("returns the stored annotationList when it exists", () => {
    localStorage.setItem("annotationList", JSON.stringify(mockAnnotationList));
    const initializedAnnotationList = initializeAnnotationList();
    expect(initializedAnnotationList).toEqual(mockAnnotationList);
  });

  test("returns an empty object when annotationList does not exist", () => {
    const initializedAnnotationList = initializeAnnotationList();
    expect(initializedAnnotationList).toEqual({});
  });
});

describe("processTextSegments", () => {
  test.each([undefined, {}, []])(
    "throw TypeError when textChunks is %s",
    (invalidTextChunk) => {
      expect(() => {
        processTextSegments({
          textChunks: invalidTextChunk,
          annotationsById: mockAnnotationRangesForTextId,
          computeSegmentsFn: vi.fn(() => {}),
        });
      }).toThrow("Can not process empty text or undefined.");
    }
  );

  test("handle text chuck with no annotations", () => {
    const mockTextChuck = ["mockTextChunk1,", "mockTextChunk2"];
    expect(
      processTextSegments({
        textChunks: mockTextChuck,
        annotationsById: undefined,
        computeSegmentsFn: vi.fn(() => {}),
      })
    ).toEqual({
      fullText: "mockTextChunk1,mockTextChunk2",
      segmentList: [
        [
          {
            start: 0,
            end: 15,
            count: 0,
            ids: [],
          },
        ],
        [
          {
            start: 15,
            end: 29,
            count: 0,
            ids: [],
          },
        ],
      ],
    });
  });

  test("handle single text chuck with annotaitons", () => {
    const singleMockTextChuck = ["mockTextChunk1,"];
    const mockAnnotationsById = { anno1: [0, 3], anno2: [2, 8], anno3: [6, 8] };
    const fakeComputeFn = vi.fn(() => {
      return [
        { start: 0, end: 2, count: 1, ids: ["anno1"] },
        { start: 2, end: 3, count: 2, ids: ["anno1", "anno2"] },
        { start: 3, end: 6, count: 1, ids: ["anno2"] },
        { start: 6, end: 8, count: 2, ids: ["anno2", "anno3"] },
        { start: 8, end: 15, count: 0, ids: [] },
      ];
    });

    const expectedProcessedSegments = {
      fullText: "mockTextChunk1,",
      segmentList: [
        [
          { start: 0, end: 2, count: 1, ids: ["anno1"] },
          { start: 2, end: 3, count: 2, ids: ["anno1", "anno2"] },
          { start: 3, end: 6, count: 1, ids: ["anno2"] },
          { start: 6, end: 8, count: 2, ids: ["anno2", "anno3"] },
          { start: 8, end: 15, count: 0, ids: [] },
        ],
      ],
    };

    expect(
      processTextSegments({
        textChunks: singleMockTextChuck,
        annotationsForTextId: mockAnnotationsById,
        computeSegmentsFn: fakeComputeFn,
      })
    ).toEqual(expectedProcessedSegments);
    expect(fakeComputeFn).toHaveBeenCalledWith(
      "mockTextChunk1,",
      mockAnnotationsById
    );
  });

  test("handle multiple text chuck with annotaitons", () => {
    const multipleMockTextChuck = [
      "mockTextChunk1,",
      "mockTextChunk2",
      "mockTextChunk3",
    ];
    const mockAnnotationsById = {
      anno1: [0, 8],
      anno2: [9, 23],
      anno3: [10, 33],
      anno4: [0, 43],
      anno5: [2, 5],
      anno6: [12, 18],
      anno7: [9, 23],
    };
    const fakeComputeFn = vi.fn(() => {
      return [
        { start: 0, end: 2, count: 2, ids: ["anno1", "anno4"] },
        { start: 2, end: 5, count: 3, ids: ["anno1", "anno4", "anno5"] },
        { start: 5, end: 8, count: 2, ids: ["anno1", "anno4"] },
        { start: 8, end: 9, count: 1, ids: ["anno4"] },
        { start: 9, end: 10, count: 3, ids: ["anno2", "anno4", "anno7"] },
        {
          start: 10,
          end: 12,
          count: 4,
          ids: ["anno2", "anno3", "anno4", "anno7"],
        },
        {
          start: 12,
          end: 15,
          count: 5,
          ids: ["anno2", "anno3", "anno4", "anno6", "anno7"],
        },
        {
          start: 15,
          end: 18,
          count: 5,
          ids: ["anno2", "anno3", "anno4", "anno6", "anno7"],
        },
        {
          start: 18,
          end: 23,
          count: 4,
          ids: ["anno2", "anno3", "anno4", "anno7"],
        },
        { start: 23, end: 29, count: 2, ids: ["anno3", "anno4"] },
        { start: 29, end: 33, count: 2, ids: ["anno3", "anno4"] },
        { start: 33, end: 43, count: 1, ids: ["anno4"] },
      ];
    });

    const expectedProcessedSegments = {
      fullText: "mockTextChunk1,mockTextChunk2mockTextChunk3",
      segmentList: [
        [
          { start: 0, end: 2, count: 2, ids: ["anno1", "anno4"] },
          { start: 2, end: 5, count: 3, ids: ["anno1", "anno4", "anno5"] },
          { start: 5, end: 8, count: 2, ids: ["anno1", "anno4"] },
          { start: 8, end: 9, count: 1, ids: ["anno4"] },
          { start: 9, end: 10, count: 3, ids: ["anno2", "anno4", "anno7"] },
          {
            start: 10,
            end: 12,
            count: 4,
            ids: ["anno2", "anno3", "anno4", "anno7"],
          },
          {
            start: 12,
            end: 15,
            count: 5,
            ids: ["anno2", "anno3", "anno4", "anno6", "anno7"],
          },
        ],
        [
          {
            start: 15,
            end: 18,
            count: 5,
            ids: ["anno2", "anno3", "anno4", "anno6", "anno7"],
          },
          {
            start: 18,
            end: 23,
            count: 4,
            ids: ["anno2", "anno3", "anno4", "anno7"],
          },
          { start: 23, end: 29, count: 2, ids: ["anno3", "anno4"] },
        ],
        [
          { start: 29, end: 33, count: 2, ids: ["anno3", "anno4"] },
          { start: 33, end: 43, count: 1, ids: ["anno4"] },
        ],
      ],
    };

    expect(
      processTextSegments({
        textChunks: multipleMockTextChuck,
        annotationsForTextId: mockAnnotationsById,
        computeSegmentsFn: fakeComputeFn,
      })
    ).toEqual(expectedProcessedSegments);

    expect(fakeComputeFn).toHaveBeenCalledWith(
      "mockTextChunk1,mockTextChunk2mockTextChunk3",
      mockAnnotationsById,
      [15, 29]
    );
  });
});

test("getHighlightLevel-calculate correct highlight level accoridng to count", () => {
 
  const randomCount = Math.floor(Math.random() * (1000 - 3 + 1)) + 3;
  expect(getHighlightLevel(0)).toEqual(0);
  expect(getHighlightLevel(1)).toEqual(1);
  expect(getHighlightLevel(2)).toEqual(2);
  expect(getHighlightLevel(randomCount)).toEqual(3);
});
