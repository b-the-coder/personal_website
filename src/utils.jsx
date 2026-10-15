import React from "react";

const initializeAnnotationList = () => {
  const storedAnnotationListJson = localStorage.getItem("annotationList");
  if (storedAnnotationListJson === null) {
    return {};
  } else {
    return JSON.parse(storedAnnotationListJson);
  }
};

/**
 * @param {Range} range
 * @param {Element} textPositionNode
 * @returns {import("./types").RangeOffsets}
 */
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

const getNextModeOnSelection = (userSelection) => {
  if (userSelection.isCollapsed === true || !userSelection.toString().trim()) {
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

const upsertAnnotation = (
  annotationList,
  currentAnnotationId,
  newAnnotation
) => {
  if (currentAnnotationId === undefined) {
    const annotationId = crypto.randomUUID();
    return {
      ...annotationList,
      [annotationId]: createAnnotation(newAnnotation),
    };
  } else {
    const updatedAnnotationList = { ...annotationList };
    updatedAnnotationList[currentAnnotationId] = {
      ...updatedAnnotationList[currentAnnotationId],
      annotationContent: newAnnotation.annotationContent,
    };
    return updatedAnnotationList;
  }
};

const deleteAnnotation = (annotationList, currentAnnotationId) => {
  const updatedAnnotationList = { ...annotationList };
  delete updatedAnnotationList[currentAnnotationId];
  return updatedAnnotationList;
};

/**
 * @param {import("./types").AnnotationList} annotationList
 * @returns {import("./types").GroupedAnnotationsByTextId}
 */
const groupAnnotationsByTextId = (annotationList) => {
  /** @type {import("./types").GroupedAnnotationsByTextId} */

  const annotationsByTextId = {};

  Object.entries(annotationList).forEach(([annotationId, annotation]) => {
    const textId = annotation.selectionPosition.textPosition;

    if (!annotationsByTextId[textId]) {
      annotationsByTextId[textId] = {};
    }
    annotationsByTextId[textId][annotationId] =
      annotation.selectionPosition.range;
  });

  return annotationsByTextId;
};

const getHighlightLevel = (count) => {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
};

/**
 * Splits fullText at annotation and chunk boundaries.
 * Annotation offset ranges and chunk boundaries are calculate base on the correspinding full text.
 */
const computeSegments = (fullText, annotationRanges, chunkBoundaries = []) => {
  if (typeof fullText !== "string" || fullText.trim().length === 0) {
    throw new TypeError("computeSegments: text must be a non-empty string.");
  }
  if (!Array.isArray(chunkBoundaries)) {
    throw new TypeError("computeSegments: chunkBoundaries must be an array.");
  }

  if (chunkBoundaries.some((boundary) => boundary > fullText.length)) {
    throw new RangeError(
      "computeSegments: chunkBoundaries must not contain values greater than text.length."
    );
  }
  const annotationEntries = Object.entries(annotationRanges ?? {});

  const boundaryPoints = new Set([0, fullText.length, ...chunkBoundaries]);

  annotationEntries.forEach(([, [start, end]]) => {
    boundaryPoints.add(start);
    boundaryPoints.add(end);
  });

  const sortedBoundaryPoints = [...boundaryPoints].sort((a, b) => a - b);

  const segments = [];

  for (let i = 0; i < sortedBoundaryPoints.length - 1; i++) {
    const segStart = sortedBoundaryPoints[i];
    const segEnd = sortedBoundaryPoints[i + 1];

    if (segStart === segEnd) continue;

    const coveringIds = annotationEntries
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

/**
 * Render fullText with correct highlight level and annotation IDs using the supplied segments from computeSegment.
 *  The segments must be computed against the same fullText passed here.
 */
const renderSegments = (fullText, segs) => {
  if (typeof fullText !== "string" || fullText.trim().length === 0) {
    throw new TypeError("Can not render empty text or undefined.");
  }
  if (!Array.isArray(segs) || segs.length === 0) {
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

/**
 * Joins text chunks with same textId into the full text, computes annotation segments, and groups the segments
 * back by chunk so each chunk can retain its markup.
 * The joined chunks must match the block's textContent in content and order,
 * because annotation ranges are measured against that complete text block.
 */
const processTextSegments = ({
  textChunks,
  annotationsForTextId,
  computeSegmentsFn,
}) => {
  if (!Array.isArray(textChunks) || textChunks.length === 0) {
    throw new TypeError("Can not process empty text or undefined.");
  }

  const fullText = textChunks.join("");

  // Preserve one globally positioned segment per non-empty chunk when no
  // annotations need to be computed.
  if (!annotationsForTextId) {
    let currentStart = 0;
    const segmentList = textChunks.map((chunk) => {
      const segEnd = currentStart + chunk.length;
      const chunkSegments =
        chunk.length > 0
          ? [
              {
                start: currentStart,
                end: segEnd,
                count: 0,
                ids: [],
              },
            ]
          : [];
      currentStart = segEnd;

      return chunkSegments;
    });

    return { fullText, segmentList };
  }

  // A single chunk needs no additional boundary to preserve its markup.
  if (textChunks.length === 1) {
    const allSegments = computeSegmentsFn(fullText, annotationsForTextId);
    return { fullText, segmentList: [allSegments] };
  }

  // Add chunk boundaries so annotation segments never cross markup changes.
  const boundaries = [];
  let currentLength = 0;
  for (let i = 0; i < textChunks.length; i++) {
    currentLength += textChunks[i].length;
    if (i < textChunks.length - 1) {
      boundaries.push(currentLength);
    }
  }

  const allSegments = computeSegmentsFn(
    fullText,
    annotationsForTextId,
    boundaries
  );
  const allBoundaries = [...boundaries, fullText.length];
  const segmentList = [];
  let prevBoundary = 0;

  // Restore one segment list per original chunk while keeping global offsets.
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
  initializeAnnotationList,
  getRelativeOffsets,
  renderSegments,
  computeSegments,
  processTextSegments,
  getHighlightLevel,
  getNextModeOnSelection,
  createAnnotation,
  upsertAnnotation,
  groupAnnotationsByTextId,
  deleteAnnotation,
};
