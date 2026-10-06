import React from "react";
import { useRef } from "react";
import { getUpdatedAnnotationList, deleteAnnotation } from "../utils";
import type { AnnotationStateContext } from "./types";

// Pick only the fields this component needs
type AnnotationOffererProps = Pick<
  AnnotationStateContext,
  "mode" | "setMode" | "selectionPosition"
>;
type AnnotationInputProps = Pick<
  AnnotationStateContext,
  | "mode"
  | "setMode"
  | "annotationList"
  | "setAnnotationList"
  | "selectedText"
  | "selectionPosition"
  | "currentAnnotationId"
>;

type AnnotationDisplayProps = Pick<
  AnnotationStateContext,
  | "mode"
  | "setMode"
  | "annotationList"
  | "setAnnotationList"
  | "currentAnnotationId"
  | "setCurrentAnnotationId"
>;

function AnnoFeature({
  session,
  setSession,
  annotationList,
  setAnnotationList,
}: AnnotationStateContext) {
  return (
    <div className="annoFeature">
      <AnnotationOfferer session={session} setSession={setSession} />
      <AnnotationInput
        session={session}
        setSession={setSession}
        annotationList={annotationList}
        setAnnotationList={setAnnotationList}
      />
      <AnnotationDisplay
        session={session}
        setSession={setSession}
        annotationList={annotationList}
        setAnnotationList={setAnnotationList}
      />
    </div>
  );
}
function AnnotationOfferer({ session, setSession }: AnnotationOffererProps) {
  if (session.kind != "text_selected") {
    return null;
  }
  const handleClick = () => {
    setSession({
      ...session,
      kind: "annotating",
    });
  };

  return (
    <span
      onClick={handleClick}
      className="annotation-offerer"
      style={{
        position: "fixed",
        left: session.selectionPosition.viewportPosition.x + "px",
        top: session.selectionPosition.viewportPosition.y + "px",
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
  annotationList,
  setAnnotationList,
  session,
  setSession,
}: AnnotationInputProps) {
  //hook只能在组件顶层调用，所有hook必须在任何可能提前return的条件判断之前。
  const annotationRef = useRef<HTMLTextAreaElement>(null);

  if (session.kind != "annotating") {
    return null;
  }

  const onPostClick = () => {
    //拿到用户输入的标注内容

    const annoContent = annotationRef.current?.value;

    // 声明要传进createAnnotation里的新annodata
    const newAnno = {
      annotatedText: session.selectedText,
      annotationContent: annoContent,
      selectionPosition: session.selectionPosition,
    };
    //返回更新后的annotationlist
    const updated = getUpdatedAnnotationList(
      annotationList,
      session.currentAnnotationId,
      newAnno
    );
    setAnnotationList(updated);
    // 状态回到 “idle”

    setSession({
      kind: "idle",
      selectedText: "",
      selectionPosition: null,
      currentAnnotationId: undefined,
    });

    //todo： 加一个alert告诉用户annotating被储存
  };
  const onCancelClick = () => {
    // setMode("idle");
    setSession({
      kind: "idle",
      selectedText: "",
      selectionPosition: null,
      currentAnnotationId: undefined,
    });
  };

  const isEditing = session.currentAnnotationId !== undefined;

  const displayText = isEditing
    ? annotationList[session.currentAnnotationId].annotatedText
    : session.selectedText;
  const placeholderText = isEditing
    ? annotationList[session.currentAnnotationId].annotationContent
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
  annotationList,
  setAnnotationList,
  session,
  setSession,
}: AnnotationDisplayProps) {
  if (session.kind != "anno_display") {
    return null;
  }

  const displayAnnotationIds = session.currentAnnotationId.split(",");

  const handleDeleteClick = (annoId: string) => {
    const updatedAnnotationList = deleteAnnotation(annotationList, annoId);
    setAnnotationList(updatedAnnotationList);

    setSession({
      kind: "idle",
      selectedText: "",
      selectionPosition: null,
      currentAnnotationId: undefined,
    });
  };
  const handleEditClick = (annoId: string) => {
    setSession({
      kind: "annotating",
      selectedText: "",
      selectionPosition: null,
      currentAnnotationId: annoId,
    });
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
  AnnoFeature,
  AnnotationOfferer,
  AnnotationInput,
  AnnotationDisplay,
  getUpdatedAnnotationList,
};
