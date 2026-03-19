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
HASH_STORE_FILE = ".hashes.json"

# -------------------- HELPERS --------------------
def set_git_config(email, name):
    subprocess.run(["git", "config", "--global", "user.email", email])
    subprocess.run(["git", "config", "--global", "user.name", name])

def git_commit(files, message):
    if not files:
        return False
    subprocess.run(["git", "add"] + files)
    result = subprocess.run(["git", "commit", "-m", message], capture_output=True, text=True)
    
    if result.returncode == 0:
        subprocess.run(["git", "push"])
        print("Committed files:", files)
        return True
    else:
        print("No changes to commit")
        return False

# -------------------- HASH MANAGEMENT --------------------
def load_hashes():
    try:
        with open(HASH_STORE_FILE) as f:
            return json.load(f)
    except FileNotFoundError:
        return {}

def save_hashes(hashes):
    with open(HASH_STORE_FILE, "w") as f:
        json.dump(hashes, f)

def has_data_changed(message_type, data, hashes):
    """Return True if data differs from last hash."""
    # Compute hash of relevant subset of data
    new_hash = hashlib.md5(json.dumps(data, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    if hashes.get(message_type) != new_hash:
        hashes[message_type] = new_hash
        return True
    return False

# -------------------- PUSHER NOTIFICATION --------------------
def notify_pusher(message_type, data):
    """Send trimmed payload to Pusher to avoid exceeding size limits."""
    # Keep payload small: only send relevant fields
    trimmed_data = data
    if message_type == "matches":
        # Only send match keys and scores/times relevant to your team
        trimmed_data = [
            {
                "key": m.get("key"),
                "predicted_time": m.get("predicted_time"),
                "alliances": m.get("alliances")
            } for m in data
        ]
    elif message_type == "eventStatus":
        trimmed_data = {
            k: data[k] for k in ["next_match_key", "last_match_key", "qual", "playoff"] if k in data
        }
    elif message_type == "events":
        # Only events for this team
        trimmed_data = [e for e in data if TEAM in e.get("team_keys", [TEAM])]
    
    body = json.dumps({
        "name": "update",
        "channels": ["my-channel"],
        "data": json.dumps({"messageType": message_type, "data": trimmed_data})
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

def write_file(filename, data):
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)

# -------------------- MAIN SEASON FUNCTION --------------------
def season():
    hashes = load_hashes()
    data_files_to_commit = []

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

        # Only update file and push if data changed
        if has_data_changed(msg_type, data, hashes):
            write_file(filename, data)
            notify_pusher(msg_type, data)
            data_files_to_commit.append(filename)

    # Always commit the hash file if any changes
    if data_files_to_commit:
        data_files_to_commit.append(HASH_STORE_FILE)
        diff = git_commit(data_files_to_commit, COMMIT_MESSAGE)
        if diff:
            notify_pusher("complete", {"files": data_files_to_commit.copy()})

    save_hashes(hashes)

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
