from num2words import num2words
import aiohttp
import aiotba
import os

tba_api_key = os.getenv('TBA_API_KEY')

team = 3461
event = "2023ctwat"


async def matches(ctx, event:str, team:int):
    async with aiohttp.ClientSession() as http_session:     
        tbaSession = aiotba.TBASession(tba, http_session)
        msg = await ctx.send("Processing...")
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
            # embed.add_field(name=f"{matchtitle} {m.match_number}", value=f"{matchlvl.replace(f'{team}', f'**{team}**')}", inline=True)
        # await ctx.send(embed=embed)
        # await msg.delete()
        print(stats)


matches(event, team)