// js/stepController.js

import { selectedTools } from './toolSystem.js';

export function isToolComboValid(validCombos) {
	// Checks if selectedTools matches any allowed combo, order doesn't matter
	return validCombos.some(
		combo => combo.length === selectedTools.length &&
			combo.every(t => selectedTools.includes(t))
	);
}

export function handlePartInteraction(partName, step, onSuccess, onFail) {
	if (isToolComboValid(step.valid_tool_combinations)) {
		onSuccess(partName, step);
	} else {
		onFail();
	}
}
