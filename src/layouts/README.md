# Dashiki Layouts

Dashiki is a dashboard builder, and it comes with a bunch of built-in layouts.
If you'd like your own layout, you're welcome to contribute one.  To build a
layout, use gulp:

```
gulp --layout <<layout-name>> --config <<config-wiki-article>>
```


## Compare

The compare layout lets you compare metrics measured in an A/B test scenario.
Graphs that support this layout allow combining data or comparing it
side by side.  For an example, see https://edit-analysis.wmflabs.org/compare/


## Metrics By Project

This layout lets you easily find WMF-hosted wiki projects and visualize one
of the configured metrics for all those projects.


## Tabs

This is a basic layout that just lets you display graphs organized by tabs.
