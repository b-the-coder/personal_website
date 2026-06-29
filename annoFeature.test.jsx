import { describe, expect, test, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import {
  AnnotationOfferer,
  AnnotationInput,
  AnnotationDisplay,
} from "./components/annoFeature";
import {
  getNextModeOnSelection,
  getUpdatedAnnotationList,
  highlightText,
  deleteAnnotation,
} from "./utils";

afterEach(() => {
  cleanup();
});

const mockSelectedString = {
  validSelection: "mockstring",
  emptySelection: "",
  nullSelection: null,
};

const mockPosition = {
  viewportposition: { x: 100, y: 100 },
  textposition: "1",
};

const mockAnnotationList = {
  "anno-123": {
    annotatedText: "name and contact",
    annotationContent: "this is a note for resume header",
    annotationPosition: {
      viewportposition: { x: 1, y: 2 },
      textposition: "rsmHeader",
    },
    timestamp: 1234567890,
  },
  "anno-456": {
    annotatedText: "links",
    annotationContent: "this is a note for resume header",
    annotationPosition: {
      viewportposition: { x: 1, y: 2 },
      textposition: "rsmHeader",
    },
    timestamp: 1234567890,
  },
  "anno-789": {
    annotatedText: "location",
    annotationContent: "this is a note for resume header",
    annotationPosition: {
      viewportposition: { x: 1, y: 2 },
      textposition: "rsmHeader",
    },
    timestamp: 1234567890,
  },
};

const mockNewAnnoData = {
  annotatedText: "newly selected text",
  annotationContent: "new note",
  annotationPosition: "skl",
};

const mockCurrentAnnotationId = "anno-123";

describe("AnnotationOfferer", () => {
  test("renders AnnotationOfferer at selected view port position when mode is text_selected", () => {
    render(
      <AnnotationOfferer
        mode="text_selected"
        selectionPosition={mockPosition}
      />
    );
    expect(screen.queryByText("Add annotation")).toBeInTheDocument();
    expect(screen.queryByText("Add annotation")).toHaveStyle({
      position: "fixed",
      left: "100px",
      top: "100px",
    });
  });

  test("does not renders when mode is not text_selected", () => {
    render(
      <AnnotationOfferer mode="random_mode" selectionPosition={mockPosition} />
    );
    expect(screen.queryByText("Add annotation")).toBeNull();
  });
});

describe("AnnotationInput", () => {
  test("render when mode is annotating", () => {
    render(
      <AnnotationInput
        mode="annotating"
        selectedText="some text"
        currentAnnotationId={undefined}
        annotationList={{}}
      />
    );
    expect(screen.queryByText(/On:/)).toBeInTheDocument();
  });

  test("does not renders when mode is not annotating", () => {
    render(
      <AnnotationInput
        mode="idle"
        selectedText="some text"
        currentAnnotationId={undefined}
        annotationList={{}}
      />
    );
    expect(screen.queryByText(/On:/)).toBeNull();
  });
  test("Show the right annotated text and place holder when add new annotation", () => {
    render(
      <AnnotationInput
        mode="annotating"
        selectedText="some text"
        currentAnnotationId={undefined}
        annotationList={{}}
      />
    );
    expect(screen.queryByText(/some text/)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Write your annotation...")
    ).toBeInTheDocument();
  });
  test("Show the right annotated text and place holder when edit existing annotation", () => {
    render(
      <AnnotationInput
        mode="annotating"
        selectedText="some text"
        currentAnnotationId={mockCurrentAnnotationId}
        annotationList={mockAnnotationList}
      />
    );
    expect(
      screen.queryByText(
        `${mockAnnotationList[mockCurrentAnnotationId].annotatedText}`
      )
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        mockAnnotationList[mockCurrentAnnotationId].annotationContent
      )
    ).toBeInTheDocument();
  });
});

describe("AnnotationDisplay", () => {
  test("renders when mode is anno_display", () => {
    render(
      <AnnotationDisplay
        mode="anno_display"
        annotationList={mockAnnotationList}
        currentAnnotationId={mockCurrentAnnotationId}
      />
    );
    expect(
      screen.queryByText(
        mockAnnotationList[mockCurrentAnnotationId].annotatedText
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        mockAnnotationList[mockCurrentAnnotationId].annotationContent
      )
    ).toBeInTheDocument();
  });

  test("does not renders when mode is notanno_display", () => {
    render(
      <AnnotationDisplay
        mode="random_mode"
        annotationList={mockAnnotationList}
        currentAnnotationId={mockCurrentAnnotationId}
      />
    );
    expect(
      screen.queryByText(
        mockAnnotationList[mockCurrentAnnotationId].annotatedText
      )
    ).toBeNull();
    expect(
      screen.queryByText(
        mockAnnotationList[mockCurrentAnnotationId].annotationContent
      )
    ).toBeNull();
    expect(screen.queryByText("On:")).toBeNull();
    expect(screen.queryByText("You annotated:")).toBeNull();
  });

  test("Show the right annotated text and annotation content when render", () => {
    render(
      <AnnotationDisplay
        mode="anno_display"
        annotationList={mockAnnotationList}
        currentAnnotationId={mockCurrentAnnotationId}
      />
    );
    expect(
      screen.queryByText(
        `${mockAnnotationList[mockCurrentAnnotationId].annotatedText}`
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByText(
        mockAnnotationList[mockCurrentAnnotationId].annotationContent
      )
    ).toBeInTheDocument();
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

describe("highlightText", () => {
  test("case1: both match → highlight", () => {
    const mockTextContent = "before name and contact after";
    const mockTextId = "rsmHeader";
    const processedTextContent = highlightText(
      mockTextContent,
      mockAnnotationList,
      mockTextId
    );
    render(<>{processedTextContent}</>);
    expect(document.querySelector(".highlighted")).toHaveTextContent(
      "name and contact"
    );
    expect(screen.getByText(/before/)).toBeInTheDocument();
    expect(screen.getByText(/after/)).toBeInTheDocument();
  });
  test("case2: textId matches but content does not", () => {
    const mockTextContent = "random text";
    const mockTextId = "rsmHeader";
    const processedTextContent = highlightText(
      mockTextContent,
      mockAnnotationList,
      mockTextId
    );
    render(<>{processedTextContent}</>);
    expect(screen.getByText(/random text/)).toBeInTheDocument();
    expect(document.querySelector(".highlighted")).toBeNull();
  });
  test("case3: content matches but textId does not", () => {
    const mockTextContent = "before name and contact after";
    const mockTextId = "wrongId";
    const processedTextContent = highlightText(
      mockTextContent,
      mockAnnotationList,
      mockTextId
    );
    render(<>{processedTextContent}</>);
    expect(screen.getByText(/name and contact/)).toBeInTheDocument();
    expect(document.querySelector(".highlighted")).toBeNull();
  });
  test("case4: no match at all", () => {
    const mockTextContent = "random text";
    const mockTextId = "wrongId";
    const processedTextContent = highlightText(
      mockTextContent,
      mockAnnotationList,
      mockTextId
    );
    render(<>{processedTextContent}</>);
    expect(screen.getByText(/random text/)).toBeInTheDocument();
    expect(document.querySelector(".highlighted")).toBeNull();
  });
  test("highlights all matching annotations with the corrected annotation Id in the same text", () => {
    const mockTextContent =
      " before name and contact middle1 links middle2 location after";
    const mockTextId = "rsmHeader";
    const processedTextContent = highlightText(
      mockTextContent,
      mockAnnotationList,
      mockTextId
    );
    render(<>{processedTextContent}</>);
    expect(document.querySelectorAll(".highlighted")).toHaveLength(3);
    expect(screen.getByText("name and contact")).toHaveClass("highlighted");
    expect(screen.getByText("links")).toHaveClass("highlighted");
    expect(screen.getByText("location")).toHaveClass("highlighted");
    expect(screen.getByText("name and contact")).toHaveAttribute(
      "data-anno-id",
      "anno-123"
    );
    expect(screen.getByText("links")).toHaveAttribute(
      "data-anno-id",
      "anno-456"
    );
    expect(screen.getByText("location")).toHaveAttribute(
      "data-anno-id",
      "anno-789"
    );
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
        annotationPosition: mockNewAnnoData.annotationPosition,
      }),
    });
    vi.restoreAllMocks();
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
