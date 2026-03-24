// tba.js - Helper functions for parsing TBA data from GitHub repository

const TBA_BASE_URL = "https://raw.githubusercontent.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/gh-actions-tba-data-backend";
var year = getCurrentSeasonYear();
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

function getEventLocalTimeDate(date, timezone) {
    const [year, month, day] = date.split("-").map(Number);

    // Build a date string in the timezone
    const dateTimeString = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}T00:00:00`;

    // Parse in the target timezone using Date.toLocaleString trick
    const localDateStr = new Date(dateTimeString).toLocaleString("en-US", { timeZone: timezone });

    return new Date(localDateStr);
}

function getEventLocalTimeCurrentTime(timezone) {
    return new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
}

function viewOnTBA() {
window.location.assign('https://www.thebluealliance.com/team/3461/' + year);
}

/**
 * Fetch and parse events JSON for the current year
 */
async function getEvents() {
    const response = await fetch(`${TBA_BASE_URL}/${year}_events.json?t=${Date.now()}`);
    return await response.json();
}

async function getEvent(eventKey) {
    const events = await getEvents();
    return events.find(e => e.key === eventKey) || null;
}

async function getEventMatches(eventKey) {
    const response = await fetch(`${TBA_BASE_URL}/${year}_matches.json?t=${Date.now()}`);
    const matches = await response.json();
    return matches.filter(m => m.event_key === eventKey);
}

/**
 * Fetch and parse matches JSON for the current year
 */
async function getMatches() {
    const response = await fetch(`${TBA_BASE_URL}/${year}_matches.json?t=${Date.now()}`);
    return await response.json();
}

/**
 * Fetch and parse event statuses JSON
 */
async function getEventStatuses() {
    const response = await fetch(`${TBA_BASE_URL}/${year}_event_statuses.json?t=${Date.now()}`);
    // console.log(response.json());
    return await response.json();
}
/**
 * 
 * @param {string} eventKey 
 * @returns json object with event status, or null if not found
 */
async function getTeamStatusStr(eventKey) {
    const status = await getTeamEventStatus(eventKey)
    return status ? status.overall_status_str : "Current Status is Unknown";
}
async function getTeamEventStatus(eventKey) {
    const eventStatuses = await getEventStatuses();
    const status = eventStatuses[`${eventKey}`];
    //console.log("Current Event Status:", status);
    return status ? status : {};
}

async function getTeamStatusRecordStr(eventKey, override) {
    const status = override || await getTeamEventStatus(eventKey)
    if (status?.playoff) {
        return status?.playoff?.record ? `<span class="green-text font-weight-bold">${status.playoff.record.wins}W</span> <span class="text-danger font-weight-bold">${status.playoff.record.losses}L</span> <span class="font-weight-bold text-info">${status.playoff.record.ties > 0 ? status.playoff.record.ties + "T" : ""}</span>` : "-W -L -T";
    } else if (status?.qual?.ranking) {
        return status?.qual?.ranking?.record ? `<span class="green-text font-weight-bold">${status.qual.ranking.record.wins}W</span> <span class="text-danger font-weight-bold">${status.qual.ranking.record.losses}L</span> <span class="font-weight-bold text-info">${status.qual.ranking.record.ties > 0 ? status.qual.ranking.record.ties + "T" : ""}</span>` : "-W -L -T";
    } else {
        return "No Record"
    }
}
async function getTeamStatusRank(eventKey, override) {
    const status = override || await getTeamEventStatus(eventKey);
    if (status?.playoff) {
        const allianceDisplayName = status?.alliance?.name ? status.alliance.name.replace("Alliance", "A") + " " : ""; 
        if (status?.playoff.status === "eliminated") {
            return allianceDisplayName + "Eliminated from Playoffs"
        } else {
            return allianceDisplayName + status?.playoff?.double_elim_round ? status.playoff.double_elim_round : String(status.playoff.level).toUpperCase();
        }
    }
    else if (status?.qual?.ranking) {
        if (status?.qual?.status === "completed" && status?.next_match_key === null) {
            return "Qualification Matches Completed"
        } else {
            return status?.qual?.ranking ? status.qual.ranking.rank + "/" + status.qual.num_teams : "? / ?";
        }
    } else {
        return "No Rank"
    }
}

/**
 * Fetch and parse district rankings JSON
 */
async function getDistrictRankings() {
    const response = await fetch(`${TBA_BASE_URL}/${year}_district_rankings.json?t=${Date.now()}`);
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
 * 
 * @param {string} matchKey 
 * @returns "Formatted match key (e.g., "QM1", "SF1-1") or null if match not found
 */
function getMatchCodeFromKey(matchKey) {
    try {
        return matchKey.split("_")[1].toUpperCase().replace(/(?<!Q)M/g, "-"); // Insert hyphen before M if not preceded by Q (to differentiate between QM and QF)
    } catch (error) {
        console.error('Failed to format match key:', error);
        return "UN";
    }
    // let matchTitle;
    // switch (match.comp_level) {
    //     case "qm":
    //         matchTitle = "QM";
    //         break;
    //     case "ef":
    //         matchTitle = `EF${match.set_number}-`;
    //         break;
    //     case "qf":
    //         matchTitle = `QF${match.set_number}-`;
    //         break;
    //     case "sf":
    //         matchTitle = `SF${match.set_number}-`;
    //         break;
    //     case "f":
    //         matchTitle = `F${match.set_number}-`; //This is for if a Final gets replayed. Logically finals dont need a set number but TBA formats them with a set number so this is to match that formatting
    //         break;
    //     default:
    //         matchTitle = "Unknown";
    // }

    // return `${matchTitle} ${match.match_number}`;
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

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    return events
        .filter(event => event.start_date <= today && event.end_date >= today)
        .sort((a, b) => a.start_date.localeCompare(b.start_date))[0] ?? null;
}

/**
 * Get next upcoming event
 */
async function getNextEvent() {
    const events = await getEvents();
    const now = new Date();

    return events
        .filter(event => new Date(event.start_date) >= now && new Date(event.end_date) >= now)
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0] || null;
}

/**
 * Get team's district rank and points
 */
async function getTeamDistrictStats() {
    const rankings = await getDistrictRankings();
    return rankings.find(team => team.team_key === "frc3461") || null;
}

async function getAwards() {
    const response = await fetch(`${TBA_BASE_URL}/${year}_awards.json`);
    const awards = await response.json();
    return awards;
}

async function getMedia() {
    const response = await fetch(`${TBA_BASE_URL}/${year}_media.json`);
    const media = await response.json();
    return media.filter(m => m.team_key === "frc3461");
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

export { getEventLocalTimeCurrentTime, getEventLocalTimeDate, getEventMatches, getTeamEventStatus, getTeamStatusRank, getTeamStatusRecordStr, getCurrentSeasonYear, getEvents, getEvent, getMatches, getEventStatuses, getTeamStatusStr, getDistrictRankings, getEventNameFromKey, getShortEventNameFromKey, getMatchFromKey, getMatchNameFromKey, getMatchCodeFromKey, formatTeamKey, getCurrentEvent, getNextEvent, getTeamDistrictStats, getAwards, getMedia, formatTimestamp, getKickoffDate };
window.getMatchCodeFromKey = getMatchCodeFromKey; // Expose getMatchCodeFromKey to global scope for testing purposes
window.getCurrentSeasonYear = getCurrentSeasonYear; // Expose getCurrentSeasonYear to global scope for testing purposes
window.year = year; // Expose year variable to global scope for testing purposes
