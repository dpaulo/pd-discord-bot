# Discord Bot made for the 2nd year of MMU Professional Development unit project.

## Getting Started

```bash
npm run startDev
# to start everything in development environment using nodemon, so the bot restarts everytime you save any changes
npm run start
# regular node startup
```

## Structure

`src` is the main directory that contains all the components including the `main.js` and `create-db.js` (used to create the SQLite database file if it doesn't exist).

The `src` directory includes `components` that contains the 4 different components of the Discord Bot.

You need to create `.env` file locally that includes `BOT_TOKEN={token}` and `STEAM_WEB_API_KEY={key}`, as it is in the `.gitignore` list due to security reasons.

`config.json` contains the databse name, prefix of the Discord Bot and all the commands that are used.

## Authors:

- Alen Boby
- Ismail Jeylani
- Donell Williams
- Dovydas Paulauskas
