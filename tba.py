import asyncio
from num2words import num2words
import aiohttp
import aiotba
import os

tba_api_key = os.getenv('TBA_API_KEY')

team = 3461
event = "2023ctwat"


async def matches(event:str, team:int):
    async with aiohttp.ClientSession() as http_session:     
        tbaSession = aiotba.TBASession(tba_api_key, http_session)
        # msg = await ctx.send("Processing...")
        eventdata = await tbaSession.event(event_key=event)
        stats = await tbaSession.team_event_matches(team=team, event=event)
        # embed = discord.Embed(title=f"{eventdata.name} {eventdata.year}", description=f"Week {eventdata.week} {eventdata.event_type_string} Event")
        # embed.set_thumbnail(url='https://frcavatars.herokuapp.com/get_image?team={}'.format(team))
        for m in stats: 
            matchdata = await tbaSession.match(m)
            matchtitle=""
            if (matchdata.comp_level == "qm"):
                matchtitle = "Qualification"
            elif (matchdata.comp_level == "qf"):
                matchtitle = f"**Quarterfinal** {matchdata.set_number} Match"
            elif (matchdata.comp_level == "sf"):
                matchtitle = f"**Semifinal** {matchdata.set_number} Match"
            elif (matchdata.comp_level == "f"):
                matchtitle = f"**Final** {matchdata.set_number} Match"
            else:
                matchtitle = "Unknown"

            matchlvl = str('**Red:** {} \n **Blue:** {} \n **Winner:** {}').format('-'.join(matchdata.alliances.get("red").team_keys).replace('frc', ''), '-'.join(matchdata.alliances.get("blue").team_keys).replace('frc', ''), matchdata.winning_alliance.capitalize())
            ##(m)
            #level.append(matchlvl)
            print(f"{matchtitle} {m.match_number}" f"{matchlvl.replace(f'{team}', f'**{team}**')}")
        # await ctx.send(embed=embed)
        # await msg.delete()

async def season(teamnum:int, year:int = None):
    async with aiohttp.ClientSession() as http_session:     
        tbaSession = aiotba.TBASession(tba_api_key, http_session)
        # team = await tbaSession.team(f'frc{teamnum}')
        if year is None:
            year = (await tbaSession.status()).current_season
        # msg = await ctx.send("Processing...")
        events = await tbaSession.team_events(team= f'frc{teamnum}', year=f"{year}")
        # embed = discord.Embed(title=f"{team.nickname} {team.team_number} {year} Season", description=f"Event List:")
        # embed.set_thumbnail(url='https://frcavatars.herokuapp.com/get_image?team={}'.format(teamnum))
        
        if len(events) != 0:
        
            for event in events:
                matches = await tbaSession.team_event_matches(f'frc{teamnum}', event=event.key, keys_only=True)
                level = []
                fancy = [level.sort()]
                data = await tbaSession.event_teams_statuses(event.key)
                teamdata = data.get(f"frc{teamnum}")
                try:
                    level.append(f'{teamdata.overall_status_str.replace("<b>", "**").replace("</b>", "**")} \n ')
                except:
                 pass
                
                if len(matches) != 0:
                    for m in matches: 
                        matchdata = await tbaSession.match(m)
                        matchtitle=""
                        if (matchdata.comp_level == "qm"):
                            matchtitle = "Qualification"
                        elif (matchdata.comp_level == "qf"):
                            matchtitle = f"**Quarterfinal** {matchdata.set_number} Match"
                        elif (matchdata.comp_level == "sf"):
                            matchtitle = f"**Semifinal** {matchdata.set_number} Match"
                        elif (matchdata.comp_level == "f"):
                            matchtitle = f"**Final** {matchdata.set_number} Match"
                        else:
                            matchtitle = "Unknown"

                        matchlvl = str(f'{matchtitle} {matchdata.match_number}')
                        #(m)
                        level.append(matchlvl)
                    
                    #return(f"{matchdata.comp_level}{matchdata.set_number}")
                else:
                 level.append("No Matches")
                
                print(f"{event.name} ({event.key})"'\n'.join(level))
        else:
            print("No events found for this team, Check back later")
        
        # await msg.delete()
        # await ctx.send(embed=embed) 


loop = asyncio.get_event_loop()
coroutine = season(team)
loop.run_until_complete(coroutine)