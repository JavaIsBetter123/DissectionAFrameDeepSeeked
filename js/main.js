// main.js: Entry point for A-Frame VR Dissection MVP
import { loadSteps, displayStep } from "./stepLoader.js";
import { renderToolTray, resetToolSelection, selectedTools } from './toolSystem.js';
import { handlePartInteraction } from './stepController.js';

let steps = [];
let currentStepIndex = 0;

document.addEventListener("DOMContentLoaded", async () => {
	steps = await loadSteps("data/sample_steps.json");
	showStep(0);
});

function showStep(stepIdx) {
	currentStepIndex = stepIdx;
	const step = steps[stepIdx];
	displayStep(step);

	fetch("data/tools.json")
		.then(res => res.json())
		.then((allTools) => {
			renderToolTray(step.required_tools, allTools, (tools) => {
				// Could update UI to say "Now click a part!"
			});
		});

	const holder = document.getElementById("specimen-holder");
	// Attach click event to each model part
	[...holder.children].forEach(entity => {
		entity.onclick = () => {
			handlePartInteraction(
				entity.id?.replace("model-", ""),
				step,
				(part, step) => {
					document.getElementById('feedback').textContent = 'Great! Skin removed!';
					entity.setAttribute('visible', 'false');
					// Reveal next model, according to on_success/actions, etc.
				},
				() => {
					document.getElementById('feedback').textContent = 'Try using the right tool combination!';
				}
			);
		};
	});
	resetToolSelection();
}

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
