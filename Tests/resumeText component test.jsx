import { describe, expect, test, afterEach, vi, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import React from "react";

import { ResumeText } from "../components/resumeText";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
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