const person = {
  name: "Emma",
  email: "emmahsde@gmail.com",
  area: "NY/NJ",
  aboutMe: "Hi, my name is Emma.",
  proExp: ["Attend JS bootcamp.", "Worked as a chemical analyst."],
};

const headerSection = document.querySelector(".header");
const name = headerSection.querySelector("h1");
name.textContent = person.name;
const email = headerSection.querySelector("p#email");
email.textContent = person.email;
const area = headerSection.querySelector("p#area");
area.textContent = person.area;

const aboutMeSection = document.querySelector(".aboutme");
const aboutMe = aboutMeSection.querySelector("#aboutme");
aboutMe.textContent = person.aboutMe;

const experienceListSection = document.querySelector(".experiencelist");
const experienceList = experienceListSection.querySelectorAll("li");
console.log(experienceList, typeof experienceList);
experienceList.forEach((ele, i) => {
  ele.textContent = person.proExp[i];
});

const contactSection = document.querySelector(".contact");
const contactInfo = contactSection.querySelector("#contactinfo");
contactInfo.textContent = person.email;
