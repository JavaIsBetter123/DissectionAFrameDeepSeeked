// stepLoader.js
export async function loadSteps(url) {
	console.log(`Fetching steps from: ${url}`);
	const res = await fetch(url);
	console.log(`Fetch response status for steps: ${res.status}`);
	if (!res.ok) throw new Error(`Could not fetch steps (${url}): ${res.status} ${res.statusText}`);
	try {
		const data = await res.json();
		console.log("Parsed steps data:", data);
		if (!Array.isArray(data)) throw new Error("steps.json content must be an array");
		return data;
	} catch (error) {
		throw new Error(`Failed to parse JSON from ${url}: ${error.message}`);
	}
}

export function displayStep(step) {
	console.log("--- displayStep called ---");
	console.log("Step data:", step);
	const scene = document.querySelector("a-scene");
	const holder = document.getElementById("specimen-holder");

	if (!scene) {
		console.error("A-Frame scene (<a-scene>) not found!");
		return;
	}
	if (!holder) {
		console.error("Specimen holder entity (#specimen-holder) not found!");
		return;
	}

	console.log("Clearing specimen holder:", holder);
	holder.innerHTML = ""; // Clear any previous children

	if (!step.models || Object.keys(step.models).length === 0) {
		console.warn("No models defined for this step:", step.id);
		// Update instructions even if no models
		const inst = document.getElementById("step-instructions");
  	if (inst && step.description) inst.setAttribute("text", "value", step.description);
		return;
	}

	console.log("Processing models:", step.models);
	for (const [part, modelDef] of Object.entries(step.models)) {
		console.log(`Creating entity for part: ${part}`);
		const entity = document.createElement("a-entity");
		entity.setAttribute("id", `model-${part}`);
		console.log(`  Setting gltf-model path: ${modelDef.path}`);
		entity.setAttribute("gltf-model", `${modelDef.path}`); // Wrap path in url()
		entity.setAttribute("position", "0 0 0"); // Position relative to holder

		entity.addEventListener("model-error", (e) => {
			console.error(`!!! Model error for "${part}" (${modelDef.path}):`, e.detail);
		});
		entity.addEventListener("model-loaded", (e) => {
			console.log(`--- Model loaded successfully for "${part}" (${modelDef.path}) ---`);
			// You might want to attach click handlers *here* instead of in main.js
		});

		// Set visibility based on final_state if defined
		let isVisible = true; // Default to visible
		if (step.final_state && step.final_state[part] && typeof step.final_state[part].visible === 'boolean') {
			isVisible = step.final_state[part].visible;
			console.log(`  Visibility for ${part} from final_state: ${isVisible}`);
		} else {
			console.log(`  No specific visibility in final_state for ${part}, defaulting to true.`);
		}
		entity.setAttribute("visible", isVisible.toString()); // Set attribute explicitly

		console.log(`  Appending entity ${entity.id} to holder. Visible: ${isVisible}`);
		holder.appendChild(entity);
	}

	console.log("Current children of specimen-holder:", holder.children);

	// Update step instructions
	const inst = document.getElementById("step-instructions");
	if (inst && step.description) {
		console.log("Updating step instructions text.");
		inst.setAttribute("text", "value", step.description);
	} else {
		if (!inst) console.warn("Step instructions entity (#step-instructions) not found.");
		if (!step.description) console.warn("No description found in step data for instructions.");
	}
	console.log("--- displayStep finished ---");
}
