// main.js (updated with better model handling)
import { loadSteps, displayStep } from './stepLoader.js';
import { renderToolTray, resetToolSelection } from './toolSystem.js';

let steps = [];
let currentStepIndex = 0;
let allTools = {};
let modelsLoaded = false; // Track model loading state

// Load tools.json once
fetch("data/tools.json")
  .then(res => {
    if (!res.ok) throw new Error(`Failed to fetch tools: ${res.statusText}`);
    return res.json();
  })
  .then(obj => {
    allTools = obj;
  })
  .catch(error => console.error("Error loading tools.json:", error));

document.addEventListener("DOMContentLoaded", async () => {
  try {
    steps = await loadSteps("data/sample_steps.json");
    if (steps && steps.length > 0) {
      showStep(0);
    } else {
      console.error("No steps loaded or steps array is empty.");
    }
  } catch (error) {
    console.error("Error in DOMContentLoaded initialization:", error);
  }
});

async function showStep(stepIndex) {
  currentStepIndex = stepIndex;
  const step = steps[currentStepIndex];
  
  if (!step) {
    console.error(`Step data for index ${stepIndex} is undefined.`);
    return;
  }

  const scene = document.querySelector('a-scene');
  if (!scene.hasLoaded) {
    await new Promise(resolve => scene.addEventListener('loaded', resolve, { once: true }));
  }

  modelsLoaded = false;
  displayStep(step);
  
  const feedback = document.getElementById('feedback');
  if (feedback) feedback.textContent = '';

  renderToolTray(
    step.required_tools || [],
    allTools,
    () => { if (feedback) feedback.textContent = ''; }
  );

  resetToolSelection();

  // Wait for all models to load before enabling interaction
  await waitForModels();
  modelsLoaded = true;
  setupInteractions(step);
}

async function waitForModels() {
  const holder = document.getElementById("specimen-holder");
  if (!holder) return;
  
  const models = [...holder.querySelectorAll('[gltf-model]')];
  if (models.length === 0) return;
  
  await Promise.all(models.map(model => {
    return new Promise(resolve => {
      if (model.hasLoaded) {
        resolve();
      } else {
        model.addEventListener('model-loaded', resolve, { once: true });
      }
    });
  }));
}

function setupInteractions(step) {
  const holder = document.getElementById("specimen-holder");
  if (!holder) return;

  // Organize z-index for proper layering
  const layers = {
    'skin': 0.1,
    'muscle': 0.2,
    'organs': 0.3
  };

  [...holder.children].forEach(entity => {
    const partName = entity.id.replace('model-', '');
    const layer = Object.keys(layers).find(l => partName.includes(l));
    if (layer) {
      const pos = entity.getAttribute('position');
      entity.setAttribute('position', { ...pos, z: layers[layer] });
    }

    entity.classList.add("clickable");
    entity.addEventListener('click', () => {
      if (!modelsLoaded) return;
      
      const feedback = document.getElementById('feedback');
      if (feedback) feedback.textContent = 'Success! You performed the right action!';
      
      // Toggle between skin and muscle layers
      const skin = holder.querySelector('#model-skin');
      const muscle = holder.querySelector('#model-muscle');
      if (skin) skin.setAttribute('visible', 'false');
      if (muscle) muscle.setAttribute('visible', 'true');
    });
  });
}
