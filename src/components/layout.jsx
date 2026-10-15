import React, { useState } from "react";
import { person } from "../portfolio-data.json";
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

function SiteHeader() {
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

function DarkModeToggle() {
  const toggleInputRef = useRef(null);

  const handleDarkModeChange = (e) => {
    const isDark = e.target.checked;

    // Pass the boolean explicitly so the dark-mode body class always matches the checkbox
    document.body.classList.toggle("dark-mode", isDark);
    localStorage.setItem("darkMode", isDark);
  };

  useEffect(() => {
    const darkModeChosen = localStorage.getItem("darkMode");
    if (darkModeChosen === "true") {
      toggleInputRef.current.checked = true;
      document.body.classList.add("dark-mode");
    } else if (darkModeChosen === null) {
      const isDarkModePreferred = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.body.classList.toggle("dark-mode", isDarkModePreferred);
      toggleInputRef.current.checked = isDarkModePreferred;
      // Note: darkModeChosen === "false" is intentionally unhandled — light mode is the default
    }
  }, []);

  return (
    <div id="preference">
      <input
        ref={toggleInputRef}
        type="checkbox"
        id="dark-mode"
        className="toggle-input"
        onChange={handleDarkModeChange}
      />
      <label htmlFor="dark-mode" className="toggle-label"></label>
      <span className="toggle-text"> Dark Mode</span>
    </div>
  );
}

function ContactInfo() {
  useEffect(() => {
    if (!document.querySelector('script[src*="ionicons"]')) {
      const moduleScript = document.createElement("script");
      moduleScript.type = "module";
      moduleScript.src =
        "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js";
      document.head.appendChild(moduleScript);
      // Load the nomodule build as a fallback for browsers without ES module support.
      const noModuleScript = document.createElement("script");
      noModuleScript.setAttribute("nomodule", "");
      noModuleScript.src =
        "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js";
      document.head.appendChild(noModuleScript);
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

function validateForm(values) {
  const allFilled = Object.values(values).every((val) => val.trim() !== "");

  const validEmail = values.email.includes("@");

  if (allFilled && validEmail) {
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    console.log("I am in form input change");
    const { name, value } = e.target;
    const latestFormData = {
      ...formData,
      [name]: value,
    };

    setFormData(latestFormData);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default browser page reload
    // Suggested: Prevent native form submission from reloading the page.

    // Run the validation gate one final time to check the completed formData
    // Suggested: Validate the complete form before submission.
    const payload = validateForm(formData);

    // If payload is a string, it means validation failed and returned an error message
    // Suggested: Stop submission when validation returns an error message.
    if (typeof payload === "string") {
      alert(payload);
      return;
    }

    // Validation passed (payload is now the safe object data ready for backend)
    // Suggested: Validation passed; send the form payload to the backend.
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
              // Suggested: Forward the parsed backend error to the catch handler.
            });
          }
          return res.json();
        })
        .then((data) => {
          console.log("SUCCESS:", data);
          alert("Data saved successfully!");
          // Optional: reset form state here if needed
          // Suggested: Remove this optional note unless resetting the form is a planned requirement.
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
    /* Suggested: Remove this historical note; the onSubmit binding is clear from the form element. */
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
  SiteHeader,
  AboutMe,
  ExperienceList,
  DarkModeToggle,
  ContactInfo,
  ContactForm,
};
