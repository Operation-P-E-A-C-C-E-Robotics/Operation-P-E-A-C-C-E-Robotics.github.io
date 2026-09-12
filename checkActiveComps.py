#!/usr/bin/env python3

import datetime
import os
import requests

TEAM_KEY = "frc3461"
TBA_API_KEY = os.environ.get("TBA_API_KEY")

if not TBA_API_KEY:
    raise RuntimeError("TBA_API_KEY is required")

headers = {
    "X-TBA-Auth-Key": TBA_API_KEY,
    "Accept": "application/json"
}

year = datetime.datetime.now().year

eventsRequest = requests.get(
    f"https://www.thebluealliance.com/api/v3/team/{TEAM_KEY}/events/{year}",
    headers=headers,
    timeout=30
)
eventsRequest.raise_for_status()
try:
    events = eventsRequest.json()
except ValueError as exc:
    raise RuntimeError("TBA returned invalid JSON for active-event check") from exc
if not isinstance(events, list):
    raise RuntimeError("TBA returned an invalid events payload")
eTag = eventsRequest.headers.get("ETag", "")
print(f"eTag={eTag}")
headers["If-None-Match"] = eTag

today = datetime.date.today()

playing_today = any(
    datetime.date.fromisoformat(e["start_date"]) <= today <= datetime.date.fromisoformat(e["end_date"])
    for e in events
)

print(f"playing_today={playing_today}")

if playing_today:
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        raise RuntimeError("GITHUB_TOKEN is required to dispatch the event runner")

    owner = "Operation-P-E-A-C-C-E-Robotics"
    repo = "Operation-P-E-A-C-C-E-Robotics.github.io"

    url = (
        f"https://api.github.com/repos/"
        f"{owner}/{repo}/actions/workflows/updateCurrentEvent.yml/dispatches"
    )

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    payload = {
        "ref": "main"
    }

    response = requests.post(
        url,
        headers=headers,
        json=payload,
        timeout=30
    )

    print(response.status_code)

    if response.status_code == 204:
        print("Workflow dispatched successfully")
    else:
        response.raise_for_status()