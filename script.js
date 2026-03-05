console.log("script loaded");
const person = {
  Name: "Emma",
  Email: "emmahsde@gmail.com",
  Area: "NY/NJ",
  Aboutme: "Hi, my name is Emma.",
  ProExp: ["Attend JS bootcamp.", "Worked as a chemical analyst."],
};

const person_name = document.getElementById("name");
person_name.textContent = person.Name;

const person_email = document.getElementById("email");
person_email.textContent = person.Email;

const person_area = document.getElementById("area");
person_area.textContent = person.Area;

const person_aboutme = document.getElementById("aboutme");
person_aboutme.textContent = person.Aboutme;

const person_proexp1 = document.getElementById("proexp1");
person_proexp1.textContent = person.ProExp[0];

const person_proexp2 = document.getElementById("proexp2");
person_proexp2.textContent = person.ProExp[1];

const contact = document.getElementById("contactinfo");
contact.textContent = contact.textContent + person.Email;

const happy = "happywife, happylife"
