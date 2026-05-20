import React from "react";
import { useState, useRef } from "react";

const createAnnotation = (annotatedText, annotation) => ({
  annotatedText: annotatedText,
  annotation: annotation,
  timestamp: Date.now(),
});



function AnnotationOfferer({
  mode,
  setMode,
  selectedText,
  setSelectedText,
  selectionPosition,
  setSelectedPosition,
}) {
  const handleClick = () => {
    setMode("annotating");
  };
  if (mode != "text_selected") {
    return null;
  }
  return (
    <span
      onClick={handleClick}
      className="annotation-offerer"
      style={{
        position: "fixed",
        left: selectionPosition.x + "px",
        top: selectionPosition.y + "px",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path
          d="M6 1v10M1 6h10"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      Add annotation
    </span>
  );
}

function AnnotationInput({
  mode,
  setMode,
  annotationList,
  setAnnotationList,
  selectedText,
  setSelectedText,
  selectionPosition,
  setSelectionPosition,
}) {
  //hook只能在组件顶层调用，所有hook必须在任何可能提前return的条件判断之前。
  const annotationRef = useRef(null);

  if (mode != "annotating") {
    return null;
  }
  

  const onPostClick = () => {
    //用用户提交的annotation更新annotationList
    const annoId = crypto.randomUUID();
    const annoContent = annotationRef.current.value;
    const annoObject = createAnnotation(selectedText, annoContent);
    console.log("annoId",annoId)
    console.log("annoObject", annoObject)
    setAnnotationList((prevList) => ({ ...prevList, [annoId]: annoObject }));
    //直接传更新后的state，不推荐
    //setAnnotationList({...annotationList,[annoId]:annoObject});
    // 状态回到 “idle”
    setMode("idle");
    //todo： 加一个alert告诉用户annotating被储存
  };
  const onCancelClick = () => {
    setMode("idle");
  };
  return (
    <div className="annotation-input">
      <p className="annotation-input__title">Add annotation on</p>

      <p className="annotation-input__selected-text">
        On: <em>&ldquo;{selectedText}&rdquo;</em>
      </p>

      <textarea
        ref={annotationRef}
        className="annotation-input__textarea"
        placeholder="Write your annotation..."
      />

      <div className="annotation-input__actions">
        <button onClick={onPostClick} className="annotation-input__post-btn">
          Post
        </button>
        <button
          className="annotation-input__cancel-btn"
          onClick={onCancelClick}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function AnnotationDisplay() {
  return (
    <div className="annotation-display">
      <p className="annotation-display__selected-text">
        On: <em>&ldquo;selected text will appear here...&rdquo;</em>
      </p>

      <p className="annotation-display__content">
        Annotation content will appear here.
      </p>

      <div className="annotation-display__actions">
        <button className="annotation-display__delete-btn">Delete</button>
        <button className="annotation-display__edit-btn">Edit</button>
      </div>
    </div>
  );
}

export { AnnotationOfferer, AnnotationInput, AnnotationDisplay };
