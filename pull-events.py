import json
import os
import requests
import datetime
from dateutil.rrule import rrulestr
from dateutil.parser import parse
from dateutil.tz import tzutc
from dotenv import load_dotenv

load_dotenv()

# Set the Google Calendar API endpoint URL
calendar_url = "https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events"

# Set the calendar ID for the public calendar you want to access
calendar_id = "team@peacce.org"

# Set your Google API key
api_key = os.environ['API_KEY']

# Get the current date and time
now = datetime.datetime.now().replace(tzinfo=tzutc())  # Current datetime with UTC timezone
max_date = now + datetime.timedelta(days=15)  # Maximum datetime within 15 days

# Set the API request parameters
params = {
    "calendarId": calendar_id,
    "key": api_key,
    "timeZone": "UTC",
    'timeMin': now.isoformat(),
    'timeMax': max_date.isoformat(),
}


def get_recurrence_occurrences(event, recurrence_rule):
    start_datetime = parse(event['start']['dateTime'])
    end_datetime = parse(event['end']['dateTime'])

    # Parse the recurrence rule
    rule = rrulestr(recurrence_rule, dtstart=start_datetime)

    # Generate occurrences based on the rule
    occurrences = []
    for occurrence in rule:
        occurrence_event = event.copy()
        occurrence_event['start']['dateTime'] = occurrence.isoformat()
        occurrence_event['end']['dateTime'] = (occurrence + (end_datetime - start_datetime)).isoformat()
        occurrences.append(occurrence_event)

    return occurrences


# Make the API request
response = requests.get(calendar_url.format(calendar_id=calendar_id), params=params)

# Parse the response JSON
events = response.json().get("items", [])

# Create a list to store individual event objects
individual_events = []

# Process each event
for event in events:
    # Check if the event has a recurrence rule
    if "recurrence" in event:
        # Extract the recurrence rule
        recurrence_rule = event["recurrence"][0]

        # Generate individual occurrences based on the recurrence rule
        occurrences = get_recurrence_occurrences(event, recurrence_rule)

        # Add the individual occurrences within the next 15 days to the list
        for occurrence in occurrences:
            start_datetime = occurrence.get('start', {}).get('dateTime')
            if start_datetime and parse(start_datetime) <= max_date:
                individual_events.append(occurrence)
    else:
        # Check if the event occurs within the next 15 days and has 'start' and 'end' keys
        start_datetime = event.get('start', {}).get('dateTime')
        if start_datetime and parse(start_datetime) <= max_date:
            individual_events.append(event)

# Save the individual events to a JSON file
with open("events.json", "w") as f:
    json.dump(individual_events, f, indent=4)
