# PEACCE Robotics Website — Project Context

This document records the current architectural and design context for work on the Operation P.E.A.C.C.E. Robotics website.

## Team / site

- FIRST Robotics Competition Team: **3461**
- Organization: Operation P.E.A.C.C.E. Robotics
- Website: `peacce.org`
- Repository: `Operation-P-E-A-C-C-E-Robotics.github.io`
- Staging site: `https://www.peacce.org/website-staging/`
- The site is built with Jekyll and deployed through GitHub Pages.
- TinaCMS is used for content management.
- The repository also contains JavaScript-driven TBA/FRC data components.

## Current redesign

The website is undergoing a substantial visual refresh rather than a minor restyling.

The current design is too dependent on an older Bootstrap-style visual language and has a lot of white space/default styling. The goal is a more intentional, modern identity while retaining the site's technical/FRC character.

The team identity includes a **tie-dye / circular rainbow** motif. This should be integrated into the overall design thoughtfully rather than applied everywhere indiscriminately.

The site does not have a large supply of strong team photography, so the design should not depend on photography-heavy hero sections.

A useful design reference is:

`https://www.frc10063.org/`

The site was created by the user's former web-design contact and contains design ideas that were relevant to the original direction. It is an inspiration/reference only, not an authority and not something to copy wholesale.

## Current homepage direction

The redesigned homepage has been moving toward a narrative structure along these lines:

1. Hero
   - "We build more than robots."
2. Identity / quick facts
   - Team 3461
   - 15+ years of competition
   - Connecticut / Hartford County
   - 4-H community program
3. Mission / philosophy
   - "Engineering is what we do. People are why we do it."
4. Team capabilities
   - CAD
   - Programming
   - Electrical
   - Public Relations
5. Competition
   - "On the field."
   - Current competition/event information
6. Current robot
   - "Meet Piggy Back"
7. Robot history
   - "Built over time."
8. Community
   - "More than robots."
9. Social / build updates
   - "Follow the build."
10. Next event
11. Sponsors
   - "Built together."
12. Footer/contact

This is a direction, not a rigid requirement. Inspect the actual current file before modifying it.

## Event banner refactor

The existing current-event banner is a major refactoring target.

Historically it used:
- `_includes/currentlyCompetingBanner.html`
- `assets/js/currentlyCompetingBanner.js`

The old implementation mixed:
- Bootstrap layout
- HTML
- global IDs
- inline event handlers
- widget-specific JS in a separate file
- a global `window.setBanner`
- TBA data access
- rendering logic
- countdown logic
- live-stream handling

The goal is to replace this with a genuinely encapsulated widget.

### Desired architecture

`_includes/currentlyCompetingBanner.html` should eventually contain:

- component HTML
- component CSS
- component JavaScript

The separate:

`assets/js/currentlyCompetingBanner.js`

has been removed. The current-event widget is now self-contained in its include and consumes the generated `current_event.json` snapshot.

The widget should:
- be completely hidden when there is no current event
- not render an off-season placeholder
- manage its own visibility
- manage its own event listeners
- not expose a global API
- use scoped DOM references
- use namespaced CSS
- gracefully handle missing data

Existing useful functionality should remain:

- current event name
- current status string
- event rank
- next match
- next-match countdown
- last match
- last-match alliance teams
- last-match score
- next-match alliance teams
- event local time
- live stream
- Gameday link
- refresh control

The current implementation has an important failure mode where missing matches/webcasts can lead to undefined values being dereferenced. The replacement should explicitly guard those cases.

## Current TBA helper situation

`assets/js/tba.js` is currently a broad collection of functions covering several concerns:

### Generic-ish TBA data access
- events
- matches
- event statuses
- district rankings
- awards
- media

### Match/event lookup and formatting
- match lookup
- match-name formatting
- match-code formatting
- event-name lookup

### PEACCE/team-specific logic
- Team 3461 status strings
- Team 3461 ranking display
- Team 3461 record display
- Team 3461 district stats
- Team 3461-specific team-key formatting
- direct "view Team 3461 on TBA" behavior

This file should eventually be cleaned up so generic TBA access/formatting is not unnecessarily coupled to PEACCE-specific presentation.

Do not remove functions blindly. Search for their usages first.

## TBA `/status` and runner

The TBA API `/status` endpoint now provides authoritative information including:
- current season
- exact kickoff timestamp

The repository's runner is being updated to retrieve this information and write it into:

`data/tba/status.json`

This should become the site's source of truth for current season/kickoff instead of independently calculating the season based on September.

The existing `getCurrentSeasonYear()` heuristic and `getKickoffDate()` helper are therefore candidates for removal/replacement after all callers have been audited.

The runner currently lives at approximately:

`data/tba/updateTBAStatus.py`

The runner loads a `.env` file for the TBA API key.

Important Linux detail encountered during development:
- filenames are case-sensitive
- the `.env` filename/casing had been wrong, causing `load_dotenv(".env")` to fail even though the user believed the file existed.

Do not assume a missing environment variable means the API key itself is wrong; inspect the actual filename/path first.

## TBA data architecture goal

The desired flow is:

TBA API
→ repository runner / GitHub Action
→ `data/tba/*.json`
→ shared `tba.js` utilities
→ encapsulated site components

The runner should be authoritative about generated data.

Client-side widgets should not need to know how the runner works.

## Shared countdown utilities

There is an existing:

`assets/js/countdown.js`

It provides time/countdown functionality used by the current-event widget and potentially other site components.

When refactoring the event widget, preserve useful shared countdown functionality rather than duplicating it unnecessarily.

However, widget-specific behavior belongs in the widget itself.

## Current event detection

The current `tba.js` implementation uses event start/end dates to determine whether an event is currently active.

That logic may remain if it is still the appropriate interpretation of the generated event data, but the new architecture should consider the authoritative runner/status data when determining season/current state.

Do not change the meaning of "current event" without inspecting how the rest of the site expects it to work.

## Component philosophy

The broader redesign is moving toward self-contained components.

For page-specific components:

- Include accepts explicit inputs where useful.
- HTML, CSS, and JS should be colocated when the component benefits from it.
- Avoid leaking internal DOM IDs/classes into unrelated page code.
- Avoid global JavaScript functions.
- Avoid requiring callers to know how a widget works internally.
- Components should fail gracefully when data is missing.

This is especially important because the site contains many FRC/TBA widgets.

## Existing FRC season-page work

The site also contains components for:
- event results
- match data
- analytics
- high-score displays
- robot-season pages
- documents
- galleries

The user prefers encapsulated components for these rather than adding more global scripts.

Existing competition UI uses Red/Blue alliance presentation, with Team 3461 emphasized when it appears in alliance lists.

## Visual details from recent work

For Red/Blue competition tables:
- Red alliance belongs on the left.
- Blue alliance belongs on the right.
- Team 3461 should be visually emphasized.
- Score placement should remain readable.
- Rounded corners should be possible independently for red/blue outer corners.

Avoid assuming old Bootstrap alignment classes are the only solution.

## Homepage competition banner

There is/was a hidden current-event banner in the homepage DOM. It is intentionally hidden when no current event exists.

Important: crawler/extracted HTML may show its fallback text even though the element is hidden in the browser.

Do not interpret the presence of fallback text in crawled HTML as proof that the banner is visibly rendered.

The desired behavior remains:
**no current event → no visible banner.**

## Development preferences

The user:
- works primarily on Pop!_OS/Linux
- uses VS Code
- uses Codex in VS Code for direct repository editing
- prefers actual file changes/downloadable files for very large rewrites because copying huge source files through the GitHub UI/clipboard is inconvenient
- wants exact, concrete code changes rather than vague architectural suggestions
- wants the assistant to inspect existing code before proposing replacements
- appreciates clear acknowledgement when an earlier assumption was wrong

## Current refactor sequence

The intended order of work is approximately:

1. Finish/update the TBA runner to persist authoritative `/status` information.
2. Refactor `tba.js` around the generated status/current-season data.
3. Audit and clean up unused/PEACCE-specific TBA helpers.
4. Rewrite `currentlyCompetingBanner.html` as an encapsulated HTML/CSS/JS widget.
5. Remove `assets/js/currentlyCompetingBanner.js`.
6. Test the widget in-season and off-season.
7. Continue applying the same encapsulation philosophy to other components.

Do not skip directly to broad unrelated refactors while these foundational changes are in progress.

## Important distinction: ChatGPT vs Codex context

The user is using Codex in VS Code because their Copilot monthly credits were exhausted.

Codex has access to the repository/workspace, but the IDE Codex conversation does not automatically inherit the full context/history of this ChatGPT conversation.

Therefore these files exist partly to bridge that gap:

- `AGENTS.md` = persistent instructions for how Codex should work in this repository.
- `context.md` = project history/current architecture/context that Codex can consult when it needs background.

Keep `AGENTS.md` relatively stable and instructional. Update `context.md` as major architecture decisions change.
