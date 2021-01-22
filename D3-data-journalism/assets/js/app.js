// set up chart
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 40,
    left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create an svg wrapper
// append an SVG group that will hold the chart
// and shift the group by left and top margins

var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);


// import the data from /data/data.csv
d3.csv("assets/data/data.csv").then((hpdata) => {
    console.log(hpdata);
    // parse the data to numeric values
    hpdata.forEach(function(data) {
        // healthcare vs poverty
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        // smokers vs age
        data.age = +data.age;
        data.smokes = +data.smokes;
    });
    console.log(hpdata);



}).catch(function(error) {
    console.log(error);
});


