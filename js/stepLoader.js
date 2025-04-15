// stepLoader.js: Loads/displays steps.json data for DissectionAFrame

export async function loadSteps(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not fetch steps: " + res.statusText);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error("steps.json must be an array");
  return data;
}

// Example: Display a single step/model (handles missing model gracefully)
export function displayStep(step) {
  const scene = document.querySelector("a-scene");
  const holder = document.getElementById("specimen-holder");
  holder.innerHTML = ""; // Clear any previous children

  // Try to load each model (e.g., skin, muscle)
  for (const [part, modelDef] of Object.entries(step.models || {})) {
    const entity = document.createElement("a-entity");
    entity.setAttribute("id", `model-${part}`);
    entity.setAttribute("gltf-model", modelDef.path);
    entity.setAttribute("position", "0 0 0");
    entity.addEventListener("model-error", (e) => {
      console.warn(`Model for "${part}" missing or failed to load: ${modelDef.path}`);
    });
    // Set visibility based on final_state if defined
    if (step.final_state && step.final_state[part] && step.final_state[part].visible === false) {
      entity.setAttribute("visible", "false");
    }
    holder.appendChild(entity);
  }

  // Update step instructions
  const inst = document.getElementById("step-instructions");
  if (inst && step.description) inst.setAttribute("text", "value", step.description);
}
