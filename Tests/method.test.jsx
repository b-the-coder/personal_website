import { describe, expect, test, afterEach, vi, beforeEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { JSDOM } from "jsdom";
import "@testing-library/jest-dom/vitest";

import {
  annotationListinit,
  getRelativeOffsets,
  getNextModeOnSelection,
  getUpdatedAnnotationList,
  deleteAnnotation,
  groupAnnotationsByTextId,
  renderSegments,
  computeSegments,
} from "../utils";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mockSelectedString = {
  validSelection: "mockstring",
  emptySelection: "",
  nullSelection: null,
};

const expectedGroupedAnnotation = {
  "paragraph one": { "anno-1": [0, 1], "anno-2": [0, 1] },
  "paragraph two": { "anno-3": [0, 1] },
};
const mockResumeTextIdSection = "namelocationemail";

const segment = (start, end, ids = []) => ({
  start,
  end,
  count: ids.length,
  ids,
});

const mockAnnotation1 = {
  annotatedText: "name and contact",
  annotationContent: "this is a note for resume header",
  selectionPosition: {
    viewportPosition: { x: 100, y: 200 },
    textPosition: "paragraph one",
    range: [0, 1],
  },
  timestamp: 1234567890,
};

const mockAnnotation2 = {
  annotatedText: "links",
  annotationContent: "this is a note for resume header",
  selectionPosition: {
    viewportPosition: { x: 300, y: 400 },
    textPosition: "paragraph one",
    range: [0, 1],
  },
  timestamp: 1234567890,
};

const mockAnnotation3 = {
  annotatedText: "location",
  annotationContent: "this is a note for resume header",
  selectionPosition: {
    viewportPosition: { x: 500, y: 600 },
    textPosition: "paragraph two",
    range: [0, 1],
  },
  timestamp: 1234567890,
};

const mockAnnotationList = {
  "anno-1": mockAnnotation1,
  "anno-2": mockAnnotation2,
  "anno-3": mockAnnotation3,
};

const mockNewAnnoData = {
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
  test("should calculate correct relative offsets for ranges", () => {
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
  test("group annotations by textId and keep only their ranges", () => {
    expect(groupAnnotationsByTextId(mockAnnotationList)).toEqual(
      expectedGroupedAnnotation
    );
  });
});

describe("getNextModeOnSelection", () => {
  test("mode setup is correct with selections", () => {
    expect(getNextModeOnSelection(mockSelectedString.validSelection)).toBe(
      "text_selected"
    );
    expect(getNextModeOnSelection(mockSelectedString.nullSelection)).toBe(
      "idle"
    );
    expect(getNextModeOnSelection(mockSelectedString.emptySelection)).toBe(
      "idle"
    );
  });
});

describe("deleteAnnotation", () => {
  test("deleteAnnotation removes the annotation with the given id", () => {
    const result = deleteAnnotation(
      mockAnnotationList,
      mockCurrentAnnotationId
    );
    expect(Object.keys(result)).toHaveLength(
      Object.keys(mockAnnotationList).length - 1
    );
    expect(result[mockCurrentAnnotationId]).toBeUndefined();
  });
});

describe("getUpdatedAnnotationList", () => {
  test("creates a new annotation", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("mock-id");
    const currentAnnotationId = undefined;
    const result = getUpdatedAnnotationList(
      mockAnnotationList,
      currentAnnotationId,
      mockNewAnnoData
    );

    expect(result).toEqual({
      ...mockAnnotationList,
      "mock-id": expect.objectContaining({
        annotatedText: mockNewAnnoData.annotatedText,
        annotationContent: mockNewAnnoData.annotationContent,
        selectionPosition: mockNewAnnoData.selectionPosition,
      }),
    });
    expect(Object.keys(result)).toHaveLength(
      Object.keys(mockAnnotationList).length + 1
    );
  });
  test("updates an existing annotation", () => {
    const result = getUpdatedAnnotationList(
      mockAnnotationList,
      mockCurrentAnnotationId,
      mockNewAnnoData
    );
    expect(Object.keys(result)).toHaveLength(
      Object.keys(mockAnnotationList).length
    );
    expect(result[mockCurrentAnnotationId].annotationContent).toEqual(
      mockNewAnnoData.annotationContent
    );
    expect(result[mockCurrentAnnotationId].annotatedText).toEqual(
      mockAnnotationList[mockCurrentAnnotationId].annotatedText
    );
    expect(result[mockCurrentAnnotationId].annotationPosition).toEqual(
      mockAnnotationList[mockCurrentAnnotationId].annotationPosition
    );
    expect(result[mockCurrentAnnotationId].timestamp).toEqual(
      mockAnnotationList[mockCurrentAnnotationId].timestamp
    );
  });
});

describe("computeSegments", () => {
  //to-do: resolve how test.each works
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

  test("throws when any extra boundary exceeds text.length", () => {
    const extraBoundaries = [3, 18];
    expect(() => {
      computeSegments(mockResumeTextIdSection, {}, extraBoundaries);
    }).toThrow(
      new RangeError(
        "computeSegments: extraBoundaries must not contain values greater than text.length."
      )
    );
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
          segment(0, 2),
          segment(2, 5, ["a"]),
          segment(5, 6, ["a", "b"]),
          segment(6, 8, ["a", "b"]),
          segment(8, 12, ["b"]),
          segment(12, 17),
        ],
      ],
      [
        "with a boundary inside one range but outside the overlapping area",
        [4],
        [
          segment(0, 2),
          segment(2, 4, ["a"]),
          segment(4, 5, ["a"]),
          segment(5, 8, ["a", "b"]),
          segment(8, 12, ["b"]),
          segment(12, 17),
        ],
      ],
      [
        "with a boundary outside both ranges",
        [15],
        [
          segment(0, 2),
          segment(2, 5, ["a"]),
          segment(5, 8, ["a", "b"]),
          segment(8, 12, ["b"]),
          segment(12, 15),
          segment(15, 17),
        ],
      ],
      [
        "without extra boundaries",
        [],
        [
          segment(0, 2),
          segment(2, 5, ["a"]),
          segment(5, 8, ["a", "b"]),
          segment(8, 12, ["b"]),
          segment(12, 17),
        ],
      ],
    ])("%s", (_, extraBoundaries, expected) => {
      expect(
        computeSegments(
          mockResumeTextIdSection,
          overlappingAnnotations,
          extraBoundaries
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
          segment(0, 2),
          segment(2, 5, ["big"]),
          segment(5, 8, ["big", "small"]),
          segment(8, 12, ["big"]),
          segment(12, 17),
        ],
      ],
      [
        "with a boundary inside the smaller range",
        [6],
        [
          segment(0, 2),
          segment(2, 5, ["big"]),
          segment(5, 6, ["big", "small"]),
          segment(6, 8, ["big", "small"]),
          segment(8, 12, ["big"]),
          segment(12, 17),
        ],
      ],
      [
        "with a boundary inside the bigger range but outside the smaller range",
        [10],
        [
          segment(0, 2),
          segment(2, 5, ["big"]),
          segment(5, 8, ["big", "small"]),
          segment(8, 10, ["big"]),
          segment(10, 12, ["big"]),
          segment(12, 17),
        ],
      ],
      [
        "with a boundary outside the bigger range",
        [15],
        [
          segment(0, 2),
          segment(2, 5, ["big"]),
          segment(5, 8, ["big", "small"]),
          segment(8, 12, ["big"]),
          segment(12, 15),
          segment(15, 17),
        ],
      ],
    ])("%s", (_, extraBoundaries, expected) => {
      expect(
        computeSegments(
          mockResumeTextIdSection,
          nestedAnnotations,
          extraBoundaries
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
        [segment(0, 2), segment(2, 12, ["a"]), segment(12, 17)],
      ],
      [
        "with a boundary inside the range",
        [6],
        [
          segment(0, 2),
          segment(2, 6, ["a"]),
          segment(6, 12, ["a"]),
          segment(12, 17),
        ],
      ],
      [
        "with a boundary outside the range",
        [15],
        [
          segment(0, 2),
          segment(2, 12, ["a"]),
          segment(12, 15),
          segment(15, 17),
        ],
      ],
    ])("%s", (_, extraBoundaries, expected) => {
      expect(
        computeSegments(
          mockResumeTextIdSection,
          singleAnnotation,
          extraBoundaries
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
      render(renderSegments(mockResumeTextIdSection, segs));

      expect(screen.getByText(mockResumeTextIdSection)).toBeInTheDocument();
    }
  );
  test("render text correctly with valid segments", () => {
    const overlappingAnnotationsWithoutBoundrySegments = [
      segment(0, 2),
      segment(2, 5, ["a"]),
      segment(5, 8, ["a", "b"]),
      segment(8, 12, ["b"]),
      segment(12, 17),
    ];
    render(
      renderSegments(
        mockResumeTextIdSection,
        overlappingAnnotationsWithoutBoundrySegments
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

describe("annotationListinit", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("return annotatonList if it's exists", () => {
    localStorage.setItem("annotationList", JSON.stringify(mockAnnotationList));
    const result = annotationListinit();
    expect(result).toEqual(mockAnnotationList);
  });

  test("return '{}' if annotaitonList not exists ", () => {
    const result = annotationListinit();
    expect(result).toEqual({});
  });
});
