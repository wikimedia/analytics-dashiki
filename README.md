# Dashiki

Dashboarding tool.  No server.  Modular.
Initially, this tool is aimed at dashboarding for Mediawiki universe.

## Use

```
git clone https://gerrit.wikimedia.org/r/analytics/dashiki
cd dashiki
python -m SimpleHTTPServer 5000
```

You can now browse to http://localhost:5000/dist to use the latest release.

To modify and develop:

# Install Bower modules
`bower install`
  
# Install npm modules
`npm install`

# Use gulp to build
```
npm install -g gulp
```
After running 'gulp' should work

If you were unable to install gulp globally 
you can run the build via local module

```
./node_modules/gulp
./node_modules/gulp/bin/gulp.js
```
# executing a gulp task 
```
$(which gulp) html
```

Go into http://localhost:8000/src to run against raw files 

# Handy commands

```
bower ls
bower list -p
```

Will list dependencies 

# Debug gulp tasks
Install node inspector 

```
npm install -g node-inspector
```
You need to add "debugger" to the task you are interested in debuggin.

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
