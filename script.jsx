import React from "react";
import { useState, useEffect} from "react";
import { createRoot } from "react-dom/client";
import {
  Header,
  Contact,
  Skills,
  Experience,
  Projects,
  Education,
} from "./components/resumeText";
import {
  AnnotationOfferer,
  AnnotationDisplay,
  AnnotationInput,
} from "./components/annoFeature";

function ResumeText({
  annotationList,
  setAnnotationList,
  currentAnnotationId,
  setCurrentAnnotationId,
  mode,
  setMode,
  selectedText,
  setSelectedText,
  selectionPosition,
  setSelectionPosition,
}) {
  const handleSelection = () => {
    const userSelection = window.getSelection();
    const selectedString = userSelection.toString();
    const range = userSelection.getRangeAt(0);
    const textPositionNode =
      range.startContainer.parentElement.closest("[data-text-id]");
    const textPosition = textPositionNode.getAttribute("data-text-id");
    const rect = range.getBoundingClientRect();
    const position = {
      viewportposition: { x: rect.right, y: rect.bottom },
      textposition: textPosition,
    };

    if (selectedString === "" || selectedString === null) {
      setMode("idle");
      return;
    }

    setMode("text_selected");
    setSelectedText(selectedString);
    setSelectionPosition(position);
    setCurrentAnnotationId("")
  };
  const handleClick = (e) => {
    const annoId = e.target.dataset.annoId;
    if (annoId) {
      setCurrentAnnotationId(annoId);
      setMode("anno_display");
  }
  };

  return (
    <div
      className="resumeText"
      onMouseUp={handleSelection}
      onClick={handleClick}
    >
      <Header annotationList={annotationList} />
      <Contact annotationList={annotationList} />
      <Skills annotationList={annotationList} />
      <Experience annotationList={annotationList} />
      <Projects annotationList={annotationList} />
      <Education annotationList={annotationList} />
    </div>
  );
}

function Annofeature({
  mode,
  setMode,
  annotationList,
  setAnnotationList,
  currentAnnotationId,
  setCurrentAnnotationId,
  selectedText,
  setSelectedText,
  selectionPosition,
  setSelectionPosition,
}) {
  return (
    <div className="annoFeature">
      <AnnotationOfferer
        mode={mode}
        setMode={setMode}
        selectedText={selectedText}
        setSelectedText={setSelectedText}
        selectionPosition={selectionPosition}
        setSelectionPosition={setSelectionPosition}
      />
      <AnnotationInput
        mode={mode}
        setMode={setMode}
        annotationList={annotationList}
        setAnnotationList={setAnnotationList}
        selectedText={selectedText}
        setSelectedText={setSelectedText}
        selectionPosition={selectionPosition}
        setSelectionPosition={setSelectionPosition}
        currentAnnotationId={currentAnnotationId}
        setCurrentAnnotationId={setCurrentAnnotationId}
      />
      <AnnotationDisplay
        mode={mode}
        setMode={setMode}
        annotationList={annotationList}
        setAnnotationList={setAnnotationList}
        currentAnnotationId={currentAnnotationId}
        setCurrentAnnotationId={setCurrentAnnotationId}
      />
    </div>
  );
}

function ResumeAnno() {
  const annotationListinit = () => {
    if (localStorage.getItem("annotationList") === null) {
      return {};
    } else {
      return JSON.parse(localStorage.annotationList);
    }
  };
  const [annotationList, setAnnotationList] = useState(annotationListinit());
  const [currentAnnotationId, setCurrentAnnotationId] = useState("");
  const [mode, setMode] = useState("idle");
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState(null);

  useEffect(() => {
    localStorage.annotationList = JSON.stringify(annotationList);
  }, [annotationList]);

  return (
    <div className="resumeAnno">
      <ResumeText
        mode={mode}
        setMode={setMode}
        selectedText={selectedText}
        setSelectedText={setSelectedText}
        selectionPosition={selectionPosition}
        setSelectionPosition={setSelectionPosition}
        annotationList={annotationList}
        setAnnotationList={setAnnotationList}
        currentAnnotationId={currentAnnotationId}
        setCurrentAnnotationId={setCurrentAnnotationId}
      />
      <Annofeature
        mode={mode}
        setMode={setMode}
        selectedText={selectedText}
        setSelectedText={setSelectedText}
        selectionPosition={selectionPosition}
        setSelectionPosition={setSelectionPosition}
        annotationList={annotationList}
        setAnnotationList={setAnnotationList}
        currentAnnotationId={currentAnnotationId}
        setCurrentAnnotationId={setCurrentAnnotationId}
      />
    </div>
  );
}
const domNode = document.getElementById("resumeAnno");
const root = createRoot(domNode);
root.render(<ResumeAnno />);

const person = {
  name: "Emma",
  email: "emmahsde@gmail.com",
  area: "NY/NJ",
  aboutMe: "Hi, my name is Emma.",
  proExp: ["Attend JS bootcamp.", "Worked as a chemical analyst."],
};

// Populate header
const headerSection = document.querySelector("header");
const name = headerSection.querySelector("h1");
name.textContent = person.name;
const email = headerSection.querySelector("p#email");
email.textContent = person.email;
const area = headerSection.querySelector("p#area");
area.textContent = person.area;

// Populate about me
const aboutMeSection = document.querySelector("#aboutme");
const aboutMe = aboutMeSection.querySelector("#aboutme-text");
aboutMe.textContent = person.aboutMe;

// Populate experience list
// Assumes proExp items and <li> elements are in the same order
const experienceListSection = document.querySelector("#experiencelist");
const experienceList = experienceListSection.querySelectorAll("li");
experienceList.forEach((ele, i) => {
  ele.textContent = person.proExp[i];
});

// Dark mode
// Listen for toggle changes and persist the user's choice
const toggleInput = document.querySelector(".toggle-input");

toggleInput.addEventListener("input", (e) => {
  const isDark = e.target.checked;
  document.body.classList.toggle("dark-mode", isDark);
  localStorage.setItem("darkMode", isDark);
});

// On page load: restore saved preference, or fall back to OS setting
const darkModeChosen = localStorage.getItem("darkMode");

if (darkModeChosen === "true") {
  // User has explicitly chosen dark mode before
  toggleInput.checked = true;
  document.body.classList.add("dark-mode");
} else if (darkModeChosen === null) {
  // First visit — no saved preference, mirror OS/browser setting
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.body.classList.toggle("dark-mode", prefersDark);
  toggleInput.checked = prefersDark;
}
// Note: darkModeChosen === "false" is intentionally unhandled — light mode is the default

//form submit

//Get form values
const contantForm = document.querySelector(".contactForm");

const nameInput = contantForm.querySelector("#name");
const emailInput = contantForm.querySelector("#email");
const messageInput = contantForm.querySelector("#message");

const submitbutton = document.querySelector("#submitbutton");

function validateForm(values) {
  // all fields non-empty
  const allFilled = Object.values(values).every((val) => val.trim() !== "");

  // simple email check
  const validEmail = values.contactEmail.includes("@");

  if (allFilled && validEmail) {
    // return a copy of the object for payload
    return { ...values };
  } else {
    return null; // invalid
  }
}

submitbutton.addEventListener("click", (e) => {
  // to prevent browser default form submission
  e.preventDefault();

  const formValues = {
    contactName: nameInput.value,
    contactEmail: emailInput.value,
    contactMessage: messageInput.value,
  };
 

  const payload = validateForm(formValues);
 
  if (payload) {
    
    fetch("http://localhost:3000/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      //same as .then((res) => {return res.json();})  arrow function without {} → implicit return
      .then((res) => {
        if (!res.ok) {
          return res.json().then((data) => {
            throw data; // Throw backend errors to catch block
          });
        }
        return res.json();
      })
      .then((data) => console.log(data))
      .catch((err) => console.error("FETCH ERROR:", err));
  } else {
    alert("Invalid input");
  }
});
