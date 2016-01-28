This folder includes Knockout JS components that all understand data as an instance of the TimeseriesData class.  To make a new visualizer:

* Make a knockout js component in a new sub-folder
* Visualize a TimeseriesData instance in whatever way you like
* Register the component in app/startup.js for dev mode
* Register the component in the layout index.js file, as part of the main bundle or an on-demand bundle
