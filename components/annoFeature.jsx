import React from "react";
import { useState, useRef } from "react";

const createAnnotation = (
  annotatedText,
  annotationContent,
  annotationPosition
) => ({
  annotatedText: annotatedText,
  annotationContent: annotationContent,
  annotationPosition: annotationPosition,
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
        left: selectionPosition.viewportposition.x + "px",
        top: selectionPosition.viewportposition.y + "px",
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
  currentAnnotationId,
  setCurrentAnnotationId,
}) {
  //hook只能在组件顶层调用，所有hook必须在任何可能提前return的条件判断之前。
  const annotationRef = useRef(null);

  if (mode != "annotating") {
    return null;
  }

  const onPostClick = () => {
    //拿到用户输入的标注内容
    const annoContent = annotationRef.current.value;
    //先检查post是修改已有标注还是新增标注
    if (currentAnnotationId === "") //用用户提交的annotation更新annotationList
    {
      const annoId = crypto.randomUUID();
      const annoObject = createAnnotation(
        selectedText,
        annoContent,
        selectionPosition.textposition
      );
      setAnnotationList((prevList) => ({ ...prevList, [annoId]: annoObject }));
      //直接传更新后的state，不推荐
      //setAnnotationList({...annotationList,[annoId]:annoObject});
    } else {
      const editedAnnotationList = { ...annotationList };
      editedAnnotationList[currentAnnotationId].annotationContent = annoContent;
      setAnnotationList(editedAnnotationList);
    }
    // 状态回到 “idle”
    setMode("idle");
    //todo： 加一个alert告诉用户annotating被储存
  };
  const onCancelClick = () => {
    setMode("idle");
  };

  const isEditing = currentAnnotationId !== "";
  const displayText = isEditing
    ? annotationList[currentAnnotationId].annotatedText
    : selectedText;
  const placeholderText = isEditing
    ? annotationList[currentAnnotationId].annotationContent
    : "Write your annotation...";

  return (
    <div className="annotation-input">
      <p className="annotation-input__selected-text">
        On: <em>&ldquo;{displayText}&rdquo;</em>
      </p>
      <textarea
        ref={annotationRef}
        className="annotation-input__textarea"
        placeholder={placeholderText}
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

function AnnotationDisplay({
  mode,
  setMode,
  annotationList,
  setAnnotationList,
  currentAnnotationId,
  setCurrentAnnotationId,
}) {
  if (mode != "anno_display") {
    return null;
  }
  const handleDeleteClick = () => {
    setMode("idle");
    const updatedAnnotationList = { ...annotationList };
    delete updatedAnnotationList[currentAnnotationId];
    setAnnotationList(updatedAnnotationList);
  };
  const handleEditClick = () => {
    setMode("annotating");
  };

  return (
    <div className="annotation-display">
      <p className="annotation-display__selected-text">
        <strong>
          <em>On:</em>
        </strong>{" "}
        <em>{annotationList[currentAnnotationId].annotatedText}</em>
      </p>
      <p className="annotation-display__content">
        <strong>
          <em>You annotated:</em>
        </strong>{" "}
        {annotationList[currentAnnotationId].annotationContent}
      </p>

      <div className="annotation-display__actions">
        <button
          className="annotation-display__edit-btn"
          onClick={handleEditClick}
        >
          Edit
        </button>
        <button
          className="annotation-display__delete-btn"
          onClick={handleDeleteClick}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export { AnnotationOfferer, AnnotationInput, AnnotationDisplay };
