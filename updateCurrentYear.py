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

# Intervals
FAST_INTERVAL = 10          # seconds (matches/status)
SLOW_INTERVAL = 300         # seconds (district, awards, event info)
END_TIME = "21:00:00"       # Eastern Time cutoff

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

# -------------------- PUSHER --------------------
def notify_pusher(message_type, data):
    # Limit data size to avoid failures
    max_len = 2000
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
            k: data[k] for k in ["next_match_key", "last_match_key", "qual", "playoff", "overall_status_str"] if k in data
        }
    elif message_type == "events":
        trimmed_data = [
            {
                "key": e.get("key"),
                "name": e.get("name"),
                "start_date": e.get("start_date"),
                "end_date": e.get("end_date"),
                "timezone": e.get("timezone"),
                "webcasts": e.get("webcasts")
            } for e in data
        ]
    elif message_type == "district":
        trimmed_data = next((r for r in data if r["team_key"] == TEAM), None)

    body = json.dumps({
        "name": "update",
        "channels": ["my-channel"],
        "data": json.dumps({"messageType": message_type, "data": trimmed_data})[:max_len]
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

# -------------------- TBA FETCH --------------------
def fetch_json(endpoint):
    url = f"https://www.thebluealliance.com/api/v3/{endpoint}?X-TBA-Auth-Key={TBA_API_KEY}"
    resp = requests.get(url)
    return resp.json()

# -------------------- FILE MERGE --------------------
def merge_array_file(filename, new_data):
    try:
        if os.path.exists(filename):
            with open(filename, "r") as f:
                existing = json.load(f)
        else:
            existing = []
        # Merge: add new or update existing by 'key'
        existing_map = {item['key']: item for item in existing}
        changed = False
        for item in new_data:
            key = item['key']
            if key not in existing_map or existing_map[key] != item:
                existing_map[key] = item
                changed = True
        merged = list(existing_map.values())
        if changed:
            with open(filename, "w") as f:
                json.dump(merged, f, indent=4)
        return changed
    except Exception as e:
        print(f"Failed to merge {filename}: {e}")
        return False

def merge_object_file(filename, new_data):
    try:
        if os.path.exists(filename):
            with open(filename, "r") as f:
                existing = json.load(f)
        else:
            existing = {}

        changed = False
        for key, value in new_data.items():
            if key not in existing or existing[key] != value:
                existing[key] = value
                changed = True
        
        if changed:
            with open(filename, "w") as f:
                json.dump(existing, f, indent=4)
        return changed            
    except Exception as e:
        print(f"Failed to merge {filename}: {e}")
        return False
    
def overwrite_file(filename, new_data):
    try:
        with open(filename, "w") as f:
            json.dump(new_data, f, indent=4)
        return True
    except Exception as e:
        print(f"Failed to write {filename}: {e}")
        return False

# -------------------- CURRENT EVENT --------------------
def get_current_event():
    events = fetch_json(f"team/{TEAM}/events/{YEAR}")
    today = datetime.date.today()

    current_event = None
    next_event = None

    # Sort events by start date
    events.sort(key=lambda e: e["start_date"])

    for e in events:
        start = datetime.datetime.strptime(e["start_date"], "%Y-%m-%d").date()
        end = datetime.datetime.strptime(e["end_date"], "%Y-%m-%d").date()

        if start <= today <= end:
            current_event = e
            break
        elif start > today and not next_event:
            next_event = e
    
    selected = current_event if current_event else next_event
    if selected:
        print(f"Using event: {selected['key']} ({selected['name']})")
    
    return selected

def get_match_deltas(matches):
    global MATCH_CACHE

    now = int(time.time())
    deltas = []

    for m in matches:
        key = m.get("key")
        predicted = m.get("predicted_time")

        if not key or not predicted:
            continue

        # Only future matches
        if predicted < now:
            continue

        prev = MATCH_CACHE.get(key)

        # New match OR changed predicted time
        if prev != predicted:
            MATCH_CACHE[key] = predicted

            deltas.append({
                "key": key,
                "predicted_time": predicted,
                "alliances": m.get("alliances")
            })

    return deltas

# -------------------- UPDATE FUNCTIONS --------------------
def update_current_event_matches_and_status():
    event = get_current_event()
    if not event:
        return

    today = datetime.date.today()
    start = datetime.datetime.strptime(event["start_date"], "%Y-%m-%d").date()
    end = datetime.datetime.strptime(event["end_date"], "%Y-%m-%d").date()

    if not (start <= today <= end):
        print(f"Event {event['key']} {event['name']} is in the future, skipping fast polling... ({event['start_date']})")
        return
    files_changed = []

    # Matches
    matches = fetch_json(f"team/{TEAM}/event/{event['key']}/matches")
    if merge_array_file(f"{YEAR}_matches.json", matches):
        files_changed.append(f"{YEAR}_matches.json")
    
    deltas = get_match_deltas(matches)
    
    if deltas:
        notify_pusher("matches", deltas)

    # Event Status
    status = fetch_json(f"team/{TEAM}/events/{YEAR}/statuses")
    if event["key"] in status and merge_object_file(f"{YEAR}_event_statuses.json", {event["key"]: status[event["key"]]}):
        files_changed.append(f"{YEAR}_event_statuses.json")
        notify_pusher("eventStatus", status[event["key"]])

    if files_changed:
        git_commit(files_changed, COMMIT_MESSAGE)

def update_current_event_awards_and_info():
    event = get_current_event()
    if not event:
        print("No current or upcoming event for team (awards/info).")
        return
    files_changed = []

    # Awards
    awards = fetch_json(f"team/{TEAM}/awards/{YEAR}")
    awards = [a for a in awards if a["event_key"] == event["key"]]
    if merge_array_file(f"{YEAR}_awards.json", awards):
        files_changed.append(f"{YEAR}_awards.json")

    # Event info
    event_info_file = f"{YEAR}_events.json"
    if merge_array_file(event_info_file, [event]):
        files_changed.append(event_info_file)

    if files_changed:
        git_commit(files_changed, COMMIT_MESSAGE)

def update_district_rankings():
    rankings = fetch_json(f"district/{YEAR}ne/rankings")
    if overwrite_file(f"{YEAR}_district_rankings.json", rankings):
        notify_pusher("district", rankings)
        git_commit([f"{YEAR}_district_rankings.json"], COMMIT_MESSAGE)

# -------------------- MAIN LOOP --------------------
def run():
    set_git_config(EMAIL, NAME)
    eastern = pytz.timezone("US/Eastern")
    last_fast = 0
    last_slow = 0

    while True:
        now_dt = datetime.datetime.now(eastern)
        now_str = now_dt.strftime("%H:%M:%S")
        now_ts = int(time.time())

        if now_str > END_TIME:
            notify_pusher("backend", {"message": "TBA Polling Runner is terminating..."})
            print(f"[{now_str}] Outside working hours. Exiting.")
            break

        if now_ts - last_fast >= FAST_INTERVAL:
            update_current_event_matches_and_status()
            last_fast = now_ts

        if now_ts - last_slow >= SLOW_INTERVAL:
            update_current_event_awards_and_info()
            update_district_rankings()
            last_slow = now_ts

        time.sleep(1)  # 1s tick for interval check

if __name__ == "__main__":
    run()
