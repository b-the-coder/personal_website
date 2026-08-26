import { describe, expect, test, afterEach, vi, beforeEach } from "vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import React from "react";

import { ResumeText, Header, Contact,Skills } from "../components/resumeText";
import * as utils from "../utils";
import resumeData from "../resumeData.json";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});


function expectRenderSegmentsCalledInOrder(spy, fullText, segmentList) {
  segmentList.forEach((seg, i) => {
    expect(spy).toHaveBeenNthCalledWith(i + 1, fullText, seg);
  });
}

const mockFullText = "fake-full-text";
const mockTextChunk1Seg = [{ start: 0, end: 1, count: 0, ids: [] }];
const mockTextChunk2Seg = [{ start: 1, end: 2, count: 0, ids: [] }];
const mockTextChunk3Seg = [{ start: 2, end: 3, count: 0, ids: [] }];


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

describe("Header", () => {
  const segmentList = [mockTextChunk1Seg, mockTextChunk2Seg, mockTextChunk3Seg];

  test("invokes renderSegments in segmentList order", () => {
    vi.spyOn(utils, "processTextSegments").mockReturnValue({
      fullText: mockFullText,
      segmentList,
    });
    const renderSegmentsSpy = vi.spyOn(utils, "renderSegments");

    render(<Header annotationList={{}} />);

    expectRenderSegmentsCalledInOrder(renderSegmentsSpy, mockFullText, segmentList);
    expect(renderSegmentsSpy).toHaveBeenCalledTimes(segmentList.length);
  });

  test("renders name in h2, then email and location in p tags, in that order", () => {
    const { container } = render(<Header annotationList={{}} />);
    const elements = container.querySelectorAll("h2, p");

    expect(elements[0].tagName).toBe("H2");
    expect(elements[0].textContent).toBe(resumeData.name);
    expect(elements[1].tagName).toBe("P");
    expect(elements[1].textContent).toBe(resumeData.contact.email);
    expect(elements[2].tagName).toBe("P");
    expect(elements[2].textContent).toBe(resumeData.contact.location);
  });
});

describe("Contact", () => {
  const segmentList = [mockTextChunk1Seg, mockTextChunk2Seg];

  test("invokes renderSegments in segmentList order", () => {
    vi.spyOn(utils, "processTextSegments").mockReturnValue({
      fullText: mockFullText,
      segmentList,
    });
    const renderSegmentsSpy = vi.spyOn(utils, "renderSegments");

    render(<Contact annotationList={{}} />);

    expectRenderSegmentsCalledInOrder(renderSegmentsSpy, mockFullText, segmentList);
    expect(renderSegmentsSpy).toHaveBeenCalledTimes(segmentList.length);
  });

  test("renders github then linkedin in p tags, in that order", () => {
    const { container } = render(<Contact annotationList={{}} />);
    const elements = container.querySelectorAll("p");

    expect(elements[0].tagName).toBe("P");
    expect(elements[0].textContent).toBe(resumeData.contact.github);
    expect(elements[1].tagName).toBe("P");
    expect(elements[1].textContent).toBe(resumeData.contact.linkedin);
  });
});

// describe("Skills", () => {
//   const segmentList = [mockTextChunk1Seg, mockTextChunk2Seg];

//   test("invokes renderSegments in segmentList order", () => {
//     vi.spyOn(utils, "processTextSegments").mockReturnValue({
//       fullText: mockFullText,
//       segmentList,
//     });
//     const renderSegmentsSpy = vi.spyOn(utils, "renderSegments");

//     render(<Skills annotationList={{}} />);

//     expectRenderSegmentsCalledInOrder(renderSegmentsSpy, mockFullText, segmentList);
    
//   });})
