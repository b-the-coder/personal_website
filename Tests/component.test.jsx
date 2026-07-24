import { describe, expect, test, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
import React from "react";
import {
  AnnotationOfferer,
  AnnotationInput,
  AnnotationDisplay,
} from "../components/annoFeature";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const mockSelectedString = {
  validSelection: "mockstring",
  emptySelection: "",
  nullSelection: null,
};

const mockPosition = {
  viewportPosition: { x: 100, y: 100 },
  textPosition: "paragraph one",
  range: [0, 1],
};

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

const mockAnnotationListafterDeletion = {
  "anno-2": mockAnnotation2,
  "anno-3": mockAnnotation3,
};

const mockCurrentAnnotationId = "anno-1";

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
  test("changes mode to annotating when clicked", async () => {
    const user = userEvent.setup();
    const setMode = vi.fn();

    render(
      <AnnotationOfferer
        mode="text_selected"
        setMode={setMode}
        selectionPosition={mockPosition}
      />
    );

    await user.click(screen.getByText("Add annotation"));

    expect(setMode).toHaveBeenCalledWith("annotating");
  });
});

describe("AnnotationInput", () => {
  describe("rendering based on mode", () => {
    test("renders when mode is annotating", () => {
      render(
        <AnnotationInput
          mode="annotating"
          selectedText={mockSelectedString.validSelection}
          currentAnnotationId={undefined}
          annotationList={{}}
        />
      );

      expect(screen.queryByText(/On:/)).toBeInTheDocument();
    });

    test("does not render when mode is not annotating", () => {
      render(
        <AnnotationInput
          mode="idle"
          selectedText={mockSelectedString.validSelection}
          currentAnnotationId={undefined}
          annotationList={{}}
        />
      );

      expect(screen.queryByText(/On:/)).toBeNull();
    });
  });

  describe("displayed content", () => {
    test("shows the correct annotated text and placeholder when adding a new annotation", () => {
      render(
        <AnnotationInput
          mode="annotating"
          selectedText={mockSelectedString.validSelection}
          currentAnnotationId={undefined}
          annotationList={{}}
        />
      );

      expect(
        screen.getByText(mockSelectedString.validSelection)
      ).toBeInTheDocument();

      expect(
        screen.getByPlaceholderText("Write your annotation...")
      ).toBeInTheDocument();
    });

    test("shows the correct annotated text and placeholder when editing an existing annotation", () => {
      render(
        <AnnotationInput
          mode="annotating"
          currentAnnotationId={mockCurrentAnnotationId}
          annotationList={mockAnnotationList}
        />
      );

      expect(
        screen.getByText(
          mockAnnotationList[mockCurrentAnnotationId].annotatedText
        )
      ).toBeInTheDocument();

      expect(
        screen.getByPlaceholderText(
          mockAnnotationList[mockCurrentAnnotationId].annotationContent
        )
      ).toBeInTheDocument();
    });
  });

  describe("input controls", () => {
    let user;
    let setMode;
    let setAnnotationList;

    beforeEach(() => {
      user = userEvent.setup();
      setMode = vi.fn();
      setAnnotationList = vi.fn();
    });

    test("Add new annotation and resets mode when Post been clicked", async () => {
      vi.spyOn(crypto, "randomUUID").mockReturnValue("mock-id");

      render(
        <AnnotationInput
          mode="annotating"
          setMode={setMode}
          selectionPosition={mockPosition}
          selectedText={mockSelectedString.validSelection}
          annotationList={mockAnnotationList}
          setAnnotationList={setAnnotationList}
          currentAnnotationId={undefined}
        />
      );

      await user.type(screen.getByRole("textbox"), "mock annotation content");

      await user.click(
        screen.getByRole("button", {
          name: /post/i,
        })
      );

      expect(setMode).toHaveBeenCalledWith("idle");
      expect(setAnnotationList).toHaveBeenCalledOnce();

      const updatedAnnotationList = setAnnotationList.mock.calls[0][0];

      expect(updatedAnnotationList["mock-id"]).toMatchObject({
        annotatedText: mockSelectedString.validSelection,
        annotationContent: "mock annotation content",
        selectionPosition: mockPosition,
      });
    });

    test("Edit existing annotation and resets mode when Post been clicked", async () => {
      render(
        <AnnotationInput
          mode="annotating"
          setMode={setMode}
          selectionPosition={mockPosition}
          selectedText={mockSelectedString.validSelection}
          annotationList={mockAnnotationList}
          setAnnotationList={setAnnotationList}
          currentAnnotationId={mockCurrentAnnotationId}
        />
      );

      await user.type(
        screen.getByRole("textbox"),
        "mock edited annotation content"
      );

      await user.click(
        screen.getByRole("button", {
          name: /post/i,
        })
      );

      expect(setMode).toHaveBeenCalledWith("idle");
      expect(setAnnotationList).toHaveBeenCalledOnce();

      const updatedAnnotationList = setAnnotationList.mock.calls[0][0];

      expect(updatedAnnotationList[mockCurrentAnnotationId]).toMatchObject({
        ...mockAnnotationList[mockCurrentAnnotationId],
        annotationContent: "mock edited annotation content",
      });
    });
    test("discard change and resets mode when Cancel been clicked", async () => {
      render(
        <AnnotationInput
          mode="annotating"
          setMode={setMode}
          // selectionPosition={mockPosition}
          // selectedText={mockSelectedString.validSelection}
          // annotationList={mockAnnotationList}
          // currentAnnotationId={undefined}
        />
      );

      await user.click(
        screen.getByRole("button", {
          name: /cancel/i,
        })
      );

      expect(setMode).toHaveBeenCalledWith("idle");
    });
  });
});

describe("AnnotationDisplay", () => {
  describe("render based on mode", () => {
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
  });

  describe("displayed content", () => {
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

  describe("Edit and Delete behavior", () => {
    let user;
    let setMode;

    beforeEach(() => {
      user = userEvent.setup();
      setMode = vi.fn();
    });

    test("Set correct mode when Edit been clicked", async () => {
      render(
        <AnnotationDisplay
          mode="anno_display"
          setMode={setMode}
          annotationList={mockAnnotationList}
          currentAnnotationId={mockCurrentAnnotationId}
        />
      );

      await user.click(
        screen.getByRole("button", {
          name: /edit/i,
        })
      );

      expect(setMode).toHaveBeenCalledWith("annotating");
    });

    test("Delete annotation and resets mode when Delete been clicked", async () => {
      const setAnnotationList = vi.fn();
      render(
        <AnnotationDisplay
          mode="anno_display"
          setMode={setMode}
          annotationList={mockAnnotationList}
          setAnnotationList={setAnnotationList}
          currentAnnotationId={mockCurrentAnnotationId}
        />
      );

      await user.click(
        screen.getByRole("button", {
          name: /delete/i,
        })
      );
      const updatedAnnotationList = setAnnotationList.mock.calls[0][0];
      expect(updatedAnnotationList).toMatchObject(
        mockAnnotationListafterDeletion
      );
      expect(setMode).toHaveBeenCalledWith("idle");
    });
  });
});
