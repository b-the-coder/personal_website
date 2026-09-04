import resumeData from "../resumeData.json";
import React from "react";
import {
  computeSegments,
  renderSegments,
  getRelativeOffsets,
  getNextModeOnSelection,
  groupAnnotationsByTextId,
  processTextSegments,
} from "../utils";

function ResumeText({
  annotationList,
  setCurrentAnnotationId,
  setMode,
  setSelectedText,
  setSelectionPosition,
}) {
  const groupedAnnotation = groupAnnotationsByTextId(annotationList);

  const handleSelection = () => {
    const userSelection = window.getSelection();
    const selectedString = userSelection.toString();
    const range = userSelection.getRangeAt(0);

    const textPositionNode =
      range.startContainer.parentElement.closest("[data-text-id]");

    const offsetsRelativeToTextPositionNode = getRelativeOffsets(
      range,
      textPositionNode
    );
    const textId = textPositionNode.getAttribute("data-text-id");
    const rect = range.getBoundingClientRect();
    const selectionPosition = {
      viewportPosition: { x: rect.right, y: rect.bottom },
      textPosition: textId,
      range: offsetsRelativeToTextPositionNode,
    };

    const nextMode = getNextModeOnSelection(selectedString);

    setMode(nextMode);
    setSelectedText(selectedString);
    setSelectionPosition(selectionPosition);
    setCurrentAnnotationId(undefined);
  };

  const handleClick = (e) => {
    const annotationIdsString = e.target.dataset.annotationIds;

    if (annotationIdsString) {
      setCurrentAnnotationId(annotationIdsString);
      setMode("anno_display");
    }
  };

  return (
    <div
      className="resumeText"
      onMouseUp={handleSelection}
      onClick={handleClick}
    >
      <Header annotationList={groupedAnnotation} />
      <Contact annotationList={groupedAnnotation} />
      <Skills annotationList={groupedAnnotation} />
      <Experience annotationList={groupedAnnotation} />
      <Projects annotationList={groupedAnnotation} />
      <Education annotationList={groupedAnnotation} />
    </div>
  );
}

function Header({ annotationList }) {
  const headerAnnotations = annotationList["resume-header"];

  const name = resumeData.name;
  const email = resumeData.contact.email;
  const location = resumeData.contact.location;
  const headerTextChuck = [name, email, location];

  const {
    fullText,
    segmentList: [nameSegments, emailSegments, locationSegments],
  } = processTextSegments({
    textChunks: headerTextChuck,
    annotationsById: headerAnnotations,
    computeSegmentsFn: computeSegments,
  });

  return (
    <div className="resumeHeader" data-text-id="resume-header">
      <h2>{renderSegments(fullText, nameSegments)}</h2>
      <div>
        <p>{renderSegments(fullText, emailSegments)}</p>
        <p>{renderSegments(fullText, locationSegments)}</p>
      </div>
    </div>
  );
}

function Contact({ annotationList }) {
  const contactAnnotations = annotationList["resume-links"];

  const github = resumeData.contact.github;
  const linkedin = resumeData.contact.linkedin;

  const contactTextChuck = [github, linkedin];
  const {
    fullText,
    segmentList: [githubSegments, linkedinSegments],
  } = processTextSegments({
    textChunks: contactTextChuck,
    annotationsById: contactAnnotations,
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

function Skills({ annotationList }) {
  const titleAnnotations = annotationList["skl"];
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

        const skillAnnotations = annotationList[textId];

        const skillTextChuck = [formattedCategory, itemsText];
        const {
          fullText,
          segmentList: [categorySegments, itemsSegments],
        } = processTextSegments({
          textChunks: skillTextChuck,
          annotationsById: skillAnnotations,
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

function Experience({ annotationList }) {
  const sectionTitle = "Experience";
  const sectionAnnotations = annotationList["exp"];

  const titleSegments = computeSegments(sectionTitle, sectionAnnotations);

  return (
    <div className="experience">
      <h2 className="resume-section-title" data-text-id="exp">
        {renderSegments(sectionTitle, titleSegments)}
      </h2>

      {resumeData.experience.map((exp, index) => {
        const titleTextId = `exp-${index}-title`;
        const expPosition = exp.title;
        const expDetail = ` - ${exp.project} (${exp.type}) | ${exp.startDate} - ${exp.endDate}`;

        const expTitleLineTextChuck = [expPosition, expDetail];
        const expTitleAnnotations = annotationList[titleTextId];

        const {
          fullText: expTitleLineText,
          segmentList: [expPositionSegments, expDetailSegments],
        } = processTextSegments({
          textChunks: expTitleLineTextChuck,
          annotationsById: expTitleAnnotations,
          computeSegmentsFn: computeSegments,
        });

        return (
          <div key={index}>
            <p data-text-id={titleTextId}>
              <strong>
                {renderSegments(expTitleLineText, expPositionSegments)}
              </strong>
              {renderSegments(expTitleLineText, expDetailSegments)}
            </p>

            <ul>
              {exp.bullets.map((bullet, bulletIndex) => {
                const expBulletTextId = `exp-${index}-bullet-${bulletIndex}`;
                const expBulletAnnotations = annotationList[expBulletTextId];
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

function Projects({ annotationList }) {
  const sectionTitle = "Projects";
  const sectionAnnotations = annotationList["pjt"];

  const titleSegments = computeSegments(sectionTitle, sectionAnnotations);

  return (
    <div className="projects">
      <h2 className="resume-section-title" data-text-id="pjt">
        {renderSegments(sectionTitle, titleSegments)}
      </h2>

      {resumeData.projects.map((pro, index) => {
        const proTitleTextId = `pjt-${index}-title`;
        const proTitleAnnotations = annotationList[proTitleTextId];

        const nameText = pro.name;
        const stackText = ` | ${pro.stack.join(", ")}`;
        const timeText = `${pro.startDate} - ${pro.endDate}`;

        const proTitleTextChuck = [nameText, stackText, timeText];
        const {
          fullText,
          segmentList: [nameSegments, stackSegments, timeSegments],
        } = processTextSegments({
          textChunks: proTitleTextChuck,
          annotationsById: proTitleAnnotations,
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
                const bulletAnnotations = annotationList[bulletTextId];
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

function Education({ annotationList }) {
  const sectionTitle = "Education";
  const sectionAnnotations = annotationList["edu"];

  const titleSegments = computeSegments(sectionTitle, sectionAnnotations);

  return (
    <div className="education">
      <h2 className="resume-section-title" data-text-id="edu">
        {renderSegments(sectionTitle, titleSegments)}
      </h2>

      {resumeData.education.map((edu, index) => {
        const eduHeaderTextId = `edu-${index}-school-gradudation-date`;
        const eduHeaderAnnotations = annotationList[eduHeaderTextId];

        const schoolText = edu.school;
        const graduationText = `Graduated ${edu.graduationDate}`;

        const eduHeaderTextChuck = [schoolText, graduationText];

        const {
          fullText: eduHeaderFullText,
          segmentList: [schoolSegments, graduationSegments],
        } = processTextSegments({
          textChunks: eduHeaderTextChuck,
          annotationsById: eduHeaderAnnotations,
          computeSegmentsFn: computeSegments,
        });

        const academicsTextId = `edu-${index}-degree-gpa`;
        const academicsAnnotations = annotationList[academicsTextId];

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
