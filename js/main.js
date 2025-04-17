import { loadSteps, displayStep } from './stepLoader.js';
import { renderToolTray, resetToolSelection } from './toolSystem.js';
import { attachPartClickHandler } from './stepController.js';

let steps = [];
let currentStepIndex = 0;
let allTools = {};

// Load tools.json once
fetch("data/tools.json")
	.then(res => res.json())
	.then(obj => { allTools = obj; });

document.addEventListener("DOMContentLoaded", async () => {
	steps = await loadSteps("data/sample_steps.json");
	showStep(0);
});

async function showStep(stepIndex) {
	currentStepIndex = stepIndex;
	const step = steps[currentStepIndex];

	displayStep(step);

	const feedback = document.getElementById('feedback');
	feedback.textContent = '';

	renderToolTray(
		step.required_tools,
		allTools,
		() => { feedback.textContent = ''; } // clear feedback on tool selection
	);

	resetToolSelection();

	// Attach click handlers for each relevant model part
	const holder = document.getElementById("specimen-holder");
	[...holder.children].forEach(entity => {
		const partName = entity.id?.replace('model-', '');
		entity.classList.add("clickable");
		entity.addEventListener('click', () => {
			if (comboIsValid(step.valid_tool_combinations)) {
				feedback.textContent = 'Success! You performed the right action!';
				const skin = holder.querySelector('#model-skin');
				const muscle = holder.querySelector('#model-muscle');
				if (skin) skin.setAttribute('visible', 'false');
				if (muscle) muscle.setAttribute('visible', 'true');
				// Optionally call showStep(currentStepIndex + 1);
			} else {
				feedback.textContent = 'Try using the right tools (select in tray)';
			}
		});
	});
}
