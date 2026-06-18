import { describe, expect, test, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import React from "react";
import { AnnotationOfferer, AnnotationInput } from "./components/annoFeature";
import { getNextModeOnSelection, getUpdatedAnnotationList } from "./utils";

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
    annotatedText: "some resume text",
    annotationContent: "this is a note",
    annotationPosition: "exp",
    timestamp: 1234567890,
  },
};

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
