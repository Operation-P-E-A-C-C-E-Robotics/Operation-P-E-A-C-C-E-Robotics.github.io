const staticURL = "https://raw.githubusercontent.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/google-api-backend/events.json"

async function getEventsJson() {
    const response = await fetch(staticURL);
    const eventsJson = await response.json();
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
  