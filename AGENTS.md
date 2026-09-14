# PEACCE Robotics Website — Codex Instructions

## Project

This repository is the website for Operation P.E.A.C.C.E. Robotics / FIRST Robotics Competition Team 3461.

Primary stack:
- Jekyll
- GitHub Pages
- HTML/CSS/JavaScript
- Bootstrap 4-era markup exists in older components, but new work should prefer modern, component-scoped CSS
- TinaCMS is used for content management
- TBA data is generated into `data/tba/` by the repository's runner/workflow

## Working principles

### 1. Preserve the architecture unless intentionally refactoring it

Before changing a shared utility, include, or data format, inspect its callers/usages. Do not make a broad change merely to simplify one component.

### 2. Prefer encapsulated components

New interactive widgets should keep their:
- HTML
- CSS
- JavaScript

together when practical, especially for page-specific widgets implemented as Jekyll includes.

Widget-specific JavaScript should not require a separate global script unless there is a compelling reason.

Avoid exposing widget APIs through `window.*`.

Prefer:
- local variables
- module scope
- event listeners
- `data-*` attributes
- scoped DOM references
- namespaced CSS classes

Avoid:
- inline `onclick`
- generic/global IDs
- global mutable state
- selectors that depend on unrelated page markup

### 3. CSS

New CSS should be namespaced to its component.

Do not assume Bootstrap 4 utility classes are the project's preferred long-term architecture. Existing Bootstrap classes may remain where they are already useful, but new components should not become dependent on Bootstrap simply because it is present.

The site's visual direction is being refreshed. Avoid defaulting to an all-white Bootstrap appearance.

The team's visual identity includes a tie-dye/rainbow circular motif. Use it thoughtfully rather than turning every section into a rainbow.

### 4. JavaScript

Use modern JavaScript:
- `const` / `let`
- modules where appropriate
- optional chaining
- nullish coalescing
- async/await
- small focused functions

Do not add `var` unless there is a specific compatibility reason.

Handle missing API data gracefully.

Do not assume an array lookup succeeded before dereferencing the result.

Do not silently swallow errors. Log useful diagnostics where appropriate, while keeping the public UI graceful.

### 5. TBA data

`data/tba/` contains locally generated TBA data.

The repository's runner is responsible for retrieving authoritative TBA information and writing local JSON consumed by the site.

The TBA `/status` endpoint is intended to be the authoritative source for:
- current FRC season
- kickoff timestamp

Do not recreate those values independently with calendar heuristics if the generated status data is available.

The existing `tba.js` is being cleaned up. Keep generic TBA data access separate from PEACCE/team-specific presentation logic where practical.

In particular, avoid putting things such as "bold Team 3461" into a generic TBA data/parser helper unless there is a deliberate reason.

### 6. Current-event widget

The current-event banner is being rewritten.

Desired behavior:
- If there is no current event, the component remains completely hidden.
- Do not display an off-season placeholder.
- The component owns its own visibility.
- The component owns its own DOM rendering and event handlers.
- Do not expose a global `setBanner()` API.
- It should eventually replace/delete `assets/js/currentlyCompetingBanner.js`.
- It should handle missing next/last matches and missing webcast data without breaking the page.
- Its CSS should be component-scoped.
- It should preserve useful existing functionality: current event, status, rank, next/last match, alliance teams, last score, event local time, countdown, live stream, Gameday link, and refresh.

### 7. Data and API performance

Avoid repeatedly downloading the same large JSON file inside helper functions when the caller already has the data.

When refactoring TBA helpers, consider:
- a shared data-fetch helper
- caching data within a component/request lifecycle
- passing already-loaded event/match objects into formatting functions
- validating HTTP responses before parsing JSON

Do not prematurely over-engineer a generic framework.

### 8. Accessibility

New UI should:
- use semantic HTML where practical
- have meaningful button/link text
- provide accessible labels for controls
- avoid relying on color alone to communicate state
- preserve keyboard usability

### 9. Links

Use Jekyll's `site.baseurl` / URL helpers where appropriate instead of hard-coding site paths that need to work under `/website-staging/`.

External links should remain explicit and valid.

### 10. Editing files

Before editing a file:
1. Read the current file.
2. Inspect relevant callers/usages.
3. Make the smallest coherent change that accomplishes the requested goal.
4. Check for syntax/structural errors.
5. Do not overwrite unrelated user work.

For large rewrites, explain what is intentionally being replaced.

### 11. Do not invent project facts

If something is unclear, inspect the repository rather than assuming.

The current design/refactor context is documented in `context.md`.
