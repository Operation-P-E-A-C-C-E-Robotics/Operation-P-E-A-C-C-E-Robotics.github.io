// Shared access to repository-generated Blue Alliance data.
// Presentation (including Team 3461 emphasis) belongs in the consuming component.

const cache = new Map();

function dataUrl(filename) {
  return new URL(`../../data/tba/${filename}`, import.meta.url);
}

async function fetchJson(filename, expectedType) {
  if (!cache.has(filename)) {
    cache.set(filename, fetch(dataUrl(filename), { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Could not load ${filename}: ${response.status}`);
        const payload = await response.json();
        if (expectedType && !(payload instanceof expectedType)) {
          throw new TypeError(`${filename} did not contain the expected data shape`);
        }
        return payload;
      })
      .catch((error) => {
        cache.delete(filename);
        throw error;
      }));
  }
  return cache.get(filename);
}

async function getSeasonStatus() { return fetchJson("status.json", Object); }

async function getCurrentSeasonYear() {
  const status = await getSeasonStatus();
  if (!Number.isInteger(status.current_season)) throw new Error("TBA status has no current_season");
  return status.current_season;
}

async function getKickoffDate() {
  const status = await getSeasonStatus();
  const kickoff = new Date(status.kickoff_datetime);
  if (Number.isNaN(kickoff.getTime())) throw new Error("TBA status has no valid kickoff_datetime");
  return kickoff;
}

async function getYearData(suffix, expectedType) {
  const year = await getCurrentSeasonYear();
  return fetchJson(`${year}_${suffix}.json`, expectedType);
}

const getEvents = () => getYearData("events", Array);
const getMatches = () => getYearData("matches", Array);
const getEventStatuses = () => getYearData("event_statuses", Object);
const getDistrictRankings = () => getYearData("district_rankings", Array);
const getAwards = () => getYearData("awards", Array);
const getMedia = async () => (await getYearData("media", Array)).filter((item) => item.team_key === "frc3461");
const getCurrentEventSnapshot = () => fetchJson("current_event.json", Object);

async function getEvent(eventKey) { return (await getEvents()).find((event) => event.key === eventKey) ?? null; }
async function getEventMatches(eventKey) { return (await getMatches()).filter((match) => match.event_key === eventKey); }
async function getMatchFromKey(matchKey) { return matchKey ? (await getMatches()).find((match) => match.key === matchKey) ?? null : null; }
async function getTeamEventStatus(eventKey) { return (await getEventStatuses())[eventKey] ?? null; }
async function getTeamStatusStr(eventKey) { return (await getTeamEventStatus(eventKey))?.overall_status_str ?? "Current status is unavailable"; }

async function getTeamStatusRank(eventKey, statusOverride) {
  const status = statusOverride ?? await getTeamEventStatus(eventKey);
  if (status?.playoff) {
    const alliance = status.alliance?.name?.replace("Alliance", "A").replace(" ", "") ?? "";
    return status.playoff.status === "eliminated" ? `${alliance} | Eliminated` : `${alliance} | ${status.playoff.double_elim_round ?? String(status.playoff.level ?? "").toUpperCase()}`;
  }
  return status?.qual?.ranking ? `${status.qual.ranking.rank}/${status.qual.num_teams ?? "?"}` : "No rank";
}

async function getTeamStatusRecordStr(eventKey, statusOverride) {
  const status = statusOverride ?? await getTeamEventStatus(eventKey);
  const record = status?.playoff?.record ?? status?.qual?.ranking?.record;
  return record ? `${record.wins}W ${record.losses}L ${record.ties ?? 0}T` : "No record";
}

async function getEventNameFromKey(eventKey) { return (await getEvent(eventKey))?.name ?? null; }
async function getShortEventNameFromKey(eventKey) { return (await getEvent(eventKey))?.short_name ?? null; }
async function getMatchNameFromKey(matchKey) {
  const match = await getMatchFromKey(matchKey);
  if (!match) return null;
  const names = { qm: "Qualification Match", qf: `Quarterfinal ${match.set_number} Match`, sf: `Semifinal ${match.set_number} Match`, f: "Final" };
  return `${names[match.comp_level] ?? "Match"} ${match.match_number}`;
}
function getMatchCodeFromKey(matchKey) { return typeof matchKey === "string" ? (matchKey.split("_")[1]?.toUpperCase().replace(/(?<!Q)M/g, "-") ?? "UN") : "UN"; }
function formatTeamNumber(teamKey) { return String(teamKey ?? "").replace(/^frc/, ""); }
async function getCurrentEvent() { const snapshot = await getCurrentEventSnapshot(); return snapshot.state === "active" ? snapshot.event : null; }
async function getNextEvent() {
  const today = new Date().toISOString().slice(0, 10);
  return (await getEvents()).filter((event) => event.start_date >= today).sort((a, b) => a.start_date.localeCompare(b.start_date))[0] ?? null;
}
async function getTeamDistrictStats() { return (await getDistrictRankings()).find((team) => team.team_key === "frc3461") ?? null; }
function formatTimestamp(timestamp) { return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(timestamp * 1000)); }

export {
  formatTeamNumber, formatTimestamp, getAwards, getCurrentEvent, getCurrentEventSnapshot,
  getCurrentSeasonYear, getDistrictRankings, getEvent, getEventMatches, getEventNameFromKey,
  getEventStatuses, getEvents, getKickoffDate, getMatchCodeFromKey, getMatchFromKey,
  getMatchNameFromKey, getMatches, getMedia, getNextEvent, getSeasonStatus,
  getShortEventNameFromKey, getTeamDistrictStats, getTeamEventStatus, getTeamStatusRank,
  getTeamStatusRecordStr, getTeamStatusStr
};
