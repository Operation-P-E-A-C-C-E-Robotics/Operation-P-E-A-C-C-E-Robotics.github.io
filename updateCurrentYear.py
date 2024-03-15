import asyncio
from num2words import num2words
import aiohttp
import aiotba
import os
import json
import requests
import datetime
import time
import subprocess
import pytz

tba_api_key = os.getenv('TBA_API_KEY')
# start_time = datetime.datetime.now().strftime("%H:%M:%S") - timedelta(minutes=5)
end_time = "21:00:00"
commit_message = "Committing files via Python script"

email = "actions@github.com"
name = "Github Actions [Bot]"

def set_git_config(email, name):
    """
    Set global Git configuration for email and name.

    Args:
        email: Git user email.
        name: Git user name.
    """
    try:
        subprocess.run(["git", "config", "--global", "user.email", email])
        subprocess.run(["git", "config", "--global", "user.name", name])
        print("Git configuration set successfully.")
    except Exception as e:
        print("Error setting Git configuration:", str(e))

def git_commit(files, message):
    """
    Commit files to Git with a commit message.
    
    Args:
        files: List of files to commit.
        message: Commit message.
    """
    try:
        subprocess.run(["git", "add"] + files)
        subprocess.run(["git", "commit", "-m", message])
        subprocess.run(["git", "push", "--force"])
        print("Files committed successfully.")
    except Exception as e:
        print("Error committing files:", str(e))


async def season(api):
    year = datetime.date.today().year
    events = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/events/{year}?X-TBA-Auth-Key={api}')
    # #print(tba_api_key)
    #print(events.text)
    with open(f"{year}_events.json", "w") as outfile:
        outfile.write(json.dumps(events.json(), indent=4))
        outfile.close()
        git_commit([f"{year}_events.json"], commit_message)
    
    event_status = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/events/{year}/statuses?X-TBA-Auth-Key={api}')
    # #print(tba_api_key)
    #print(event_status.text)
    with open(f"{year}_event_statuses.json", "w") as outfile:
        outfile.write(json.dumps(event_status.json(), indent=4))
        outfile.close()
       
        git_commit([f"{year}_event_statuses.json"], commit_message)
    
    awards = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/awards/{year}?X-TBA-Auth-Key={api}')
    # #print(tba_api_key)
    #print(awards.text)
    with open(f"{year}_awards.json", "w") as outfile:
        outfile.write(json.dumps(awards.json(), indent=4))
        outfile.close()
        git_commit([f"{year}_awards.json"], commit_message)
    
    matches = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/matches/{year}?X-TBA-Auth-Key={api}')
    # #print(tba_api_key)
    #print(matches.text)
    with open(f"{year}_matches.json", "w") as outfile:
        outfile.write(json.dumps(matches.json(), indent=4))
        outfile.close()
        git_commit([f"{year}_matches.json"], commit_message)
    

    media = requests.get(f'https://www.thebluealliance.com/api/v3/team/frc3461/media/{year}?X-TBA-Auth-Key={api}')
    # #print(tba_api_key)
    #print(media.text)
    with open(f"{year}_media.json", "w") as outfile:
        outfile.write(json.dumps(media.json(), indent=4))
        outfile.close()
        git_commit([f"{year}_media.json"], commit_message)

    districts = requests.get(f'https://www.thebluealliance.com/api/v3/district/{year}ne/rankings?X-TBA-Auth-Key={api}')
    #print(districts.text)
    with open(f"{year}_district_rankings.json", "w") as outfile:
        outfile.write(json.dumps(districts.json(), indent=4))
        outfile.close()
        git_commit([f"{year}_district_rankings.json"], commit_message)


async def run_script():
    set_git_config(email, name)
    while True:
        # Get the current datetime in Eastern Time
        eastern = pytz.timezone('US/Eastern')
        eastern_now = datetime.datetime.now(eastern)

        # Check if it's between 9am and 9pm in Eastern Time
        if eastern_now.strftime("%H:%M:%S") <= end_time:
            await season(tba_api_key)
            print("Data fetched and committed.")
        else:
            print("Outside of working hours. Exiting loop.")
            break

        # Wait for 30 seconds before next iteration
        await asyncio.sleep(30)

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(run_script())