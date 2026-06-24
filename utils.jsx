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

// const highlightText = (textContent, annotationList, textId) => {
//   for (const [annoId, annoObject] of Object.entries(annotationList)) {
//     if (
//       textContent.includes(annoObject.annotatedText) === true &&
//       annoObject.annotationPosition.textposition === textId
//     ) {
//       const parts = textContent.split(annoObject.annotatedText);

//       return (
//         <>
//           {parts[0]}
//           <span className="highlighted" data-anno-id={annoId}>
//             {annoObject.annotatedText}
//           </span>
//           {parts[1]}
//         </>
//       );
//     }
//   }
//   return textContent;
// };

const highlightText = (textContent, annotationList, textId) => {
  let cursor = 0;
  let result = [];

  while (cursor < textContent.length) {
    let nextMatch = null;

    // 扫描所有 annotation
    for (const [annoId, annoObject] of Object.entries(annotationList)) {
      // 业务逻辑1：
      // 只处理属于当前 textId 的 annotation
      if (annoObject.annotationPosition.textposition !== textId) {
        continue;
      }

      // 从 cursor 之后查找 annotatedText
      let index = textContent.indexOf(annoObject.annotatedText, cursor);

      // 没找到
      if (index === -1) {
        continue;
      }

      // 找到更靠前的 match
      if (nextMatch === null || index < nextMatch.startIndex) {
        nextMatch = {
          startIndex: index,
          endIndex: index + annoObject.annotatedText.length,
          text: annoObject.annotatedText,
          id: annoId,
        };
      }
    }

    // 没有任何 match
    if (nextMatch === null) {
      result.push({
        type: "text",
        value: textContent.slice(cursor),
      });

      break;
    }

    // match 前面的普通文本
    if (nextMatch.startIndex > cursor) {
      result.push({
        type: "text",
        value: textContent.slice(cursor, nextMatch.startIndex),
      });
    }

    // highlight
    result.push({
      type: "highlight",
      value: nextMatch.text,
      id: nextMatch.id,
    });

    // 跳到 match 末尾
    cursor = nextMatch.endIndex;
  }

  return (
    <>
      {result.map((segment, index) => {
        if (segment.type === "highlight") {
          return (
            <span key={index} className="highlighted" data-anno-id={segment.id}>
              {segment.value}
            </span>
          );
        }

        return segment.value;
      })}
    </>
  );
};

export {
  getNextModeOnSelection,
  createAnnotation,
  getUpdatedAnnotationList,
  highlightText,
};
