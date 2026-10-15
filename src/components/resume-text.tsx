import { resumeData } from "../portfolio-data.json";
import React from "react";
import {
  computeSegments,
  renderSegments,
  getRelativeOffsets,
  getNextModeOnSelection,
  groupAnnotationsByTextId,
  processTextSegments,
} from "../utils";

import type { AnnotationStateContext, GroupedAnnotationsByTextId } from "../types";

type ResumeSectionProps = { annotationsByTextId: GroupedAnnotationsByTextId };


function ResumeText({ annotationList, setSession }: AnnotationStateContext) {
  
  const annotationsByTextId = groupAnnotationsByTextId(annotationList);

  const handleSelection = () => {
    const userSelection = window.getSelection();

    // Guard against a null Selection object when no browsing context.
    if (userSelection === null) return;

    const selectedString = userSelection.toString();

    const nextMode = getNextModeOnSelection(userSelection);
    if (nextMode === "idle") {
      setSession({
        kind: nextMode,
        selectedText: selectedString,
        selectionPosition: null,
        currentAnnotationId: undefined,
      });
      return;
    }

    // Convert the selected range into offsets relative to its text block.
    const range = userSelection.getRangeAt(0);
    const textPositionNode =
      range.startContainer.parentElement?.closest("[data-text-id]");
    const textId = textPositionNode?.getAttribute("data-text-id");
    // Ignore selections that do not start inside a valid annotatable text block.
    if (!textPositionNode || !textId) return;
    const offsetsRelativeToTextPositionNode = getRelativeOffsets(
      range,
      textPositionNode
    );

    const rect = range.getBoundingClientRect();
    const selectionPosition = {
      viewportPosition: { x: rect.right, y: rect.bottom },
      textPosition: textId,
      range: offsetsRelativeToTextPositionNode,
    };

    setSession({
      kind: nextMode,
      selectedText: selectedString,
      selectionPosition: selectionPosition,
      currentAnnotationId: undefined,
    });
  };

  const handleAnnotationClick = (e: React.MouseEvent<HTMLDivElement>) => {
    
    const userSelection = window.getSelection();


    // Guard against a null Selection object when no browsing context.
    if (userSelection === null) return;

    let annotationIdsString;

    // Read annotation IDs only when the user is not making an active text selection.
    if (
      userSelection.isCollapsed === true ||
      !userSelection.toString().trim()
    ) {
      annotationIdsString = (e.target as HTMLElement).dataset.annotationIds;
    }

   
    if (annotationIdsString) {
      setSession({
        kind: "anno_display",
        selectedText: "",
        selectionPosition: null,
        currentAnnotationId: annotationIdsString,
      });
    }
  };

  return (
    <div
      className="resumeText"
      onMouseUp={handleSelection}
      onClick={handleAnnotationClick}
    >
      <Header annotationsByTextId={annotationsByTextId} />
      <Contact annotationsByTextId={annotationsByTextId} />
      <Skills annotationsByTextId={annotationsByTextId} />
      <Experience annotationsByTextId={annotationsByTextId} />
      <Projects annotationsByTextId={annotationsByTextId} />
      <Education annotationsByTextId={annotationsByTextId} />
    </div>
  );
}

function Header({ annotationsByTextId }: ResumeSectionProps) {


  
  const headerAnnotations = annotationsByTextId["resume-header"];

  
  const name = resumeData.name;
  const email = resumeData.contact.email;
  const location = resumeData.contact.location;
  const headerTextChunk = [name, email, location];

  // Build the full header text and the annotated segments for each field.
  const {
    fullText,
    segmentList: [nameSegments, emailSegments, locationSegments],
  } = processTextSegments({
    textChunks: headerTextChunk,
    annotationsForTextId: headerAnnotations,
    computeSegmentsFn: computeSegments,
  });

  return (
    <div className="resumeHeader" data-text-id="resume-header">
 {/*  Render each segment with its annotation highlight styling. */}
      <h2>{renderSegments(fullText, nameSegments)}</h2>
      <div>
        <p>{renderSegments(fullText, emailSegments)}</p>
        <p>{renderSegments(fullText, locationSegments)}</p>
      </div>
    </div>
  );
}

function Contact({ annotationsByTextId }: ResumeSectionProps) {
  const contactAnnotations = annotationsByTextId["resume-links"];

  const github = resumeData.contact.github;
  const linkedin = resumeData.contact.linkedin;

  const contactTextChunk = [github, linkedin];
  const {
    fullText,
    segmentList: [githubSegments, linkedinSegments],
  } = processTextSegments({
    textChunks: contactTextChunk,
    annotationsForTextId: contactAnnotations,
    computeSegmentsFn: computeSegments,
  });

  return (
    <div className="contact-links" data-text-id="resume-links">
      <p className="contact-item">{renderSegments(fullText, githubSegments)}</p>
      <p className="contact-item">
        {renderSegments(fullText, linkedinSegments)}
      </p>
    </div>
  );
}

function Skills({ annotationsByTextId }: ResumeSectionProps) {
  const titleAnnotations = annotationsByTextId["skl"];
  const sectionTitle = "Skills";
  const titleSegments = computeSegments(sectionTitle, titleAnnotations);

  return (
    <div className="skills">
      <h2 className="resume-section-title" data-text-id="skl">
        {renderSegments(sectionTitle, titleSegments)}
      </h2>
      {resumeData.skills.map(({ category, items }, index) => {
        const formattedCategory =
          category.charAt(0).toUpperCase() + category.slice(1) + ": ";
        const itemsText = items.join(", ");
        const textId = `skl-${index}`;

        const skillAnnotations = annotationsByTextId[textId];

        const skillTextChunk = [formattedCategory, itemsText];
        const {
          fullText,
          segmentList: [categorySegments, itemsSegments],
        } = processTextSegments({
          textChunks: skillTextChunk,
          annotationsForTextId: skillAnnotations,
          computeSegmentsFn: computeSegments,
        });

        return (
          <p key={index} data-text-id={textId}>
            <strong>{renderSegments(fullText, categorySegments)}</strong>
            <span>{renderSegments(fullText, itemsSegments)}</span>
          </p>
        );
      })}
    </div>
  );
}

function Experience({ annotationsByTextId }: ResumeSectionProps) {
  // Build the Experience section title and apply any annotations attached to it.
  const sectionTitle = "Experience";
  const sectionAnnotations = annotationsByTextId["exp"];

  const titleSegments = computeSegments(sectionTitle, sectionAnnotations);

  return (
    <div className="experience">
      <h2 className="resume-section-title" data-text-id="exp">
        {renderSegments(sectionTitle, titleSegments)}
      </h2>

      {/* Render each experience entry from the resume data. */}
      {resumeData.experience.map((exp, index) => {
        // Use one text ID for the complete title line so its annotations share a coordinate system.
        const titleTextId = `exp-${index}-title`;
        const expPosition = exp.title;
        const expDetail = ` - ${exp.project} (${exp.type}) | ${exp.startDate} - ${exp.endDate}`;

        // Keep the position and details as separate chunks because they use different HTML styles.
        const expTitleLineTextChunk = [expPosition, expDetail];
        const expTitleAnnotations = annotationsByTextId[titleTextId];

        // Build the full title line and calculate the annotated segments for each chunk.
        const {
          fullText: expTitleLineText,
          segmentList: [expPositionSegments, expDetailSegments],
        } = processTextSegments({
          textChunks: expTitleLineTextChunk,
          annotationsForTextId: expTitleAnnotations,
          computeSegmentsFn: computeSegments,
        });

        return (
          <div key={index}>
            {/* Render the position in bold and the remaining details in regular text. */}
            <p data-text-id={titleTextId}>
              <strong>
                {renderSegments(expTitleLineText, expPositionSegments)}
              </strong>
              {renderSegments(expTitleLineText, expDetailSegments)}
            </p>

            <ul>
              {exp.bullets.map((bullet, bulletIndex) => {
                // Give each bullet its own text ID and annotation segments.
                const expBulletTextId = `exp-${index}-bullet-${bulletIndex}`;
                const expBulletAnnotations =
                annotationsByTextId[expBulletTextId];
                const expBulletSegments = computeSegments(
                  bullet,
                  expBulletAnnotations
                );

                return (
                  <li key={bulletIndex} data-text-id={expBulletTextId}>
                    {renderSegments(bullet, expBulletSegments)}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function Projects({ annotationsByTextId }: ResumeSectionProps) {
  const sectionTitle = "Projects";
  const sectionAnnotations = annotationsByTextId["pjt"];

  const titleSegments = computeSegments(sectionTitle, sectionAnnotations);

  return (
    <div className="projects">
      <h2 className="resume-section-title" data-text-id="pjt">
        {renderSegments(sectionTitle, titleSegments)}
      </h2>

      {resumeData.projects.map((pro, index) => {
        const proTitleTextId = `pjt-${index}-title`;
        const proTitleAnnotations = annotationsByTextId[proTitleTextId];

        const nameText = pro.name;
        const stackText = ` | ${pro.stack.join(", ")}`;
        const timeText = `${pro.startDate} - ${pro.endDate}`;

        const proTitleTextChunk = [nameText, stackText, timeText];
        const {
          fullText,
          segmentList: [nameSegments, stackSegments, timeSegments],
        } = processTextSegments({
          textChunks: proTitleTextChunk,
          annotationsForTextId: proTitleAnnotations,
          computeSegmentsFn: computeSegments,
        });

        return (
          <div key={index}>
            <p className="project-header" data-text-id={proTitleTextId}>
              <span>
                <strong>{renderSegments(fullText, nameSegments)}</strong>
                {renderSegments(fullText, stackSegments)}
              </span>
              <span>{renderSegments(fullText, timeSegments)}</span>
            </p>

            <ul>
              {pro.bullets.map((bullet, bulletIndex) => {
                const bulletTextId = `pjt-${index}-bullet-${bulletIndex}`;
                const bulletAnnotations = annotationsByTextId[bulletTextId];
                const bulletSegments = computeSegments(
                  bullet,
                  bulletAnnotations
                );

                return (
                  <li key={bulletIndex} data-text-id={bulletTextId}>
                    {renderSegments(bullet, bulletSegments)}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function Education({ annotationsByTextId }: ResumeSectionProps) {
  const sectionTitle = "Education";
  const sectionAnnotations = annotationsByTextId["edu"];

  const titleSegments = computeSegments(sectionTitle, sectionAnnotations);

  return (
    <div className="education">
      <h2 className="resume-section-title" data-text-id="edu">
        {renderSegments(sectionTitle, titleSegments)}
      </h2>

      {resumeData.education.map((edu, index) => {
        const eduHeaderTextId = `edu-${index}-school-gradudation-date`;
        const eduHeaderAnnotations = annotationsByTextId[eduHeaderTextId];

        const schoolText = edu.school;
        const graduationText = `Graduated ${edu.graduationDate}`;

        const eduHeaderTextChunk = [schoolText, graduationText];

        const {
          fullText: eduHeaderFullText,
          segmentList: [schoolSegments, graduationSegments],
        } = processTextSegments({
          textChunks: eduHeaderTextChunk,
          annotationsForTextId: eduHeaderAnnotations,
          computeSegmentsFn: computeSegments,
        });

        const academicsTextId = `edu-${index}-degree-gpa`;
        const academicsAnnotations = annotationsByTextId[academicsTextId];

        // degree 和 GPA 没有不同 HTML 格式，可以一起渲染
        const academicsText = `${edu.degree} | GPA: ${edu.gpa}`;

        const academicsSegments = computeSegments(
          academicsText,
          academicsAnnotations
        );

        return (
          <div key={index}>
            <p className="education-header" data-text-id={eduHeaderTextId}>
              <span>
                <strong>
                  {renderSegments(eduHeaderFullText, schoolSegments)}
                </strong>
              </span>
              <span>
                {renderSegments(eduHeaderFullText, graduationSegments)}
              </span>
            </p>

            <p data-text-id={academicsTextId}>
              {renderSegments(academicsText, academicsSegments)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export { ResumeText, Header, Contact, Skills, Experience, Projects, Education };
