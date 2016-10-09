# Spotify Visualizer
### Made with Meteor, flow-router for routing, blaze-layout for templates

Interfaces with Spotify's publicly available web API to retrieve lists of playlists, user data, and song data to look at. With a cool bubble chart too!

## Installation
1. Clone the repo into an empty folder.
2. Install Meteor (I created the project on Windows, but the code should run on any OS that Meteor officially supports)
3. cd into the directory, type `meteor`, and let the application build itself for first run.
4. Go to your packages directory (on macOS / Linux, `~/.meteor/packages`, on Windows `C:\Users\<you>\AppData\.meteor\packages`)
5. In the `xinranxiao_spotify-web-api` package (may be `xinranxiao:spotify-web-api` on Linux), replace `npm/node_modules/spotify-web-api/spotify-web-api.js` with the version in the application's root directory to enable playlist track retrieval.
6. Go get a Spotify Developer API Key [here](https://developer.spotify.com/web-api/) and enter the id and secret key into imports/api/startup/server/index.js.
7. Rerun the app, navigate to `localhost:3000`, and go!
