#!/usr/bin/env python3
import json
import os
import sys
from datetime import date, datetime, timezone
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

TEAM = os.getenv("TEAM", "frc3461")
YEAR = int(os.getenv("YEAR") or date.today().year)
OUTPUT_PATH = Path(os.getenv("CURRENT_EVENT_JSON_PATH", "current_event.json"))
TBA_API_KEY = os.getenv("TBA_API_KEY")


def build_session() -> requests.Session:
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
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session


SESSION = build_session()


def fetch_json(path: str, expected_type):
    if not TBA_API_KEY:
        raise RuntimeError("TBA_API_KEY is required. Set it in the environment or GitHub Actions secrets.")

    url = f"https://www.thebluealliance.com/api/v3/{path}"
    response = SESSION.get(url, headers={"X-TBA-Auth-Key": TBA_API_KEY}, timeout=30)

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


def parse_date(value):
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        return None


def event_status(event):
    today = date.today()
    start = parse_date(event.get("start_date"))
    end = parse_date(event.get("end_date"))

    if start and end:
        if start <= today <= end:
            return "active"
        if today < start:
            return "upcoming"
        if today > end:
            return "past"
    return "unknown"


def normalize_match(match):
    alliances = match.get("alliances") or {}
    red = alliances.get("red") or {}
    blue = alliances.get("blue") or {}

    return {
        "key": match.get("key"),
        "event_key": match.get("event_key"),
        "comp_level": match.get("comp_level"),
        "set_number": match.get("set_number"),
        "match_number": match.get("match_number"),
        "time": match.get("time"),
        "actual_time": match.get("actual_time"),
        "predicted_time": match.get("predicted_time"),
        "winning_alliance": match.get("winning_alliance"),
        "alliances": {
            "red": {
                "score": red.get("score"),
                "team_keys": red.get("team_keys") or [],
                "surrogate_team_keys": red.get("surrogate_team_keys") or [],
                "dq_team_keys": red.get("dq_team_keys") or [],
            },
            "blue": {
                "score": blue.get("score"),
                "team_keys": blue.get("team_keys") or [],
                "surrogate_team_keys": blue.get("surrogate_team_keys") or [],
                "dq_team_keys": blue.get("dq_team_keys") or [],
            },
        },
    }


def pick_event(events):
    if not events:
        return None

    today = date.today()
    selected = None

    for event in sorted(events, key=lambda item: item.get("start_date") or "9999-12-31"):
        event_day = parse_date(event.get("start_date"))
        end_day = parse_date(event.get("end_date"))
        if not event_day or not end_day:
            continue

        if event_day <= today <= end_day:
            return event
        if not selected and today < event_day:
            selected = event

    if selected:
        return selected

    return max(events, key=lambda item: parse_date(item.get("start_date")) or date(1970, 1, 1))


def build_snapshot():
    team_events = fetch_json(f"team/{TEAM}/events/{YEAR}", list)
    event = pick_event(team_events)

    snapshot = {
        "team_key": TEAM,
        "year": YEAR,
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "source": "TBA v3",
        "event": None,
        "event_key": None,
        "state": "none",
        "team_status": None,
        "matches": [],
    }

    if not event:
        return snapshot

    event_key = event.get("key")
    if not event_key or not event.get("start_date") or not event.get("end_date"):
        raise RuntimeError("TBA returned an incomplete event payload")
    snapshot["event"] = {
        "key": event.get("key"),
        "name": event.get("name"),
        "short_name": event.get("short_name"),
        "event_code": event.get("event_code"),
        "event_type": event.get("event_type"),
        "event_type_string": event.get("event_type_string"),
        "start_date": event.get("start_date"),
        "end_date": event.get("end_date"),
        "city": event.get("city"),
        "state_prov": event.get("state_prov"),
        "country": event.get("country"),
        "website": event.get("website"),
        "timezone": event.get("timezone"),
        "week": event.get("week"),
        "district": event.get("district"),
    }
    snapshot["event_key"] = event_key
    snapshot["state"] = event_status(event)

    team_status = fetch_json(f"team/{TEAM}/event/{event_key}/status", dict)
    snapshot["team_status"] = team_status

    matches = fetch_json(f"team/{TEAM}/event/{event_key}/matches", list)
    if any(not isinstance(match, dict) or not match.get("key") for match in matches):
        raise RuntimeError("TBA returned an invalid matches payload")
    snapshot["matches"] = [normalize_match(match) for match in matches]

    return snapshot


def write_snapshot(snapshot):
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    existing = None
    if OUTPUT_PATH.exists():
        try:
            with OUTPUT_PATH.open(encoding="utf-8") as handle:
                existing = json.load(handle)
        except (OSError, ValueError) as exc:
            raise RuntimeError(f"Existing snapshot is invalid: {OUTPUT_PATH}") from exc

    comparable = dict(snapshot)
    comparable.pop("generated_at", None)
    if isinstance(existing, dict):
        existing_comparable = dict(existing)
        existing_comparable.pop("generated_at", None)
        if existing_comparable == comparable:
            print(f"No changes for {OUTPUT_PATH}")
            return

    temporary_path = OUTPUT_PATH.with_suffix(f"{OUTPUT_PATH.suffix}.tmp")
    with temporary_path.open("w", encoding="utf-8") as handle:
        json.dump(snapshot, handle, indent=2, sort_keys=True)
        handle.write("\n")
    temporary_path.replace(OUTPUT_PATH)

    print(f"Wrote {OUTPUT_PATH} for event {snapshot.get('event_key') or 'unknown'}")


def main():
    try:
        snapshot = build_snapshot()
        write_snapshot(snapshot)
        return 0
    except Exception as exc:  # pragma: no cover - workflow should surface this failure clearly
        print(f"Current-event update failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
