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

team = 3461
event = "2023ctwat"



async def season():
    year = datetime.date.today().year
    events = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/events/{year}?X-TBA-Auth-Key={tba_api_key}')
    print(tba_api_key)
    print(events.text)



loop = asyncio.get_event_loop()
coroutine = season()
loop.run_until_complete(coroutine)