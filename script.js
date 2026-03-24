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
