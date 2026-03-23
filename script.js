const person = {
  name: "Emma",
  email: "emmahsde@gmail.com",
  area: "NY/NJ",
  aboutMe: "Hi, my name is Emma.",
  proExp: ["Attend JS bootcamp.", "Worked as a chemical analyst."],
};

const headerSection = document.querySelector("header");
console.log("this is header element.classList", headerSection.classList);
const name = headerSection.querySelector("h1");
name.textContent = person.name;
const email = headerSection.querySelector("p#email");
email.textContent = person.email;
const area = headerSection.querySelector("p#area");
area.textContent = person.area;

const aboutMeSection = document.querySelector("#aboutme");
const aboutMe = aboutMeSection.querySelector("#aboutme");
aboutMe.textContent = person.aboutMe;

const experienceListSection = document.querySelector("#experiencelist");
const experienceList = experienceListSection.querySelectorAll("li");

experienceList.forEach((ele, i) => {
  ele.textContent = person.proExp[i];
});

const toggleInput = document.querySelector(".toggle-input");

toggleInput.addEventListener("input", (e) => {
  const isDark = e.target.checked;

  // 1. Change page appearance
  document.body.classList.toggle("dark-mode", isDark);
  console.log("this is document.body.classList", document.body.classList);
  // 2. Save preference to localStorage
  localStorage.setItem("darkMode", isDark);
});

// Run on page load to restore preference
const saved = localStorage.getItem("darkMode");
if (saved === "true") {
  toggleInput.checked = true;
  document.body.classList.add("dark-mode");
}
