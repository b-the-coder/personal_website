import { describe, expect, test, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { userEvent } from "@testing-library/user-event";

import React from "react";

import {
  AnnotationOfferer,
  AnnotationInput,
  AnnotationDisplay,
  AnnoFeature,
} from "../components/anno-feature";

import * as utils from "../utils";

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
  annotationContent: "this is a note1 for name and contact",
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

const mockAnnotation4 = {
  annotatedText: "name and contact",
  annotationContent: "this is a note2 for name and contact",
  selectionPosition: {
    viewportPosition: { x: 100, y: 200 },
    textPosition: "paragraph one",
    range: [0, 1],
  },
  timestamp: 1234567890,
};

const mockAnnotationList = {
  "anno-1": mockAnnotation1,
  "anno-2": mockAnnotation2,
  "anno-3": mockAnnotation3,
  "anno-4": mockAnnotation4,
};

const mockAnnotationListafterDeletion = {
  "anno-2": mockAnnotation2,
  "anno-3": mockAnnotation3,
};

const mockCurrentAnnotationId = "anno-1";
const mockAnnotationIdString = "anno-1,anno-4";

describe("AnnotationOfferer", () => {
  test("renders AnnotationOfferer at selected view port position when mode is text_selected", () => {
    const session = { kind: "text_selected", selectionPosition: mockPosition };
    render(<AnnotationOfferer session={session} />);
    expect(screen.queryByText("Add annotation")).toBeInTheDocument();
    expect(screen.queryByText("Add annotation")).toHaveStyle({
      position: "fixed",
      left: "100px",
      top: "100px",
    });
  });

  test("does not renders when mode is not text_selected", () => {
    const session = { kind: "random_mode" };
    render(<AnnotationOfferer session={session} />);
    expect(screen.queryByText("Add annotation")).toBeNull();
  });
  test("changes mode to annotating when clicked", async () => {
    const session = { kind: "text_selected", selectionPosition: mockPosition };
    const user = userEvent.setup();
    const setSession = vi.fn();

    render(<AnnotationOfferer session={session} setSession={setSession} />);

    await user.click(screen.getByText("Add annotation"));

    expect(setSession).toHaveBeenCalledWith({
      ...session,
      kind: "annotating",
    });
  });
});

describe("AnnotationInput", () => {
  describe("rendering based on mode", () => {
    test("renders when mode is annotating", () => {
      const session = {
        kind: "annotating",
        currentAnnotationId: undefined,
        selectedText: mockSelectedString.validSelection,
      };
      render(<AnnotationInput session={session} annotationList={{}} />);

      expect(screen.queryByText(/On:/)).toBeInTheDocument();
    });

    test("does not render when mode is not annotating", () => {
      const session = {
        kind: "idle",
        currentAnnotationId: undefined,
        selectedText: mockSelectedString.validSelection,
      };

      render(<AnnotationInput session={session} annotationList={{}} />);

      expect(screen.queryByText(/On:/)).toBeNull();
    });
  });

  describe("displayed content", () => {
    test("shows the correct annotated text and placeholder when adding a new annotation", () => {
      const session = {
        kind: "annotating",
        currentAnnotationId: undefined,
        selectedText: mockSelectedString.validSelection,
      };

      render(<AnnotationInput session={session} annotationList={{}} />);

      expect(
        screen.getByText(mockSelectedString.validSelection)
      ).toBeInTheDocument();

      expect(
        screen.getByPlaceholderText("Write your annotation...")
      ).toBeInTheDocument();
    });

    test("shows the correct annotated text and placeholder when editing an existing annotation", () => {
      const session = {
        kind: "annotating",
        currentAnnotationId: mockCurrentAnnotationId,
        selectedText: "",
        selectionPosition: null,
      };

      render(
        <AnnotationInput
          session={session}
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
    let setSession;
    let setAnnotationList;

    beforeEach(() => {
      user = userEvent.setup();
      setSession = vi.fn();
      setAnnotationList = vi.fn();
    });

    test("Add new annotation and resets mode when Post been clicked", async () => {
      vi.spyOn(crypto, "randomUUID").mockReturnValue("mock-id");
      const session = {
        kind: "annotating",
        selectedText: mockSelectedString.validSelection,
        selectionPosition: mockPosition,
        currentAnnotationId: undefined,
      };

      render(
        <AnnotationInput
          session={session}
          setSession={setSession}
          annotationList={mockAnnotationList}
          setAnnotationList={setAnnotationList}
        />
      );

      await user.type(screen.getByRole("textbox"), "mock annotation content");

      await user.click(
        screen.getByRole("button", {
          name: /post/i,
        })
      );

      expect(setSession).toHaveBeenCalledWith({
        kind: "idle",
        selectedText: "",
        selectionPosition: null,
        currentAnnotationId: undefined,
      });
      expect(setAnnotationList).toHaveBeenCalledOnce();

      const updatedAnnotationList = setAnnotationList.mock.calls[0][0];

      expect(updatedAnnotationList["mock-id"]).toMatchObject({
        annotatedText: mockSelectedString.validSelection,
        annotationContent: "mock annotation content",
        selectionPosition: mockPosition,
      });
    });

    test("Edit existing annotation and resets mode when Post been clicked", async () => {
      const session = {
        kind: "annotating",
        selectedText: mockSelectedString.validSelection,
        selectionPosition: mockPosition,
        currentAnnotationId: mockCurrentAnnotationId,
      };
      render(
        <AnnotationInput
          session={session}
          setSession={setSession}
          annotationList={mockAnnotationList}
          setAnnotationList={setAnnotationList}
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

      expect(setSession).toHaveBeenCalledWith({
        kind: "idle",
        selectedText: "",
        selectionPosition: null,
        currentAnnotationId: undefined,
      });
      expect(setAnnotationList).toHaveBeenCalledOnce();

      const updatedAnnotationList = setAnnotationList.mock.calls[0][0];

      expect(updatedAnnotationList[mockCurrentAnnotationId]).toMatchObject({
        ...mockAnnotationList[mockCurrentAnnotationId],
        annotationContent: "mock edited annotation content",
      });
    });
    test("discard change and resets mode when Cancel been clicked", async () => {
      //if anno input is opened from edit existing annotation
      const session = {
        kind: "annotating",
        selectedText: "",
        selectionPosition: null,
        currentAnnotationId: mockCurrentAnnotationId,
      };
      render(
        <AnnotationInput
          session = {session}
          setSession={setSession}
          annotationList={mockAnnotationList}
          
        />
      );

      await user.click(
        screen.getByRole("button", {
          name: /cancel/i,
        })
      );

      expect(setSession).toHaveBeenCalledWith({
        kind: "idle",
        selectedText: "",
        selectionPosition: null,
        currentAnnotationId: undefined,
      });
    });
  });
});

describe("AnnotationDisplay", () => {
  describe("render based on mode", () => {
    const session = {
      kind: "anno_display",
      selectedText: "",
      selectionPosition: null,
      currentAnnotationId: mockCurrentAnnotationId,
    };
    test("renders when mode is anno_display", () => {
      render(
        <AnnotationDisplay
          annotationList={mockAnnotationList}
          session={session}
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
    test("does not renders when mode is not anno_display", () => {
      const session = {
        kind: "random_mode",
        selectedText: "",
        selectionPosition: null,
        currentAnnotationId: undefined,
      };
      render(
        <AnnotationDisplay
          session={session}
          annotationList={mockAnnotationList}
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
  //to-do: update test to verify multiple annotations display
  describe("displayed content", () => {
    test("Show the right annotated text and annotation content when render", () => {
      const session = {
        kind: "anno_display",
        selectedText: "",
        selectionPosition: null,
        currentAnnotationId: mockCurrentAnnotationId,
      };
      render(
        <AnnotationDisplay
          session={session}
          annotationList={mockAnnotationList}
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
    let setSession;

    beforeEach(() => {
      user = userEvent.setup();
      setSession = vi.fn();
    });

    test("sets session to annotating with the clicked annotation ID when Edit is clicked", async () => {
      const session = {
        kind: "anno_display",
        selectedText: "",
        selectionPosition: null,
        currentAnnotationId: mockAnnotationIdString,
      };
      render(
        <AnnotationDisplay
          session={session}
          setSession={setSession}
          annotationList={mockAnnotationList}
        />
      );

      const editButtons = screen.getAllByRole("button", {
        name: /edit/i,
      });

      await user.click(editButtons[0]);
      expect(setSession).toHaveBeenNthCalledWith(1, {
        kind: "annotating",
        selectedText: "",
        selectionPosition: null,
        currentAnnotationId: "anno-1",
      });

      await user.click(editButtons[1]);
      expect(setSession).toHaveBeenNthCalledWith(2, {
        kind: "annotating",
        selectedText: "",
        selectionPosition: null,
        currentAnnotationId: "anno-4",
      });
    });

    test("Delete correct annotation and switchs mode when Delete been clicked", async () => {
      const setAnnotationList = vi.fn();

      const session = {
        kind: "anno_display",
        selectedText: "",
        selectionPosition: null,
        currentAnnotationId: mockAnnotationIdString,
      };
      const setSession = vi.fn();

      vi.spyOn(utils, "deleteAnnotation").mockReturnValue(
        mockAnnotationListafterDeletion
      );
      render(
        <AnnotationDisplay
          session={session}
          setSession={setSession}
          annotationList={mockAnnotationList}
          setAnnotationList={setAnnotationList}
        />
      );

      const deleteButtons = screen.getAllByRole("button", {
        name: /delete/i,
      });

      await user.click(deleteButtons[0]);

      expect(utils.deleteAnnotation).toHaveBeenCalledWith(
        mockAnnotationList,
        "anno-1"
      );
      expect(setAnnotationList).toHaveBeenCalledWith(
        mockAnnotationListafterDeletion
      );
      expect(setSession).toHaveBeenCalledWith({
        kind: "idle",
        selectedText: "",
        selectionPosition: null,
        currentAnnotationId: undefined,
      });

      await user.click(deleteButtons[1]);

      expect(utils.deleteAnnotation).toHaveBeenCalledWith(
        mockAnnotationList,
        "anno-4"
      );
      expect(setAnnotationList).toHaveBeenCalledWith(
        mockAnnotationListafterDeletion
      );
      expect(setSession).toHaveBeenCalledWith({
        kind: "idle",
        selectedText: "",
        selectionPosition: null,
        currentAnnotationId: undefined,
      });
    });
  });
});

test("AnnoFeature", () => {
  const result = AnnoFeature({});

  const children = result.props.children;

  expect(children[0].type).toBe(AnnotationOfferer);
  expect(children[1].type).toBe(AnnotationInput);
  expect(children[2].type).toBe(AnnotationDisplay);
});
