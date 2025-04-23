// main.js - Complete Fixed Version
import { loadSteps, displayStep } from './stepLoader.js';
import { renderToolTray, resetToolSelection } from './toolSystem.js';

let steps = [];
let currentStepIndex = 0;
let allTools = {};
let modelsLoaded = false;

// Load tools.json with better error handling
async function loadTools() {
    try {
        const response = await fetch("data/tools.json");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        allTools = await response.json();
        console.log("Tools loaded successfully:", allTools);
    } catch (error) {
        console.error("Failed to load tools:", error);
        // Provide default tools if loading fails
        allTools = {
            scalpel: { display_name: "Scalpel" },
            forceps: { display_name: "Forceps" },
            probe: { display_name: "Probe" }
        };
    }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
    console.log("Initializing application...");
    
    // Check for required DOM elements
    if (!document.getElementById('tool-tray') || !document.getElementById('specimen-holder')) {
        console.error("Critical HTML elements missing!");
        return;
    }

    try {
        await loadTools();
        steps = await loadSteps("data/sample_steps.json");
        
        if (!steps || steps.length === 0) {
            throw new Error("No steps loaded or steps array is empty");
        }
        
        showStep(0);
    } catch (error) {
        console.error("Initialization error:", error);
        const feedback = document.getElementById('feedback');
        if (feedback) feedback.textContent = "Failed to load application. Please check console for details.";
    }
});

async function showStep(stepIndex) {
    console.log(`Loading step ${stepIndex}`);
    const feedback = document.getElementById('feedback');
    
    try {
        currentStepIndex = stepIndex;
        const step = steps[currentStepIndex];
        
        if (!step) {
            throw new Error(`Step data for index ${stepIndex} is undefined`);
        }

        // Wait for scene to load
        const scene = document.querySelector('a-scene');
        if (!scene.hasLoaded) {
            await new Promise(resolve => scene.addEventListener('loaded', resolve, { once: true }));
        }

        modelsLoaded = false;
        if (feedback) feedback.textContent = 'Loading models...';
        
        // Add loading timeout
        const loadingTimeout = setTimeout(() => {
            console.error("Model loading timeout");
            if (feedback) feedback.textContent = "Loading is taking longer than expected...";
        }, 10000);

        displayStep(step);
        
        renderToolTray(
            step.required_tools || [],
            allTools,
            () => { if (feedback) feedback.textContent = ''; }
        );

        resetToolSelection();

        await waitForModels();
        clearTimeout(loadingTimeout);
        modelsLoaded = true;
        
        if (feedback) feedback.textContent = '';
        setupInteractions(step);
        
    } catch (error) {
        console.error("Error in showStep:", error);
        if (feedback) feedback.textContent = "Error loading step. See console for details.";
    }
}

async function waitForModels() {
    const holder = document.getElementById("specimen-holder");
    if (!holder) throw new Error("Specimen holder not found");
    
    const models = [...holder.querySelectorAll('[gltf-model]')];
    if (models.length === 0) return;
    
    await Promise.all(models.map(model => {
        return new Promise(resolve => {
            if (model.hasLoaded) {
                resolve();
            } else {
                model.addEventListener('model-loaded', () => {
                    console.log(`Model loaded: ${model.id}`);
                    resolve();
                }, { once: true });
                
                model.addEventListener('model-error', (e) => {
                    console.error(`Model failed to load: ${model.id}`, e.detail);
                    resolve(); // Still resolve to prevent hanging
                }, { once: true });
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
