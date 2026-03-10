import *  as tba from "./tba.js";
import * as counter from "./countdown.js";

var currentSeasonYear = null;
var currentEvent = null;
var matchUpdateInterval = null;
   

function resizeGameday() {
    const navbar = document.getElementById("gamedayNavbar");
    const gameday = document.getElementById("streamContainer");

    const navbarHeight = navbar.offsetHeight;

    gameday.style.height = `calc(100vh - ${navbarHeight}px)`;
}

window.addEventListener("load", resizeGameday);
window.addEventListener("resize", resizeGameday);

function addMatchToList(match, eventTimeZone) {
    const matchList = document.getElementById("matchesListContainer");
    const redAlliance = match.alliances.red.team_keys.map(t => t.replace("frc", "")).join(", ");
    const blueAlliance = match.alliances.blue.team_keys.map(t => t.replace("frc", "")).join(", ");
    const matchKey = tba.getMatchCodeFromKey(match.key);
    // Check if match already exists in the list to prevent duplicates (this can happen because TBA sometimes changes match times which would cause the same match to be added multiple times instead of just updating the existing match's time)
    try { 
        if (document.getElementById(`${match.key}`)) {
            console.log(`Match ${match.key} already exists in the list, updating instead of adding a duplicate.`);
            // Update existing match
            document.getElementById(`${match.key}`).querySelector('#matchCodeDisplay').innerText = matchKey; //This should not change, as it would then be a different match. Changing it makes any bugs obvious
            document.getElementById(`${match.key}`).querySelector('#nextMatchRed').innerText = redAlliance; //These ususally dont change but just in case they do we will update them as well
            document.getElementById(`${match.key}`).querySelector('#nextMatchBlue').innerText = blueAlliance; //These ususally dont change but just in case they do we will update them as well
             // Update the predicted time display
             const predictedTimeEl = document.getElementById(`${match.key}`).querySelector('#predictedTime');
             if (predictedTimeEl) {
                predictedTimeEl.innerText = `~${new Date(match.predicted_time * 1000).toLocaleTimeString("en-US", {timeZone: eventTimeZone, hour: '2-digit', minute: '2-digit'}).replace(/\s?(AM|PM)/i, "")}`;
             }
            return;
        } else {
            // Add new match to the list
            const matchEl =
                `
                <div class="pt-2 ml-0 pl-0 mr-1 text-center">
                    <h6 id="matchCodeDisplay">${matchKey}</h6>
                    <h6 id="predictedTime" class="text-small">~${new Date(match.predicted_time * 1000).toLocaleTimeString("en-US", {timeZone: eventTimeZone, hour: '2-digit', minute: '2-digit'}).replace(/\s?(AM|PM)/i, "")}</h6>
                </div>
                    <table class="table table-sm table-borderless text-light align-items-center pt-2 mb-0 mr-0 pr-0 rounded-sm" style="max-width: fit-content;">
                        <tbody class="align-items-center text-center rounded-sm">
                            <tr class="text-danger">
                                <td class="small font-weight-bold text-nowrap" id="nextMatchRed">${redAlliance}</td> 
                            </tr>
                            <tr class="text-primary">
                                <td class="small font-weight-bold text-nowrap" id="nextMatchBlue">${blueAlliance}</td>
                            </tr>
                        </tbody>
                    </table> 
                </table>  
                `
            const matchItem = document.createElement('div')
            matchItem.classList.add("container", "bg-dark", "d-inline-flex", "align-items-center", "mr-1",
                                    "mb-1","h-100","rounded-lg", "pr-0", "pl-1", "h-100"); 
            matchItem.id += match.key;
            // matchItem.style.maxWidth = "fit-content";
            matchItem.innerHTML = matchEl;
            matchList.appendChild(matchItem);
        }
    } catch (error) {
        console.error('Error occurred while checking for existing match:', error);  
    }
}

function removeMatchFromList(matchKey) {
    const matchItem = document.getElementById(matchKey);
    if (matchItem) {
        matchItem.remove();
    }
}

function setLiveStream(streamUrl) {
    const iframe = document.getElementById('liveStreamFrame');
    document.getElementById('streamContainer').style.display = 'block';
    iframe.src = streamUrl;
    
}

function populateLiveStreamOptions(event) {
    const liveStreamDropdown = document.getElementById('livestreamDropdown');
    event.webcasts.forEach(webcast => {
        const button = document.createElement('button');
        button.className = 'dropdown-item';
        button.textContent = webcast?.stream_title || (webcast.type === 'twitch' ? 'Twitch Stream' : 'YouTube Stream');
        button.addEventListener('click', () => {
            const url = webcast.type === 'twitch' 
                ? `https://player.twitch.tv/?autoplay=true&channel=${webcast.channel}&parent=www.peacce.org`
                : `https://www.youtube.com/embed/live_stream?channel=${webcast.channel}`;
            setLiveStream(url);
        });
        liveStreamDropdown.appendChild(button);
    });
}

function setEventTitle(event) {
    const eventTitleEl = document.getElementById('currentEventName');
    eventTitleEl.innerHTML = `${event?.short_name || 'Unknown Event'}`;
}
async function setEventStatus(event) {
    const eventStatusEl = document.getElementById('currentEventStatus');
    try {
        const rank = event ? await tba.getTeamStatusRank(event.key) : "? / ?" ;
        const record = event ? await tba.getTeamStatusRecordStr(event.key) : "-W -L -T";
        eventStatusEl.innerHTML = `${rank} ${record}`;
    } catch (error) {
        console.error('Failed to set event status:', error);
        eventStatusEl.innerHTML = ` ? / ? -W -L -T`;
    }
}

function setMatchList(matches, eventTimeZone) {
    matches.sort((a, b) => (a.predicted_time *1000) - (b.predicted_time *1000)); // Sort matches by predicted time (multiplied by 1000 to convert from seconds to milliseconds for JavaScript Date)
    matches.forEach(async match => await addMatchToList(match, eventTimeZone));
}

function setNextMatch(nextMatch)  {
    // console.log('Setting next match:', nextMatch);
    try{
        const nextMatchDate = new Date(nextMatch.predicted_time * 1000); // Convert from seconds to milliseconds for JavaScript Date
        const nextMatchNumberEl = document.getElementById('nextMatchNumber');
        nextMatchNumberEl.innerText = tba.getMatchCodeFromKey(nextMatch.key);
        const redAlliance = nextMatch.alliances.red.team_keys.map(t => t.replace("frc", "")).join(", ");
        const blueAlliance = nextMatch.alliances.blue.team_keys.map(t => t.replace("frc", "")).join(", ");
        document.getElementById('nextMatchRed').innerText = redAlliance;
        document.getElementById('nextMatchBlue').innerText = blueAlliance;
        console.log(document.getElementById(`${nextMatch.key}`));
        document.getElementById(`${nextMatch.key}`).remove(); // Remove the match from the list of matches below since it's now being displayed as the next match. This prevents confusion from having the same match displayed in two places and also prevents the list of matches from becoming too long as the event goes on
        
        clearInterval(matchUpdateInterval); //reset the countdown interval to prevent multiple intervals from running simultaneously
        matchUpdateInterval = counter.matchCountdown(nextMatchDate, document.getElementById('nextMatchCountdown'), document.getElementById('eventLocalTime'), currentEvent.timezone, update);
    } catch (error) {
        console.error('Failed to set next match:', error);
        document.getElementById('nextMatchNumber').innerText = "Unknown";
        document.getElementById('nextMatchRed').innerText = "";
        document.getElementById('nextMatchBlue').innerText = "";
        if (currentEvent.start_date && new Date(currentEvent.start_date).getTime() > new Date().getTime()) { 
            // If the event hasn't started yet, show the event countdown instead of the next match countdown
            matchUpdateInterval = counter.matchCountdown(currentEvent.start_date, document.getElementById('nextMatchCountdown'),  update);
            document.getElementById('nextMatchNumber').innerText = "Event Begins In:";

        }
    }
}

function setLastMatch(lastMatch) {
    try {
        const lastMatchCode = document.getElementById('lastMatchCode');
        lastMatchCode.innerText = tba.getMatchCodeFromKey(lastMatch.key);
        const redAlliance = lastMatch.alliances.red.team_keys.map(t => t.replace("frc", "")).join(", ");
        const blueAlliance = lastMatch.alliances.blue.team_keys.map(t => t.replace("frc", "")).join(", ");
        document.getElementById('lastMatchRed').innerText = redAlliance;
        document.getElementById('lastMatchBlue').innerText = blueAlliance;
        document.getElementById('lastMatchRedScore').innerText = lastMatch.alliances.red.score;
        document.getElementById('lastMatchBlueScore').innerText = lastMatch.alliances.blue.score;
        document.getElementById("lastMatchContainer").style.display = "block";
        try {
            document.getElementById(`${lastMatch.key}`).remove(); // Remove the match from the list of matches below since it's now being displayed as the last match. This prevents confusion from having the same match displayed in two places and also prevents the list of matches from becoming too long as the event goes on
            //It should have already been removed when it was set as the next match, but in case the next match gets changed before the last match gets updated this will ensure there are no duplicates
        }
        catch (error) {
            console.error('Failed to remove last match from list:', error);
        }

    } catch (error) {
        console.error('Failed to set last match:', error);
        document.getElementById("lastMatchContainer").style.display = "none";
    }
}

async function init() {
    currentSeasonYear = await tba.getCurrentSeasonYear();
    currentEvent = await tba.getCurrentEvent() || await tba.getNextEvent() || null;
    setEventTitle(currentEvent);
    counter.eventLocalTime(currentEvent.timezone, document.getElementById('eventLocalTime'));
    populateLiveStreamOptions(currentEvent);
    if (new Date(currentEvent.start_date).getTime() > new Date().getTime()) {
        setLiveStream(''); // Hide live stream if event hasn't started yet
    } else {
        setLiveStream(currentEvent.webcasts.length > 0 ? (currentEvent.webcasts[0].type === 'twitch' ? `https://player.twitch.tv/?autoplay=true&channel=${currentEvent.webcasts[0].channel}&parent=www.peacce.org` : `https://www.youtube.com/embed/live_stream?channel=${currentEvent.webcasts[0].channel}`) : '');
    }
   await update();
}

async function update() {
    setMatchList(await tba.getEventMatches(currentEvent.key), currentEvent.timezone);
    await setEventStatus(currentEvent); // this must be last because event status is null until the event begins
    setNextMatch(currentEvent.next_match_key ? await tba.getMatchFromKey(currentEvent.next_match_key) : null);
    setLastMatch(currentEvent.last_match_key ? await tba.getMatchFromKey(currentEvent.last_match_key) : null);
    
    
}

init();

export { init, update, resizeGameday, addMatchToList, removeMatchFromList, setLiveStream, populateLiveStreamOptions};

window.initGameday = init; // Expose init function to global scope for testing purposes
window.updateGameday = update; // Expose update function for the refresh button
window.addMatchToList = addMatchToList; // Expose addMatchToList for testing purposes
window.removeMatchFromList = removeMatchFromList;
window.setNextMatch = setNextMatch;
window.setLastMatch = setLastMatch;
window.setMatchList = setMatchList;
const testNextMatch =
{
    "actual_time": 1743267613,
    "alliances": {
        "blue": {
            "dq_team_keys": [],
            "score": 89,
            "surrogate_team_keys": [],
            "team_keys": [
                "frc10245",
                "frc155",
                "frc6333"
            ]
        },
        "red": {
            "dq_team_keys": [],
            "score": 82,
            "surrogate_team_keys": [],
            "team_keys": [
                "frc2168",
                "frc3461",
                "frc571"
            ]
        }
    },
    "comp_level": "qm",
    "event_key": "2025cthar",
    "key": "2025cthar_qm21",
    "match_number": 14,
    "post_result_time": 1743267835,
    "predicted_time": `${Math.floor(new Date().getTime() / 1000) + 90}`, // Set predicted time to 1 minute from now for testing purposes
    "set_number": 1,
    "time": 1743266040,
    "videos": [
        {
            "key": "9ruQfZNKQSA",
            "type": "youtube"
        }
    ],
    "winning_alliance": "blue"
};
const testLastMatch =
{
    "actual_time": 1743267613,
    "alliances": {
        "blue": {
            "dq_team_keys": [],
            "score": 89,
            "surrogate_team_keys": [],
            "team_keys": [
                "frc10245",
                "frc155",
                "frc6333"
            ]
        },
        "red": {
            "dq_team_keys": [],
            "score": 82,
            "surrogate_team_keys": [],
            "team_keys": [
                "frc2168",
                "frc3461",
                "frc571"
            ]
        }
    },
    "comp_level": "qm",
    "event_key": "2025cthar",
    "key": "2025cthar_qm16",
    "match_number": 14,
    "post_result_time": 1743267835,
    "predicted_time": 1743267613,
    "set_number": 1,
    "time": 1743266040,
    "videos": [
        {
            "key": "9ruQfZNKQSA",
            "type": "youtube"
        }
    ],
    "winning_alliance": "blue"
};


function generateTestMatches(matchesArray) {
    const maxMatches = 20;
    const baseTeams = ["frc10245", "frc155", "frc6333", "frc2168", "frc3461", "frc571", "frc1234", "frc5678", "frc9012", "frc3456", "frc7890", "frc1111"]; // Extended team list for variety
    while (matchesArray.length < maxMatches) {
        const original = matchesArray[Math.floor(Math.random() * matchesArray.length)];
        const duplicate = JSON.parse(JSON.stringify(original));
        duplicate.match_number += Math.floor(Math.random() * 50) + 1;
        duplicate.key = `2025cthar_qm${duplicate.match_number}`;
        duplicate.predicted_time = Math.floor(new Date().getTime() / 1000) + Math.floor(Math.random() * 3600);
        duplicate.alliances.red.score = Math.floor(Math.random() * 200);
        duplicate.alliances.blue.score = Math.floor(Math.random() * 200);
        // Randomly select teams
        const selectedTeams = [];
        while (selectedTeams.length < 6) {
            const team = baseTeams[Math.floor(Math.random() * baseTeams.length)];
            if (!selectedTeams.includes(team)) {
                selectedTeams.push(team);
            }
        }
        duplicate.alliances.red.team_keys = selectedTeams.slice(0, 3);
        duplicate.alliances.blue.team_keys = selectedTeams.slice(3, 6);
        matchesArray.push(duplicate);
    }
}

function testMatches() {
    const matches = [testLastMatch, testNextMatch];
    generateTestMatches(matches);
    setMatchList(matches, currentEvent.timezone);
    setTimeout(() => {
        setLastMatch(testLastMatch);
        setNextMatch(testNextMatch);
    }, 1000);
}
window.testMatches = testMatches; // Expose testMatches function to global scope for testing purposes