// stepLoader.js (with better model organization)
export function displayStep(step) {
  const scene = document.querySelector("a-scene");
  const holder = document.getElementById("specimen-holder");

  if (!scene || !holder) {
    console.error("Required elements not found!");
    return;
  }

  holder.innerHTML = "";

  if (!step.models || Object.keys(step.models).length === 0) {
    console.warn("No models defined for this step:", step.id);
    const inst = document.getElementById("step-instructions");
    if (inst && step.description) inst.setAttribute("text", "value", step.description);
    return;
  }

  // Organize models by type for proper positioning
  const modelGroups = {
    'skin': [],
    'muscle': [],
    'organs': []
  };

  // First pass: categorize models
  for (const [part, modelDef] of Object.entries(step.models)) {
    const group = Object.keys(modelGroups).find(g => part.includes(g)) || 'organs';
    modelGroups[group].push({ part, modelDef });
  }

  // Second pass: create entities with organized positioning
  Object.entries(modelGroups).forEach(([group, models]) => {
    models.forEach(({ part, modelDef }) => {
      const entity = document.createElement("a-entity");
      entity.setAttribute("id", `model-${part}`);
      entity.setAttribute("gltf-model", modelDef.path);
      
      // Set default position based on group
      const basePosition = {
        skin: { x: 0, y: 0, z: 0.1 },
        muscle: { x: 0, y: 0, z: 0.2 },
        organs: { x: 0, y: 0, z: 0.3 }
      }[group] || { x: 0, y: 0, z: 0 };
      
      entity.setAttribute("position", basePosition);
      
      // Apply any step-specific position overrides
      if (modelDef.position) {
        entity.setAttribute("position", modelDef.position);
      }

      // Set visibility
      const isVisible = step.final_state?.[part]?.visible ?? true;
      entity.setAttribute("visible", isVisible.toString());

      // Add error handling
      entity.addEventListener("model-error", (e) => {
        console.error(`Model error for "${part}":`, e.detail);
      });

      holder.appendChild(entity);
    });
  });

  // Update instructions
  const inst = document.getElementById("step-instructions");
  if (inst && step.description) {
    inst.setAttribute("text", "value", step.description);
  }
}
