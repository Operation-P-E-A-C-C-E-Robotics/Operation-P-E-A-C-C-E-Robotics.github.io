import json
import os
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

TEAM = "frc3461"
API_KEY = os.getenv("TBA_API_KEY")
DATA_DIR = Path(__file__).resolve().parent


def build_session():
    session = requests.Session()
    retry = Retry(
        total=4,
        connect=4,
        read=4,
        status=4,
        backoff_factor=1,
        allowed_methods={"GET"},
        status_forcelist=[429, 500, 502, 503, 504],
    )
    session.mount("https://", HTTPAdapter(max_retries=retry))
    return session


SESSION = build_session()


def fetch_json(path, expected_type, allow_not_found=False):
    if not API_KEY:
        raise RuntimeError("TBA_API_KEY is required")

    response = SESSION.get(
        f"https://www.thebluealliance.com/api/v3/{path}",
        headers={"X-TBA-Auth-Key": API_KEY},
        timeout=30,
    )
    if response.status_code == 404 and allow_not_found:
        return None
    response.raise_for_status()
    try:
        payload = response.json()
    except ValueError as exc:
        raise RuntimeError(f"TBA returned invalid JSON for {path}") from exc
    if not isinstance(payload, expected_type):
        raise RuntimeError(
            f"TBA returned {type(payload).__name__} for {path}; "
            f"expected {expected_type.__name__}"
        )
    return payload


def write_json(path, payload):
    temporary_path = path.with_suffix(f"{path.suffix}.tmp")
    with temporary_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=4)
        handle.write("\n")
    temporary_path.replace(path)


def validate_events(events, year):
    for event in events:
        if not isinstance(event, dict) or not event.get("key"):
            raise RuntimeError(f"Invalid event payload for {year}")
        if not event.get("start_date") or not event.get("end_date"):
            raise RuntimeError(f"Incomplete event payload for {year}")


def validate_keyed_records(records, name, year):
    for record in records:
        if not isinstance(record, dict) or not record.get("key"):
            raise RuntimeError(f"Invalid {name} payload for {year}")


def collect_season(year):
    events = fetch_json(f"team/{TEAM}/events/{year}", list)
    statuses = fetch_json(f"team/{TEAM}/events/{year}/statuses", dict)
    awards = fetch_json(f"team/{TEAM}/awards/{year}", list)
    matches = fetch_json(f"team/{TEAM}/matches/{year}", list)
    media = fetch_json(f"team/{TEAM}/media/{year}", list)
    districts = fetch_json(f"district/{year}ne/rankings", list, allow_not_found=True)

    validate_events(events, year)
    validate_keyed_records(matches, "matches", year)
    if not all(isinstance(item, dict) for item in media):
        raise RuntimeError(f"Invalid media payload for {year}")
    if not all(isinstance(item, dict) for item in awards):
        raise RuntimeError(f"Invalid awards payload for {year}")
    if districts is not None and not all(isinstance(item, dict) for item in districts):
        raise RuntimeError(f"Invalid district rankings payload for {year}")

    payloads = {
        f"{year}_events.json": events,
        f"{year}_event_statuses.json": statuses,
        f"{year}_awards.json": awards,
        f"{year}_matches.json": matches,
        f"{year}_media.json": media,
    }
    if districts is not None:
        payloads[f"{year}_district_rankings.json"] = districts
    for filename, payload in payloads.items():
        write_json(DATA_DIR / filename, payload)


def main():
    years = fetch_json(f"team/{TEAM}/years_participated", list)
    if not years or not all(isinstance(year, int) for year in years):
        raise RuntimeError("TBA returned an invalid years-participated payload")

    for year in years:
        collect_season(year)


if __name__ == "__main__":
    main()
