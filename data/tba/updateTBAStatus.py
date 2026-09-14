import os
import requests
import json
from dotenv import load_dotenv

load_dotenv(".env")

TBA_API_KEY = os.getenv("TBA_API_KEY")

EMAIL = "actions@github.com"
NAME = "GitHub Actions [Bot]"
COMMIT_MESSAGE = "Update TBA Status Endpoint"


def fetch_json(endpoint, expected_type, allow_not_found=False):
    if not TBA_API_KEY:
        raise RuntimeError("TBA_API_KEY is required")

    url = f"https://www.thebluealliance.com/api/v3/{endpoint}?X-TBA-Auth-Key={TBA_API_KEY}"

    resp = requests.get(url, timeout=30)

    if resp.status_code == 404 and allow_not_found:
        return None

    resp.raise_for_status()

    try:
        payload = resp.json()
    except ValueError as exc:
        raise RuntimeError(
            f"TBA returned invalid JSON for {endpoint}"
        ) from exc

    if not isinstance(payload, expected_type):
        raise RuntimeError(
            f"TBA returned {type(payload).__name__} for {endpoint}; "
            f"expected {expected_type.__name__}"
        )

    return payload


tbaStatus = fetch_json("status", dict)

with open("data/tba/tba_status.json", "w") as f:
    json.dump(tbaStatus, f, indent=2)