#!/usr/bin/env python3

import datetime
import os
import requests

TEAM_KEY = "frc3461"

headers = {
    "X-TBA-Auth-Key": os.environ["TBA_AUTH_KEY"],
    "Accept": "application/json"
}

year = datetime.datetime.now().year

eventsRequest = requests.get(
    f"https://www.thebluealliance.com/api/v3/team/{TEAM_KEY}/events/{year}",
    headers=headers
)
eTag = eventsRequest.headers.get("ETag", "")
print(f"eTag={eTag}")
headers["If-None-Match"] = eTag
events = eventsRequest.json()

today = datetime.date.today()

playing_today = any(
    datetime.date.fromisoformat(e["start_date"]) <= today <= datetime.date.fromisoformat(e["end_date"])
    for e in events
)

print(f"playing_today={playing_today}")

if playing_today:
    token = os.environ["GITHUB_TOKEN"]

    owner = "Operation-P-E-A-C-C-E-Robotics"
    repo = "Operation-P-E-A-C-C-E-Robotics.github.io"

    url = (
        f"https://api.github.com/repos/"
        f"{owner}/{repo}/actions/workflows/updateCurrentYear.yml/dispatches"
    )

    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    payload = {
        "ref": "gh-actions-tba-backend"
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
        print(response.text)
    pass