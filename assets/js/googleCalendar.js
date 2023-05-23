const staticURL = "https://raw.githubusercontent.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/google-api-backend/events.json"

async function getEventsJson() {
    const response = await fetch(staticURL);
    const eventsJson = await response.json();
    console.log(eventsJson)
    return eventsJson;
}

async function getNextNonRecurringEvent() {
    events = await getEventsJson()
    let now = new Date();
    let nextEvent = null;
  
    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      if (event.start.dateTime > now.toISOString()) {
        if (!event.recurrence || !event.recurringEventId) {
          if (!nextEvent || event.start.dateTime < nextEvent.start.dateTime) {
            nextEvent = event;
          }
        }
      }
    }
    console.log(nextEvent)
    return Promise.resolve(nextEvent);
}
  


async function getNextEvent() {
    events = getEventsJson();
  
    // Get the current date/time
    const currentDate = new Date();
  
    // Initialize variables for storing the next event information
    let nextEvent = null;
    let nextEventDate = null;
  
    // Iterate over the events and find the next upcoming event
    for (const event of events) {
      const eventDate = new Date(event.start.dateTime);
  
      // Check if the event date is in the future and update the next event information if applicable
      if (eventDate > currentDate && (!nextEventDate || eventDate < nextEventDate)) {
        nextEvent = event;
        nextEventDate = eventDate;
      }
    }
  
    return nextEvent;
  }

function updateHomePageEventBox(data) {
  date = new Date(data.start.dateTime)
  console.log(date)
  document.getElementById('nextEvent').innerText = ' ' + data.summary
  document.getElementById('startTime').innerHTML += ' ' + date.toLocaleString('en-US', options)
  document.getElementById('location').innerHTML += ' ' + data.location
  document.getElementById('goToCalendar').href = data.htmlLink
}