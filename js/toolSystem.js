// toolSystem.js
export let selectedTools = [];

export function renderToolTray(requiredTools, allTools, onToolUpdate) {
	const tray = document.getElementById('tool-tray');
	tray.innerHTML = '';
	selectedTools = [];

	function updateButtonStates() {
		// Visually highlight the selected buttons
		[...tray.children].forEach(btn => {
			const tid = btn.dataset.toolid;
			btn.style.background = selectedTools.includes(tid) ? 'lime' : '';
		});
		// Call update callback to inform the main app
		onToolUpdate(selectedTools.slice());
	}

	requiredTools.forEach(t => {
		const btn = document.createElement('button');
		btn.textContent = allTools[t]?.display_name || t;
		btn.dataset.toolid = t;
		btn.onclick = () => {
			// Toggle: If already selected, deselect; else, select (max requiredTools.length)
			const i = selectedTools.indexOf(t);
			if (i >= 0) {
				selectedTools.splice(i, 1);
			} else if (selectedTools.length < requiredTools.length) {
				selectedTools.push(t);
			}
			updateButtonStates();
		};
		tray.appendChild(btn);
	});

	updateButtonStates(); // Ensure initial
}
export function resetToolSelection() {
	selectedTools = [];
	if (document.getElementById('tool-tray'))
		[...document.getElementById('tool-tray').children].forEach(btn => btn.style.background = '');
}
