import React from "react";
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { ResumeText } from "./resumeText";
import { Annofeature } from "./annoFeature";

function ResumeAnno() {
  const annotationListinit = () => {
    if (localStorage.getItem("annotationList") === null) {
      return {};
    } else {
      return JSON.parse(localStorage.annotationList);
    }
  };
  const [annotationList, setAnnotationList] = useState(annotationListinit());
  const [currentAnnotationId, setCurrentAnnotationId] = useState(undefined);
  const [mode, setMode] = useState("idle");
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState(null);

  useEffect(() => {
    localStorage.annotationList = JSON.stringify(annotationList);
  }, [annotationList]);

  return (
    <div className="resumeAnno">
      <ResumeText
        mode={mode}
        setMode={setMode}
        selectedText={selectedText}
        setSelectedText={setSelectedText}
        selectionPosition={selectionPosition}
        setSelectionPosition={setSelectionPosition}
        annotationList={annotationList}
        setAnnotationList={setAnnotationList}
        currentAnnotationId={currentAnnotationId}
        setCurrentAnnotationId={setCurrentAnnotationId}
      />
      <Annofeature
        mode={mode}
        setMode={setMode}
        selectedText={selectedText}
        setSelectedText={setSelectedText}
        selectionPosition={selectionPosition}
        setSelectionPosition={setSelectionPosition}
        annotationList={annotationList}
        setAnnotationList={setAnnotationList}
        currentAnnotationId={currentAnnotationId}
        setCurrentAnnotationId={setCurrentAnnotationId}
      />
    </div>
  );
}
const domNode = document.getElementById("resumeAnno");

const root = createRoot(domNode);
root.render(<ResumeAnno />);

export { ResumeAnno };
