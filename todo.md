# List of features

## Todo
----

### Cleanup
  - Comment code
  - Remove unused imports

### Bug fixes
  - Ensure features and styles are consistent across browsers

## Finished
---

### Notifications
  - Keywords

### Settings
  - Values need to be stored correctly
  - Add option to change nick for opers
  - Make sure emoticons can be changed there

### Cleanup
  - Group functions and properties  
  - Markdown
  - Move code in chat commands to functions
  - Move unnecessary stuff out of chat.vuex
  - Add typings for untyped modules
  - Move files in components to folders

### Away status
  - Automatically set it after a certain amount of time with no interaction
  - Allow it to be manually set
  - Don't fetch on demand - rather, update every 5 seconds (or so) and fetch values

### Bug fixes
  - Operator name change seems to break sometimes
  - Optimize away/online status loading
  - Find a way to limit unnecessary GET requests (tooltips)

### Miscellaneous
  - Clicking a channel name in a chat message opens the channel

### Reconnect button
  - Style to align with theme
  - Hide input when visible

### Action menu
  - Add a 'copy message' button that copies the message in `<user>message` format

