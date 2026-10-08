import React from "react";
import ResumeAnno from "./components/resume-anno";
import {
  Nav,
  Header,
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
      <Header />
      <AboutMe />
      <ExperienceList />

      <ResumeAnno />
      <ContactInfo />
      <ContactForm />
    </div>
  );
}

export default App;
