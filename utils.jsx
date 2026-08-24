import React from "react";

const annotationListinit = () => {
  const data = localStorage.getItem("annotationList");
  if (data === null) {
    return {};
  } else {
    return JSON.parse(data);
  }
};

const getRelativeOffsets = (range, textPositionNode) => {
  const preCaretRange = range.cloneRange();

  // 让克隆出来的选区，起点固定在最外层大容器的开头
  preCaretRange.selectNodeContents(textPositionNode);
  // 让克隆选区的终点，等于用户实际选中的起点
  preCaretRange.setEnd(range.startContainer, range.startOffset);

  // 此时，克隆选区内包含的所有文本字符长度，就是绝对的全局起始位置！
  // 注意：toString() 会自动平铺所有子元素的文本
  const globalStartIndex = preCaretRange.toString().length;

  // 同理，计算全局结束位置
  preCaretRange.setEnd(range.endContainer, range.endOffset);
  const globalEndIndex = preCaretRange.toString().length;

  const startIndex = globalStartIndex;
  const endIndex = globalEndIndex;

  return [startIndex, endIndex];
};

const getNextModeOnSelection = (selectedString) => {
  if (selectedString === "" || selectedString === null) {
    return "idle";
  }
  return "text_selected";
};

const createAnnotation = ({
  annotatedText,
  annotationContent,
  selectionPosition,
}) => ({
  annotatedText,
  annotationContent,
  selectionPosition,
  timestamp: Date.now(),
});
// const createAnnotation = (newAnnoData) => ({
//   annotatedText: newAnnoData.annotatedText,
//   annotationContent: newAnnoData.annotationContent,
//   annotationPosition: newAnnoData.annotationPosition,
//   timestamp: Date.now(),
// });

//createAnnotation简写

const getUpdatedAnnotationList = (
  annotationList,
  currentAnnotationId,
  newAnnoData
) => {
  // newAnnoData: { selectedText, annoContent, textPosition }
  if (currentAnnotationId === undefined) {
    const annoId = crypto.randomUUID();
    return { ...annotationList, [annoId]: createAnnotation(newAnnoData) };
  } else {
    const updatedAnnotationList = { ...annotationList };
    updatedAnnotationList[currentAnnotationId] = {
      ...updatedAnnotationList[currentAnnotationId],
      annotationContent: newAnnoData.annotationContent,
    };
    return updatedAnnotationList;
  }
};

const deleteAnnotation = (annotationList, currentAnnotationId) => {
  const updatedAnnotationList = { ...annotationList };
  delete updatedAnnotationList[currentAnnotationId];
  return updatedAnnotationList;
};

const groupAnnotationsByTextId = (annotationList) => {
  const grouped = {};

  Object.entries(annotationList).forEach(([annotationId, annotation]) => {
    const textId = annotation.selectionPosition.textPosition;
    if (!grouped[textId]) {
      grouped[textId] = {};
    }
    grouped[textId][annotationId] = annotation.selectionPosition.range;
  });

  return grouped;
};

const getHighlightLevel = (count) => {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3; // count >= 3
};
const computeSegments = (text, annotationsById, extraBoundaries = []) => {
  if (typeof text !== "string" || text.trim().length === 0) {
    //to-do: add log
    throw new TypeError("computeSegments: text must be a non-empty string.");
  }
  if (!Array.isArray(extraBoundaries)) {
    //to-do: add log
    throw new TypeError("computeSegments: extraBoundaries must be an array.");
  }

  if (extraBoundaries.some((boundary) => boundary > text.length)) {
    //to-do: add log
    throw new RangeError(
      "computeSegments: extraBoundaries must not contain values greater than text.length."
    );
  }
  const entries = Object.entries(annotationsById ?? {});

  const points = new Set([0, text.length, ...extraBoundaries]);

  entries.forEach(([, [start, end]]) => {
    points.add(start);
    points.add(end);
  });

  const sorted = [...points].sort((a, b) => a - b);

  const segments = [];

  for (let i = 0; i < sorted.length - 1; i++) {
    const segStart = sorted[i];
    const segEnd = sorted[i + 1];

    if (segStart === segEnd) continue;

    const coveringIds = entries
      .filter(([, [start, end]]) => start <= segStart && end >= segEnd)
      .map(([id]) => id);

    segments.push({
      start: segStart,
      end: segEnd,
      count: coveringIds.length,
      ids: coveringIds,
    });
  }

  return segments;
};



const renderSegments = (fullText, segs) => {
  if (typeof fullText !== "string" || fullText.trim().length === 0) {
    throw new TypeError("Can not render empty text or undefined.");
  }
  if (!Array.isArray(segs) || segs.length === 0) {
    //to-do: deep dive for react key
    return <span key="empty-segs">{fullText}</span>;
  }

  return segs.map((seg, i) => {
    const content = fullText.slice(seg.start, seg.end);
    if (seg.count === 0)
      return <React.Fragment key={i}>{content}</React.Fragment>;

    const level = getHighlightLevel(seg.count);
    return (
      <span
        key={i}
        className={`highlight highlight-${level}`}
        data-annotation-ids={seg.ids.join(",")}
      >
        {content}
      </span>
    );
  });
};

const processTextSegments = ({
  textChunks,
  annotationsById,
  computeSegmentsFn,
}) => {
  // 1. 严格拦截 textChunks
  if (!Array.isArray(textChunks) || textChunks.length === 0) {
    throw new TypeError("Can not process empty text or undefined.");
  }

  const fullText = textChunks.join("");

  // 🌟 核心优化：提前判断没有标注的情况（包含忘了传、传入 null、传入 undefined）
  if (!annotationsById) {
    // 根本不需要做任何复杂计算，直接把每个 chunk 映射成一个完整的 segment 即可
    
    let currentStart = 0;
    const segmentList = textChunks.map((chunk) => {
      const segEnd = currentStart + chunk.length;
      const chunkSegments =
        chunk.length > 0
          ? [{
              start: currentStart,
              end: segEnd,
              count: 0,
              ids: [],
            }]
          : [];
      currentStart = segEnd;
      
      return chunkSegments;
    });

    return { fullText, segmentList };
  }

  // 2. 以下是有标注时，才去跑的原本的复杂运算（保持你原有的逻辑不变）
  if (textChunks.length === 1) {
    const allSegments = computeSegmentsFn(fullText, annotationsById);
    return { fullText, segmentList: [allSegments] };
  }

  const boundaries = [];
  let currentLength = 0;
  for (let i = 0; i < textChunks.length; i++) {
    currentLength += textChunks[i].length;
    if (i < textChunks.length - 1) {
      boundaries.push(currentLength);
    }
  }

  const allSegments = computeSegmentsFn(fullText, annotationsById, boundaries);
  const allBoundaries = [...boundaries, fullText.length];
  const segmentList = [];
  let prevBoundary = 0;

  for (let i = 0; i < allBoundaries.length; i++) {
    const currentBoundary = allBoundaries[i];
    const currentSegments = allSegments.filter(
      (seg) => seg.start >= prevBoundary && seg.end <= currentBoundary
    );
    segmentList.push(currentSegments);
    prevBoundary = currentBoundary;
  }

  return { fullText, segmentList };
};

export {
  annotationListinit,
  getRelativeOffsets,
  renderSegments,
  computeSegments,
  processTextSegments,
  getHighlightLevel,
  getNextModeOnSelection,
  createAnnotation,
  getUpdatedAnnotationList,
  groupAnnotationsByTextId,
  deleteAnnotation,
};
