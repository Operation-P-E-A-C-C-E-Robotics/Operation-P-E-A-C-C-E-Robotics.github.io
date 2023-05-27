# Project Documentation for Operation-P-E-A-C-C-E-Robotics.github.io

1. # Project Documentation

    Welcome to the project documentation for Operation-P-E-A-C-C-E-Robotics.github.io! This documentation serves as a guide to understand and navigate the website, which is built using the Jekyll framework, TinaCMS Content Manager, and hosted on GitHub Pages.

    ## Project Overview

    Operation-P-E-A-C-C-E-Robotics.github.io is a website developed by the Operation P.E.A.C.C.E. Robotics team. The website serves as a platform to showcase team activities, events, and match data for the robotics competitions. It incorporates various features, including API integrations with Google Calendar and The Blue Alliance, to provide up-to-date information and dynamic content.

    ## Purpose and Goals

    The purpose of this project is to create a user-friendly and informative website that allows team members to showcase their achievements and share relevant information with others. The website aims to provide a seamless experience for team members to manage and update content using the TinaCMS Content Manager.

    The goals of this project include:
    - Creating a visually appealing and responsive website using Bootstrap 4 styles and custom CSS.
    - Implementing API integrations with Google Calendar and The Blue Alliance to display events and match data.
    - Facilitating easy content management and updates using the TinaCMS Content Manager.
    - Ensuring the security and confidentiality of API credentials by storing them in GitHub Secrets.

    ## Technologies Used

    The following technologies are utilized in the development and maintenance of the site:

    - Jekyll: A static site generator that simplifies the creation of dynamic websites using templates and Markdown.
    - TinaCMS: A content management system that provides an intuitive interface for managing website content.
    - Bootstrap 4: A popular CSS framework used for creating responsive and visually appealing web designs.
    - GitHub Pages: A hosting service provided by GitHub to publish websites directly from a GitHub repository.

    Throughout this documentation, you will find detailed information on installation and setup, usage guide, API integration instructions, customization and theming options, and troubleshooting tips.

    We hope this documentation serves as a valuable resource for team members to effectively manage and update the website.

    Let's get started!


2. # Installation and Setup
    ## Prerequisites

    ### Operating System Recommendation

    Jekyll, the static site generator used in this project, is primarily designed to run on Linux. While there is a semi-supported and potentially buggy port available for Windows, it is generally recommended to use Linux for a more stable and seamless experience with Jekyll.

    If you are using Windows, it is advisable to set up a Linux environment using virtualization software, such as WSL (Windows Subsystem for Linux), or run Jekyll within a Linux-based virtual machine.

    Throughout this documentation, we assume that you are using a Linux-based operating system for running Jekyll. Instructions provided may differ slightly for Windows users, and it's important to keep in mind any potential compatibility issues or differences in behavior.

    Please note that the Jekyll development team primarily focuses on ensuring a smooth experience on Linux. While efforts have been made to support Jekyll on Windows, it may not offer the same level of stability and performance. Therefore, it is highly recommended to use Jekyll on a Linux environment for optimal results.

    ### Getting Started

    To get started with the project, you have two options to clone the GitHub repository: using the command line or the GitHub web interface. Choose the method that suits you best.

    #### Cloning via Command Line

    1. Open a terminal or command prompt on your computer.

    2. Navigate to the directory where you want to clone the repository. You can use the `cd` command followed by the directory path to change to the desired location.

    ```bash
        cd /path/to/desired/location
    ```

    3. Next, copy the repository URL. You can find the repository URL by clicking on the "Code" button on the GitHub repository page.

    4. In the terminal or command prompt, use the git clone command followed by the repository URL to clone the repository. Paste the URL after the git clone command and press Enter.
   
    ```bash
        git clone https://github.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io
    ```

    5.  The cloning process will begin, and you will see a progress indicator showing the download progress.
    6.  Once the cloning is complete, you will have a local copy of the repository on your machine.
   
   #### Cloning via GitHub Web Interface
   1. Open your web browser and go to the [GitHub repository](https://github.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io) page.
   2. Click on the "Code" button, and then click on the "Download ZIP" option.
   3. A ZIP file containing the repository's contents will be downloaded to your computer.
   4. Extract the ZIP file to the desired location on your machine.
   

3. Usage Guide
   - Local development
   - Editing content with TinaCMS
   - Deploying the website to GitHub Pages
   - Using Google Calendar API integration
   - Using The Blue Alliance API integration

4. # API Integrations

    This project utilizes GitHub Action runners on separate branches to handle API integrations. The data retrieved from these integrations is stored in JSON files, which are subsequently fetched by client-side JavaScript to populate the website with dynamic content.

    ### Google Calendar API Integration

    The Google Calendar API integration allows retrieving events from a specific calendar and displaying them on the website. Here's an overview of the process:

    1. The GitHub Action runner on the [designated branch](https://github.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/tree/google-api-backend) is triggered at specified intervals or events.
    2. The runner authenticates with the Google Calendar API using the provided credentials stored in GitHub Secrets.
    3. The runner fetches the events from the calendar using the API, and saves the data to a [JSON file](https://github.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/blob/google-api-backend/events.json) in the repository.
    4. Client-side JavaScript on the website fetches the JSON file and processes the data to display the events in the desired format.

    ### The Blue Alliance API Integration

    The Blue Alliance API integration retrieves match data from The Blue Alliance API and incorporates it into the website. The following outlines the process:

    5. The GitHub Action runner on the [designated branch](https://github.com/Operation-P-E-A-C-C-E-Robotics/Operation-P-E-A-C-C-E-Robotics.github.io/tree/gh-actions-tba-data-backend) runs at defined intervals or events.
    6. The runner authenticates with The Blue Alliance API using the provided credentials stored in GitHub Secrets.
    7. The runner retrieves the desired match data from the API and saves it as a JSON file in the repository.
    8. Client-side JavaScript on the website fetches the JSON file and processes the data to present match details and relevant information.

    ### API Key Security
    It's important to ensure that the API credentials are securely stored in GitHub Secrets and not exposed publicly. The GitHub Actions workflows and runners are responsible for executing the necessary tasks and updating the JSON files, allowing the website to dynamically fetch and display the most recent data. At no point should you paste an API key into any of the files you are working with in the repo, all authentication is handled upon deploy.  When developing, just let the site fetch the data from the files on the git repo, those will serve as working data for your tests.


5. Customization and Theming
   - Modifying the website's appearance using Bootstrap 4
   - Adding custom CSS
   - Working with Bootstrap components

6. Regenerating and Saving Credentials
   - GitHub Secrets overview
   - Regenerating API credentials
   - Saving and updating credentials in GitHub Secrets

7. Troubleshooting
   - Common issues and solutions
   - Debugging tips

8. Additional Resources
    Framework and CMS
   - [Jekyll Documentation](https://jekyllrb.com/docs/)
   - [TinaCMS Documentation](https://tinacms.org/docs/)
   
    HTML and CSS 
   - [Bootstrap 4 Documentation](https://www.w3schools.com/bootstrap4/)
   - [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web)
   - [W3Schools HTML Tutorial](https://www.w3schools.com/html/)
   - [W3Schools CSS Tutorial](https://www.w3schools.com/css/)
   - [CSS-Tricks](https://css-tricks.com/)
   - [CSS Reference by Codrops](https://tympanus.net/codrops/css_reference/)

    API Integrations
   - [The Blue Alliance API v3 Documentation](https://www.thebluealliance.com/apidocs/v3)
   - [Google Calendar API documentation](https://developers.google.com/calendar/overview)