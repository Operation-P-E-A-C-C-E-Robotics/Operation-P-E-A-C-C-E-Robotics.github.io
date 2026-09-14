import json
import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
load_dotenv(ROOT / ".env")
API_KEY = os.getenv("TBA_API_KEY")
OUTPUT = ROOT / "status.json"


def main():
    if not API_KEY:
        raise RuntimeError("TBA_API_KEY is required")
    response = requests.get(
        "https://www.thebluealliance.com/api/v3/status",
        headers={"X-TBA-Auth-Key": API_KEY},
        timeout=30,
    )
    response.raise_for_status()
    payload = response.json()
    if not isinstance(payload, dict) or not isinstance(payload.get("current_season"), int):
        raise RuntimeError("TBA returned an invalid status payload")
    temporary = OUTPUT.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    temporary.replace(OUTPUT)
    print(f"Wrote {OUTPUT}")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Status update failed: {error}", file=sys.stderr)
        sys.exit(1)
