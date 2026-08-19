import { describe, expect, test, afterEach, vi, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { userEvent } from "@testing-library/user-event";
import React from "react";
import {
  AnnotationOfferer,
  AnnotationInput,
  AnnotationDisplay,
} from "../components/annoFeature";
import { ResumeText } from "../components/resumeText";

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
  //to-do: update test to verify multiple annotations display
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
    let setCurrentAnnotationId;

    beforeEach(() => {
      user = userEvent.setup();
      setMode = vi.fn();
      setCurrentAnnotationId = vi.fn();
    });

    test("Sets current annotation and switches mode when Edit been clicked", async () => {
      render(
        <AnnotationDisplay
          mode="anno_display"
          setMode={setMode}
          annotationList={mockAnnotationList}
          currentAnnotationId={mockAnnotationIdString}
          setCurrentAnnotationId={setCurrentAnnotationId}
        />
      );

      const editButtons = screen.getAllByRole("button", {
        name: /edit/i,
      });

      await user.click(editButtons[0]);
      expect(setCurrentAnnotationId).toHaveBeenCalledWith("anno-1");
      expect(setMode).toHaveBeenCalledWith("annotating");

      await user.click(editButtons[1]);
      expect(setCurrentAnnotationId).toHaveBeenCalledWith("anno-4");
      expect(setMode).toHaveBeenCalledWith("annotating");
    });

    test("Delete correct annotation and switchs mode when Delete been clicked", async () => {
      const setAnnotationList = vi.fn();
      vi.spyOn(utils, "deleteAnnotation").mockReturnValue(
        mockAnnotationListafterDeletion
      );
      render(
        <AnnotationDisplay
          mode="anno_display"
          setMode={setMode}
          annotationList={mockAnnotationList}
          setAnnotationList={setAnnotationList}
          currentAnnotationId={mockAnnotationIdString}
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
      expect(setMode).toHaveBeenCalledWith("idle");

      await user.click(deleteButtons[1]);
      expect(utils.deleteAnnotation).toHaveBeenCalledWith(
        mockAnnotationList,
        "anno-4"
      );
      expect(setMode).toHaveBeenCalledWith("idle");
    });
  });
});

describe("resumeText", () => {
  let mockProps;

  beforeEach(() => {
    mockProps = {
      annotationList: [],
      setCurrentAnnotationId: vi.fn(),
      setMode: vi.fn(),
      setSelectedText: vi.fn(),
      setSelectionPosition: vi.fn(),
    };
  });

  test("handleSelection setup states with valid selection", () => {
    const { container } = render(<ResumeText {...mockProps} />);
    const textPositionNode = container.querySelector(".resumeHeader");
    const textNode = textPositionNode.querySelector("h2").firstChild;
    // 3. 构建真正的 JSDOM DOM Range
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 3);
    range.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 0,
      left: 0,
      bottom: 10,
      right: 10,
      width: 10,
      height: 10,
    });
    // 4. Mock window.getSelection 返回这个 JSDOM Range
    const selectedString = textNode.textContent.slice(0, 3);
    vi.spyOn(window, "getSelection").mockReturnValue({
      toString: () => selectedString,
      getRangeAt: () => range,
    });
    // 5. 触发 mouseup 事件
    const resumeTextContainer = container.querySelector(".resumeText");
    fireEvent.mouseUp(resumeTextContainer);
    // 6. 断言 4 个 Setter 的调用（彻底忽略 viewportPosition）
    expect(mockProps.setSelectedText).toHaveBeenCalledWith(selectedString);
    expect(mockProps.setSelectionPosition).toHaveBeenCalledWith(
      expect.objectContaining({
        textPosition: "resume-header",
        range: [0, 3], // getRelativeOffsets 在 JSDOM 环境下真实计算出的相对索引
      })
    );
    expect(mockProps.setCurrentAnnotationId).toHaveBeenCalledWith(undefined);
    expect(mockProps.setMode).toHaveBeenCalledWith("text_selected"); // 可根据 getNextModeOnSelection 的返回值写具体期望值
  });
});
