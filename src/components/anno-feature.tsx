import React from "react";
import { useRef } from "react";
import { upsertAnnotation, deleteAnnotation } from "../utils";
import type { AnnotationStateContext } from "../types";

function AnnotationFeature({
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
function AnnotationOfferer({
  session,
  setSession,
}: Pick<AnnotationStateContext, "session" | "setSession">) {
  if (session.mode != "text_selected") {
    return null;
  }

  const handleClick = () => {
    setSession({
      ...session,
      mode: "annotating",
    });
  };

  // Defensive guard for an invariant violation; text_selected sessions always have a selection position.
  if (!session.selectionPosition) {
    return;
  }
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
}: AnnotationStateContext) {
  // Keep hooks before the conditional return so every render uses the same hook order.
  const annotationRef = useRef<HTMLTextAreaElement>(null);

  if (session.mode !== "annotating") return null;

  if (session.mode != "annotating") {
    return null;
  }

  const handlePostClick = () => {
    const annotationContent = annotationRef.current?.value;
    const newAnnotation = {
      annotatedText: session.selectedText,
      annotationContent: annotationContent,
      selectionPosition: session.selectionPosition,
    };
    const updatedAnnotationList = upsertAnnotation(
      annotationList,
      session.currentAnnotationId,
      newAnnotation
    );

    setAnnotationList(updatedAnnotationList);
    setSession({
      mode: "idle",
      selectedText: "",
      selectionPosition: null,
      currentAnnotationId: undefined,
    });
  };

  const handleCancelClick = () => {
    setSession({
      mode: "idle",
      selectedText: "",
      selectionPosition: null,
      currentAnnotationId: undefined,
    });
  };

  let displayText, placeholderText;
  if (!session.currentAnnotationId) {
    displayText = session.selectedText;
    placeholderText = "Write your annotation...";
  } else {
    displayText = annotationList[session.currentAnnotationId].annotatedText;
    placeholderText =
      "You annotated:" +
      annotationList[session.currentAnnotationId].annotationContent;
  }

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
        <button
          onClick={handlePostClick}
          className="annotation-input__post-btn"
        >
          Post
        </button>
        <button
          className="annotation-input__cancel-btn"
          onClick={handleCancelClick}
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
}: AnnotationStateContext) {
  if (session.mode != "anno_display") {
    return null;
  }

  // Defensive guard for an invariant violation; anno_display sessions always have a currentAnnotationId.
  if (!session.currentAnnotationId) {
    console.error(
      "currentAnnotationId is invalid, value is:",
      session.currentAnnotationId
    );
    return null;
  }

  const displayAnnotationIds = session.currentAnnotationId.split(",");

  const handleDeleteClick = (annoId: string) => {
    const updatedAnnotationList = deleteAnnotation(annotationList, annoId);
    setAnnotationList(updatedAnnotationList);
    setSession({
      mode: "idle",
      selectedText: "",
      selectionPosition: null,
      currentAnnotationId: undefined,
    });
  };

  const handleEditClick = (annoId: string) => {
    setSession({
      mode: "annotating",
      selectedText: "",
      selectionPosition: null,
      currentAnnotationId: annoId,
    });
  };

  return displayAnnotationIds.map((annotationId) => (
    <div className="annotation-display" key={annotationId}>
      <p className="annotation-display__selected-text">
        <strong>
          <em>On:</em>
        </strong>{" "}
        <em>{annotationList[annotationId].annotatedText}</em>
      </p>
      <p className="annotation-display__content">
        <strong>
          <em>You annotated:</em>
        </strong>{" "}
        {annotationList[annotationId].annotationContent}
      </p>

      <div className="annotation-display__actions">
        <button
          className="annotation-display__edit-btn"
          onClick={() => {
            handleEditClick(annotationId);
          }}
        >
          Edit
        </button>
        <button
          className="annotation-display__delete-btn"
          onClick={() => {
            handleDeleteClick(annotationId);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  ));
}

export {
  AnnotationFeature,
  AnnotationOfferer,
  AnnotationInput,
  AnnotationDisplay,
};
