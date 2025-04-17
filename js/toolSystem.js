// js/toolSystem.js

export let selectedTools = [];

export function renderToolTray(requiredTools, allTools, onSelectTool) {
	const tray = document.getElementById('tool-tray');
	tray.innerHTML = '';
	selectedTools = [];
	
	requiredTools.forEach((tool) => {
		const btn = document.createElement('button');
		btn.textContent = allTools[tool]?.display_name || tool;
		btn.onclick = () => {
			if (!selectedTools.includes(tool)) {
				selectedTools.push(tool);
				btn.style.background = 'lightgreen';
				onSelectTool(selectedTools);
			}
		};
		tray.appendChild(btn);
	});
}

export function resetToolSelection() {
	selectedTools = [];
	const tray = document.getElementById('tool-tray');
	[...tray.children].forEach((btn) => btn.style.background = '');
}
