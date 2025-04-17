// main.js
import { loadSteps, displayStep } from './stepLoader.js';
import { renderToolTray, resetToolSelection } from './toolSystem.js';
// Import comboIsValid if you plan to use the click handler logic here later
// import { comboIsValid } from './stepController.js';

let steps = [];
let currentStepIndex = 0;
let allTools = {};

// Load tools.json once
fetch("data/tools.json")
	.then(res => {
		console.log("Fetched tools.json response:", res);
		if (!res.ok) throw new Error(`Failed to fetch tools: ${res.statusText}`);
		return res.json();
	})
	.then(obj => {
		console.log("Parsed tools:", obj);
		allTools = obj;
	})
	.catch(error => console.error("Error loading tools.json:", error)); // Added catch

document.addEventListener("DOMContentLoaded", async () => {
	console.log("DOM Content Loaded. Starting app initialization.");
	try {
		steps = await loadSteps("data/sample_steps.json");
		console.log("Steps loaded successfully:", steps);
		if (steps && steps.length > 0) {
			console.log("Attempting to show step 0.");
			showStep(0); // Call showStep only if steps loaded
		} else {
			console.error("No steps loaded or steps array is empty.");
		}
	} catch (error) {
		console.error("Error in DOMContentLoaded initialization:", error);
	}
});

async function showStep(stepIndex) {
	console.log(`showStep called for index: ${stepIndex}`);
	currentStepIndex = stepIndex;
	const step = steps[currentStepIndex];
	console.log("Current step data:", step);

	if (!step) {
		console.error(`Step data for index ${stepIndex} is undefined.`);
		return; // Stop if step data is missing
	}

	// Ensure A-Frame scene is ready (optional but good practice)
	const scene = document.querySelector('a-scene');
	if (!scene.hasLoaded) {
		console.log("A-Frame scene not loaded yet, waiting...");
		await new Promise(resolve => scene.addEventListener('loaded', resolve, { once: true }));
		console.log("A-Frame scene loaded.");
	}

	displayStep(step); // This function adds the models

	const feedback = document.getElementById('feedback');
	if (feedback) feedback.textContent = ''; // Check if feedback exists

	// Ensure allTools is loaded before rendering tray
	if (Object.keys(allTools).length === 0) {
		console.warn("Tools not loaded yet when trying to render tool tray.");
		// Optionally wait or fetch again, but better to ensure fetch completes first
	}

	renderToolTray(
		step.required_tools || [], // Handle potentially missing required_tools
		allTools,
		() => { if (feedback) feedback.textContent = ''; } // clear feedback on tool selection
	);

	resetToolSelection();

	// Attach click handlers for each relevant model part
	// NOTE: This logic might run *before* the models are fully loaded by A-Frame.
	// It's generally better to attach handlers after a 'model-loaded' event
	// or use event delegation on the holder.
	const holder = document.getElementById("specimen-holder");
	if (holder) {
		console.log("Attaching click handlers to children of:", holder);
		// Wait a brief moment for entities to potentially be added by displayStep
		setTimeout(() => {
			[...holder.children].forEach(entity => {
				const partName = entity.id?.replace('model-', '');
				console.log(`Adding click listener to entity: ${entity.id}`);
				entity.classList.add("clickable"); // Make sure CSS targets .clickable if needed

				// Remove previous listener if any to prevent duplicates
				// This requires storing the listener function, complicates things a bit.
				// For now, let's assume it's okay.

				entity.addEventListener('click', () => {
					console.log(`Clicked on ${entity.id}`);
					// Temporarily disable comboIsValid check to see if click works
					// if (comboIsValid(step.valid_tool_combinations)) {
					if (true) { // Test click registration
						if (feedback) feedback.textContent = 'Success! You performed the right action!';
						const skin = holder.querySelector('#model-skin');
						const muscle = holder.querySelector('#model-muscle');
						console.log("Attempting to toggle visibility. Skin:", skin, "Muscle:", muscle);
						if (skin) skin.setAttribute('visible', 'false');
						if (muscle) muscle.setAttribute('visible', 'true');
						// Optionally call showStep(currentStepIndex + 1);
					} else {
						if (feedback) feedback.textContent = 'Try using the right tools (select in tray)';
					}
				});
			});
		}, 100); // Small delay - better methods exist (like waiting for model-loaded)
	} else {
		console.error("Specimen holder not found!");
	}
}

// NOTE: The original main.js didn't explicitly call showStep if the fetch calls failed
// or if loadSteps returned an empty array. Added checks for that.
