# HTML-Chat
HTML5 implementation of Eterna's web-based IRC chat client to replace the legacy Flash-based implementation

Please note that a rewritten version using Vue.js is planned to improve the readability and extensibility of the codebase. More info will be forthcoming.

As a reference, the chat server currently uses [txircd](https://github.com/ElementalAlchemist/txircd) as the IRCd daemon and a custom python-based IRC bot to record recent history.

## Setup
This code makes use of the [webpack](https://webpack.js.org/) module bundler. In order to run the app, do the following:
* Install [NodeJS and npm](https://nodejs.org/en/download/)
* Open a command prompt/terminal, cd into HTML-Chat, and run `npm install`
* To start a development server, run `npm start`
* Open a browser and navigate to localhost:9000, then enter your username and password (or leave blank to use without logging in), then optionally a channel if you don't want to post in the main chat (ie if your testing could eb considered disruptive or cause other clients to break)

To create a one-off set of files with webpack, run `npm run build:dev` for the development build or `npm run build:prod` for the production configuration

## Contributing
Feel free to fork this repository, make some changes, and create a pull request. Your changes will then be revewed, merged, and deployed once accepted. It is encouraged to use a channel other than #global (the default) for testing purposes if it could be disruptive.

Currently compatibility must be maintained between this chat and the legacy Flash chat, until it can be implemented into the game. At that point, more significant changes may be implemented to improve implementations based on IRCv3 functionality and and other functions that would otherwise "break" the Flash chat.

-----------------------------------------

Design and implementation of initial release: [@LFP6](https://github.com/LFP6) ([Eterna](http://www.eternagame.org/web/player/48290/))
