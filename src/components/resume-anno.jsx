import React from "react";
import { useState, useEffect } from "react";

import { ResumeText } from "./resume-text";
import { AnnotationFeature } from "./anno-feature";
import { initializeAnnotationList } from "../utils";

function ResumeAnnotation() {
  const [annotationList, setAnnotationList] = useState(
    initializeAnnotationList()
  );
  const [session, setSession] = useState({
    mode: "idle",
    selectedText: "",
    selectionPosition: null,
    currentAnnotationId: undefined,
  });

  useEffect(() => {
    localStorage.annotationList = JSON.stringify(annotationList);
  }, [annotationList]);
 
  return (
    <div className="resume">
      <h2>Resume:</h2>
      <div className="resumeAnno">
        <ResumeText
          annotationList={annotationList}
          setAnnotationList={setAnnotationList}
          session={session}
          setSession={setSession}
        />
        <AnnotationFeature
          annotationList={annotationList}
          setAnnotationList={setAnnotationList}
          session={session}
          setSession={setSession}
        />
      </div>
    </div>
  );
}

export default ResumeAnnotation;
