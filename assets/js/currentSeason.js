import { getKickoffDate, getCurrentEvent, getCurrentSeasonYear, getNextEvent, getMedia, getTeamDistrictStats, getDistrictRankings, getAwards, getEvents, getEventStatuses, getMatches, formatTeamKey, getEventNameFromKey, getMatchNameFromKey } from "./tba.js";
import {eventCountdown, matchCountdown, kickoffCountdown} from "./countdown.js";
import { Chart } from "https://cdn.jsdelivr.net/npm/chart.js@4.5.1/+esm";

  const year = getCurrentSeasonYear();
  document.getElementById("header").innerHTML = year + " Competition Season"

  async function setEventCountdown() {
    try {
      var nextEvent = await getNextEvent();
      var currentEvent = await getCurrentEvent();
      if (currentEvent) {
        console.log("Hiding Competition Countdown because we are currently Competing at:", currentEvent.name);
        
        return; // If we're currently at an event, we don't want to show the "Next Event" countdown
      }
      console.log("Next Event:", nextEvent);
      const counterEl = document.getElementById('competitionCountdown');
      eventCountdown(nextEvent, counterEl);
      counterEl.style.display = 'block';
    } catch (error) {
      console.error("Error fetching next event:", error);
      return;
    }
    
  }
  setEventCountdown();

  async function setMedia() {
    try {
      const mediaJSON = await getMedia();
      let hasPlacedImage = false;

      if (mediaJSON.length === 0) {
        document.getElementById("robotImagePlaceholder").classList.add("active");
        return;
      }

      for (let i = 0; i < mediaJSON.length; i++) {
        const tempMedia = mediaJSON[i];
        if (tempMedia.preferred && tempMedia.direct_url) {
          const imgElement = `<img src="${tempMedia.direct_url}" class="carousel-item ${!hasPlacedImage ? 'active' : ''} img-thumbnail" style="width:100%; height:30rem; object-fit: cover;">`;
          document.getElementById("robotCarousel").innerHTML += imgElement;

          if (!hasPlacedImage) {
            document.getElementById("image").setAttribute("content", tempMedia.direct_url);
            hasPlacedImage = true;
          }
        }
      }

      if (!hasPlacedImage) {
        document.getElementById("robotImagePlaceholder").classList.add("active");
      }
    } catch (error) {
      console.error("Error loading media:", error);
      document.getElementById("robotImagePlaceholder").classList.add("active");
    }
  }
  setMedia();


  async function setGitCommitDate() {
    const gitCommits = await fetch("https://api.github.com/repos/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/commits/gh-actions-tba-data-backend");
    var gitCommitJSON = await gitCommits.json()
    var gitLastUpdatedDate = new Date(gitCommitJSON.commit.committer.date)
    document.getElementById("dataLastUpdated").innerText = gitLastUpdatedDate.toLocaleDateString() + " at " + gitLastUpdatedDate.toLocaleTimeString()
  }
  setGitCommitDate();

  async function setDistrictStats() {
    const districtStats = await getTeamDistrictStats();
    const rankings = await getDistrictRankings();
    const teams = rankings.filter(item => item.point_total !== 0);
    if (districtStats) {
      document.getElementById("districtRank").innerHTML = "District Rank: " + districtStats.rank + "/" + teams.length;
      document.getElementById("districtPoints").innerHTML = "Total District Points: " + districtStats.point_total;
    }
}
setDistrictStats();


  async function show() {
    const awards = await getAwards();
    const event = await getEvents();
    const eventStats = await getEventStatuses();
    const stats = {};
    const eventKeyEventInfoPair = {};
    for (var i = 0; i < event.length; i++){
      stats[event[i].key] = eventStats[i] || null;
      eventKeyEventInfoPair[event[i].key] = event[i];
    }
    let tab =
      `<tr>
        <th>Event Name</th>
        <th>Ranking</th>
        <th>Awards</th>
    </tr>`;

    console.log(eventStats)
    if (length == 0) {
      tab = `<h1 class=text-center>No Events Found</h1>`
      document.getElementById("employees").innerHTML = tab;
    }
  for (const [key, value] of Object.entries(eventStats)) {
    var badge = ""
    if (value != null) {
      switch(eventStats[key].event_type) {
        case 100:
          badge = `<span class="badge badge-pill badge-secondary">Preseason Event</span>`
          break;
        case 99:
          badge = `<span class="badge badge-pill badge-secondary">Offseason Event</span>`
          break;
        case -1:
          badge = `<span class="badge badge-pill badge-warning">Unlabeled Event</span>`
          break;
        case 0:
          badge = `<span class="badge badge-pill badge-primary">Week ${stats[key].week + 1} Regional Event</span>`
          break;
        case 1:
          badge = `<span class="badge badge-pill badge-primary">Week ${stats[key].week + 1} District Event</span>`
          break;
        case 2:
          badge = `<span class="badge badge-pill badge-info">DCMP</span>`
          break;
        case 3:
          badge = `<span class="badge badge-pill badge-success">CMP Division</span>`
          break;
        case 4:
          badge = `<span class="badge badge-pill badge-success">CMP Einstein</span>`
          break;

        case 5:
          badge = `<span class="badge badge-pill badge-info">DCMP Division</span>`
          break;
        case 7:
            badge = `<span class="badge badge-pill badge-danger">2020/21 Remote Event</span>` // Covid is fun isnt it
            break;

        case null:
          badge = ""
          break;
        default:
          badge = ""
      }
      tab += `<tr><td date=${eventKeyEventInfoPair[key].start_date} id=${key}><a class="text-dark" href="https://www.thebluealliance.com/event/${key}">${eventKeyEventInfoPair[key].name} ${badge}</a></td><td id="${key}eventstatus"> ${value.overall_status_str}</td><td id=${key + "awards"}>None Found</td></tr>`;
    } else {
      tab += `<tr><td date=${eventKeyEventInfoPair[key].start_date} id=${key}><a class="text-dark" href="https://www.thebluealliance.com/event/${key}">${eventKeyEventInfoPair[key].name} ${badge}</a></td><td>Event Begins on ${new Date(eventKeyEventInfoPair[key].start_date + "T09:00:00").toLocaleString(navigator.languages[0], { timeZone: eventKeyEventInfoPair[key].timezone, day: 'numeric', month: 'long', year: 'numeric' })}</td><td>No Data</td></tr>`
    }
    // Setting innerHTML as tab variable
    document.getElementById("employees").innerHTML = tab;
    sortTable();
    }
    ////////console.log(awards);
    for (var i = 0; i < awards.length; i++) {
      ////////console.log(awards[i]);
      document.getElementById(awards[i].event_key + "awards").innerHTML = awards[i].name;
    }

}
function sortTable() {
  var table, rows, switching, i, x, y, shouldSwitch;
  var table = document.getElementById("employees");
  var switching = true;
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      var x = rows[i].getElementsByTagName("TD")[0];
      var y = rows[i + 1].getElementsByTagName("TD")[0];
      var xTime = Date.parse(x.getAttribute("date"));
      var yTime = Date.parse(y.getAttribute("date"));
      // Check if the two rows should switch place:
      if (xTime > yTime) {
        // If so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}
show();



//for the graphs 
  if (Date.now() > getKickoffDate()) {
    getMatchRecord();
  } else {
    document.getElementById('bestMatch').hidden = true

  }
  async function getMatchRecord(){
    var matches = await getMatches();
    if (matches.length == 0) {
      // If there are no matches, we can't really show any data, so we'll hide the best match banner and the graph
      console.log("No matches found for the current season. Hiding best match banner and graph.");
      document.getElementById('bestMatch').hidden = true
      document.getElementById('myChart').hidden = true
    }
    generateDataSet(matches);
    var highestScoringMatch = getHighestRankingOnSeasonMatch(matches);
    // console.log(highestScoringMatch)
    updateBestMatchBanner(highestScoringMatch);
  }

  async function updateBestMatchBanner(highScore) {


    try { 
      const event_name = await getEventNameFromKey(highScore.event_key)
      document.getElementById('bestMatchEventName').innerText += event_name 
      const match_name = await getMatchNameFromKey(highScore.key)
      document.getElementById('bestMatchMatchName').innerText += match_name
    } catch {
      console.log("failed to get event or match name")
    }
      // document.getElementById('bestMatchYTEmbed').src = "https://www.youtube-nocookie.com/embed/" + highScore.videos[0].key 

     //document.getElementById('bestMatchRedOne').innerHTML += formatTeamKey(highScore.alliances.red.team_keys[0])
      //document.getElementById('bestMatchBlueOne').innerHTML += formatTeamKey(highScore.alliances.blue.team_keys[0])

    try {
      document.getElementById('bestMatchYTEmbed').src = "https://www.youtube-nocookie.com/embed/" + highScore.videos[0].key 
    } catch {
     console.log("failed to set youtube match link")
     document.getElementById('bestMatchYTEmbedContainer').style.display = "None";
    }
    
    try {
      document.getElementById('bestMatchRedOne').innerHTML += formatTeamKey(highScore.alliances.red.team_keys[0]) //TODO verify
      document.getElementById('bestMatchBlueOne').innerHTML += formatTeamKey(highScore.alliances.blue.team_keys[0])
    } catch {
      console.log("failed to get Red/Blue team one")
    }

    try {
      document.getElementById('bestMatchRedTwo').innerHTML += formatTeamKey(highScore.alliances.red.team_keys[1])
      document.getElementById('bestMatchBlueTwo').innerHTML += formatTeamKey(highScore.alliances.blue.team_keys[1])
    } catch {
      console.log("failed to get Red/Blue team two")
    }

    try {
      document.getElementById('bestMatchRedThree').innerHTML += formatTeamKey(highScore.alliances.red.team_keys[2])
      document.getElementById('bestMatchBlueThree').innerHTML += formatTeamKey(highScore.alliances.blue.team_keys[2])
    } catch {
      console.log("failed to get Red/Blue team three")
    }

    try {
      document.getElementById('bestMatchRedScore').innerText += "Score: "+ highScore.alliances.red.score
      document.getElementById('bestMatchBlueScore').innerText += "Score: "+highScore.alliances.blue.score
    } catch {
      console.log("failed to get Red/Blue match score")
    }
  }

  function getHighestRankingOnSeasonMatch(matches) {
    var bestMatch = null
    var highScore = 0;
    var currentScore = 0;
    if (matches.length == 0) {
      document.getElementById('bestMatch').hidden = true
    }
    for (var i = 0; i < matches.length; i++) {
      var match = new Object(matches[i]);
      var redAlliance =  match.alliances.red
      var blueAlliance =  match.alliances.blue
      


        function getScore(alliance) {
          return alliance.score
        }

        if (redAlliance.team_keys.includes("frc3461")) {
          currentScore = getScore(redAlliance)
        } else if (blueAlliance.team_keys.includes("frc3461")) {
          currentScore = getScore(blueAlliance)
        }

        // console.log(match.key, currentScore)
        if (currentScore > highScore) {
          highScore = currentScore
          bestMatch = match
          // console.log("Best Scoring Match:", match.key, currentScore, ">", highScore)
        }

        
    }
    // console.log(currentScore, bestMatch)
    return bestMatch
  }

  function generateDataSet(matches) {
    var events = [];
    var score = [];
    var scorePure = [];
    var eventsScorePair = [];
    var matchNumber = [];
    var redAlliance;
    var blueAlliance;
    // ////console.log(matches);
     for (var i = 0; i < matches.length; i++) {
        //////console.log(matches[i]);
        var match = new Object(matches[i]);
        // ////console.log(match);
        var redAlliance = match.alliances.red.team_keys;
        var blueAlliance = match.alliances.blue.team_keys;
        if (events.includes(match.event_key) == false) {
          events.push(match.event_key);
        }

        if (redAlliance.includes("frc3461")) {
          // events.find(any(match.event_key)).push(match.alliances.red.score);
          scorePure.push(match.alliances.red.score);
          // score.push([match.event_key, {x: match.match_number, y: match.alliances.red.score, compLevel: match.comp_level+match.match_number}]);
          score.push([match.event_key, {x: match.match_number, y: match.alliances.red.score, num: match.time, comp: match.comp_level + match.match_number}]);

        } else if (blueAlliance.includes("frc3461")) {
          scorePure.push(match.alliances.blue.score);
          score.push([match.event_key, {x: match.match_number, y: match.alliances.blue.score, num: match.time, comp: match.comp_level + match.match_number}]);

        }

        matchNumber.push(i);
      }
      var eventsWithScoreArray = new Object;
      for (var i = 0; i < events.length; i++) {
        eventsWithScoreArray[events[i]] = [];
      }
      // ////console.log(score);
      for (var i=0; i<score.length; i++){
        // ////console.log(score[i]);
        eventsWithScoreArray[score[i][0]].push(score[i][1]);
        // eventsWithScoreArray[score[i][1]].push(score[i][2]);
        eventsWithScoreArray[score[i][0]].sort(function(a, b){return a.num - b.num});
      }
      // ////console.log(events);
      // ////console.log(score);
      // ////console.log(eventsScorePair);
      //  ////console.log(eventsWithScoreArray);


      generateGraph(events, eventsWithScoreArray, matchNumber);
  }

  async function generateGraph(events, scores, match_number) {
    const N = Math.max(...match_number) / events.length + 8;
    const arr = Array.from({length: N}, (_, index) => "Match " + (index + 1) );
    //console.log(arr);
    // console.log(match_number);
    //console.log(events)
    var xValues = arr;
    var barColors = ["red", "green","blue","orange","brown"];
    var eventKeyNamePair = {};
    var chartConfig = {
      type: "line",
      data: {
        labels: arr,
        datasets: []
      },
      options: {
        legend: {display: true},
        // scales: {
        //   yAxes: [{ticks: {min: 0}}],
        // }
        title: {
          display: true,
          text: "Match Scores Over Time",
          fontSize: 16
        }
      }
    };


    for (var i = 0; i < events.length; i++){

      var eventData = await getEventNameFromKey(events[i]);
      // ////console.log(events[i]);
      eventKeyNamePair[events[i]] = eventData;
    }
    // ////console.log(eventKeyNamePair);

    Object.entries(scores).forEach((entry, index) => {
      const [key, value] = entry;


      // ////console.log(eventName);
      // ////console.log(entry);
      //console.log(value)
      chartConfig.data.datasets.push({
        label: eventKeyNamePair[key],
        borderColor: barColors[index],
        backgroundColor: barColors[index],
        data: value.sort(function(a,b) { if (a.num && b.num != null){sortNumerically(a.num, b.num)} else {sortNumerically(a.comp, b.comp)}}),
        fill: false,
        tension: 0
      });
    });

    // ////console.log(chartConfig);
    new Chart("myChart", chartConfig);



  }


  function sortNumerically(a, b) {
  if (a > b) {
    return 1;
  } else if (b > a) {
    return -1;
  } else {
    return 0;
  }
  }
