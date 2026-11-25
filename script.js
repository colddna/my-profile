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
// Future Projects
// The cards are NOT hardcoded in the HTML. They're built from the
// `projects` array below, and rebuilt (re-rendered) after every change:
//   - submitting the form adds a project
//   - the × button deletes one
//   - dragging a card onto another moves it to that spot
// The array is saved in localStorage, so changes survive a page reload.
// ==========================================================================

const PROJECTS_KEY = "futureProjects";

// Used the first time someone visits (nothing saved yet)
const sampleProjects = [
  {
    name: "Autonomous robot",
    description: "A self-driving robot that maps a room and navigates around obstacles on its own.",
  },
  {
    name: "Rover game for Android",
    description: "A mobile game where you drive a rover across rough terrain and collect parts.",
  },
];

const projectForm = document.querySelector("#project-form");
const projectNameInput = document.querySelector("#project-name");
const projectDescInput = document.querySelector("#project-description");
const projectCards = document.querySelector("#project-cards");

let projects = loadProjects();

// Read the saved array; fall back to the samples if there's nothing valid
function loadProjects() {
  try {
    const saved = JSON.parse(localStorage.getItem(PROJECTS_KEY));
    if (Array.isArray(saved)) {
      return saved.filter((p) => p && typeof p.name === "string" && typeof p.description === "string");
    }
  } catch (error) {
    // Bad JSON or storage blocked: use the samples
  }
  return sampleProjects.map((p) => ({ ...p })); // copies, so the samples stay untouched
}

function saveProjects() {
  try {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  } catch (error) {
    // Storage can be blocked (e.g. private browsing); the page still works,
    // changes just won't survive a reload
  }
}

// Build one card. textContent (not innerHTML) is used for the user's text
// so anything typed into the form is shown as plain text, never run as code.
function createProjectCard(project, index) {
  const card = document.createElement("li");
  card.className = "project-card";
  card.draggable = true;
  card.dataset.index = index;

  const grip = document.createElement("span");
  grip.className = "project-card-grip";
  grip.setAttribute("aria-hidden", "true");
  grip.textContent = "⠇"; // ⠇ vertical dots

  const body = document.createElement("div");
  body.className = "project-card-body";

  const title = document.createElement("h3");
  title.textContent = project.name;

  const description = document.createElement("p");
  description.textContent = project.description;

  body.append(title, description);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "project-delete";
  deleteButton.textContent = "×"; // ×
  deleteButton.setAttribute("aria-label", "Delete " + project.name);
  deleteButton.dataset.index = index;

  card.append(grip, body, deleteButton);
  return card;
}

// Clear the list and rebuild every card from the array
function renderProjects() {
  projectCards.replaceChildren();

  if (projects.length === 0) {
    const empty = document.createElement("li");
    empty.className = "project-empty";
    empty.textContent = "No future projects yet. Add one above.";
    projectCards.append(empty);
    return;
  }

  projects.forEach((project, index) => {
    projectCards.append(createProjectCard(project, index));
  });
}

// --- Add a project -----------------------------------------------------------
projectForm.addEventListener("submit", (e) => {
  e.preventDefault(); // stop the browser from reloading the page

  const name = projectNameInput.value.trim();
  const description = projectDescInput.value.trim();
  if (!name || !description) return; // ignore entries that are only spaces

  projects.push({ name, description });
  saveProjects();
  renderProjects();

  projectForm.reset();
  projectNameInput.focus(); // ready for the next one
});

// --- Delete a project ----------------------------------------------------------
// One listener on the list handles every × button, including cards added
// later (the cards are rebuilt on each render, so per-card listeners would
// have to be re-added every time).
projectCards.addEventListener("click", (e) => {
  const deleteButton = e.target.closest(".project-delete");
  if (!deleteButton) return;

  projects.splice(Number(deleteButton.dataset.index), 1);
  saveProjects();
  renderProjects();
});

// --- Drag-and-drop reordering ----------------------------------------------------
// Drag a card and drop it on another card: the dragged project moves into
// that card's position in the array, then everything re-renders.
let dragFromIndex = null;

function clearDropTargets() {
  projectCards.querySelectorAll(".is-drop-target").forEach((card) => {
    card.classList.remove("is-drop-target");
  });
}

projectCards.addEventListener("dragstart", (e) => {
  const card = e.target.closest(".project-card");
  if (!card) return;
  dragFromIndex = Number(card.dataset.index);
  card.classList.add("is-dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", String(dragFromIndex)); // required by Firefox
});

projectCards.addEventListener("dragover", (e) => {
  const card = e.target.closest(".project-card");
  if (!card || dragFromIndex === null) return;
  e.preventDefault(); // allows dropping here
  e.dataTransfer.dropEffect = "move";
  if (!card.classList.contains("is-drop-target")) {
    clearDropTargets();
    if (Number(card.dataset.index) !== dragFromIndex) {
      card.classList.add("is-drop-target");
    }
  }
});

projectCards.addEventListener("drop", (e) => {
  const card = e.target.closest(".project-card");
  if (!card || dragFromIndex === null) return;
  e.preventDefault();

  const dropIndex = Number(card.dataset.index);
  if (dropIndex !== dragFromIndex) {
    const [moved] = projects.splice(dragFromIndex, 1); // take it out...
    projects.splice(dropIndex, 0, moved);              // ...and put it in the new spot
    saveProjects();
    renderProjects();
  }
});

// Runs whether the drop worked or was cancelled: tidy up the drag styles
projectCards.addEventListener("dragend", () => {
  dragFromIndex = null;
  clearDropTargets();
  projectCards.querySelectorAll(".is-dragging").forEach((card) => {
    card.classList.remove("is-dragging");
  });
});

renderProjects();


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
