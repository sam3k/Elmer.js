Elmer.js
========

Some improvements to the console for easier debugging in production environments.

# TODO:
- [x] Switch to using Underscore/Lo-Dash for array methods
- [ ] Implement console.warn
- [ ] Implement console.error
- [x] Implement AMD support
- [x] If cookie Elmer.disable() use default console (elmer=console) to keep line numbers
- [ ] Create override console via a loop for less code
- [ ] Enable/disable via hashes
- [x] Sync up cookies & registrar
- [ ] Update Grunt Watch to use a Gaze version that fixes [this issue](https://github.com/gruntjs/grunt-contrib-watch/issues/13)
- [x] Add JSHint using Grunt Watch


# Development
## Running JSHint While Developing
If you are using Node.js, you can install the node modules being used. Do so, like this:

```
npm install
```

This will install the dev dependencies for this library. And then you can simply run the following command from the root folder:

```
grunt
```

You will now see a message in the terminal that looks something like this:
```
Running "watch" task
Waiting...
```

# Known Issues
## Grunt Watch Stops reacting to file changes after the first time
Grunt Watch dependency "Gaze.js" has been modified in the file: node_modules/gaze/lib/gaze.js line 71; from: 

```javascript
  forceWatchMethod: false 
```

to 

```javascript
  forceWatchMethod: 'old'
```

This is in regard to issue "Stops reacting to file changes after the first time" discussed here: https://github.com/gruntjs/grunt-contrib-watch/issues/13

