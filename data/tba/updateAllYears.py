import json
import os
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

TEAM = "frc3461"
API_KEY = os.getenv("TBA_API_KEY")
DATA_DIR = Path(__file__).resolve().parent

FAILURES = []


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


def fetch_json(path, expected_type):
    if not API_KEY:
        raise RuntimeError("TBA_API_KEY is required")

    response = SESSION.get(
        f"https://www.thebluealliance.com/api/v3/{path}",
        headers={"X-TBA-Auth-Key": API_KEY},
        timeout=30,
    )

    # A missing TBA resource is not necessarily an error.
    if response.status_code == 404:
        return None

    response.raise_for_status()

    try:
        payload = response.json()
    except ValueError as exc:
        raise RuntimeError(f"TBA returned invalid JSON for {path}") from exc

    # Some old TBA endpoints return JSON null instead of 404.
    if payload is None:
        return None

    if not isinstance(payload, expected_type):
        raise RuntimeError(
            f"TBA returned {type(payload).__name__} for {path}; "
            f"expected {expected_type.__name__}"
        )

    return payload


def safe_fetch(path, expected_type, default=None, context=None):
    """
    Fetch data without aborting the entire collection.

    Returns default when the endpoint is unavailable or malformed,
    and records the failure for the final report.
    """
    try:
        payload = fetch_json(path, expected_type)

        if payload is None:
            FAILURES.append({
                "path": path,
                "context": context,
                "reason": "not available",
            })
            return default

        return payload

    except Exception as exc:
        FAILURES.append({
            "path": path,
            "context": context,
            "reason": str(exc),
        })
        return default


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


def collect_event_statistics(event_key):
    return {
        "event_key": event_key,

        "oprs": safe_fetch(
            f"event/{event_key}/oprs",
            dict,
            default=None,
            context=f"{event_key} OPRs",
        ),

        "coprs": safe_fetch(
            f"event/{event_key}/coprs",
            dict,
            default=None,
            context=f"{event_key} COPRs",
        ),

        "alliances": safe_fetch(
            f"event/{event_key}/alliances",
            list,
            default=None,
            context=f"{event_key} alliances",
        ),
    }


def collect_season(year):
    print(f"Collecting {year}...")

    events = safe_fetch(
        f"team/{TEAM}/events/{year}",
        list,
        default=[],
        context=f"{year} events",
    )

    statuses = safe_fetch(
        f"team/{TEAM}/events/{year}/statuses",
        dict,
        default={},
        context=f"{year} event statuses",
    )

    awards = safe_fetch(
        f"team/{TEAM}/awards/{year}",
        list,
        default=[],
        context=f"{year} awards",
    )

    matches = safe_fetch(
        f"team/{TEAM}/matches/{year}",
        list,
        default=[],
        context=f"{year} matches",
    )

    media = safe_fetch(
        f"team/{TEAM}/media/{year}",
        list,
        default=[],
        context=f"{year} media",
    )

    districts = safe_fetch(
        f"district/{year}ne/rankings",
        list,
        default=None,
        context=f"{year} district rankings",
    )

    # If the event list itself doesn't exist, there's nothing useful
    # we can do for this season's event-specific statistics.
    if not events:
        FAILURES.append({
            "path": f"team/{TEAM}/events/{year}",
            "context": f"{year}",
            "reason": "No events returned",
        })
        return

    validate_events(events, year)

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

    for event in events:
        event_key = event["key"]

        statistics = collect_event_statistics(event_key)

        write_json(
            DATA_DIR / f"{event_key}_statistics.json",
            statistics,
        )


def main():
    if not API_KEY:
        raise RuntimeError("TBA_API_KEY is required")

    # This is one thing we actually need in order to know what to process.
    years = fetch_json(
        f"team/{TEAM}/years_participated",
        list,
    )

    if not years or not all(isinstance(year, int) for year in years):
        raise RuntimeError(
            "TBA returned an invalid years-participated payload"
        )

    for year in years:
        try:
            collect_season(year)
        except Exception as exc:
            FAILURES.append({
                "path": f"season/{year}",
                "context": str(year),
                "reason": str(exc),
            })

            print(f"  FAILED: {year}: {exc}")

    print()
    print("=" * 70)
    print("COLLECTION COMPLETE")
    print("=" * 70)

    if not FAILURES:
        print("No failures.")
        return

    print(f"{len(FAILURES)} unavailable/failed resource(s):")
    print()

    for failure in FAILURES:
        context = failure.get("context")
        path = failure["path"]
        reason = failure["reason"]

        if context:
            print(f"- {context}")
            print(f"  {path}")
        else:
            print(f"- {path}")

        print(f"  {reason}")
        print()


if __name__ == "__main__":
    main()