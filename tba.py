import asyncio
from num2words import num2words
import aiohttp
import aiotba
import os
import json
import requests
import datetime

# from dotenv.main import load_dotenv

# load_dotenv('/home/miguel/my_project/.env')
tba_api_key = os.getenv('TBA_API_KEY')
# print(tba_api_key)

team = 3461
event = "2023ctwat"

def yearsParticipated(api):
    years_participated = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/years_participated?X-TBA-Auth-Key={api}')
    return years_participated.json()

async def season(api):
    years = yearsParticipated(api)
    print(years)
    for year in years:
        events = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/events/{year}?X-TBA-Auth-Key={api}')
        # print(tba_api_key)
        print(events.text)
        with open(f"{year}_events.json", "w") as outfile:
            json.dump(events.json(), outfile)
            outfile.close()
        
        awards = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/awards/{year}?X-TBA-Auth-Key={api}')
        # print(tba_api_key)
        print(awards.text)
        with open(f"{year}_awards.json", "w") as outfile:
            json.dump(awards.json(), outfile)
            outfile.close()
        
        matches = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/matches/{year}?X-TBA-Auth-Key={api}')
        # print(tba_api_key)
        print(matches.text)
        with open(f"{year}_matches.json", "w") as outfile:
            json.dump(matches.json(), outfile)
            outfile.close()



loop = asyncio.get_event_loop()
coroutine = season(tba_api_key)
loop.run_until_complete(coroutine)