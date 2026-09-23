import React from "react";
import { useState, useEffect } from "react";

import { ResumeText } from "./resume-text";
import { AnnoFeature } from "./anno-feature";
import { annotationListinit } from "../utils";

function ResumeAnno() {
  const [annotationList, setAnnotationList] = useState(annotationListinit());
  const [currentAnnotationId, setCurrentAnnotationId] = useState(undefined);
  const [mode, setMode] = useState("idle");
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState(null);

  useEffect(() => {
    localStorage.annotationList = JSON.stringify(annotationList);
  
  }, [annotationList]);


 

  return (
    <div className="resume">
      <h2>Resume:</h2>
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
        <AnnoFeature
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
    </div>
  );
}

export default ResumeAnno;
