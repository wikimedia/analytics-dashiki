# Dashiki

Dashboarding tool.  No server.  Modular.
Initially, this tool is aimed at dashboarding for Mediawiki universe.

## Use

```
git clone https://gerrit.wikimedia.org/r/analytics/dashiki
cd dashiki
python -m SimpleHTTPServer 5000
```

Browse http://localhost:8000/dist to use the latest release.
Or, browse to http://localhost:5000/src to run against raw files.

To modify and develop:

### Install Bower modules
`bower install`

### Install npm modules
`npm install`

### Build and Dev tools

We're using karma as a test runner and gulp as a build tool.  You may want to
install these tools globally:

```
npm install -g gulp
npm install -g karma-cli
```

Running gulp tasks to build, lint, clean, etc:
```
gulp (html|lint|js)
gulp
```

The karma test runner will watch all files and execute all tests on changes:
```
karma start
```

# Debugging dev tools
Install node inspector

```
npm install -g node-inspector
```

Add "debugger" to the task you are interested in debugging:

```
gulp.task('html', function() {
    debugger;
    // some code
});
```

And later call it with node-debug. Example:

```
$ node-debug  --web-port=7000 ./node_modules/gulp/bin/gulp.js html
Node Inspector is now available from http://localhost:7000/debug?port=5858
Debugging `./node_modules/gulp/bin/gulp.js`

debugger listening on port 5858
```

# Tests
We use karma to run tests

The way the karma installation works has changed with 0.12. It's documented here how to install it now:
http://karma-runner.github.io/0.12/intro/installation.html. For global installation you'll need 
to run npm install -g karma-cli and the local one is npm install karma. 
In 0.12 no plugins ship with karma anymore so you have to specify them by hand, e.g. npm install --save-dev karma-chrome-launcher.

To start running tests:
```
karma start
```

# Future Plans

### implement parameter validation

The way people interact with components is by passing them params.  Therefore, components should implement validation and helpful error messages for unexpected parameters.  Ideally, this validation could be turned into documentation for the component interfaces.  Promising object validation libraries:

* https://github.com/hapijs/joi
* https://github.com/molnarg/js-schema
* https://github.com/tjwebb/congruence
* https://github.com/square/lgtm/wiki
