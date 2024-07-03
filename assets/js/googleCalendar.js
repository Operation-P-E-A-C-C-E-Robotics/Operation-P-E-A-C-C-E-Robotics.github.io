const staticURL = "https://raw.githubusercontent.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/google-api-backend/events.json"

async function getEventsJson() {
    const response = await fetch(staticURL);
    const eventsJson = await response.json();
    // console.log('before')
    // console.log(eventsJson)
    // console.log('-----------------------------')
    const filteredData = eventsJson.filter(obj => obj.status === "confirmed");
    // console.log('after')
    // console.log(filteredData)
    return filteredData;
}

async function getNextNonRecurringEvent() {
    events = await getEventsJson()
    // console.log(events)
    let now = new Date();
    let nextEvent = null;
    let eventStartDate = null;
    let eventEndDate = null;
  
    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      // console.log(event)
      // console.log(event.start)
      // console.log(event.start.dateTime)
      try {
          eventStartDate = new Date(event.start.dateTime)
      } catch {
          eventStartDate = new Date(event.start.date)
      }

      try {
          eventEndDate = new Date(event.end.dateTime)
      } catch {
          eventEndDate = new Date(event.end.date)
      }
        
        if (now >= eventStartDate && now <= eventEndDate) {
        if (!event.recurrence || !event.recurringEventId) {
          if (!nextEvent || event.start.dateTime <= nextEvent.start.dateTime) {
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

  

  for (const event of events) {
    let eventStartDate = null;
    let eventEndDate = null;
    // console.log(event)

    try {
      if (eventStartDate == null){
        eventStartDate = new Date(event.start.dateTime)
      }
    } catch {
      console.warn("Unable to set eventStartDate to event.start.dateTime")
    }
    try {
      if (eventStartDate == null) {
        eventStartDate = new Date(event.start.date)
      }
    }
    catch {
      console.warn("Unable to set eventStartDate to event.start.date")
    }
    // console.log(eventStartDate, event)
    try {
      if (eventEndDate == null) {
        eventEndDate = new Date(event.end.dateTime)
      }
    } catch {
      console.warn("Unable to set eventEndDate to event.end.dateTime")
    }

    try {
      if (eventEndDate == null) {
        eventEndDate = new Date(event.end.date)
      }
    } catch {
      console.warn("Unable to set eventEndDate to event.end.date")
    }

    console.log(currentDate, eventStartDate, eventEndDate, event)
    if (currentDate <= eventStartDate || currentDate <= eventEndDate) {
      nextEvent = event;
      // console.log(nextEvent);
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

    if (startDate >= currentDate && (!nextDate || startDate <= nextDate)) {
      nextDate = startDate;
      nextEvent = event
    }
  }

  return Promise.resolve(nextEvent);
}
  
async function getEventDate(event) {
  var options
  var date
  try {
    const [year, month, day] = event.start.date.split('-');
    options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
    date = new Date(year, month - 1, day);
  } catch {
    options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
    date= new Date(event.start.dateTime);
  }
  // console.log(date)
  return Promise.resolve(date.toLocaleString('en-US', options))
}


async function updateHomePageEventBox(data) {
  // console.log(data)
  // console.log(data.start)
  options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
  date = await getEventDate(data)
  // console.log(data)
  document.getElementById('nextEvent').innerText = ' ' + data.summary
  document.getElementById('startTime').innerHTML += ' ' + date.toLocaleString('en-US', options)
  if (data.location === undefined) {
  document.getElementById('location').innerHTML += ' No Location Provided'
  } else {
    document.getElementById('location').innerHTML += ' ' + data.location
  }
  document.getElementById('goToCalendar').href = data.htmlLink
  document.getElementById('calendarBoxButtons').style.display = "block"
}
