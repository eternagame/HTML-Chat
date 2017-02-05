# HTML-Chat
HTML5 implementation of Eterna's web-based IRC chat client to replace the legacy Flash-based implementation

Please note that a rewritten version sing backbone.js is under way to improve the readability and extensibility of the codebase. See the backbone-rewrite branch for its current status. New pull requests will be accepted for both versions at the present time.

## Setup
For testing, in a browser navigate to index.html?username=[username]&uid=[user ID]&channel=[channel name], where the name and ID are your Eterna name and id, and optionally the channel on the server to connect to. In production, the div with the id "chat" will be placed in a framing div which will define the width and height.

The chat page needs to be served from a webserver. You can do this with the included run_server.py, derived from the version used in the [data browser](https://github.com/EteRNAgame/data-browser/blob/master/run_server.py)).

## Contributing
Feel free to fork this repository, make some changes, and create a pull request. Your changes will then be reviewed, and then merged and deployed once accepted. It is encouraged to use a channel other than #global (the default) for testing purposes if it could be disruptive

Currently compatibility must be maintained between this chat and the legacy Flash chat, until it can be implemented into the game. At that point, more significant changes may be implemented to improve implementations based on IRCv3 functionality and and other functions that would otherwise "break" the Flash chat.

-----------------------------------------

Design and implementation of initial release: [@LFP6](https://github.com/LFP6) ([Eterna](http://www.eternagame.org/web/player/48290/))
