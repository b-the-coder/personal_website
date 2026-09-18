import React, { useState } from "react";
import { person } from "../portfolioData.json";
import { useRef, useEffect } from "react";

function Nav() {
  return (
    <nav>
      <a href="#aboutme">About Me</a>
      <a href="#experiencelist">Professional Experience</a>
      <a href="#contact">Contact</a>
    </nav>
  );
}

function Header() {
  return (
    <header>
      <h1>{person.name}</h1>
      <p id="email">{person.email}</p>
      <p id="area">{person.area}</p>
    </header>
  );
}

function AboutMe() {
  return (
    <section id="aboutme">
      <h2>About me:</h2>
      <p id="aboutme-text">{person.aboutMe}</p>
    </section>
  );
}

function ExperienceList() {
  return (
    <section id="experiencelist">
      <h2>Experience:</h2>
      <ul>
        {person.proExp.map((exp, i) => (
          <li key={i}>{exp}</li>
        ))}
      </ul>
    </section>
  );
}

// Dark mode
function DarkModeToggle() {
  const toggleinputRef = useRef(null);
  const handleChange = (e) => {
    console.log("I am in handle change");
    const isDark = e.target.checked;
    // classList.toogle("class", condition). If the condition is true, add the class. If the condition is false, remove the class.
    document.body.classList.toggle("dark-mode", isDark);
    localStorage.setItem("darkMode", isDark);
  };

  useEffect(() => {
    const darkModeChosen = localStorage.getItem("darkMode");

    if (darkModeChosen === "true") {
      // User has explicitly chosen dark mode before
      toggleinputRef.current.checked = true;
      document.body.classList.add("dark-mode");
    } else if (darkModeChosen === null) {
      // First visit — no saved preference, mirror OS/browser setting

      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.body.classList.toggle("dark-mode", prefersDark);
      toggleinputRef.current.checked = prefersDark;
      // Note: darkModeChosen === "false" is intentionally unhandled — light mode is the default
    }
  }, []);

  return (
    <div id="preference">
      <input
        ref={toggleinputRef}
        type="checkbox"
        id="dark-mode"
        className="toggle-input"
        onChange={handleChange}
      />
      <label htmlFor="dark-mode" className="toggle-label"></label>
      <span className="toggle-text"> Dark Mode</span>
    </div>
  );
}

function ContactInfo() {
  useEffect(() => {
    // 确保 ionicons 脚本已加载(也可以直接放在 index.html 的 <head> 里)
    if (!document.querySelector('script[src*="ionicons"]')) {
      const moduleScript = document.createElement("script");
      moduleScript.type = "module";
      moduleScript.src =
        "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js";
      document.head.appendChild(moduleScript);

      const nomoduleScript = document.createElement("script");
      nomoduleScript.setAttribute("nomodule", "");
      nomoduleScript.src =
        "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js";
      document.head.appendChild(nomoduleScript);
    }
  }, []);

  return (
    <section id="contact">
      <h2>Get in touch with me:</h2>
      <div id="contactinfo">
        <a href="mailto:emmahsde@gmail.com" id="email">
          <ion-icon name="mail-outline"></ion-icon>
        </a>
        <a href="https://github.com/b-the-coder">
          <ion-icon name="logo-github"></ion-icon>
        </a>
        <a href="https://www.linkedin.com/in/binemmahe/">
          <ion-icon name="logo-linkedin"></ion-icon>
        </a>
      </div>
    </section>
  );
}

//form submit
function validateForm(values) {
  // all fields non-empty
  const allFilled = Object.values(values).every((val) => val.trim() !== "");

  // simple email check
  const validEmail = values.email.includes("@");

  if (allFilled && validEmail) {
    // return a copy of the object for payload
    return { ...values };
  } else {
    if (!allFilled) {
      return "Please fill out all required fields!";
    }
    if (!validEmail) {
      return "Please enter a valid email address (must contain '@')!";
    }
  }
}

function ContactForm() {
  // Initialize with empty strings to avoid undefined errors during early validation
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Validate input and set states
  const handleChange = (e) => {
    console.log("I am in form input change")
    const { name, value } = e.target;
    const latestFormData = {
      ...formData,
      [name]: value,
    };
    // Kept your inline validation logic if needed for extension later
    const validatedInput = validateForm(latestFormData);
    setFormData(latestFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default browser page reload

    // Run the validation gate one final time to check the completed formData
    const payload = validateForm(formData);

    // If payload is a string, it means validation failed and returned an error message
    if (typeof payload === "string") {
      alert(payload);
      return;
    }

    // Validation passed (payload is now the safe object data ready for backend)
    if (payload) {
      fetch("http://localhost:3000/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
        .then((res) => {
          if (!res.ok) {
            return res.json().then((data) => {
              throw data; // Throw backend errors to catch block
            });
          }
          return res.json();
        })
        .then((data) => {
          console.log("SUCCESS:", data);
          alert("Data saved successfully!");
          // Optional: reset form state here if needed
        })
        .catch((err) => {
          console.error("FETCH ERROR:", err);
          alert("Failed to save data. Server error.");
        });
    } else {
      alert("Invalid input");
    }
  };

  return (
    /* FIXED: Bind onSubmit to the form element directly */
    <form className="contactForm" onSubmit={handleSubmit}>
      <h2>Send me a message!</h2>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          required
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          onChange={handleChange}
        />
      </div>

      <div>
        <label htmlFor="message">Message:</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          onChange={handleChange}
        ></textarea>
      </div>

      <div id="submitbutton">
        <input type="submit" value="Send" />
      </div>
    </form>
  );
}

export {
  Nav,
  Header,
  AboutMe,
  ExperienceList,
  DarkModeToggle,
  ContactInfo,
  ContactForm,
};
