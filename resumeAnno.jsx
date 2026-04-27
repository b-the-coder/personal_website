import resumeData from './resumeData.json';
import React from 'react';

function Header() {
    return (
      <div>
        <p>{resumeData.name}</p>
        <p>{resumeData.contact.email}</p>
        <p>{resumeData.contact.location}</p>
        <p>{resumeData.contact.github}</p>
        <p>{resumeData.contact.linkedin}</p>
      </div>
    );
  }



 
  
  function Skills() {
    return (
      <div>
        <p>
          Frontend: {resumeData.skills.frontend.join(", ")}
        </p>
        <p>
          State & SPA: {resumeData.skills.stateSPA.join(", ")}
        </p>
        <p>
          Backend: {resumeData.skills.backend.join(", ")}
        </p>
        <p>
          Databases: {resumeData.skills.databases.join(", ")}
        </p>
        <p>
          Testing: {resumeData.skills.testing.join(", ")}
        </p>
        <p>
          DevOps: {resumeData.skills.devops.join(", ")}
        </p>
      </div>
    );
  }
  
  function Experience() {
    return (
      <div>
        <p>
          {resumeData.experience[0].title} - {resumeData.experience[0].project} ({resumeData.experience[0].type}) | {resumeData.experience[0].startDate} - {resumeData.experience[0].endDate}
        </p>
        <ul>
          <li>{resumeData.experience[0].bullets[0]}</li>
          <li>{resumeData.experience[0].bullets[1]}</li>
          <li>{resumeData.experience[0].bullets[2]}</li>
          <li>{resumeData.experience[0].bullets[3]}</li>
          <li>{resumeData.experience[0].bullets[4]}</li>
          <li>{resumeData.experience[0].bullets[5]}</li>
          <li>{resumeData.experience[0].bullets[6]}</li>
          <li>{resumeData.experience[0].bullets[7]}</li>
        </ul>
      </div>
    );
  }
  
  function Projects() {
    return (
      <div>
        <p>
          {resumeData.projects[0].name} | {resumeData.projects[0].stack.join(", ")} | {resumeData.projects[0].date}
        </p>
        <ul>
          <li>{resumeData.projects[0].bullets[0]}</li>
          <li>{resumeData.projects[0].bullets[1]}</li>
          <li>{resumeData.projects[0].bullets[2]}</li>
        </ul>
  
        <p>
          {resumeData.projects[1].name} | {resumeData.projects[1].stack.join(", ")} | {resumeData.projects[1].startDate} - {resumeData.projects[1].endDate}
        </p>
        <ul>
          <li>{resumeData.projects[1].bullets[0]}</li>
          <li>{resumeData.projects[1].bullets[1]}</li>
        </ul>
  
        <p>
          {resumeData.projects[2].name} | {resumeData.projects[2].stack.join(", ")} | {resumeData.projects[2].startDate} - {resumeData.projects[2].endDate}
        </p>
        <ul>
          <li>{resumeData.projects[2].bullets[0]}</li>
          <li>{resumeData.projects[2].bullets[1]}</li>
        </ul>
  
        <p>
          {resumeData.projects[3].name} | {resumeData.projects[3].stack.join(", ")} | {resumeData.projects[3].startDate} - {resumeData.projects[3].endDate}
        </p>
        <ul>
          <li>{resumeData.projects[3].bullets[0]}</li>
          <li>{resumeData.projects[3].bullets[1]}</li>
        </ul>
      </div>
    );
  }
  
  function Education() {
    return (
      <div>
        <p>
          {resumeData.education[0].school} - {resumeData.education[0].degree} | GPA: {resumeData.education[0].gpa} | {resumeData.education[0].graduationDate}
        </p>
        <p>
          {resumeData.education[1].school} - {resumeData.education[1].degree} | GPA: {resumeData.education[1].gpa} | {resumeData.education[1].graduationDate}
        </p>
      </div>
    );
  }
  export {Header,Skills,Experience,Projects,Education};
