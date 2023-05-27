[![Update data from The Blue Alliance once a week](https://github.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/actions/workflows/updateAllYears.yml/badge.svg)](https://github.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/actions/workflows/updateAllYears.yml)

[![Update data from The Blue Alliance for current season every 5 minutes during competition hours](https://github.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/actions/workflows/updateCurrentYear.yml/badge.svg)](https://github.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/actions/workflows/updateCurrentYear.yml)


# Data Collection from The Blue Alliance API

This branch in the GitHub repository is dedicated to collecting data from The Blue Alliance API and storing it in JSON files. The data is organized by year and type, with files like `2022_events.json`, `2022_matches.json`, `2022_district_rankings.json`, and so on. Additionally, the data collection process is automated using GitHub Actions, which runs at a specific schedule.

## Branch Structure
```
├── .github/
│   └── workflows/
│       ├── updateAllYears.yml
│       └── updateCurrentYear.yml
├── updateAllYears.py
├── updateCurrentYear.py 
├── .gitignore
├── README.md
└── *.json
```

- `.github/workflows/updateAllYears.yml`: GitHub Actions workflow file that automates the data collection process at a scheduled time.
- `src/data_collection.py`: Python script that interacts with The Blue Alliance API, fetches data, and stores it in the appropriate JSON files.
- `.gitignore`: Specifies files and directories to be ignored by Git.
- `README.md`: The readme file you are currently reading.

## Workflow Configuration

The data collection process is triggered and scheduled using GitHub Actions. The configuration for the workflow can be found in the `.github/workflows/updateAllYears.yml` file. The cron schedule specified in the workflow is as follows:

```yaml
on:
  schedule:
    - cron: '35 4 * * 0'

```

This cron expression means that the workflow will run every Sunday at 4:35 AM (UTC) which is 00:45 AM EDT. This schedule can be modified according to requirements.

a similar config exists in `.github/workflows/updateCurrentYear.yml` this script is run at different times and will only update the data for the **Current Year**

```yaml
on:  
  schedule:
    - cron: '*/5 * * 3-4 *'

```

This cron expression means that the workflow will run At every 5th minute (UTC) in every month from March through April. This schedule can be modified according to requirements or removed if a feasable way to connect a webhook from the Blue Alliance API can be found.

### Creating new cron triggers
to create a new cron trigger, use [this generator](https://crontab.guru/) to generate the proper syntax then copy paste it into the workflow file

## Data Collection Script
The data collection scripts `updateAllYears.py` and `updateCurrentYear.py` are responsible for fetching data from The Blue Alliance API and storing it in JSON files. The script is located in the src/ directory of the repository.

To use the script locally:

1. Install the necessary dependencies by running `pip install -r requirements.txt.`
2. Create a `.env` and add `TBA_API_KEY=yourAPIKeyHere`, do **NOT** commit the `.env` file or your API Key will be publicly accessable, if this happens, delete your API Key immediatly, there is an API Key stored in the Git repo secrets and handled by the github action runner for production
3. Run the script using `python updateAllYears.py` or `python updateCurrentYear.py`
4. The script fetches the data and stores it in JSON files within the repository. The JSON files are organized based on the year and type of data collected.


## Issues
Please write an Issue or Pull Request if there is a problem, avoid directly comiting changes without first reviewing with the rest of the Website maintainers (if you are the only person maintaing the site then you of course dont have to do this)

### Last Updated May 20 2023