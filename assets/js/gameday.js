import *  as tba from "./tba.js";
import * as counter from "./countdown.js";


var currentSeasonYear = null;
var currentEvent = null;
var matchCountdownInterval = null;
var updateInterval = null;
var globalEventStatus = null;
var globalEventStatusSource = null;

const matchRefreshSpinner = document.getElementById("matchRefreshSpinner");
const streamRefreshSpinner = document.getElementById("streamRefreshSpinner");


var pusher = new Pusher('72d88eaacede8acd7e91', {
    cluster: 'mt1'
});
var channel = pusher.subscribe('my-channel');
channel.bind('update', function(payload) {
    console.log("Pusher update:", payload);

    const type = payload.messageType;
    const data = payload.data;

    if (type === "matches") {
        data.forEach(match => addMatchToList(match, currentEvent.timezone));
    }

    else if (type === "eventStatus") {
        globalEventStatus = data;
        globalEventStatusSource = "pusher";
        setEventStatus(data);
        tba.getEventMatches(currentEvent.key).then(matches => {
            setMatchList(matches, currentEvent.timezone);
        }).catch(error => {
            console.error('Failed to get event matches:', error);
            setMatchList([], currentEvent.timezone); // Clear match list on error
        });
        tba.getMatchFromKey(data.next_match_key).then((match) => {
            setNextMatch(match)
        });
        tba.getMatchFromKey(data.last_match_key).then( (match) => {
            setLastMatch(match);
        });
    }
    else if (type === "district") {
        console.log("District update:", data);
    }
    else {
        updateWithVisual(); //if the notification source is not one of the above with particular handling, reset the UI with visual notification to the user.
    }
});

const navbar = document.getElementById("gamedayNavbar");
const gameday = document.getElementById("streamContainer");
var navbarHeight = navbar.offsetHeight;

function resizeGameday() {
    gameday.style.height = `calc(100vh - ${navbarHeight}px)`;
}

window.addEventListener("load", window.jQuery(document.getElementById("currentEventStatus")).tooltip())
window.addEventListener("load", window.jQuery(document.getElementById("eventLocalTime")).tooltip())
window.addEventListener("load", window.jQuery(matchRefreshSpinner).tooltip())
window.addEventListener("load", resizeGameday);
window.addEventListener("resize", resizeGameday);

function showRefreshSpinner(element) {
    element.classList.remove("fa-refresh")
    element.classList.add("spinner-border", "spinner-border-sm")
}
function hideRefreshSpinner(element) {
    element.classList.remove("spinner-border", "spinner-border-sm")
    element.classList.add("fa-check")
    setTimeout(()=> {
        element.classList.remove("fa-check")
        element.classList.add("fa-refresh")
    }, 1500)
}

function getPredictedTimeString(predictedTime, eventTimeZone) {
    var predictedTimeString = "";
    const predictedStart = new Date(predictedTime * 1000);
    const now = new Date()
    if (predictedStart.toDateString() !== now.toDateString()) {
        predictedTimeString = `~${predictedStart.toLocaleString("en-US", {timeZone: eventTimeZone, weekday: 'short',  hour: '2-digit', minute: '2-digit'}).replace(/\s?(AM|PM)/i, (_, p1) => p1[0].toLowerCase())}`;
    } else {
        predictedTimeString = `~${predictedStart.toLocaleTimeString("en-US", {timeZone: eventTimeZone, hour: '2-digit', minute: '2-digit'}).replace(/\s?(AM|PM)/i, (_, p1) => p1[0].toLowerCase())}`;
    }
    return predictedTimeString;
}

function addMatchToList(match, eventTimeZone) {
    const matchList = document.getElementById("matchesListContainer");
    const redAlliance = match.alliances.red.team_keys.map(t => t.replace("frc", "").replace("3461", "<abbr title='Operation PEACCE Robotics'>3461</abbr>")).join(", ");
    const blueAlliance = match.alliances.blue.team_keys.map(t => t.replace("frc", "").replace("3461", "<abbr title='Operation PEACCE Robotics'>3461</abbr>")).join(", ");
    const matchKey = tba.getMatchCodeFromKey(match.key);
    const predictedTimeString = getPredictedTimeString(match.predicted_time, eventTimeZone);
    // Check if match already exists in the list to prevent duplicates (this can happen because TBA sometimes changes match times which would cause the same match to be added multiple times instead of just updating the existing match's time)
    try { 
        if (document.getElementById(`${match.key}`)) {
            console.log(`Match ${match.key} already exists in the list, updating instead of adding a duplicate.`);
            // Update existing match
            document.getElementById(`${match.key}`).querySelector('#matchCodeDisplay').innerText = matchKey; //This should not change, as it would then be a different match. Changing it makes any bugs obvious
            document.getElementById(`${match.key}`).querySelector('#nextMatchRed').innerHTML = redAlliance; //These usually dont change but just in case they do we will update them as well
            document.getElementById(`${match.key}`).querySelector('#nextMatchBlue').innerHTML = blueAlliance; //These usually dont change but just in case they do we will update them as well
            // Update the predicted time display
            const predictedTimeEl = document.getElementById(`${match.key}`).querySelector('#predictedTime');
            predictedTimeEl.innerText = predictedTimeString
            return;
        } else {
            // Add new match to the list
            const matchEl =
                `
                <div class="text-center">
                    <h6 id="matchCodeDisplay" class="m-1">${matchKey}</h6>
                    <h6 id="predictedTime" class="text-small m-1 text-nowrap">${predictedTimeString}</h6>
                </div>
                    <table class="table table-sm table-borderless text-light align-items-center p-1 m-1 rounded-sm" style="max-width: fit-content;">
                        <tbody class="align-items-center text-center rounded-sm">
                            <tr class="text-danger p-1 m-1">
                                <td class="small font-weight-bold text-nowrap p-0 m-0" id="nextMatchRed">${redAlliance}</td> 
                            </tr>
                            <tr class="text-primary p-1 m-1">
                                <td class="small font-weight-bold text-nowrap p-0 m-0" id="nextMatchBlue">${blueAlliance}</td>
                            </tr>
                        </tbody>
                    </table>   
                `
            const matchItem = document.createElement('div')
            matchItem.classList.add("container", "bg-dark", "d-inline-flex", "align-items-center", "mr-1",
                                    "h-100","rounded-lg", "pr-0", "pl-1", "h-100"); 
            matchItem.id = match.key;
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

function toggleChat() {
    document.getElementById('streamChatCol').classList.toggle('d-none');
}
function showChat() {
    document.getElementById('streamChatCol').classList.remove('d-none');
}
function hideChat() {
    document.getElementById('streamChatCol').classList.add('d-none')
}
window.toggleChat = toggleChat
window.showChat = showChat
window.hideChat = hideChat

function setLiveStream(streamUrl, streamButtonId, streamType) {
    const container = document.getElementById('streamContainer');
    var streamFrame = document.getElementById('liveStreamFrame');
    const chatFrame = document.getElementById('streamChat');
    if (streamType == "youtube") {
        streamFrame.src = streamUrl;
        chatFrame.src =`https://www.youtube.com/live_chat?v=${streamButtonId}&embed_domain=${window.location.hostname}`
        resizeGameday() //ensure the stream is sized correctly
        document.getElementById("streamChatToggle").classList.remove("disabled");
    } else if (streamType === "twitch") {
        resizeGameday() //ensure the stream is sized correctly
        streamFrame.src=`https://player.twitch.tv/?channel=${streamButtonId}&parent=${window.location.hostname}&muted=true&autoplay=true`
        chatFrame.src = `https://www.twitch.tv/embed/${streamButtonId}/chat?parent=${window.location.hostname}`;
        document.getElementById("streamChatToggle").classList.remove("disabled");
    } else {
        hideChat(); //if its not one of the two media types we support, hide the chat and disable showing it. (realistically what platforms aside from twitch and youtube have chats anyway)
        chatFrame.src = "/assets/images/notFound.png" //something nicer than the default browser "failed to connect" screen; Disabling the button should make it impossible for this to appear.
        document.getElementById("streamChatToggle").classList.add("disabled");
    }
    document.getElementById('streamContainer').style.display = 'block';
    
    if (streamButtonId) {
        document.getElementById("livestreamDropdown").childNodes.forEach((node) => {node.classList.remove("active")})
        document.getElementById(streamButtonId).classList.add("active");
    }
    
}

function populateLiveStreamOptions(event) {
    const liveStreamDropdown = document.getElementById('livestreamDropdown');
    liveStreamDropdown.innerHTML = "" //clear the list to ensure no duplicates (we might be refreshing or populating for the first time)
    event.webcasts.sort((a, b ) => {
        const aDate = new Date(a.date).toISOString().slice(0, 10);
        const bDate = new Date(b.date).toISOString().slice(0, 10);
        // console.log("Comparing Livestream Dates: ", aDate.localeCompare(bDate));
        return aDate.localeCompare(bDate)
    } ).forEach((webcast, index) => {
        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary btn-block text-left';
        button.id = webcast.channel
        if (webcast.type === "youtube") {
            getYouTubeMeta(webcast.channel).then((meta)=> {
                // console.log(meta);
                button.classList.remove("btn-outline-primary");
                button.classList.add("btn-outline-danger");
                button.innerHTML = `<span class="fa fa-user-circle-o"></span> ${meta ? meta.author_name : ""} <br> <span style="color:currentColor;" class="fa fa-youtube-play"></span> ${meta ? meta.title : `YouTube Stream ${index+1} (${webcast.date})`}`;
            }).catch( (e) => {
                button.classList.remove("btn-outline-primary");
                button.classList.add("btn-outline-danger");
                button.innerHTML = `<span style="color:currentColor;" class="fa fa-youtube-play"></span> YouTube Stream ${index+1} (${webcast.date})`;
            });
        } else if (webcast.type === "twitch"){
            button.classList.remove("btn-outline-primary");
            button.classList.add("btn-outline-twitch");
            button.innerHTML = `<span style="color:currentColor;" class="fa fa-twitch"></span> ${webcast?.stream_title || webcast.channel || `Twitch Stream ${index+1} (${webcast.date})`}`;
        } else {
            button.innerHTML = `<span style="color:currentColor;" class="fa fa-film"></span> ${webcast?.stream_title ||  `${webcast.type} Live Stream ${index+1} (${webcast.date})`}`;
        }
        button.addEventListener('click', () => {
            const url = webcast.type === 'twitch' 
                ? `https://player.twitch.tv/?autoplay=true&channel=${webcast.channel}&parent=${window.location.hostname}&muted=true`
                : `https://www.youtube.com/embed/${webcast.channel}?autoplay=1`;
            setLiveStream(url, button.id, webcast.type);
        });
        liveStreamDropdown.appendChild(button);
        
    });
}

async function getYouTubeMeta(videoId) {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  );
  return await res.json();
}

function refreshLiveStreamsWithVisual() {
    // Visual feedback to the user that the function is running (will stay on screen longer than the function actually takes to run)
    const minDisplayTime = 500; // milliseconds (0.5s usually feels good)
    const startTime = Date.now();
    showRefreshSpinner(streamRefreshSpinner)
    populateLiveStreamOptions(currentEvent)
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(minDisplayTime - elapsed, 0);
    setTimeout(() => {
        hideRefreshSpinner(streamRefreshSpinner)
    }, remaining);    
}

function setEventTitle(event) {
    const eventTitleEl = document.getElementById('currentEventName');
    eventTitleEl.innerHTML = `${event?.short_name || 'Unknown Event'}`;
    eventTitleEl.setAttribute("title", event?.week ? "Week " + (event.week + 1) + " " + event?.event_type_string + " Event": event?.event_type_string);
    window.jQuery(eventTitleEl).tooltip();
}
async function setEventStatus(override) {
    const eventStatusEl = document.getElementById('currentEventStatus');
    const eventRankEl = document.getElementById('currentEventRank');
    const eventRankIcon = document.getElementById("eventRankIcon");
    try {
        const status = override || globalEventStatus || await tba.getTeamEventStatus(currentEvent.key);
        const rank = await tba.getTeamStatusRank(currentEvent.key, status)
        const record = await tba.getTeamStatusRecordStr(currentEvent.key, status);
        eventStatusEl.innerHTML = `${record}`;
        eventRankEl.innerHTML = `${rank}`;
        try {
            if (status?.playoff) {
                eventRankIcon.classList.remove("fa-bar-chart")
                eventRankIcon.classList.add("fa-sitemap");
                eventRankEl.setAttribute("data-original-title", currentEvent.playoff_type_string)
                window.jQuery(eventRankEl).tooltip()
            } else if (status?.qual) {
                eventRankIcon.classList.add("fa-bar-chart")
                eventRankIcon.classList.remove("fa-sitemap");
                eventRankEl.setAttribute("data-original-title", "Qualification Ranking")
                window.jQuery(eventRankEl).tooltip()
            } else { console.warn("Status did not meet conditions for tooltips", status)}
        } catch (error) { console.warn("Could not set ranking tooltip", error)}
    } catch (error) {
        console.error('Failed to set event status:', error);
        eventRankEl.innerText = "-/-";
        eventStatusEl.innerText = "-W -L -T";
    }
}

function setMatchList(matches, eventTimeZone) {
    
    const now = tba.getEventLocalTimeCurrentTime(currentEvent.timezone);
    document.getElementById('matchesListContainer').innerHTML = ""; // Clear match list before populating to prevent duplicates
    matches.sort((a, b) => (a.predicted_time ) - (b.predicted_time )); // Sort matches by predicted time (multiplied by 1000 to convert from seconds to milliseconds for JavaScript Date)
    const futureMatches = matches.filter(match => match.predicted_time * 1000 > now)
    
    futureMatches.forEach(match => addMatchToList(match, eventTimeZone)); // Only show upcoming matches in the list to prevent it from becoming too long as the event goes on. Past matches can be seen by clicking on the last match section at the top which will show the most recent past match with details and a link to the match video if available
    if (
        futureMatches.length === 0 &&
        globalEventStatus?.next_match_key === null &&
        (globalEventStatus?.qual === null ||  globalEventStatus?.qual?.status === "completed" ) &&
        (
            globalEventStatus?.playoff === null ||
            globalEventStatus.playoff.status !== "playing"
        )
    ) {
        document.getElementById('matchesListContainer').innerHTML = `<h5 class=" mt-1 mb-1 d-none d-lg-block" style="max-height:60px; font-size: clamp(0.75rem, 1.05rem, 1.25rem);">${globalEventStatus?.overall_status_str ?? ""}</h5>`
    }
    
}

function setNextMatch(nextMatch) {
    console.log('Setting next match:', nextMatch);
    const nextMatchPredictedTimeEl = document.getElementById("nextMatchPredictedTime");
    if (!nextMatch) {
        console.log("Next Match is null")
        let eventStart = tba.getEventLocalTimeDate(currentEvent.start_date, currentEvent.timezone);
        let now = tba.getEventLocalTimeCurrentTime(currentEvent.timezone);

        if (eventStart > now) {
            console.log("Event Start is in future", "Event Start: ", eventStart, "Current Local Time: ", now)
            clearInterval(matchCountdownInterval);
            // matchUpdateInterval = counter.matchCountdown(
            //     eventStart,
            //     document.getElementById('nextMatchCountdown'),
            //     update
            // );
            nextMatchPredictedTimeEl.innerText = eventStart.toLocaleString('en-US', {weekday:"long", month:"long", day:"2-digit"})
            document.getElementById('nextMatchNumber').innerText = "Event Begins On:";
            document.getElementById('nextMatchRed').innerHTML = "";
            document.getElementById('nextMatchBlue').innerHTML = "";
            document.getElementById("nextMatchCountdown").innerText = ""
            document.getElementById('nextMatchContainer').classList.remove("d-none");
        } else {
            document.getElementById('nextMatchContainer').classList.add("d-none");
            document.getElementById('nextMatchNumber').innerText = "Unknown";
            document.getElementById('nextMatchRed').innerText = "";
            document.getElementById('nextMatchBlue').innerText = "";
            document.getElementById("nextMatchCountdown").innerText = "--";
            clearInterval(matchCountdownInterval);
        }

        return;
    }

    try {
        const nextMatchDate = new Date(nextMatch.predicted_time * 1000);

        const nextMatchNumberEl = document.getElementById('nextMatchNumber');
        nextMatchNumberEl.innerText = tba.getMatchCodeFromKey(nextMatch.key);
        nextMatchPredictedTimeEl.innerText = getPredictedTimeString(nextMatch.predicted_time, currentEvent.timezone);

        const redAlliance = nextMatch.alliances.red.team_keys
            .map(t => t.replace("frc", "").replace("3461", "<abbr title='Operation PEACCE Robotics'>3461</abbr>"))
            .join(", ");

        const blueAlliance = nextMatch.alliances.blue.team_keys
            .map(t => t.replace("frc", "").replace("3461", "<abbr title='Operation PEACCE Robotics'>3461</abbr>"))
            .join(", ");

        document.getElementById('nextMatchRed').innerHTML = redAlliance;
        document.getElementById('nextMatchBlue').innerHTML = blueAlliance;

        const el = document.getElementById(nextMatch.key);
        if (el) el.remove();

        clearInterval(matchCountdownInterval);

        matchCountdownInterval = counter.matchCountdown(
            nextMatchDate,
            document.getElementById('nextMatchCountdown'),
            update, 
        );
        document.getElementById('nextMatchContainer').classList.remove("d-none");
    } catch (error) {
        console.error('Failed to set next match:', error);
    }
}


function setLastMatch(lastMatch) {
    const lastMatchContainer = document.getElementById("lastMatchContainer");
    try {
        const lastMatchCode = document.getElementById('lastMatchCode');
        lastMatchCode.innerText = tba.getMatchCodeFromKey(lastMatch.key);
        const redAlliance = lastMatch.alliances.red.team_keys.map(t => t.replace("frc", "").replace("3461", "<abbr title='Operation PEACCE Robotics'>3461</abbr>")).join(", ");
        const blueAlliance = lastMatch.alliances.blue.team_keys.map(t => t.replace("frc", "").replace("3461", "<abbr title='Operation PEACCE Robotics'>3461</abbr>")).join(", ");
        if (redAlliance.includes("3461")) {
            document.getElementById('lastMatchRedScore').innerHTML = `<u>${lastMatch.alliances.red.score}</u>`;
            document.getElementById('lastMatchBlueScore').innerHTML = lastMatch.alliances.blue.score;
        } else if (blueAlliance.includes("3461")) {
            document.getElementById('lastMatchRedScore').innerHTML = lastMatch.alliances.red.score;
            document.getElementById('lastMatchBlueScore').innerHTML = `<u>${lastMatch.alliances.blue.score}</u>`;           
        } else {
            document.getElementById('lastMatchRedScore').innerHTML = lastMatch.alliances.red.score;
            document.getElementById('lastMatchBlueScore').innerHTML = lastMatch.alliances.blue.score;             
        }

        document.getElementById('lastMatchRed').innerHTML= redAlliance;
        document.getElementById('lastMatchBlue').innerHTML = blueAlliance;
        lastMatchContainer.classList.add("d-flex"); 
        lastMatchContainer.classList.remove("d-none");
        try {
            document.getElementById(`${lastMatch.key}`).remove(); // Remove the match from the list of matches below since it's now being displayed as the last match. This prevents confusion from having the same match displayed in two places and also prevents the list of matches from becoming too long as the event goes on
            //It should have already been removed when it was set as the next match, but in case the next match gets changed before the last match gets updated this will ensure there are no duplicates
        }
        catch (error) {
            console.warn('Failed to remove last match from list:', error);
        }

    } catch (error) {
        console.warn('Failed to set last match:', error);
        lastMatchContainer.classList.remove("d-flex"); 
        lastMatchContainer.classList.add("d-none");
    }
}

async function init() {
    currentSeasonYear = await tba.getCurrentSeasonYear();
    currentEvent = await tba.getCurrentEvent() || await tba.getNextEvent() || null;
    window.currentEvent = currentEvent; //expose the current event to the window so the refresh live streams button can pass it in
    setEventTitle(currentEvent);
    counter.eventLocalTime(currentEvent.timezone, document.getElementById('eventLocalTime'));
    populateLiveStreamOptions(currentEvent);
    var nextWebcast = null;
    var nextWebcast = null;

    const liveStreamUrl = (() => {
        if (!currentEvent.webcasts || currentEvent.webcasts.length === 0) return '';

        const todayStr = new Date().toLocaleDateString('en-CA', {
            timeZone: currentEvent.timezone
        });

        nextWebcast = currentEvent.webcasts
            .filter(wc => wc.date >= todayStr)
            .sort((a, b) => a.date.localeCompare(b.date))[0];

        if (!nextWebcast) return '';

        return nextWebcast.type === 'twitch'
            ? `https://player.twitch.tv/?autoplay=true&channel=${nextWebcast.channel}&parent=www.peacce.org`
            : `https://www.youtube.com/embed/${nextWebcast.channel}?autoplay=1`;
    })();

    setLiveStream(
        liveStreamUrl,
        nextWebcast ? nextWebcast.channel : null,
        nextWebcast ? nextWebcast.type : null
    );
    
   await update();
   updateInterval = scheduleNextUpdate() // Refresh data every 3 minutes to keep match list and statuses up to date
   window.updateInterval = updateInterval; //allow cancelling the auto-match refresh for testing purposes
}


function getAdaptiveInterval() {
    const now = Date.now() / 1000;
    const nextMatchTime = tba.getMatchFromKey(globalEventStatus?.next_match_key).then((match)=> {
        return match.predicted_time;
    }).catch((e) => { console.warn("Adaptive Refresh Interval Failed to get Next Match Predicted Time... Falling Back", e)});

    if (!nextMatchTime) return 180000; //3 minutes

    const secondsUntilMatch = nextMatchTime - now;

    if (secondsUntilMatch < 120) {
        // < 2 minutes → match about to start
        return 60000; // 1 min
    } else if (secondsUntilMatch < 300) {
        // < 5 minutes → mid-cycle
        return 120000; // 2 min
    } else {
        return 180000; // default 3 min
    }
}

function scheduleNextUpdate() {
    const delay = getAdaptiveInterval();
    setTimeout(async () => {
        await update();
        scheduleNextUpdate();
    }, delay);
    console.log("Next UI rebuild: ", delay)
    return delay;
}

async function updateWithVisual() {
    // Visual feedback to the user that the function is running (will stay on screen longer than the function actually takes to run)
    const minDisplayTime = 500; // milliseconds (0.5s usually feels good)
    const startTime = Date.now();
    showRefreshSpinner(matchRefreshSpinner)
    await update()
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(minDisplayTime - elapsed, 0);
    setTimeout(() => {
        hideRefreshSpinner(matchRefreshSpinner)
    }, remaining);
}

async function update() {
    //document.getElementById('matchesListContainer').innerHTML = ""; // Clear match list before updating to prevent duplicates
    globalEventStatus = await comparePusherToGithub();
    await setEventStatus(globalEventStatus);
    //console.log("Global Event Status", globalEventStatus)
    tba.getEventMatches(currentEvent.key).then(matches => {
        setMatchList(matches, currentEvent.timezone);
    }).catch(error => {
        console.error('Failed to get event matches:', error);
        setMatchList([], currentEvent.timezone); // Clear match list on error
    });
    tba.getMatchFromKey(globalEventStatus.next_match_key).then(nextMatch => {
        setNextMatch(nextMatch);
    }).catch(error => {
        console.error('Failed to get next match:', error);
        setNextMatch(null);
    });

    tba.getMatchFromKey(globalEventStatus.last_match_key).then(lastMatch => {
        setLastMatch(lastMatch);
    }).catch(error => {
        console.error('Failed to get last match:', error);
        setLastMatch(null);
    }); 

    resizeGameday();
    matchRefreshSpinner.setAttribute('data-original-title', 
        `Refresh Matches (Last Refresh: ${new Date().toLocaleTimeString()})`
    );
}

async function comparePusherToGithub() {
    const newStatus = await tba.getTeamEventStatus(currentEvent.key);
    if (!newStatus || Object.keys(newStatus).length === 0 || !newStatus.overall_status_str) {
        console.log("API Value was empty, ignoring...");
        return globalEventStatus; // don't overwrite
    }
    if (!globalEventStatus) {
        globalEventStatus = newStatus;
        globalEventStatusSource = "api";
        console.log("No Global Status found, defaulting to API")
    } else if (globalEventStatusSource === "api") {
        // Safe to overwrite (same source)
        globalEventStatus = newStatus;
    } else {
        // Current data is from PUSHER → be careful
        const isAhead = normalizeStatus(globalEventStatus?.overall_status_str) !== normalizeStatus(newStatus?.overall_status_str);

        if (isAhead) {
            globalEventStatus = newStatus;
            globalEventStatusSource = "api";
        }
        console.log("Pusher is behind Github? ", isAhead);
    }
    return globalEventStatus;
}


function normalizeStatus(str) {
    if (!str) return ""; // treat missing as empty string
    return str?.replace(/<[^>]+>/g, '').trim();
}

init();

export { init, update, resizeGameday, addMatchToList, removeMatchFromList, setLiveStream, populateLiveStreamOptions};

window.initGameday = init; // Expose init function to global scope for testing purposes
window.updateGameday = updateWithVisual; // Expose update function for the refresh button
window.addMatchToList = addMatchToList; // Expose addMatchToList for testing purposes
window.removeMatchFromList = removeMatchFromList;
window.setNextMatch = setNextMatch;
window.setLastMatch = setLastMatch;
window.setMatchList = setMatchList;
window.refreshLiveStreamsWithVisual = refreshLiveStreamsWithVisual;
window.populateLiveStreamOptions = populateLiveStreamOptions;
// window.setLiveStream = setLiveStream;

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
    const wasFull = matchesArray.length >= maxMatches;
    const baseTeams = ["frc10245", "frc155", "frc6333", "frc2168", "frc3461", "frc571", "frc1234", "frc5678", "frc9012", "frc3456", "frc7890", "frc1111"]; // Extended team list for variety
    while (matchesArray.length < maxMatches) {
        const original = matchesArray[Math.floor(Math.random() * matchesArray.length)];
        const duplicate = JSON.parse(JSON.stringify(original));
        duplicate.match_number += Math.floor(Math.random() * 50) + 1;
        duplicate.key = `2025cthar_qm${duplicate.match_number}`;
        duplicate.predicted_time = Math.floor(new Date().getTime() / 1000) + Math.floor(Math.random() * 1000);
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
    // If the array was already full, randomly modify predicted times since they change a lot in reality
    if (wasFull) {
        matchesArray.forEach(match => {
            match.predicted_time = Math.floor(new Date().getTime() / 1000) + Math.floor(Math.random() * 100000);
        });
    }
}

function testMatches() {
    const matches = [testLastMatch, testNextMatch];
    generateTestMatches(matches);
    setMatchList(matches, currentEvent.timezone);
    setTimeout(() => {
        setLastMatch(matches[Math.floor(Math.random() * matches.length)]);
        setNextMatch(matches[Math.floor(Math.random() * matches.length)]);
    }, 1000);
    clearInterval(updateInterval);
}
window.testMatches = testMatches; // Expose testMatches function to global scope for testing purposes
