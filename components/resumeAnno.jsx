import React from "react";

function AnnotationOfferer() {
  return (
    <span className="annotation-offerer">
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

function AnnotationInput() {
  return (
    <div className="annotation-input">
      <p className="annotation-input__title">Add annotation</p>

      <p className="annotation-input__selected-text">
        On: <em>&ldquo;selected text will appear here...&rdquo;</em>
      </p>

      <textarea
        className="annotation-input__textarea"
        placeholder="Write your annotation..."
      />

      <div className="annotation-input__actions">
        <button className="annotation-input__cancel-btn">Cancel</button>
        <button className="annotation-input__post-btn">Post</button>
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
