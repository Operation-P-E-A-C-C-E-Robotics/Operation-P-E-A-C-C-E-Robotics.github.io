import os
import datetime


def main():
    # year = datetime.datetime.now().year
    year = 2024
    filename = f"_robots/{year}.md"
    toWrite =  f"""---
layout: robot
year: {year}
robotName: ROBOT NAME
game: GAME NAME
thumbnail: /assets/images/notFound.png
metatitle: "{year} Robot: ROBOT NAME"
metadesc: GAME NAME Performance and Statistics
published: false #remove this line once youve filled in the data
---"""

    if not os.path.exists(filename):
        with open(filename, "w") as f:
            f.write(toWrite)
            f.close
            print(f"Success, Created file /{f.name}")
    else:
        print(f"File Already Exists: /{filename}")

    if not os.path.exists(f"assets/{year}"):
        os.makedirs(f"assets/{year}")
        print(f"Success, Created Assets Folder /assets/{year}")
    else:
        print(f"Directory Already Exists: /assets/{year}")

main()