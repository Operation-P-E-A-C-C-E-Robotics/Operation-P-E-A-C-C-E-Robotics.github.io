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
    const [year,month,day] = date.split("-").map(Number)
    const localTimeDate = new Date(Date.UTC(year, month-1, day));
    return localTimeDate.toLocaleDateString('en-US', {timezone:timezone})
}

function getEventLocalTimeCurrentTime(timezone) {
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: timezone }));
    return now
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
    console.log("Event Statuses:",eventStatuses);
    const status = eventStatuses[`${eventKey}`];
    return status ? status : {};
}

async function getTeamStatusRecordStr(eventKey) {
    const status = await getTeamEventStatus(eventKey)
    if (status?.playoff) {
        return status?.playoff?.record ? `${status.playoff.record.wins}W ${status.playoff.record.losses}L ${status.playoff.record.ties}T` : "-W -L -T";
    } else if (status?.qual?.ranking) {
        return status?.qual?.ranking?.record ? `${status.qual.ranking.record.wins}W ${status.qual.ranking.record.losses}L ${status.qual.ranking.record.ties}T` : "-W -L -T";
    } else {
        return "No Record"
    }
}
async function getTeamStatusRank(eventKey) {
    const status = await getTeamEventStatus(eventKey);
    if (status?.playoff) {
        return status?.playoff?.double_elim_round ? status.playoff.double_elim_round : String(status.playoff.level).toUpperCase();
    }
    else if (status?.qual?.ranking) {
        return status?.qual?.ranking? status.qual.ranking.rank + "/" + status.qual.num_teams : "? / ?";
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

function sortCompLevel(a, b) {
if (a == "qm" && b == "qm" && a < b) {
    return 1;
} else if (b == "qm" && a == "qm" && b < a) {
    return -1;
} else if (a == "qm" && b == "qf" && a < b){
    return 1;
} else if (b == "qm" && a == "qf" && b < a){
    return -1;
}else if (a == "qf" && b == "sf" && a < b){
    return 1;
} else if (b == "qf" && a == "sf" && b < a){
    return -1;
}else if (b == "qf" && a != "sf" && b < a) {
    return 1;
}
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

export { getEventLocalTimeCurrentTime, getEventLocalTimeDate, getEventMatches, getTeamEventStatus, getTeamStatusRank, getTeamStatusRecordStr, getTeamStatusStr, getCurrentSeasonYear, getEvents, getEvent, getMatches, getEventStatuses, getTeamStatusStr as getTeamStatus, getDistrictRankings, getEventNameFromKey, getShortEventNameFromKey, getMatchFromKey, getMatchNameFromKey, getMatchCodeFromKey, formatTeamKey, getCurrentEvent, getNextEvent, getTeamDistrictStats, getAwards, getMedia, formatTimestamp, getKickoffDate };
window.getMatchCodeFromKey = getMatchCodeFromKey; // Expose getMatchCodeFromKey to global scope for testing purposes
window.getCurrentSeasonYear = getCurrentSeasonYear; // Expose getCurrentSeasonYear to global scope for testing purposes
window.year = year; // Expose year variable to global scope for testing purposes