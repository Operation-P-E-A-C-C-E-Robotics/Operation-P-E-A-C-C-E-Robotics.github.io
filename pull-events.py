import json
import os
import requests

# Set the Google Calendar API endpoint URL
calendar_url = "https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"

# Set the calendar ID for the public calendar you want to access
calendar_id = "team@peacce.org"

# Set your Google API key
api_key = os.environ['API_KEY']

# Set the API request parameters
params = {
    "calendarId": calendar_id,
    "key": api_key,
    "timeZone": "UTC",
}

# Make the API request
response = requests.get(calendar_url.format(calendar_id=calendar_id), params=params)

# Parse the response JSON
events = response.json()["items"]

# Save the events to a JSON file
with open("events.json", "w") as f:
    json.dump(events, f)
