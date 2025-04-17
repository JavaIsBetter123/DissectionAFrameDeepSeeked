// stepController.js

import { selectedTools } from './toolSystem.js';

/**
 * Returns true if the currently selected tools match any of the valid tool combinations.
 * @param {Array<Array<string>>} validCombos
 * @returns {boolean}
 */
export function comboIsValid(validCombos) {
	return validCombos.some(
		(valid) =>
			selectedTools.length === valid.length &&
			valid.every(t => selectedTools.includes(t))
	);
}

/**
 * Attaches a click handler to a model part element.
 * When clicked, runs onSuccess if tool combo is valid, otherwise onFail.
 * @param {HTMLElement} partEntity
 * @param {Object} step
 * @param {Function} onSuccess
 * @param {Function} onFail
 */
export function attachPartClickHandler(partEntity, step, onSuccess, onFail) {
	partEntity.classList.add("clickable");
	partEntity.addEventListener("click", () => {
		if (comboIsValid(step.valid_tool_combinations)) {
			onSuccess(partEntity, step);
		} else {
			onFail(partEntity, step);
		}
	});
}
