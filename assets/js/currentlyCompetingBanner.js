// assets/js/currentlyCompetingBanner.js

const TEAM_NUMBER = '3461';
const API_BASE_URL = 'https://raw.githubusercontent.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/gh-actions-tba-data-backend';
const TIMEZONE = 'America/New_York';
const year = new Date().getFullYear();
let countDownDate;
let eventurl = `${API_BASE_URL}/${year}_events.json`;


// Remove duplicate function definitions. Import from tba.js instead:
// - getMatchNameFromKey() - exists in tba.js
// - formatTeamKey() - exists in tba.js
// - convertTime() - exists in tba.js (named convertTime)
// - convertTimestamp() - exists in tba.js (named formatTimestamp)

// Replace convertTimestamp calls with formatTimestamp:
function convertTimestamp(timestamp) {
    return formatTimestamp(timestamp);
}



async function populateMatchTeams(match, prefix) {
    try {
        document.getElementById(`${prefix}RedOne`).innerHTML = formatTeamKey(match.alliances.red.team_keys[0]);
        document.getElementById(`${prefix}RedTwo`).innerHTML = formatTeamKey(match.alliances.red.team_keys[1]);
        document.getElementById(`${prefix}RedThree`).innerHTML = formatTeamKey(match.alliances.red.team_keys[2]);
    } catch (error) {
        console.error(`Failed to get ${prefix} red teams:`, error);
    }

    try {
        document.getElementById(`${prefix}BlueOne`).innerHTML = formatTeamKey(match.alliances.blue.team_keys[0]);
        document.getElementById(`${prefix}BlueTwo`).innerHTML = formatTeamKey(match.alliances.blue.team_keys[1]);
        document.getElementById(`${prefix}BlueThree`).innerHTML = formatTeamKey(match.alliances.blue.team_keys[2]);
    } catch (error) {
        console.error(`Failed to get ${prefix} blue teams:`, error);
    }
}

async function setLiveStream(event) {
    try {
        const iframe = document.getElementById('liveStreamFrame');
        if (iframe.src.includes('notFound')) {
            const sorted = [...event.webcasts].reverse();
            const webcast = sorted[0];

            if (webcast.type === 'twitch') {
                iframe.src = `https://player.twitch.tv/?autoplay=true&channel=${webcast.channel}&parent=www.peacce.org`;
            } else if (webcast.type === 'youtube') {
                iframe.src = `https://www.youtube.com/embed/live_stream?channel=${webcast.channel}`;
            }
        }
    } catch (error) {
        console.error('Failed to set live stream:', error);
        document.getElementById('liveStream').style.display = 'none';
    }
}

async function bannerHelper(eventTitle, nextMatchKey, stats, event, lastMatchKey) {
    const match = await getMatchFromKey(nextMatchKey);
    const lastMatch = await getMatchFromKey(lastMatchKey);

    if (match?.predicted_time) {
        countDownDate = match.predicted_time;
    }

    try {
        document.getElementById('currentCompetingEvent').innerHTML = `Currently Competing At ${eventTitle}`;
    } catch (error) {
        console.error('Failed to set event name:', error);
    }

    try {
        document.getElementById('currentStatusStr').innerHTML = stats.overall_status_str;
    } catch (error) {
        console.error('Failed to set status:', error);
    }

    try {
        const matchName = await getMatchNameFromKey(match.key);
        document.getElementById('currentNextMatch').innerHTML = `Next Match: ${matchName}`;
        document.getElementById('counter').style.display = 'block';
    } catch (error) {
        console.error('Failed to set next match:', error);
        document.getElementById('counter').style.display = 'none';
    }

    try {
        const lastMatchName = await getMatchNameFromKey(lastMatch.key);
        document.getElementById('currentLastMatch').innerHTML = `Last Match: ${lastMatchName}`;
    } catch (error) {
        console.error('Failed to set last match name:', error);
    }

    await populateMatchTeams(match, 'curMatch');
    await populateMatchTeams(lastMatch, 'lasMatch');

    try {
        document.getElementById('lasMatchRedScore').innerText = `Score: ${lastMatch.alliances.red.score}`;
        document.getElementById('lasMatchBlueScore').innerText = `Score: ${lastMatch.alliances.blue.score}`;
    } catch (error) {
        console.error('Failed to set match scores:', error);
    }

    try {
        document.getElementById('currentRank').innerHTML = `Rank: ${stats.qual.ranking.rank}/${stats.qual.num_teams}`;
    } catch (error) {
        console.error('Failed to set rank:', error);
    }

    await setLiveStream(event);

    try {
        document.getElementById('duringEventBanner').style.display = 'block';
    } catch (error) {
        console.error('Failed to show banner:', error);
    }
}

async function setBanner(eventUrl) {
    try {
        const eventResponse = await fetch(eventUrl);
        const events = await eventResponse.json();
        const now = new Date();
        let currentEvent = null;

        for (const [, event] of Object.entries(events)) {
            const eventStart = new Date(event.start_date + 'T09:00:00-04:00');
            const eventEnd = new Date(event.end_date + 'T23:59:59-04:00');

            if (now >= eventStart && now <= eventEnd) {
                currentEvent = event;
                break;
            }
        }

        if (currentEvent) {
            const statusResponse = await fetch(`${API_BASE_URL}/${year}_event_statuses.json`);
            const statuses = await statusResponse.json();
            const status = statuses[currentEvent.key];

            if (status) {
                const nextMatchKey = status.next_match_key || null;
                const lastMatchKey = status.last_match_key || null;
                await bannerHelper(currentEvent.name, nextMatchKey, status, currentEvent, lastMatchKey);
            }
        }
    } catch (error) {
        console.error('Failed to set banner:', error);
    }
}

// Initialize on page load
// Remove these functions from currentlyCompetingBanner.js:
// - getMatchNameFromKey()
// - formatTeamKey()
// - convertTime()
// - convertTimestamp()

// Add at the top of currentlyCompetingBanner.js:
// <script src="tba.js"></script>

// Then rename the one call in currentlyCompetingBanner.js:
// convertTimestamp() → formatTimestamp()

// And update the initialization:
document.addEventListener('DOMContentLoaded', () => {
    setBanner(eventurl);
});