import json
import os
import requests
from datetime import datetime


# Set the Google Calendar API endpoint URL
calendar_url = "https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"

# Set the calendar ID for the public calendar you want to access
calendar_id = "team@peacce.org"

# Set your Google API key
api_key = os.environ['API_KEY']

# Get the current date and time
now = datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
max = (datetime.utcnow() + datetime.timedelta(days=365)).isoformat() + 'Z' # one year from now
# Set the API request parameters
params = {
    "calendarId": calendar_id,
    "key": api_key,
    "timeZone": "UTC",
    'timeMin': now,
    'timeMax': max,
}

# Make the API request
response = requests.get(calendar_url.format(calendar_id=calendar_id), params=params)

# Parse the response JSON
events = response.json()["items"]

# Save the events to a JSON file
with open("events.json", "w") as f:
    # json.dump(events, f)
    f.write(json.dumps(events, indent=4))