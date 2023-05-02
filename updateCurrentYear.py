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


def yearsParticipated(api):
    years_participated = requests.get(f'https://www.thebluealliance.com/api/v3/status?X-TBA-Auth-Key={api}')
    return years_participated.text

async def season(api):
    years = yearsParticipated(api)
    data = json.loads(years)
    print(data)
    print(years)
    year = 2023
    events = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/events/{year}?X-TBA-Auth-Key={api}')
    # print(tba_api_key)
    print(events.text)
    with open(f"{year}_events.json", "w") as outfile:
        outfile.write(json.dumps(events.json(), indent=4))
        outfile.close()
    
    event_status = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/events/{year}/statuses?X-TBA-Auth-Key={api}')
    # print(tba_api_key)
    print(event_status.text)
    with open(f"{year}_event_statuses.json", "w") as outfile:
        outfile.write(json.dumps(event_status.json(), indent=4))
        outfile.close()
    
    awards = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/awards/{year}?X-TBA-Auth-Key={api}')
    # print(tba_api_key)
    print(awards.text)
    with open(f"{year}_awards.json", "w") as outfile:
        outfile.write(json.dumps(awards.json(), indent=4))
        outfile.close()
    
    matches = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/matches/{year}?X-TBA-Auth-Key={api}')
    # print(tba_api_key)
    print(matches.text)
    with open(f"{year}_matches.json", "w") as outfile:
        outfile.write(json.dumps(matches.json(), indent=4))
        outfile.close()
    

    media = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/media/{year}?X-TBA-Auth-Key={api}')
    # print(tba_api_key)
    print(media.text)
    with open(f"{year}_media.json", "w") as outfile:
        outfile.write(json.dumps(media.json(), indent=4))
        outfile.close()

    districts = requests.get(f'https://www.thebluealliance.com/api/v3/district/{year}ne/rankings?X-TBA-Auth-Key={api}')
    print(districts.text)
    with open(f"{year}_district_rankings.json", "w") as outfile:
        outfile.write(json.dumps(districts.json(), indent=4))
        outfile.close()




loop = asyncio.get_event_loop()
coroutine = season(tba_api_key)
loop.run_until_complete(coroutine)