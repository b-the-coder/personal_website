import React from "react";

const getNextModeOnSelection = (selectedString) => {
  if (selectedString === "" || selectedString === null) {
    return "idle";
  }
  return "text_selected";
};

// const createAnnotation = (newAnnoData) => ({
//   annotatedText: newAnnoData.annotatedText,
//   annotationContent: newAnnoData.annotationContent,
//   annotationPosition: newAnnoData.annotationPosition,
//   timestamp: Date.now(),
// });

//createAnnotation简写
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

const getHighlightLevel = (count) => {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3; // count >= 3
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

export {
  renderSegments,
  computeSegments,
  getHighlightLevel,
  getNextModeOnSelection,
  createAnnotation,
  getUpdatedAnnotationList,
  groupAnnotationsByTextId,
  deleteAnnotation,
};
