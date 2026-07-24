import resumeData from "../resumeData.json";
import React from "react";

import { computeSegments, renderSegments } from "../utils";

function Header({ annotationList }) {
  const headerAnnotations = annotationList["resume-header"];

  const name = resumeData.name;
  const email = resumeData.contact.email;
  const location = resumeData.contact.location;
  const fullText = `${name}${email}${location}`;

  const nameBoundary = name.length;
  const emailBoundary = name.length + email.length;

  const segments = computeSegments(fullText, headerAnnotations, [
    nameBoundary,
    emailBoundary,
  ]);

  const nameSegments = segments.filter((seg) => seg.end <= nameBoundary);
  const emailSegments = segments.filter(
    (seg) => seg.start >= nameBoundary && seg.end <= emailBoundary
  );
  const locationSegments = segments.filter((seg) => seg.start >= emailBoundary);

  return (
    <div className="resumeHeader" data-text-id="resume-header">
      <h2>{renderSegments(nameSegments, fullText)}</h2>
      <div>
        <p>{renderSegments(emailSegments, fullText)}</p>
        <p>{renderSegments(locationSegments, fullText)}</p>
      </div>
    </div>
  );
}

function Contact({ annotationList }) {
  const contactAnnotations = annotationList["resume-links"];

  const github = resumeData.contact.github;
  const linkedin = resumeData.contact.linkedin;
  const fullText = `${github}${linkedin}`;
  const githubBoundary = github.length;

  const segments = computeSegments(fullText, contactAnnotations, [
    githubBoundary,
  ]);

  const githubSegments = segments.filter((seg) => seg.end <= githubBoundary);
  const linkedinSegments = segments.filter(
    (seg) => seg.start >= githubBoundary
  );

  return (
    <div className="contact-links" data-text-id="resume-links">
      <p className="contact-item">{renderSegments(githubSegments, fullText)}</p>
      <p className="contact-item">
        {renderSegments(linkedinSegments, fullText)}
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
        {renderSegments(titleSegments, sectionTitle)}
      </h2>
      {resumeData.skills.map(({ category, items }, index) => {
        const formattedCategory =
          category.charAt(0).toUpperCase() + category.slice(1);
        const itemsText = items.join(", ");
        const textId = `skl-${index}`;
        const skillAnnotations = annotationList[textId];

        const lineText = `${formattedCategory}: ${itemsText}`;
        const boundary = formattedCategory.length + 1; // "Frontend" + ":" 的长度

        const segments = computeSegments(lineText, skillAnnotations, [
          boundary,
        ]);
        const categorySegments = segments.filter((seg) => seg.end <= boundary);
        const itemsSegments = segments.filter((seg) => seg.start >= boundary);

        return (
          <p key={index} data-text-id={textId}>
            <strong>{renderSegments(categorySegments, lineText)}</strong>
            <span> {renderSegments(itemsSegments, lineText)}</span>
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
    <div>
      <h2 className="resume-section-title" data-text-id="exp">
        {renderSegments(titleSegments, sectionTitle)}
      </h2>

      {resumeData.experience.map((exp, index) => {
        const titleTextId = `exp-${index}-title`;

        const detailsText = ` - ${exp.project} (${exp.type}) | ${exp.startDate} - ${exp.endDate}`;

        const titleLineText = exp.title + detailsText;
        const titleBoundary = exp.title.length;

        const titleAnnotations = annotationList[titleTextId];

        const titleLineSegments = computeSegments(
          titleLineText,
          titleAnnotations,
          [titleBoundary]
        );
        const jobTitleSegments = titleLineSegments.filter(
          (seg) => seg.end <= titleBoundary
        );

        const detailsSegments = titleLineSegments.filter(
          (seg) => seg.start >= titleBoundary
        );

        return (
          <div key={index}>
            <p data-text-id={titleTextId}>
              <strong>{renderSegments(jobTitleSegments, titleLineText)}</strong>
              {renderSegments(detailsSegments, titleLineText)}
            </p>

            <ul>
              {exp.bullets.map((bullet, bulletIndex) => {
                const bulletTextId = `exp-${index}-bullet-${bulletIndex}`;

                const bulletAnnotations = annotationList[bulletTextId];

                const bulletSegments = computeSegments(
                  bullet,
                  bulletAnnotations
                );

                return (
                  <li key={bulletIndex} data-text-id={bulletTextId}>
                    {renderSegments(bulletSegments, bullet)}
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
    <div>
      <h2 className="resume-section-title" data-text-id="pjt">
        {renderSegments(titleSegments, sectionTitle)}
      </h2>

      {resumeData.projects.map((pro, index) => {
        const titleTextId = `pjt-${index}-title`;
        const titleAnnotations = annotationList[titleTextId];

        const nameText = pro.name;
        const stackText = ` | ${pro.stack.join(", ")}`;
        const timeText = `${pro.startDate} - ${pro.endDate}`;

        const fullText = nameText + stackText + timeText;

        const nameBoundary = nameText.length;
        const stackBoundary = nameText.length + stackText.length;

        const projectTitleSegments = computeSegments(
          fullText,
          titleAnnotations,
          [nameBoundary, stackBoundary]
        );

        const nameSegments = projectTitleSegments.filter(
          (seg) => seg.end <= nameBoundary
        );

        const stackSegments = projectTitleSegments.filter(
          (seg) => seg.start >= nameBoundary && seg.end <= stackBoundary
        );

        const timeSegments = projectTitleSegments.filter(
          (seg) => seg.start >= stackBoundary
        );

        return (
          <div key={index}>
            <p className="project-header" data-text-id={titleTextId}>
              <span>
                <strong>{renderSegments(nameSegments, fullText)}</strong>
                {renderSegments(stackSegments, fullText)}
              </span>

              <span>{renderSegments(timeSegments, fullText)}</span>
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
                    {renderSegments(bulletSegments, bullet)}
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
    <div>
      <h2 className="resume-section-title" data-text-id="edu">
        {renderSegments(titleSegments, sectionTitle)}
      </h2>

      {resumeData.education.map((edu, index) => {
        const headerTextId = `edu-${index}-school-gradudation-date`;
        const degreeTextId = `edu-${index}-degree-grade`;

        const headerAnnotations = annotationList[headerTextId];

        const degreeAnnotations = annotationList[degreeTextId];

        const schoolText = edu.school;
        const graduationText = `Graduated ${edu.graduationDate}`;

        const headerFullText = schoolText + graduationText;

        const schoolBoundary = schoolText.length;

        const headerSegments = computeSegments(
          headerFullText,
          headerAnnotations,
          [schoolBoundary]
        );

        const schoolSegments = headerSegments.filter(
          (seg) => seg.end <= schoolBoundary
        );

        const graduationSegments = headerSegments.filter(
          (seg) => seg.start >= schoolBoundary
        );

        // degree 和 GPA 没有不同 HTML 格式，可以一起渲染
        const degreeText = `${edu.degree} | GPA: ${edu.gpa}`;

        const degreeSegments = computeSegments(degreeText, degreeAnnotations);

        return (
          <div key={index}>
            <p className="education-header" data-text-id={headerTextId}>
              <span>
                <strong>
                  {renderSegments(schoolSegments, headerFullText)}
                </strong>
              </span>

              <span>{renderSegments(graduationSegments, headerFullText)}</span>
            </p>

            <p data-text-id={degreeTextId}>
              {renderSegments(degreeSegments, degreeText)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export { Header, Contact, Skills, Experience, Projects, Education };
