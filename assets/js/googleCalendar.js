const staticURL = "https://raw.githubusercontent.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/google-api-backend/events.json"

async function getEventsJson() {
    const response = await fetch(staticURL);
    const eventsJson = await response.json();
    console.log('before')
    console.log(eventsJson)
    console.log('-----------------------------')
    const filteredData = eventsJson.filter(obj => obj.status === "confirmed");
    console.log('after')
    console.log(filteredData)
    return filteredData;
}

async function getNextNonRecurringEvent() {
    events = await getEventsJson()
    // console.log(events)
    let now = new Date();
    let nextEvent = null;
  
    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      // console.log(event)
      console.log(event.start)
      // console.log(event.start.dateTime)
      if (event.start.dateTime > now.toISOString() || event.start.date > now.toISOString()) {
        if (!event.recurrence || !event.recurringEventId) {
          if (!nextEvent || event.start.dateTime < nextEvent.start.dateTime) {
            nextEvent = event;
          }
        }
      }
    }

    return Promise.resolve(nextEvent);
}
  


async function getNextEvent() {
  const events = await getEventsJson();
  const currentDate = new Date();
  let nextEvent = null;
  let nextEventDate = null;

  for (const event of events) {
    let eventDate = null;

    if (event.start.date) {
      eventDate = new Date(event.start.date);
    } else if (event.start.dateTime) {
      eventDate = new Date(event.start.dateTime);
    }

    if (eventDate && eventDate > currentDate && (!nextEventDate || eventDate < nextEventDate)) {
      nextEvent = event;
      nextEventDate = eventDate;
    }
  }

  return Promise.resolve(nextEvent);
}


async function getNextChronologicalDate() {
  events = await getEventsJson();
  const currentDate = new Date(); // Get the current date
  let nextDate = null;
  let nextEvent = null

  for (const event of events) {
    const startDate = new Date(event.start.date);

    if (startDate > currentDate && (!nextDate || startDate < nextDate)) {
      nextDate = startDate;
      nextEvent = event
    }
  }

  return Promise.resolve(nextEvent);
}
  


async function updateHomePageEventBox(data) {
  console.log(data)
  console.log(data.start)
  options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
  if (data.start.dateTime != undefined) {
  date = new Date(data.start.dateTime)
  } else if (data.start.date) {
    date = new Date(data.start.date)
  }
  console.log(data)
  document.getElementById('nextEvent').innerText = ' ' + data.summary
  document.getElementById('startTime').innerHTML += ' ' + date.toLocaleString('en-US', options)
  document.getElementById('location').innerHTML += ' ' + data.location
  document.getElementById('goToCalendar').href = data.htmlLink
}