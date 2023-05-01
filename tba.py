from num2words import num2words
import aiohttp
import aiotba
import os

tba = os.getenv('TBA_API_KEY')

async def session():

    async with aiohttp.ClientSession() as http_session:     
     tbaSession = aiotba.TBASession(tba, http_session)
     
     #  Thread(target=loop.run_forever).start()
     print("Session Function has been executed")
    # loop = asyncio.get_event_loop()
    # loop.run_until_complete(session())
    return tbaSession


print(tba)