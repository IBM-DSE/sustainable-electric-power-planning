/***
 * Developed by Data Science Elite Team, IBM Analytics:
 * - Alan Villalobos - Data Journalist
 * - David Thomason - Software Engineer
 * Derived from Brush & Zoom line chart: https://bl.ocks.org/EfratVil/92f894ac0ba265192411e73f633a3e2f
 *
 * Copyright (c) 2018 IBM Corporation
 */

define('ZoomGraph', ["d3"], function(d3) {

var ZoomGraph = function (navSvgId, zoomedSvgId, legendId, data) {
    var chart = this;

    this.data = data;

    this.fields = Object.keys(this.data[0]);
    if (!this.fields.includes('time')){
        console.error("Data is missing a time field! Please include a parsed time value in your input data.");
    }
    this.dataLabels = this.fields.filter(function(item) {return item !== 'time'});

    this.marginZoom = { top: 5, right: 5, bottom: 30, left: 50 };
    this.marginNav = { top: 5, right: 5, bottom: 50, left: 50 };

    this.svgZoom = d3.select("svg#" + zoomedSvgId);
    this.svgNav = d3.select("svg#" + navSvgId);

    var gZoom = this.svgZoom.append("g").attr("transform", "translate(" + this.marginZoom.left + "," + this.marginZoom.top + ")");

    var gNav = this.svgNav.append("g").attr("transform", "translate(" + this.marginNav.left + "," + this.marginNav.top + ")");

    this.xZoom = d3.scaleTime();
    this.yZoom = d3.scaleLinear();
    this.xNav = d3.scaleTime();
    this.yNav = d3.scaleLinear();

    this.xZoom.domain(d3.extent(this.data, function (d) { return d.time; }));
    this.yZoom.domain([0, d3.max(this.data, function (d) {
        var label_vals = chart.dataLabels.map(function (k) { return d[k]; });
        return Math.max.apply(null, label_vals);
    })]);
    this.xNav.domain(this.xZoom.domain());
    this.yNav.domain(this.yZoom.domain());

    this.xAxisZoom = gZoom.append("g")
        .attr("class", "axis x-axis");

    this.yAxisZoom = gZoom.append("g")
        .attr("class", "axis y-axis");

    this.xAxisNav = gNav.append("g")
        .attr("class", "axis x-axis");

    this.valueZooms = [];
    this.valueNavs = [];
    this.dataLabels.forEach(function(label, i) {
      this.valueZooms.push(
        gZoom.append("path")
          .attr("class", label+" zoom")
          .attr("stroke", d3.schemeCategory10[i])
          .style("clip-path", "url(#clip)")
          .datum(this.data)
      );

      this.valueNavs.push(
        gNav.append("path")
          .attr("class", "nav")
          .attr("stroke", d3.schemeCategory10[i])
          .datum(this.data)
      );
    }, this);

    // ZOOMING

    this.clip = this.svgZoom.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect");

    this.brush = d3.brushX()
        .on("brush end", this.brushed.bind(this));

    this.zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .on("zoom", this.zoomed.bind(this));

    this.gBrush = gNav.append("g")
        .attr("class", "brush");

    this.gZoom = this.svgZoom.append("rect")
        .style("cursor", "move")
        .style("fill", "none")
        .style("pointer-events", "all");

    // LEGEND

    this.legendId = legendId;
    this.createLegend();

    // FINISH UP

    this.redraw();

};

ZoomGraph.prototype.redraw = function () {
    var chart = this;

    var boundsZoom = this.svgZoom.node().getBoundingClientRect();
    var boundsNav = this.svgNav.node().getBoundingClientRect();

    this.widthZoom = boundsZoom.width - this.marginZoom.left - this.marginZoom.right;
    this.heightZoom = boundsZoom.height - this.marginZoom.top - this.marginZoom.bottom;
    this.widthNav = boundsNav.width - this.marginNav.left - this.marginNav.right;
    this.heightNav = boundsNav.height - this.marginNav.top - this.marginNav.bottom;

    this.xZoom.rangeRound([0, this.widthZoom]);
    this.yZoom.rangeRound([this.heightZoom, 0]).nice();
    this.xNav.rangeRound([0, this.widthNav]);
    this.yNav.rangeRound([this.heightNav, 0]).nice();

    this.xAxisZoom
        .attr("transform", "translate(0," + this.heightZoom + ")")
        .call(d3.axisBottom(this.xZoom));

    this.yAxisZoom
        .call(d3.axisLeft(this.yZoom).ticks(5));

    this.xAxisNav
        .attr("transform", "translate(0," + this.heightNav + ")")
        .call(d3.axisBottom(this.xNav));

    this.svgNav.select("text.x-axis-label")
        .attr("x", this.widthNav / 2.0)
        .attr("y", this.heightNav + this.marginNav.bottom);

    this.svgZoom.select(".y-axis-label")
        .attr("x", -this.heightZoom / 2.0)
        .attr("y", -this.marginZoom.left);

    this.redrawZoom();

    for (var i in this.dataLabels) {
        this.valueNavs[i].attr("d", d3.area()
          .x(function (d) { return chart.xNav(d.time); })
          .y(function (d) { return chart.yNav(d[chart.dataLabels[i]]); })
        );
    }

    // ZOOMING

    this.clip
        .attr("width", this.widthZoom)
        .attr("height", this.heightZoom);

    this.brush
        .extent([[0, 0], [this.widthNav, this.heightNav]]);

    this.zoom
        .translateExtent([[0, 0], [this.widthZoom, this.heightZoom]])
        .extent([[0, 0], [this.widthZoom, this.heightZoom]]);

    this.gBrush
        .call(this.brush)
        .call(this.brush.move, this.xNav.range());

    this.gZoom
        .attr("width", this.widthZoom)
        .attr("height", this.heightZoom)
        .attr("transform", "translate(" + this.marginZoom.left + "," + this.marginZoom.top + ")")
        .call(this.zoom);

};

ZoomGraph.prototype.redrawZoom = function () {
    var chart = this;

    this.dataLabels.forEach(function(label, i) {
      this.valueZooms[i].attr("d", d3.area()
        .x(function (d) { return chart.xZoom(d.time); })
        .y(function (d) { return chart.yZoom(d[label]); })
      );
    }, chart);
};

ZoomGraph.prototype.brushed = function () {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    var s = d3.event.selection || this.xNav.range();
    this.xZoom.domain(s.map(this.xNav.invert, this.xNav));
    this.redrawZoom();
    this.xAxisZoom.call(d3.axisBottom(this.xZoom));
    this.svgZoom.select(".zoom").call(this.zoom.transform, d3.zoomIdentity
        .scale(this.widthZoom / (s[1] - s[0]))
        .translate(-s[0], 0));
};

ZoomGraph.prototype.zoomed = function () {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    this.xZoom.domain(t.rescaleX(this.xNav).domain());
    this.redrawZoom();
    this.xAxisZoom.call(d3.axisBottom(this.xZoom));
    this.svgNav.select(".brush").call(this.brush.move, this.xZoom.range().map(t.invertX, t));
};

ZoomGraph.prototype.createLegend = function () {
    var leg = d3.select("#" + this.legendId);

    var svg;

    this.dataLabels.forEach(function(label, i) {

      svg = leg.append("svg")
        .attr("width", 20)
        .attr("height", 20)
        .attr("class", "ml-3");

      svg.append("line")
        .attr("stroke", d3.schemeCategory10[i])
        .attr("x1", 2).attr("y1", 10)
        .attr("x2", 18).attr("y2", 10);

      leg.append("span")
        .html("&nbsp;"+label);
    }, this);
};

return ZoomGraph;

});