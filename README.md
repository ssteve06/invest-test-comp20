## Comp20 Final Project: Stock Investment Simulator

Backend: Mongodb, NodeJS server
Frontend: HTML/CSS, JQuery
APIs: IEX (Investor's exchange), SendGrid
Deployed on Heroku

Testing: Mongodb Atlas, local servers/local testing

Note: Personal info (i.e. usernames, passwords, emails) are not encrypted, so we do not recommend using real personal info.

Pupose:
    - Simulates buying stocks and tracking their current value
    - Users sign in with username and password
    - Visual display of current stocks owned, value to date, and total money invested
    
Why this Project:
    - General interest in stocks/investing
    - Feasible project in given time
    - Many different directions we could take:
        - Display graphs
        - Determine value of portfolio in past years
        - Store stock metadata to perform analysis
  
Biggest Challenge:
    - Larger group size made group coordination more difficult
        - Finding times to meet
        - Dividing the work evenly
    - Combining individual components
    SOLUTION:
        Split into subgroups of backend and frontend, one person worked in both and helped merge groups together towards the           end.
        
Most interesting:
    - Combining of multiple APIs to add complexity
        - SendGrid to send emails
        - IEX to get stock data
        - Each require unique API key
        
Most satisfying:
    - Seeing database entries appear in mongodb for the first time
    - Deploying a working app

Contributions:
    Backend:
        Max -MongoDB, some NodeJS server side
        Sam - NodeJS server side, some MongoDB
        Jun - testing, integrated with frontend
    Frontend:
        Victor - HTML, CSS styling
        Sam - ejs files, connecting to server side
        Jun - testing, integrated with backend
    APIs:
        Justin, Sam - IEX
        Max - SendGrid
