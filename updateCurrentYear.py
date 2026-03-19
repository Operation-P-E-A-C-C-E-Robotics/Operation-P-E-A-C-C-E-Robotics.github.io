import os
import json
import requests
import datetime
import subprocess
import pytz
import hashlib
import hmac
import time
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

# -------------------- CONFIG --------------------
TBA_API_KEY = os.getenv("TBA_API_KEY")
PUSHER_APP_ID = os.getenv("PUSHER_APP_ID")
PUSHER_KEY = os.getenv("PUSHER_KEY")
PUSHER_SECRET = os.getenv("PUSHER_SECRET")
PUSHER_CLUSTER = os.getenv("PUSHER_CLUSTER")

TEAM = "frc3461"
YEAR = datetime.date.today().year
EMAIL = "actions@github.com"
NAME = "GitHub Actions [Bot]"
COMMIT_MESSAGE = "Update data via Python script"

# Polling interval in seconds
POLL_INTERVAL = 10
END_TIME = "21:00:00"  # Eastern Time cutoff
DATA_FILES = []

# -------------------- HELPERS --------------------
def set_git_config(email, name):
    subprocess.run(["git", "config", "--global", "user.email", email])
    subprocess.run(["git", "config", "--global", "user.name", name])

def git_commit(files, message):
    if not files:
        return False
    subprocess.run(["git", "add"] + files)
    # Run commit but capture return code
    result = subprocess.run(["git", "commit", "-m", message], capture_output=True, text=True)
    
    if result.returncode == 0:
        # commit succeeded, push changes
        subprocess.run(["git", "push"])
        print("Committed files:", files)
        return True
    else:
        # working tree clean
        print("No changes to commit")
        print(result.stdout.strip())
        return False

# -------------------- PUSHER NOTIFICATION --------------------
def notify_pusher(message_type, data):
    body = json.dumps({
        "name": "update",
        "channels": ["my-channel"],
        "data": json.dumps({"messageType": message_type, "data": data})
    })

    timestamp = str(int(time.time()))
    params = {
        "auth_key": PUSHER_KEY,
        "auth_timestamp": timestamp,
        "auth_version": "1.0",
        "body_md5": hashlib.md5(body.encode()).hexdigest()
    }
    query_string = urllib.parse.urlencode(sorted(params.items()))
    string_to_sign = f"POST\n/apps/{PUSHER_APP_ID}/events\n{query_string}"
    signature = hmac.new(PUSHER_SECRET.encode(), string_to_sign.encode(), hashlib.sha256).hexdigest()
    url = f"https://api-{PUSHER_CLUSTER}.pusher.com/apps/{PUSHER_APP_ID}/events?{query_string}&auth_signature={signature}"
    resp = requests.post(url, headers={"Content-Type": "application/json"}, data=body)
    if not resp.ok:
        print(f"Pusher notification failed ({resp.status_code}): {resp.text}")
    else:
        print(f"Pusher notification sent for {message_type}")

# -------------------- DATA FETCH --------------------
def fetch_json(endpoint):
    url = f"https://www.thebluealliance.com/api/v3/{endpoint}?X-TBA-Auth-Key={TBA_API_KEY}"
    resp = requests.get(url)
    return resp.json()

def write_and_notify(filename, data, message_type):
        with open(filename, "w") as f:
            json.dump(data, f, indent=4)
        notify_pusher(message_type, data)
        DATA_FILES.append(filename)

# -------------------- MAIN SEASON FUNCTION --------------------
def season():
    DATA_FILES.clear()

    endpoints = [
        ("team/{}/events/{}".format(TEAM, YEAR), "events", f"{YEAR}_events.json"),
        ("team/{}/events/{}/statuses".format(TEAM, YEAR), "eventStatus", f"{YEAR}_event_statuses.json"),
        ("team/{}/awards/{}".format(TEAM, YEAR), "awards", f"{YEAR}_awards.json"),
        ("team/{}/matches/{}".format(TEAM, YEAR), "matches", f"{YEAR}_matches.json"),
        ("team/{}/media/{}".format(TEAM, YEAR), "media", f"{YEAR}_media.json"),
        ("district/{}ne/rankings".format(YEAR), "district", f"{YEAR}_district_rankings.json")
    ]

    for endpoint, msg_type, filename in endpoints:
        data = fetch_json(endpoint)
        write_and_notify(filename, data, msg_type)

    # Commit all changed files at once
    if DATA_FILES:
        diff = git_commit(DATA_FILES, COMMIT_MESSAGE)
        if diff:
            notify_pusher("complete", {"files": DATA_FILES.copy()})

# -------------------- MAIN LOOP --------------------
def run():
    set_git_config(EMAIL, NAME)
    eastern = pytz.timezone("US/Eastern")
    while True:
        now = datetime.datetime.now(eastern).strftime("%H:%M:%S")
        if now <= END_TIME:
            season()
            print(f"[{now}] Data fetched and notifications sent.")
        else:
            notify_pusher("backend", {"message": "TBA Polling Runner is terminating..."})
            print(f"[{now}] Outside working hours. Exiting.")
            break
        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    run()