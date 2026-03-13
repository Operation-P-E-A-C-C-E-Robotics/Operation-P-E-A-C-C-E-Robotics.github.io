// assets/js/currentlyCompetingBanner.js

const API_BASE_URL = 'https://raw.githubusercontent.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/gh-actions-tba-data-backend';
import { getCurrentSeasonYear, getEventStatuses, getCurrentEvent, getMatchFromKey, getMatchNameFromKey } from './tba.js';
import { eventLocalTime, matchCountdown } from './countdown.js';

var year = getCurrentSeasonYear(); 
console.log(`Current season year: ${year}`);
const eventurl = `${API_BASE_URL}/${year}_events.json`;

const timeEl = document.getElementById('time');
var updateInterval = 0;
//console.log(`Event URL: ${eventurl}`);

// Replace convertTimestamp calls with formatTimestamp:
// convertTimestamp is an alias - use formatTimestamp directly

function setMatchCountdown(predictedTime, eventTimeZone) {
    const counterEl = document.getElementById('counter');
    
    console.log(`Setting match countdown with predicted time: ${predictedTime} and event timezone: ${eventTimeZone}`);
    matchCountdown(predictedTime, counterEl, setBanner);
  
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
            const sorted = event.webcasts.filter(i => new Date(i.date) >= new Date()).sort((a, b) => {
                return a.date - b.date;
            });
            const webcast = sorted[0];

            if (webcast.type === 'twitch') {
                iframe.src = `https://player.twitch.tv/?autoplay=true&channel=${webcast.channel}&parent=www.peacce.org`;
            } else if (webcast.type === 'youtube') {
                iframe.src = `https://www.youtube.com/embed/${webcast.channel}`;
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
        setMatchCountdown(match.predicted_time, event.timezone);
    } else {
        console.warn('No predicted time for next match, hiding countdown');
        document.getElementById('counter').style.display = 'none';
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
        //document.getElementById('counter').style.display = 'none';
        document.getElementById('currentNextMatch').innerHTML = `Next Match: Unknown`;
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
        document.getElementById('currentRank').innerHTML = `Event Rank: ${stats.qual.ranking.rank}/${stats.qual.num_teams}`;
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

async function setBanner() {
    try {
        const currentEvent = await getCurrentEvent();
        console.log("Current Event:", currentEvent);
        if (currentEvent) {
            updateInterval = eventLocalTime(currentEvent.timezone, timeEl);
            const statuses = await getEventStatuses();
            const status = statuses[currentEvent.key];
            //console.log("Event Status:", status);
            const nextMatchKey = status.next_match_key || null;
            const lastMatchKey = status.last_match_key || null;
            await bannerHelper(currentEvent.name, nextMatchKey, status, currentEvent, lastMatchKey);
            
        }
    } catch (error) {
        console.error('Failed to set banner:', error);
        return;
    }
}

// Initialize on page load
console.log("Initializing banner...");
setBanner();

window.setBanner = setBanner;