import { describe, expect, test, afterEach, vi } from "vitest";
import { render, cleanup, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import React from "react";

import {
  ResumeText,
  Header,
  Contact,
  Skills,
  Experience,
  Projects,
  Education,
} from "../components/resumeText";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("resumeText", () => {
  let mockProps;

  test("handleSelection setup states with valid selection", () => {
    mockProps = {
      annotationList: {},
      setCurrentAnnotationId: vi.fn(),
      setMode: vi.fn(),
      setSelectedText: vi.fn(),
      setSelectionPosition: vi.fn(),
    };
    const { container } = render(<ResumeText {...mockProps} />);
    const textPositionNode = container.querySelector(".resumeHeader");
    const textNode = textPositionNode.querySelector("h2").firstChild;

    // 3. 构建真正的 JSDOM DOM Range
    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, 3);
    range.getBoundingClientRect = vi.fn().mockReturnValue({
      top: 0,
      left: 0,
      bottom: 10,
      right: 10,
      width: 10,
      height: 10,
    });
    // 4. Mock window.getSelection 返回这个 JSDOM Range
    const selectedString = textNode.textContent.slice(0, 3);
    vi.spyOn(window, "getSelection").mockReturnValue({
      toString: () => selectedString,
      getRangeAt: () => range,
    });
    // 5. 触发 mouseup 事件
    const resumeTextContainer = container.querySelector(".resumeText");
    fireEvent.mouseUp(resumeTextContainer);

    // 6. 断言 4 个 Setter 的调用（彻底忽略 viewportPosition）
    expect(mockProps.setSelectedText).toHaveBeenCalledWith(selectedString);
    expect(mockProps.setSelectionPosition).toHaveBeenCalledWith(
      expect.objectContaining({
        textPosition: "resume-header",
        range: [0, 3], // getRelativeOffsets 在 JSDOM 环境下真实计算出的相对索引
      })
    );
    expect(mockProps.setCurrentAnnotationId).toHaveBeenCalledWith(undefined);
    expect(mockProps.setMode).toHaveBeenCalledWith("text_selected"); // 可根据 getNextModeOnSelection 的返回值写具体期望值
  });

  describe("handleClick setup states with click behavior", () => {
    test("setup states when click annotations", () => {
      mockProps = {
        //// Tests handleClick only; annotationList is intentionally empty.
        annotationList: {},
        setCurrentAnnotationId: vi.fn(),
        setMode: vi.fn(),
        setSelectedText: vi.fn(),
        setSelectionPosition: vi.fn(),
      };

      const { container } = render(<ResumeText {...mockProps} />);
      const resumeText = container.querySelector(".resumeText");
      const annotationNode = document.createElement("span");

      annotationNode.dataset.annotationIds = "fakeannotationIDs";
      resumeText.appendChild(annotationNode);

      fireEvent.click(annotationNode);

      expect(mockProps.setCurrentAnnotationId).toHaveBeenCalledWith(
        "fakeannotationIDs"
      );
      expect(mockProps.setMode).toHaveBeenCalledWith("anno_display");
    });

    test("setup states when click no annotations text content", () => {
      mockProps = {
        annotationList: {},
        setCurrentAnnotationId: vi.fn(),
        setMode: vi.fn(),
        setSelectedText: vi.fn(),
        setSelectionPosition: vi.fn(),
      };

      const { container } = render(<ResumeText {...mockProps} />);
      const resumeText = container.querySelector(".resumeText");
      const noAnnotationNode = document.createElement("span");

      resumeText.appendChild(noAnnotationNode);

      fireEvent.click(noAnnotationNode);

      expect(mockProps.setCurrentAnnotationId).not.toHaveBeenCalled();
      expect(mockProps.setMode).not.toHaveBeenCalled();
    });
  });
});

describe("Header", () => {
  test("correctly render Header section", () => {
    const headerDiv = `<div class="resumeHeader" data-text-id="resume-header"><h2>Bin (Emma) He</h2><div><p>emmahsde@gmail.com</p><p>Greater NYC Area</p></div></div>`;
    const { container } = render(<Header annotationList={{}} />);

    const headerSection = container.firstChild.outerHTML;

    expect(headerSection).toBe(headerDiv);
  });
});

describe("Contact", () => {
  test("correctly render Contact section", () => {
    const contactDiv = `<div class="contact-links" data-text-id="resume-links"><p class="contact-item">https://github.com/b-the-coder</p><p class="contact-item">https://www.linkedin.com/in/bin-emma-he/</p></div>`;

    const { container } = render(<Contact annotationList={{}} />);

    const contactSection = container.firstChild.outerHTML;

    expect(contactSection).toBe(contactDiv);
  });
});

describe("Skills", () => {
  test("correctly render Skills section", () => {
    const skillDiv = `<div class="skills"><h2 class="resume-section-title" data-text-id="skl">Skills</h2><p data-text-id="skl-0"><strong>Frontend</strong><span> HTML5, CSS3, Sass, Material UI, JavaScript (ES6+), TypeScript, React, HOC Patterns</span></p><p data-text-id="skl-1"><strong>StateSPA</strong><span> Redux, Redux Toolkit, Webpack, Babel, ESLint, Prettier</span></p><p data-text-id="skl-2"><strong>Backend</strong><span> Node.js, Express.js, RESTful APIs</span></p><p data-text-id="skl-3"><strong>Databases</strong><span> SQL (PostgreSQL), NoSQL (MongoDB)</span></p><p data-text-id="skl-4"><strong>Testing</strong><span> Jest, React Testing Library</span></p><p data-text-id="skl-5"><strong>Devops</strong><span> Docker, AWS (EC2, S3, Beanstalk, Cognito), Git/GitHub Flow (CI/CD), npm, Bash Scripts</span></p></div>`;

    const { container } = render(<Skills annotationList={{}} />);

    const skillSection = container.firstChild.outerHTML;

    expect(skillSection).toBe(skillDiv);
  });
});

describe("Experience", () => {
  test("correctly render Experience section", () => {
    const experienceDiv = `<div class="experience"><h2 class="resume-section-title" data-text-id="exp">Experience</h2><div><p data-text-id="exp-0-title"><strong>Software Engineer</strong> - Skyscrapper AWS EC2 instance visualizer (OpenSource) | 2024-03 - Present</p><ul><li data-text-id="exp-0-bullet-0">Designed and implemented a React-based dashboard using Chart.js to visualize AWS EC2 instance metrics, improving data readability and user experience.</li><li data-text-id="exp-0-bullet-1">Implemented Redux for centralized state management, handling user authentication (Auth0), AWS Cognito verification, and EC2 instance data visualization to eliminate prop drilling and ensure consistent state.</li><li data-text-id="exp-0-bullet-2">Streamlined State Management with Redux Toolkit, reduced boilerplate code, and improved code maintainability, enabling the team to focus on core application logic.</li><li data-text-id="exp-0-bullet-3">Optimized API interactions with RTK Query, reducing redundant network requests and improving front-end performance.</li><li data-text-id="exp-0-bullet-4">Built secure RESTful API endpoints using Express.js, implementing JWT-based authentication and AWS Cognito integration to protect user data and ensure authorized access.</li><li data-text-id="exp-0-bullet-5">Integrated AWS CloudWatch for real-time EC2 metrics retrieval, leveraging Promise.all to concurrently fetch multiple metrics and reduce API response time from 7 seconds to 1 second.</li><li data-text-id="exp-0-bullet-6">Conducted unit testing of frontend components using Jest and React Testing Library to ensure modular code structure and new feature development.</li><li data-text-id="exp-0-bullet-7">Performed as team Scrum Master, spearheaded the creation of a Jira workflow, facilitated daily stand-ups and Sprint planning.</li></ul></div></div>`;
    const { container } = render(<Experience annotationList={{}} />);
    const experienceSection = container.firstChild.outerHTML;
    expect(experienceSection).toBe(experienceDiv);
  });
});

describe("Projects", () => {
  test("correctly render Experience section", () => {
    const projectsDiv = `<div class="projects"><h2 class="resume-section-title" data-text-id="pjt">Projects</h2><div><p class="project-header" data-text-id="pjt-0-title"><span><strong>Merchenwise</strong> | Python, Scrapy, Matplotlib</span><span>2025-01 - 2025-02</span></p><ul><li data-text-id="pjt-0-bullet-0">Developed a Python Scrapy crawler with rotating proxy middleware to avoid IP blocking, implementing page parsing logic for structured data extraction.</li><li data-text-id="pjt-0-bullet-1">Implemented data pipeline cleansing product metadata (prices, reviews) using regex/NLP techniques.</li><li data-text-id="pjt-0-bullet-2">Built dynamic Matplotlib dashboards to visualize historical pricing trends of tracked merchandise, enabling users to identify price drops and optimal purchase times.</li></ul></div><div><p class="project-header" data-text-id="pjt-1-title"><span><strong>BiteByte</strong> | React, TypeScript, PostgreSQL</span><span>2024-03 - 2024-06</span></p><ul><li data-text-id="pjt-1-bullet-0">Implemented React Router for client-side routing, enabling seamless navigation between Login, Signup, and HomePage components.</li><li data-text-id="pjt-1-bullet-1">Established a PostgreSQL database connection, defined and associated models with custom aliases for relationships, and exported the configured Sequelize instance and models.</li></ul></div><div><p class="project-header" data-text-id="pjt-2-title"><span><strong>Dating Activity Recommender</strong> | React, Node.js, OpenAI API</span><span>2024-03 - 2024-06</span></p><ul><li data-text-id="pjt-2-bullet-0">Utilized React Hooks (useState, useEffect) within a functional component to manage state and side effects, facilitating dynamic updates and asynchronous data fetching.</li><li data-text-id="pjt-2-bullet-1">Implemented OpenAI's Chat API within Node.js environment to dynamically generate activity suggestions and restaurant options based on user queries.</li></ul></div><div><p class="project-header" data-text-id="pjt-3-title"><span><strong>Recipe Finder</strong> | Node.js, Express, MongoDB</span><span>2024-03 - 2024-06</span></p><ul><li data-text-id="pjt-3-bullet-0">Set up an Express server with defined endpoints and middleware to handle unknown routes, leveraging the modularity of Express.Router() for organized route handling.</li><li data-text-id="pjt-3-bullet-1">Utilized Mongoose for MongoDB and Node.js to define and manage database schemas, ensuring data integrity and consistency across the application.</li></ul></div></div>`;

    const { container } = render(<Projects annotationList={{}} />);

    const projectsSection = container.firstChild.outerHTML;

    expect(projectsSection).toBe(projectsDiv);
  });
});

describe("Education", () => {
  test("correctly render Experience section", () => {
    const educationDiv = `<div class="education"><h2 class="resume-section-title" data-text-id="edu">Education</h2><div><p class="education-header" data-text-id="edu-0-school-gradudation-date"><span><strong>New Jersey Institute of Technology</strong></span><span>Graduated 2013-07</span></p><p data-text-id="edu-0-degree-grade">M.S. in Engineering | GPA: 3.55</p></div><div><p class="education-header" data-text-id="edu-1-school-gradudation-date"><span><strong>The Capital University of Economics and Business</strong></span><span>Graduated 2011-07</span></p><p data-text-id="edu-1-degree-grade">B.S. in Engineering | GPA: 3.49</p></div></div>`;
    const { container } = render(<Education annotationList={{}} />);

    const educationSection = container.firstChild.outerHTML;

    expect(educationSection).toBe(educationDiv);
  });
});
