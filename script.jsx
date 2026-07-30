import React from "react";
import { useState, useEffect } from "react";
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

import { getNextModeOnSelection, groupAnnotationsByTextId } from "./utils";

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
  const groupedAnnotation = groupAnnotationsByTextId(annotationList);
 
  
  const handleSelection = () => {
    const userSelection = window.getSelection();

    const selectedString = userSelection.toString();

    const range = userSelection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const textPositionNode =
      range.startContainer.parentElement.closest("[data-text-id]");
    
    const preCaretRange = range.cloneRange();

    // 让克隆出来的选区，起点固定在最外层大容器的开头
    preCaretRange.selectNodeContents(textPositionNode);
    // 让克隆选区的终点，等于用户实际选中的起点
    preCaretRange.setEnd(range.startContainer, range.startOffset);

    // 此时，克隆选区内包含的所有文本字符长度，就是绝对的全局起始位置！
    // 注意：toString() 会自动平铺所有子元素的文本
    const globalStartIndex = preCaretRange.toString().length;

    // 同理，计算全局结束位置
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    const globalEndIndex = preCaretRange.toString().length;
    const startIndex = globalStartIndex;
    const endIndex = globalEndIndex;
   
    const textPosition = textPositionNode.getAttribute("data-text-id");
   

    const selectionPosition = {
      viewportPosition: { x: rect.right, y: rect.bottom },
      textPosition: textPosition,
      range: [startIndex, endIndex],
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
  const [currentAnnotationId, setCurrentAnnotationId] = useState(undefined);
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
  // classList.toogle("class", condition). If the condition is true, add the class. If the condition is false, remove the class.
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
