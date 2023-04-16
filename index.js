const core = require('@actions/core');
const github = require('@actions/github');


var events = "https://www.thebluealliance.com/api/v3/team/frc3461/events/";
var year = new Date().getFullYear();

var eventstatuses = "/statuses?X-TBA-Auth-Key=hOngAA1OYRpYtrfePLodT2G27R7fSBfrGJ57RwH1sOZJxaJv3rHGfhH37aLitVNb"
var key = core.getInput('api-key');
const authKey = "?X-TBA-Auth-Key=" + key 
var district = "https://www.thebluealliance.com/api/v3/district/" +year +"ne/rankings"+authKey
var media = "https://www.thebluealliance.com/api/v3/team/frc3461/media/"
var awards = "https://www.thebluealliance.com/api/v3/team/frc3461/awards/"


var eventstats = events + year + "/statuses" + authKey;
var eventurl = events + year + authKey;
var mediaurl = media + year + authKey;
var awardsurl = awards + year + authKey;
var countDownDate;


async function getMedia(mediaURL) {
  const apiResponse = await fetch(mediaURL);
  const mediaJSON = await apiResponse.json();

}

async function getapi(eventurl, eventstats, awards) {
  const eventResponse = await fetch(eventurl);
  const eventStats = await fetch(eventstats);
  const awardsData = await fetch(awards);
  var eventdata = await eventResponse.json();
  var eventstatdata = await eventStats.json();
  var awardsForYear = await awardsData.json();
}

async function getDistrictStats(district) {
 var districtResponse = await fetch(district);
 var districtJSON = await districtResponse.json();
 var teamDistrictRankings;
 
 for (var i = 0; i < districtJSON.length; i++) {
             if (districtJSON[i].team_key == "frc3461") {
       //console.log(districtJSON[i]);
     document.getElementById("districtRank").innerHTML = "Current District Rank: " + districtJSON[i].rank; 
     document.getElementById("districtPoints").innerHTML = "Current District Points: " + districtJSON[i].point_total; 
   }
 }

}


async function getMatchFromKey(matchKey) {
  var matchAPIURL = "https://www.thebluealliance.com/api/v3/match/" + matchKey + authKey;
  var matchAPIResponse = await fetch(matchAPIURL);
  var match = await matchAPIResponse.json();
  console.log(match);
  return Promise.resolve(match);
}

async function getTeamStatus(eventKey) {
  //console.log(eventKey);
  var matchAPIURL = "https://www.thebluealliance.com/api/v3/team/frc3461/event/" + year + eventKey + "/status" + authKey;
  var matchAPIResponse = await fetch(matchAPIURL);
  var match = await matchAPIResponse.json();
  return match;
}

// Calling the async functions
getapi(eventurl, eventstats, awardsurl);
getMedia(mediaurl);
getDistrictStats(district);