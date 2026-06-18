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
  annotationPosition,
}) => ({
  annotatedText,

  annotationContent,
  annotationPosition,
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

const highlightText = (textContent, annotationList, textId) => {
  for (const [annoId, annoObject] of Object.entries(annotationList)) {
    if (
      textContent.includes(annoObject.annotatedText) === true &&
      annoObject.annotationPosition.textposition === textId
    ) {
      const parts = textContent.split(annoObject.annotatedText);

      return (
        <>
          {parts[0]}
          <span className="highlighted" data-anno-id={annoId}>
            {annoObject.annotatedText}
          </span>
          {parts[1]}
        </>
      );
    }
  }
  return textContent;
};


export {
  getNextModeOnSelection,
  createAnnotation,
  getUpdatedAnnotationList,
  highlightText,
};
