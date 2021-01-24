// set up chart
var svgWidth = 960; //window.innerWidth;
var svgHeight = 500; //window.innerHeight;

var margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//  var w = parseInt(d3.select("#scatter").style("width"));
//  var h = parseInt(d3.select("#scatter").style("height"));

// create an svg wrapper
// append an SVG group that will hold the chart
// and shift the group by left and top margins

var svg = d3
    .select("#scatter")
    .append("svg")
    .classed("chart", true)
    .attr("width", svgWidth)  
    .attr("height", svgHeight)


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

    // create scales for the chart
    var xScale = d3.scaleLinear()
                    .domain([8, d3.max(hpdata, d => d.poverty)])
                    .range([0,width]);

    var yScale = d3.scaleLinear()
                    .domain([0, d3.max(hpdata, d => d.healthcare)])
                    .range([height, 0]);

    // create the axes
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    // append the axes
    // append y axis
    chartGroup.append("g")
                .classed("y-axis", true)
                .call(yAxis);

    // append x axis
    chartGroup.append("g")
                .classed("x-axis", true)
                .attr("transform", `translate(0, ${height})`)
                .call(xAxis);
    
    // add the dots
    var circlesGroup = chartGroup.selectAll("circle")
                // .selectAll("circle")
                .data(hpdata)
                .enter()
                .append("circle")
                .attr("cx", d => xScale(d.poverty))
                .attr("cy", d => yScale(d.healthcare))
                .attr("r", 15)
                .classed("stateCircle", true)
                .attr("opacity", "0.6");

    // add text to circle
    var circleText = chartGroup.selectAll()
            .data(hpdata)
            .enter()
            .append("text")
            .text(d => d.abbr)
            .attr("x", d => xScale(d.poverty))
            .attr("y", d => yScale(d.healthcare))
            .attr("class", "stateText")
            .attr("font-size", "12")
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "central")


    // append tooltip div
    var toolTip = d3.tip().attr('class', 'd3-tip').html(function(d) {
        return `<div> ${d.state} <br> Poverty: ${d.poverty}% <br> HealthCare: ${d.healthcare}% </div>`; 
    });

    // toolTip
    chartGroup.call(toolTip);

    // create mouseover and mouseout
    circlesGroup.on("mouseover", function (d) {toolTip.show(d, this);})
                .on("mouseout", function (d){ toolTip.hide(d, this)})

    // create axes labels
    // create group for x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)

    var xPovertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    var yLabel = chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 50)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .attr("class", "active")
        .text("In Healthcare (%) ")
    
    

}).catch(function(error) {
    console.log(error);
});
