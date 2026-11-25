// ==========================================================================
// Mobile nav toggle (the three-line "hamburger" button)
// The button only appears below 768px (see styles.css, section 5).
// ==========================================================================

const nav = document.querySelector("nav");
const toggle = document.querySelector(".nav-toggle");

// Mark the nav as collapsible. CSS only hides the links when this class is
// present, so if JavaScript fails to load, the links stay visible.
nav.classList.add("nav-collapsible");

function setMenuOpen(isOpen) {
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
}

// Open/close when the button is clicked
toggle.addEventListener("click", () => {
  const isOpen = toggle.getAttribute("aria-expanded") === "true";
  setMenuOpen(!isOpen);
});

// Close the menu after a link is chosen
nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

// Close the menu with the Escape key and return focus to the button
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
    setMenuOpen(false);
    toggle.focus();
  }
});


// ==========================================================================
// Skills show/hide button
// "Skills"      -> list hidden; click to show it
// "Hide Skills" -> list visible; click to hide it
// The list starts hidden. It's hidden here rather than in the HTML so the
// skills stay visible if JavaScript fails to load.
// ==========================================================================

const skillsToggle = document.querySelector(".skills-toggle");
const skillsList = document.querySelector("#skills-list");

function setSkillsVisible(isVisible) {
  skillsList.hidden = !isVisible;
  skillsToggle.textContent = isVisible ? "Hide Skills" : "Skills";
  // aria-expanded tells screen readers whether the list is open
  skillsToggle.setAttribute("aria-expanded", String(isVisible));
}

setSkillsVisible(false);

skillsToggle.addEventListener("click", () => {
  setSkillsVisible(skillsList.hidden);
});


// ==========================================================================
// Message character counter (bottom right of the contact form's textarea)
// Updates on every change: typing, pasting, deleting.
// ==========================================================================

const messageBox = document.querySelector("textarea#message");
const messageCount = document.querySelector("#message-count");

function updateMessageCount() {
  const count = messageBox.value.length;
  messageCount.textContent = count + (count === 1 ? " character" : " characters");
}

updateMessageCount(); // covers text the browser restores after a reload
messageBox.addEventListener("input", updateMessageCount);


// ==========================================================================
// Dark / light theme toggle (footer, bottom right)
// The starting theme is set by a small script in the <head> of index.html:
// the visitor's saved choice, or their system setting if they haven't chosen.
// ==========================================================================

const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = themeToggle.querySelector(".theme-toggle-icon");
const themeText = themeToggle.querySelector(".theme-toggle-text");

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.documentElement.setAttribute("data-theme", theme);
  // aria-pressed tells screen readers whether dark mode is on
  themeToggle.setAttribute("aria-pressed", String(isDark));
  // The button shows the mode you'll switch TO
  themeIcon.textContent = isDark ? "☀" : "☾"; // sun : moon
  themeText.textContent = isDark ? "Light mode" : "Dark mode";
}

applyTheme(document.documentElement.getAttribute("data-theme") || "light");

themeToggle.addEventListener("click", () => {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  applyTheme(next);
  try {
    localStorage.setItem("theme", next); // remember the choice for next visit
  } catch (error) {
    // Storage can be blocked (e.g. private browsing); the toggle still works
  }
});


// ==========================================================================
// Dynamic greeting (footer, between the copyright and the theme toggle)
// Uses the visitor's local time on a 24-hour clock:
//   05:00 - 11:59  Good morning
//   12:00 - 16:59  Good afternoon
//   17:00 - 04:59  Good evening
// ==========================================================================

const greeting = document.querySelector("#greeting");

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

function updateGreeting() {
  greeting.textContent = getGreeting(new Date().getHours()) + "!";
}

updateGreeting();
// Re-check every minute so the greeting changes if the page is left open
setInterval(updateGreeting, 60 * 1000);
