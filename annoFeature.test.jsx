import { describe, expect, test, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { AnnotationOfferer, AnnotationInput } from "./components/annoFeature";
import {
  getNextModeOnSelection,
  getUpdatedAnnotationList,
  highlightText,
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
  "existing-id-123": {
    annotatedText: "name and contact",
    annotationContent: "this is a note for resume header",
    annotationPosition: {
      viewportposition: { x: 1, y: 2 },
      textposition: "rsmHeader",
    },
    timestamp: 1234567890,
  },
  "existing-id-456": {
    annotatedText: "links",
    annotationContent: "this is a note for resume header",
    annotationPosition: {
      viewportposition: { x: 1, y: 2 },
      textposition: "rsmHeader",
    },
    timestamp: 1234567890,
  },
  "existing-id-789": {
    annotatedText: "location",
    annotationContent: "this is a note for resume header",
    annotationPosition: {
      viewportposition: { x: 1, y: 2 },
      textposition: "rsmHeader",
    },
    timestamp: 1234567890,
  },
};

const mockTextContent = " name and contact links location";

const mockNewAnnoData = {
  annotatedText: "newly selected text",
  annotationContent: "new note",
  annotationPosition: "skl",
};
const mockCurrentAnnotationId = "existing-id-123";

describe("AnnotationOfferer", () => {
  test("mode是text_selected时offerer显示", () => {
    render(
      <AnnotationOfferer
        mode="text_selected"
        selectionPosition={mockPosition}
      />
    );
    expect(screen.queryByText("Add annotation")).toBeInTheDocument();
  });

  test("mode不是text_selected时offerer不显示", () => {
    render(<AnnotationOfferer mode="idle" selectionPosition={mockPosition} />);
    expect(screen.queryByText("Add annotation")).toBeNull();
  });

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

describe("AnnotationInput", () => {
  test("mode是annotating时input显示", () => {
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

  test("mode不是annotating时input不显示", () => {
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

describe("highlightedText", () => {
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
    const mockTextContent = "name and contact info";
    const mockTextId = "wrongId";
    const processedTextContent = highlightText(
      mockTextContent,
      mockAnnotationList,
      mockTextId
    );
    render(<>{processedTextContent}</>);
    expect(screen.getByText(/name and contact info/)).toBeInTheDocument();
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
  test("highlights all matching annotations in the same text", () => {
    const mockTextId = "rsmHeader";
    const processedTextContent = highlightText(
      mockTextContent,
      mockAnnotationList,
      mockTextId
    );
    render(<>{processedTextContent}</>);
    expect(
      document.querySelectorAll(".highlighted")
    ).toHaveLength(3);
    expect(screen.getByText("name and contact")).toHaveClass("highlighted");
expect(screen.getByText("links")).toHaveClass("highlighted");
expect(screen.getByText("location")).toHaveClass("highlighted");
  });
});
