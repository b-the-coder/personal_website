import React from "react";
import { useState, useEffect } from "react";

import { ResumeText } from "./resume-text";
import { AnnoFeature } from "./anno-feature";
import { annotationListinit } from "../utils";

function ResumeAnno() {
  const [annotationList, setAnnotationList] = useState(annotationListinit());
  const [session, setSession] = useState({
    kind: "idle",
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
        <AnnoFeature
          annotationList={annotationList}
          setAnnotationList={setAnnotationList}
          session={session}
          setSession={setSession}
        />
      </div>
    </div>
  );
}

export default ResumeAnno;
