// main.js: Entry point for A-Frame VR Dissection MVP
import { loadSteps, displayStep } from "./stepLoader.js";

document.addEventListener("DOMContentLoaded", async () => {
  const info = document.getElementById("info");
  info.textContent = "Loading steps...";
  try {
    const steps = await loadSteps("data/sample_steps.json");
    info.textContent = `Step loaded: ${steps[0].title}`;
    displayStep(steps[0]);
  } catch (e) {
    info.textContent = "Failed to load steps: " + e.message;
    console.error(e);
  }
});
