// stepLoader.js - Complete Fixed Version
export async function loadSteps(url) {
    console.log(`Loading steps from: ${url}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch steps: ${res.statusText}`);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Steps data must be an array");
    return data;
}

export function displayStep(step) {
    console.log(`Displaying step: ${step.id}`);
    const scene = document.querySelector("a-scene");
    const holder = document.getElementById("specimen-holder");

    if (!scene || !holder) {
        throw new Error("Required elements not found: a-scene or specimen-holder");
    }

    // Clear previous models with proper disposal
    const previousModels = [...holder.children];
    previousModels.forEach(model => {
        const modelComponent = model.components['gltf-model'];
        if (modelComponent && modelComponent.model) {
            modelComponent.model.traverse(child => {
                if (child.material) child.material.dispose();
                if (child.geometry) child.geometry.dispose();
            });
        }
    });
    holder.innerHTML = "";

    if (!step.models || Object.keys(step.models).length === 0) {
        console.warn("No models defined for this step");
        updateInstructions(step);
        return;
    }

    // Create and position models
    Object.entries(step.models).forEach(([part, modelDef]) => {
        const entity = document.createElement("a-entity");
        entity.setAttribute("id", `model-${part}`);
        entity.setAttribute("gltf-model", `url(${modelDef.path})`);
        
        // Set position with fallbacks
        const position = modelDef.position || { x: 0, y: 0, z: 0 };
        entity.setAttribute("position", position);

        // Set visibility
        const isVisible = step.final_state?.[part]?.visible ?? true;
        entity.setAttribute("visible", isVisible);

        // Add error handling
        entity.addEventListener("model-error", (e) => {
            console.error(`Model error for "${part}":`, e.detail);
        });

        entity.addEventListener("model-loaded", () => {
            console.log(`Model loaded: ${part}`);
        });

        holder.appendChild(entity);
    });

    updateInstructions(step);
}

function updateInstructions(step) {
    const inst = document.getElementById("step-instructions");
    if (inst && step.description) {
        inst.setAttribute("text", "value", step.description);
    }
}
