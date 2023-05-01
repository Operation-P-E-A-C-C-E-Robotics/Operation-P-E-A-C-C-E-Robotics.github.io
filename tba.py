from num2words import num2words
import aiohttp
import aiotba
import os

tba_api_key = os.getenv('TBA_API_KEY')


async def session():

    async with aiohttp.ClientSession() as http_session:     
     tbaSession = aiotba.TBASession(tba_api_key, http_session)
     
     #  Thread(target=loop.run_forever).start()
     print("Session Function has been executed")
    # loop = asyncio.get_event_loop()
    # loop.run_until_complete(session())
    return tbaSession


async def getAllMatches(tba_api_key):
    tba = await session()
    print(tba.event_teams_statuses("2023ctwat"))


getAllMatches(tba_api_key)