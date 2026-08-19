import React from "react";
import { useState, useRef } from "react";
import { getUpdatedAnnotationList, deleteAnnotation } from "../utils";

function Annofeature({
  mode,
  setMode,
  annotationList,
  setAnnotationList,
  currentAnnotationId,
  setCurrentAnnotationId,
  selectedText,
  setSelectedText,
  selectionPosition,
  setSelectionPosition,
}) {
  return (
    <div className="annoFeature">
      <AnnotationOfferer
        mode={mode}
        setMode={setMode}
        selectedText={selectedText}
        setSelectedText={setSelectedText}
        selectionPosition={selectionPosition}
        setSelectionPosition={setSelectionPosition}
      />
      <AnnotationInput
        mode={mode}
        setMode={setMode}
        annotationList={annotationList}
        setAnnotationList={setAnnotationList}
        selectedText={selectedText}
        setSelectedText={setSelectedText}
        selectionPosition={selectionPosition}
        setSelectionPosition={setSelectionPosition}
        currentAnnotationId={currentAnnotationId}
        setCurrentAnnotationId={setCurrentAnnotationId}
      />
      <AnnotationDisplay
        mode={mode}
        setMode={setMode}
        annotationList={annotationList}
        setAnnotationList={setAnnotationList}
        currentAnnotationId={currentAnnotationId}
        setCurrentAnnotationId={setCurrentAnnotationId}
      />
    </div>
  );
}
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
        left: selectionPosition.viewportPosition.x + "px",
        top: selectionPosition.viewportPosition.y + "px",
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
  setcurrentAnnotationId,
}) {
  //hook只能在组件顶层调用，所有hook必须在任何可能提前return的条件判断之前。
  const annotationRef = useRef(null);

  if (mode != "annotating") {
    return null;
  }

  const onPostClick = () => {
    //拿到用户输入的标注内容
    const annoContent = annotationRef.current.value;
    // 声明要传进createAnnotation里的新annodata
    const newAnno = {
      annotatedText: selectedText,
      annotationContent: annoContent,
      selectionPosition: selectionPosition,
    };
    //返回更新后的annotationlist
    const updated = getUpdatedAnnotationList(
      annotationList,
      currentAnnotationId,
      newAnno
    );
    setAnnotationList(updated);

    // 状态回到 “idle”
    setMode("idle");

    //todo： 加一个alert告诉用户annotating被储存
  };
  const onCancelClick = () => {
    setMode("idle");
  };

  const isEditing = currentAnnotationId !== undefined;

  const displayText = isEditing
    ? annotationList[currentAnnotationId].annotatedText
    : selectedText;
  const placeholderText = isEditing
    ? annotationList[currentAnnotationId].annotationContent
    : "Write your annotation...";

  return (
    <div className="annotation-input">
      <p className="annotation-input__selected-text">
        On: <em>{displayText}</em>
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

  const displayAnnotationIds = currentAnnotationId.split(",");

  const handleDeleteClick = (annoId) => {
    const updatedAnnotationList = deleteAnnotation(annotationList, annoId);
    setAnnotationList(updatedAnnotationList);
    setMode("idle");
  };
  const handleEditClick = (annoId) => {
    setCurrentAnnotationId(annoId);
    setMode("annotating");
  };

  return displayAnnotationIds.map((annoId) => (
    <div className="annotation-display" key={annoId}>
      <p className="annotation-display__selected-text">
        <strong>
          <em>On:</em>
        </strong>{" "}
        <em>{annotationList[annoId].annotatedText}</em>
      </p>
      <p className="annotation-display__content">
        <strong>
          <em>You annotated:</em>
        </strong>{" "}
        {annotationList[annoId].annotationContent}
      </p>

      <div className="annotation-display__actions">
        <button
          className="annotation-display__edit-btn"
          onClick={() => {
            handleEditClick(annoId);
          }}
        >
          Edit
        </button>
        <button
          className="annotation-display__delete-btn"
          onClick={() => {
            handleDeleteClick(annoId);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  ));
}

export {
  Annofeature,
  AnnotationOfferer,
  AnnotationInput,
  AnnotationDisplay,
  getUpdatedAnnotationList,
};
