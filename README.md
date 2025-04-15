# DissectionAFrame

A-Frame/WebVR client for the VR Dissection educational platform.

**Features:**
- Loads step definitions from `/data/sample_steps.json`
- Attempts to load basic 3D models; shows error in browser console if assets are missing
- Modular JS structure (main hub, JSON parser, unit test)
- Intended for local prototyping, Glitch deployment, and student experimentation

**Setup:**
1. Import or upload to [Glitch.com](https://glitch.com/), or clone and run locally (`python3 -m http.server` for static files).
2. Browse to the main page and see a specimen loader/preview.
3. Edit `/data/sample_steps.json` to add or revise steps.

**Editing Content:**
- Steps JSON and 3D assets can be freely modified for prototyping.
- Project code, model, and documentation conventions are defined in the central instructor repo.

**Docs & Schema:**
- [API_REFERENCE.md (instructor repo — reference only)](../DissectionAssistant/docs/API_REFERENCE.md)
