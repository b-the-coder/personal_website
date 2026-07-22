import { describe, expect, test, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";
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
  vi.restoreAllMocks();
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

const mockAnnotation123 = {
  annotatedText: "name and contact",
  annotationContent: "this is a note for resume header",
  annotationPosition: {
    viewportposition: { x: 1, y: 2 },
    textposition: "rsmHeader",
  },
  timestamp: 1234567890,
};

const mockAnnotation456 = {
  annotatedText: "links",
  annotationContent: "this is a note for resume header",
  annotationPosition: {
    viewportposition: { x: 4, y: 5 },
    textposition: "rsmHeader",
  },
  timestamp: 1234567890,
};

const mockAnnotation789 = {
  annotatedText: "location",
  annotationContent: "this is a note for resume header",
  annotationPosition: {
    viewportposition: { x: 7, y: 8 },
    textposition: "rsmHeader",
  },
  timestamp: 1234567890,
};

const mockAnnotationList = {
  "anno-123": mockAnnotation123,
  "anno-456": mockAnnotation456,
  "anno-789": mockAnnotation789,
};

const mockAnnotationListafterDeletion = {
  "anno-456": mockAnnotation456,
  "anno-789": mockAnnotation789,
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
        annotationPosition: mockPosition,
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
  test("highlight only the annotated text when there multiple same text in a sentence ", () => {
    const mockTextContent = " 1st name and contact 2nd name and contact";
    const mockTextId = "rsmHeader";
    const processedTextContent = highlightText(
      mockTextContent,
      mockAnnotationList,
      mockTextId
    );
    render(<>{processedTextContent}</>);
    expect(document.querySelectorAll(".highlighted")).toHaveLength(1);
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
