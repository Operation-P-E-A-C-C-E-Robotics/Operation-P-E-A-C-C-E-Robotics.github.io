import os
import json
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Load API key from Repository Secrets
api_key = os.environ['API_KEY']

# Set up Google Calendar API credentials
creds = service_account.Credentials.from_service_account_info({
    'type': os.environ['TYPE'],
    'project_id': os.environ['PROJECT_ID'],
    'private_key_id': os.environ['PRIVATE_KEY_ID'],
    'private_key': os.environ['PRIVATE_KEY'].replace('\\n', '\n'),
    'client_email': os.environ['CLIENT_EMAIL'],
    'client_id': os.environ['CLIENT_ID'],
    'auth_uri': os.environ['AUTH_URI'],
    'token_uri': os.environ['TOKEN_URI'],
    'auth_provider_x509_cert_url': os.environ['AUTH_PROVIDER_X509_CERT_URL'],
    'client_x509_cert_url': os.environ['CLIENT_X509_CERT_URL']
})

# Set up Google Calendar API client
calendar = build('calendar', 'v3', credentials=creds)

# Set up API request to get events from public calendar
calendar_id = 'team@peacce.org'
url = f'https://www.googleapis.com/calendar/v3/calendars/{calendar_id}/events?key={api_key}'

# Make API request to get events from public calendar
response = requests.get(url)
data = json.loads(response.content.decode('utf-8'))

# Output event data
print(data)
