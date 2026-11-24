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
