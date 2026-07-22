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

// utils.jsx
const computeSegments = (
  text,
  annotationsById,
  extraBoundaries = []
) => {
  const entries = Object.entries(annotationsById ?? {});

  const points = new Set([
    0,
    text.length,
    ...extraBoundaries,
  ]);

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
      .filter(
        ([, [start, end]]) =>
          start <= segStart && end >= segEnd
      )
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



function highlightFlatText(text, annotationsById) {

  const segments = computeSegments(text, annotationsById);
  

  return segments.map((seg, i) => {
    if (seg.count === 0) {
      return <React.Fragment key={i}>{text.slice(seg.start, seg.end)}</React.Fragment>;
    }

    const level = getHighlightLevel(seg.count);

    return (
      <span key={i} className={`highlight highlight-${level}`} data-annotation-ids={seg.ids.join(",")}>
        {text.slice(seg.start, seg.end)}
      </span>
    );
  });
}
//function renderSegments(segs, fullText) {
  //return segs.map((seg, i) => {
    //const content = fullText.slice(seg.start, seg.end);
    //if (seg.count === 0)
      //return <React.Fragment key={i}>{content}</React.Fragment>;

    //const level = getHighlightLevel(seg.count);
    //return (
      //<span
        //key={i}
        //className={`highlight highlight-${level}`}
        //data-annotation-ids={seg.ids.join(",")}
      //>
        //{content}
      //</span>
   // );
 // });
  
//}





export {
  computeSegments,
  getHighlightLevel,
  getNextModeOnSelection,
  createAnnotation,
  getUpdatedAnnotationList,
  groupAnnotationsByTextId,
  deleteAnnotation,
  highlightFlatText,
};
