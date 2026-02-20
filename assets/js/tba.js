// tba.js - Helper functions for parsing TBA data from GitHub repository

const TBA_BASE_URL = "https://raw.githubusercontent.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/gh-actions-tba-data-backend";
/**
 * Get the current FRC season year
 * Year increments after September (build season is in the fall)
 */
function getCurrentSeasonYear(date = new Date()) {
    let season = date.getFullYear();
    if (date.getMonth() >= 8) { // September = month 8 (0-indexed)
        season += 1;
    }
    return season;
}



/**
 * Fetch and parse events JSON for the current year
 */
async function getEvents() {
    const response = await fetch(`${TBA_BASE_URL}/${year}_events.json`);
    return await response.json();
}

/**
 * Fetch and parse matches JSON for the current year
 */
async function getMatches() {
    const response = await fetch(`${TBA_BASE_URL}/${year}_matches.json`);
    return await response.json();
}

/**
 * Fetch and parse event statuses JSON
 */
async function getEventStatuses() {
    const response = await fetch(`${TBA_BASE_URL}/${year}_event_statuses.json`);
    return await response.json();
}

/**
 * Fetch and parse district rankings JSON
 */
async function getDistrictRankings() {
    const response = await fetch(`${TBA_BASE_URL}/${year}_district_rankings.json`);
    return await response.json();
}

/**
 * Get event name by event key
 */
async function getEventNameFromKey(eventKey) {
    const events = await getEvents();
    const event = events.find(e => e.key === eventKey);
    return event ? event.name : null;
}

/**
 * Get short event name by event key
 */
async function getShortEventNameFromKey(eventKey) {
    const events = await getEvents();
    const event = events.find(e => e.key === eventKey);
    return event ? event.short_name : null;
}

/**
 * Get match details by match key
 */
async function getMatchFromKey(matchKey) {
    const matches = await getMatches();
    return matches.find(m => m.key === matchKey) || null;
}

/**
 * Get formatted match name (e.g., "Qualification Match 1")
 */
async function getMatchNameFromKey(matchKey) {
    const match = await getMatchFromKey(matchKey);
    if (!match) return null;

    let matchTitle;
    switch (match.comp_level) {
        case "qm":
            matchTitle = "Qualification Match";
            break;
        case "qf":
            matchTitle = `Quarterfinal ${match.set_number} Match`;
            break;
        case "sf":
            matchTitle = `Semifinal ${match.set_number} Match`;
            break;
        case "f":
            matchTitle = "Final";
            break;
        default:
            matchTitle = "Unknown";
    }

    return `${matchTitle} ${match.match_number}`;
}

/**
 * Format team key by removing "frc" prefix and bolding team 3461
 */
function formatTeamKey(teamKey) {
    const teamNumber = teamKey.replace("frc", "");
    return teamNumber === "3461" ? `<b>${teamNumber}</b>` : teamNumber;
}

/**
 * Get current event during competition period
 */
async function getCurrentEvent() {
    const events = await getEvents();
    const now = new Date();

    return events
        .filter(event => new Date(event.end_date + "T23:59:59-04:00") > now)
        .sort((a, b) => a.week - b.week)[0] || null;
}

/**
 * Get next upcoming event
 */
async function getNextEvent() {
    const events = await getEvents();
    const now = new Date();

    return events
        .filter(event => new Date(event.start_date + "T09:00:00-04:00") >= now)
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0] || null;
}

/**
 * Get team's district rank and points
 */
async function getTeamDistrictStats() {
    const rankings = await getDistrictRankings();
    return rankings.find(team => team.team_key === "frc3461") || null;
}

/**
 * Convert timestamp to Eastern time
 */
function convertTime(date) {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Date(dateObj.toLocaleString('en-US', { timeZone: 'America/New_York' }));
}

/**
 * Convert Unix timestamp to formatted date/time string
 */
function formatTimestamp(timestamp) {
    const d = new Date(timestamp * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    let hh = d.getHours();
    const min = String(d.getMinutes()).padStart(2, '0');
    let ampm = 'AM';

    if (hh > 12) {
        hh -= 12;
        ampm = 'PM';
    } else if (hh === 12) {
        ampm = 'PM';
    } else if (hh === 0) {
        hh = 12;
    }

    return `${yyyy}-${mm}-${dd}, ${hh}:${min} ${ampm}`;
}

/**
 * Get first Saturday in January (FRC Kickoff)
 */
function getKickoffDate(year = new Date().getFullYear()) {
    const jan1 = new Date(year, 0, 1);
    const firstSaturday = new Date(jan1);
    firstSaturday.setDate(jan1.getDate() + (6 - jan1.getDay()));
    return firstSaturday;
}