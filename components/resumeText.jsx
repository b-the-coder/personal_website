import resumeData from "../resumeData.json";
import React from "react";

function Header() {
  return (
    <div className="resumeHeader">
      <h2>{resumeData.name}</h2>
      <div>
        <p>{resumeData.contact.email}</p>
        <p>{resumeData.contact.location}</p>
      </div>
    </div>
  );
}

function Contact() {
  return (
    <div className="contact-links">
      <p className="contact-item">{resumeData.contact.github}</p>
      <p className="contact-item">{resumeData.contact.linkedin}</p>
    </div>
  );
}

function Skills() {
  return (
    <div className="skills">
      <h2 className="resume-section-title">Skills</h2>
      {resumeData.skills.map(({ category, items }, index) => {
        const formattedCategory =
          category.charAt(0).toUpperCase() + category.slice(1);

        return (
          <p key={index}>
            <strong>{formattedCategory}:</strong> {items.join(", ")}
          </p>
        );
      })}
    </div>
  );
}

function Experience() {
  return (
    <div>
      <h2 className="resume-section-title">Experience</h2>
      {resumeData.experience.map((exp, index) => (
        <div key={index}>
          <p>
            <strong>{exp.title}</strong> - {exp.project} ({exp.type}) |{" "}
            {exp.startDate} - {exp.endDate}
          </p>
          <ul>
            {exp.bullets.map((bullet, bulletIndex) => (
              <li key={bulletIndex}>{bullet}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Projects() {
    return (
      <div>
        <h2 className="resume-section-title">Projects</h2>
        {resumeData.projects.map((pro, index) => (
          <div key={index}>
            <p className="project-header">
              <span><strong>{pro.name}</strong> | {pro.stack.join(", ")}</span>
              <span>{pro.startDate} - {pro.endDate}</span>
            </p>
            <ul>
              {pro.bullets.map((bullet, bulletIndex) => (
                <li key={bulletIndex}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

function Education() {
  return (
    <div>
      <h2 className="resume-section-title">Education</h2>
      {resumeData.education.map((edu, index) => (
        <div key={index}>
          <p className="education-header">
            <span>
              <strong>{edu.school}</strong>
            </span>
            <span>Graduated {edu.graduationDate}</span>
          </p>
          <p>
            {edu.degree} | GPA: {edu.gpa}
          </p>
        </div>
      ))}
    </div>
  );
}
export { Header, Contact, Skills, Experience, Projects, Education };
