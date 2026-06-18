import resumeData from "../resumeData.json";
import React from "react";
import { highlightText } from "../utils";

function Header({ annotationList }) {
  return (
    <div className="resumeHeader" data-text-id="resume-header">
      <h2>{highlightText(resumeData.name, annotationList, "resume-header")}</h2>
      <div>
        <p>
          {highlightText(
            resumeData.contact.email,
            annotationList,
            "resume-header"
          )}
        </p>
        <p>
          {highlightText(
            resumeData.contact.location,
            annotationList,
            "resume-header"
          )}
        </p>
      </div>
    </div>
  );
}

function Contact({ annotationList }) {
  return (
    <div className="contact-links" data-text-id="resume-links">
      <p className="contact-item">
        {highlightText(
          resumeData.contact.github,
          annotationList,
          "resume-links"
        )}
      </p>
      <p className="contact-item">
        {highlightText(
          resumeData.contact.linkedin,
          annotationList,
          "resume-links"
        )}
      </p>
    </div>
  );
}

function Skills({ annotationList }) {
  return (
    <div className="skills">
      <h2 className="resume-section-title" data-text-id="skl">
        {highlightText("Skills", annotationList, "skl")}
      </h2>
      {resumeData.skills.map(({ category, items }, index) => {
        const formattedCategory =
          category.charAt(0).toUpperCase() + category.slice(1);

        return (
          <p key={index}>
            <strong data-text-id={`skl-${index}-category`}>
              {highlightText(
                formattedCategory,
                annotationList,
                `skl-${index}-category`
              )}
              :
            </strong>{" "}
            <span data-text-id={`skl-${index}-items`}>
              {highlightText(
                items.join(", "),
                annotationList,
                `skl-${index}-items`
              )}
            </span>
          </p>
        );
      })}
    </div>
  );
}

function Experience({ annotationList }) {
  return (
    <div>
      <h2 className="resume-section-title" data-text-id="exp">
        {highlightText("Experience", annotationList, "exp")}
      </h2>
      {resumeData.experience.map((exp, index) => (
        <div key={index}>
          <p data-text-id={`exp-${index}-title`}>
            <strong>
              {highlightText(exp.title, annotationList, `exp-${index}-title`)}
            </strong>{" "}
            - {highlightText(exp.project, annotationList, `exp-${index}-title`)}{" "}
            ({highlightText(exp.type, annotationList, `exp-${index}-title`)}) |{" "}
            {highlightText(exp.startDate, annotationList, `exp-${index}-title`)}{" "}
            - {highlightText(exp.endDate, annotationList, `exp-${index}-title`)}
          </p>
          <ul>
            {exp.bullets.map((bullet, bulletIndex) => (
              <li
                key={bulletIndex}
                data-text-id={`exp-${index}-bullet-${bulletIndex}`}
              >
                {highlightText(
                  bullet,
                  annotationList,
                  `exp-${index}-bullet-${bulletIndex}`
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Projects({ annotationList }) {
  return (
    <div>
      <h2 className="resume-section-title" data-text-id="pjt">
        {highlightText("Projects", annotationList, "pjt")}
      </h2>
      {resumeData.projects.map((pro, index) => (
        <div key={index}>
          <p className="project-header">
            <span data-text-id={`pjt-${index}-title`}>
              <strong>
                {highlightText(pro.name, annotationList, `pjt-${index}-title`)}
              </strong>{" "}
              |{" "}
              {highlightText(
                pro.stack.join(", "),
                annotationList,
                `pjt-${index}-title`
              )}
            </span>

            <span data-text-id={`pjt-${index}-period`}>
              {highlightText(
                pro.startDate,
                annotationList,
                `pjt-${index}-period`
              )}{" "}
              -{" "}
              {highlightText(
                pro.endDate,
                annotationList,
                `pjt-${index}-period`
              )}
            </span>
          </p>
          <ul>
            {pro.bullets.map((bullet, bulletIndex) => (
              <li
                key={bulletIndex}
                data-text-id={`pjt-${index}-bullet-${bulletIndex}`}
              >
                {highlightText(
                  bullet,
                  annotationList,
                  `pjt-${index}-bullet-${bulletIndex}`
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Education({ annotationList }) {
  return (
    <div>
      <h2 className="resume-section-title" data-text-id="edu">
        {highlightText("Education", annotationList, "edu")}
      </h2>
      {resumeData.education.map((edu, index) => (
        <div key={index}>
          <p
            className="education-header"
            data-text-id={`edu-${index}-school&gradudate`}
          >
            <span>
              <strong>
                {highlightText(
                  edu.school,
                  annotationList,
                  `edu-${index}-school&gradudate`
                )}
              </strong>
            </span>
            <span>
              {highlightText(
                `Graduated ${edu.graduationDate}`,
                annotationList,
                `edu-${index}-school&gradudate`
              )}
            </span>
          </p>
          <p data-text-id={`edu-${index}-degree&grade`}>
            {highlightText(
              edu.degree,
              annotationList,
              `edu-${index}-degree&grade`
            )}{" "}
            |{" "}
            {highlightText(
              `GPA: ${edu.gpa}`,
              annotationList,
              `edu-${index}-degree&grade`
            )}
          </p>
        </div>
      ))}
    </div>
  );
}
export { Header, Contact, Skills, Experience, Projects, Education };
