# Dashiki

Dashiki: ***Dash***boards powered by ***wiki*** articles.

* Bring your own server - python, java, c#, ruby, etc.  Dashiki is purely client side
* Modular - Knockout's component system and observable patterns help you stay DRY
** use your favorite visualization library: d3, vega, dygraphs, highcharts, etc.
** use your favorite kind of datasource: flat files, apis, etc.
* Testable - test your code with pleasure using Karma

## Use

```
$ git clone https://gerrit.wikimedia.org/r/analytics/dashiki

$ cd dashiki

Install npm modules and gulp:
$ npm install
$ sudo npm install -g gulp
$ cd semantic && gulp build

TIPS:
* If you have fabric(from PyPI) installed you can also run `fab setup` instead of the above three commands.
* On Ubuntu, you may need to do `sudo apt-get install libcairo2-dev libjpeg-dev libgif-dev` to get npm to work.
* yarn install is under consideration, some incompabilities remain.
* If you get `npm ERR! code EINTEGRITY` with `npm install`,  try removing `package-lock.json`.
* Gulp version 4 is not stable and compatible with other packages. If you are running into errors with `sudo npm install -g gulp`, use `sudo npm install gulp@3.9.0`.

Build some dashboards by running the commands below from the project root folder:
$ gulp --layout metrics-by-project --config Dashiki:VitalSigns
$ gulp --layout compare --config Dashiki:VisualEditorAndWikitext
$ gulp --layout tabs --config Dashiki:SimpleRequestBreakdowns

Execute the following command to run the Python http server:
$ python -m SimpleHTTPServer 5000
```

And you can now browse to http://localhost:5000/dist/compare-Dashiki:VisualEditorAndWikitext/

What is this magic?  When you pass `--layout compare` to the gulp build, you're telling it
to use the layout defined in src/layouts/compare/.  When you pass `--config
VisualEditorAndWikitext`, you're telling it to configure this layout with the article found
at https://meta.wikimedia.org/wiki/Config:Dashiki:VisualEditorAndWikitext.  For all valid layouts,
see the `src/layouts` folder and the README there.

### Build and Dev tools

We're using karma as a test runner and gulp as a build tool.  You may want to
install gulp globally:

```
npm install -g gulp
```

We don't recommend installing karma globally because new versions can break compatibility with the runners we have.  Instead, you can use the packages we've configured and tested for compatiblity:

```
./node_modules/karma/bin/karma start
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

# Deploy
We have fabric to help deploy dashboards - some parts of this explanation are Wikimedia labs specific - however you can also use the deployer without.

To install fabric

```
pip install fabric
```

Once you've built and tested your dashboard, add a section to the `dashiki/config.yaml` file with relevant config, for instance:

```
edit-analysis:
        layout: compare
        config: VisualEditorAndWikitext
        piwikHost:
        piwikId:
        hostname: edit-analysis.wmflabs.org
        subfolder: compare
```

In Wikimedia labs, we are hoping to have all the dashboards setup in the Dashiki labs project, so ask for access to this project. And from Wikitech's Manage Web Proxies page, set up a proxy for your hostname. Use dashiki-01 as prod and test. You can point multiple proxies at the same instance:

```
edit-analysis-test.wmflabs.org, http://dashiki-01.dashiki.eqiad.wmflabs:80
edit-analysis.wmflabs.org, http://dashiki-01.dashiki.eqiad.wmflabs:80
```

If you are deploying to a different instance, add a stage to the STAGES dictionary defined in the fabfile.

Apache has been configured on our instances to serve all files out of /srv/static/hostname at https://hostname. To get this working for your dashboard add your hostname in the Puppet Configuration tab for the instance you're deploying to, on Horizon.  The role is role::simplestatic and the Parameters are a list of the hostnames configured on that instance.

You are all set!

If you are not using labs - you can have a similar setup - Feel free to adapt the fabfile to suit your destination paths. (Our puppet setup is [here](https://github.com/wikimedia/operations-puppet/blob/production/manifests/role/simplestatic.pp))

* What all can you do with fabric? - `fab help`
* Find all dashboards setup in config.yaml - `fab dashboards`
* Find the stages you can deploy to - `fab stages`
* How is a dashboard currently configured - `fab config:<dashboard-name>`
* Deploy a dashboard - `fab dashboard:<dashboard-name> [staging|production] deploy`
    Example: 
    fab dashboard:browser-reports,hostname=browser-reports.wmflabs.org production deploy -u <username>

* Change dashboard config params while deploying: (This uses fabric's [keyword args syntax](http://docs.fabfile.org/en/1.10/usage/fab.html#per-task-arguments)) -
`fab dashboard:edit-analysis,layout=compare,hostname=edit-analysis-test.wmflabs.org staging deploy`


# Future Plans

### implement parameter validation

The way people interact with components is by passing them params.  Therefore, components should implement validation and helpful error messages for unexpected parameters.  Ideally, this validation could be turned into documentation for the component interfaces.  Promising object validation libraries:

* https://github.com/hapijs/joi
* https://github.com/molnarg/js-schema
* https://github.com/tjwebb/congruence
* https://github.com/square/lgtm/wiki
