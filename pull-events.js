const { google } = require('googleapis');
const fs = require('fs');

const calendarId = 'your_calendar_id@group.calendar.google.com';
const timeMin = new Date().toISOString();
const apiKey = process.env.GOOGLE_CALENDAR_API_KEY;

const calendar = google.calendar({ version: 'v3', auth: apiKey });

calendar.events.list({
  calendarId,
  timeMin,
  maxResults: 2500,
  singleEvents: true,
  orderBy: 'startTime',
}, (err, res) => {
  if (err) {
    console.error('Error retrieving calendar events:', err);
    return;
  }

  const events = res.data.items.map(event => ({
    id: event.id,
    summary: event.summary,
    description: event.description,
    location: event.location,
    start: event.start.dateTime || event.start.date,
    end: event.end.dateTime || event.end.date,
  }));

  const json = JSON.stringify(events, null, 2);
  fs.writeFileSync('events.json', json);

  console.log(`Retrieved ${events.length} events`);
});
