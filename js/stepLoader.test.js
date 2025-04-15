// stepLoader.test.js
import { loadSteps } from "./stepLoader.js";

async function testLoadSteps() {
  try {
    const steps = await loadSteps("data/sample_steps.json");
    console.assert(Array.isArray(steps), "Steps should be an array");
    console.assert(steps.length > 0, "Should load at least one step");
    console.log("✅ loadSteps test passed.");
  } catch (e) {
    console.error("❌ loadSteps test failed:", e);
  }
}

testLoadSteps();
