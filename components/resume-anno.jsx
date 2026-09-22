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

  // useEffect(() => {
  //   localStorage.annotationList = JSON.stringify(annotationList);
  // console.log(`[useEffect write] ${performance.now()}ms`, annotationList);
  // }, [annotationList]);

  useEffect(() => {
    const delay = setTimeout(() => {
      localStorage.annotationList = JSON.stringify(annotationList);
    }, 3000); // 人为延迟 300ms 再写入
    console.log(`[useEffect write] ${performance.now()}ms`, annotationList);
    return () => clearTimeout(delay);
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
