import React from "react";
import ResumeAnnotation from "./components/resume-anno";
import {
  Nav,
  SiteHeader,
  AboutMe,
  ExperienceList,
  DarkModeToggle,
  ContactInfo,
  ContactForm,
} from "./components/layout";

function App() {
  return (
    <div className="app-container">
      <DarkModeToggle />
      <Nav />
      <SiteHeader />
      <AboutMe />
      <ExperienceList />
      <ResumeAnnotation />
      <ContactInfo />
      <ContactForm />
    </div>
  );
}

export default App;
