import *  as tba from "./tba.js";
import * as counter from "./countdown.js";


var currentSeasonYear = null;
var currentEvent = null;

   

function resizeGameday() {
    const navbar = document.getElementById("gamedayNavbar");
    const gameday = document.getElementById("streamContainer");

    const navbarHeight = navbar.offsetHeight;

    gameday.style.height = `calc(100vh - ${navbarHeight}px)`;
}

window.addEventListener("load", resizeGameday);
window.addEventListener("resize", resizeGameday);

async function addMatchToList(match) {
    const matchList = document.getElementById("matchesListContainer");
    const redAlliance = match.alliances.red.team_keys.map(t => t.replace("frc", "")).join(", ");
    const blueAlliance = match.alliances.blue.team_keys.map(t => t.replace("frc", "")).join(", ");
    const matchKey = await tba.getMatchCodeFromKey(match.key);
    const matchEl =
        `
        <div class="pt-2 ml-0 pl-0 mr-1 text-center">
            <h6>${matchKey}</h6>
        </div>
        <table class="table table-sm table-borderless text-light align-items-center pt-2 pb-2 mb-1 mt-1 mr-0 pr-0 rounded-sm" style="max-width: fit-content; height: 100%;">
            <tbody class="align-items-center text-center rounded-sm">
                <tr class="text-danger">
                    <td class="small font-weight-bold text-nowrap">${redAlliance}</td> 
                </tr>
                <tr class="text-primary">
                    <td class="small font-weight-bold text-nowrap">${blueAlliance}</td>
                </tr>
            </tbody>
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
        eventStatusEl.innerHTML = `Event Begins`;
    }
}

function setMatchList(matches) {
    matches.forEach(async match => await addMatchToList(match));
}

function setNextMatch(nextMatch)  {
    const nextMatchDate = new Date(nextMatch.predicted_time);
    const nextMatchNumberEl = document.getElementById('nextMatchNumber');
    tba.getMatchCodeFromKey(nextMatch.key).then(matchName => {
        nextMatchNumberEl.innerText = `${matchName}`;
    }).catch(error => {
        console.error('Failed to set next match name:', error);
        
    });
    const redAlliance = nextMatch.alliances.red.team_keys.map(t => t.replace("frc", "")).join(", ");
    const blueAlliance = nextMatch.alliances.blue.team_keys.map(t => t.replace("frc", "")).join(", ");
    document.getElementById('nextMatchRed').innerText = redAlliance;
    document.getElementById('nextMatchBlue').innerText = blueAlliance;
    counter.matchCountdown(nextMatchDate, document.getElementById('nextMatchCountdown'), document.getElementById('eventLocalTime'), currentEvent.timezone, update);
}

function setLastMatch(lastMatch) {
    const lastMatchEl = document.getElementById('currentLastMatch');
    tba.getMatchCodeFromKey(lastMatch.key).then(matchName => {
        lastMatchEl.innerText = `Last Match: ${matchName}`;
    }).catch(error => {
        console.error('Failed to set last match name:', error);
        lastMatchEl.innerText = `Last Match: Unknown`;
    });
}

async function init() {
    currentSeasonYear = await tba.getCurrentSeasonYear();
    currentEvent = await tba.getCurrentEvent() || await tba.getNextEvent() || null;
    setEventTitle(currentEvent);

    populateLiveStreamOptions(currentEvent);
    if (new Date(currentEvent.start_date).getTime() > new Date().getTime()) {
        console.log("setting event countdown with start date " + currentEvent.start_date);
        counter.eventCountdown(currentEvent, document.getElementById('competitionCountdown'), update);
        document.getElementById('competitionCountdown').style.display = 'block';
        counter.matchCountdown(new Date(currentEvent.start_date), document.getElementById('nextMatchCountdown'), document.getElementById('eventLocalTime'), currentEvent.timezone, update);
    } else {
        setLiveStream(currentEvent.webcasts.length > 0 ? (currentEvent.webcasts[0].type === 'twitch' ? `https://player.twitch.tv/?autoplay=true&channel=${currentEvent.webcasts[0].channel}&parent=www.peacce.org` : `https://www.youtube.com/embed/live_stream?channel=${currentEvent.webcasts[0].channel}`) : '');
    }
   await update();
}

async function update() {
    setMatchList(await tba.getEventMatches(currentEvent.key));
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