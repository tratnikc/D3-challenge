// set up chart
var svgWidth = 960; //window.innerWidth;
var svgHeight = 500; //window.innerHeight;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

 var w = parseInt(d3.select("#scatter").style("width")) + margin.left + margin.right;
//  var h = parseInt(d3.select("#scatter").style("height"));

// create an svg wrapper
// append an SVG group that will hold the chart
// and shift the group by left and top margins

var svg = d3
    .select("#scatter")
    .append("svg")
    .classed("chart", true)
    .attr("width", w)  
    .attr("height", svgHeight)

// append SVG group
var chartGroup = svg.append("g")
    // .classed("chart", true)
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

console.log(parseInt(d3.select("svg").style("width")));
console.log(margin.left);

// Initial Parameters
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used on updating x-scale variable upon clicking on axis label
function xScale(censusData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
                        .domain([8, d3.max(censusData, d => d[chosenXAxis])])
                        .range([0, width]);
    return xLinearScale;
};

function yScale(censusData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
                        .domain([0, d3.max(censusData, d => d[chosenYAxis])])
                        .range([height, 0]);
    return yLinearScale;
};

// function to redraw x-axis
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;
};

// function to redraw y-axis
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);

    return yAxis;
};


// update Tooltip based on chosen data
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xLabel;
    var yLabel;

    console.log(chosenXAxis);
    console.log(chosenYAxis);

    if (chosenXAxis === "poverty") {xLabel = "Poverty (%): "}
    else if (chosenXAxis === "age") {xLabel = "Age: "}
    else {xLabel = "Income: "};

    if (chosenYAxis === "healthcare") {yLabel = "Healthcare (%): "}
    else if (chosenYAxis === "smokes") {yLabel = "Smokes (%): "}
    else {yLabel = "Obesity (%): "};
    
    var toolTip = d3.tip().attr('class', 'd3-tip').html(function(d) {
        return `<div> ${d.state} <br> ${xLabel} ${d[chosenXAxis]}% <br> ${yLabel} ${d[chosenYAxis]}% </div>`; 
    });

    circlesGroup.call(toolTip);

    // create mouseover and mouseout
    circlesGroup.on("mouseover", function (d) {toolTip.show(d, this);})
                .on("mouseout", function (d){ toolTip.hide(d, this)});

    return circlesGroup;

};

// import the data from /data/data.csv
d3.csv("assets/data/data.csv").then((hpdata) => {

    // parse the data to numeric values
    hpdata.forEach(function(data) {

        // healthcare vs poverty
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        
        // smokers vs age
        data.age = +data.age;
        data.smokes = +data.smokes;

        // obesity vs household income
        data.obesity = +data.obesity;
        data.income = +data.income;

    });
    console.log(hpdata);

    // create scales for the chart
    // call function xScale 
    var xLinearScale = xScale(hpdata, chosenXAxis);
    
    // create y scale function
    var yLinearScale = yScale(hpdata, chosenYAxis);

    // create the axes
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append the axes
    // append x axis
    var xAxis = chartGroup.append("g")
                .classed("x-axis", true)
                .attr("transform", `translate(0, ${height})`)
                .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
                .classed("y-axis", true)
                .call(leftAxis);
    
    // add the dots and text
    var circlesGroup = chartGroup.selectAll()
                // .selectAll("circle")
                .data(hpdata)
                .enter()
                .append("g")
                .append("circle")
                .attr("class", d => d.abbr)
                .attr("cx", d => xLinearScale(d[chosenXAxis]))
                .attr("cy", d => yLinearScale(d[chosenYAxis]))
                .attr("r", 15)
                .classed("stateCircle", true)
                .attr("opacity", "0.5")
                .select()
                .data(hpdata)
                .enter()
                .append("text")
                .text(d => d.abbr)
                .attr("x", d => xLinearScale(d[chosenXAxis]))
                .attr("y", d => yLinearScale(d[chosenYAxis]))
                .attr("class", "stateText")
                .attr("font-size", "12")
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "central");

    // append tooltip div
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // create axes labels
    // create group for x-axis labels
    var labelsGroup = chartGroup.append("g")
        .attr("class", "x-labels")
        .attr("transform", `translate(${width / 2}, ${height + 20})`)

    var xPovertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty") // value to grab for event listener
        .attr("class", "active")
        .text("In Poverty (%)");

    var xAgeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age") // value to grab for event listener
        .attr("class", "inactive")
        .text("Age (Median)");
    
    var xIncomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income") // value to grab for event listener
        .attr("class", "inactive")
        .text("Household Income (Median)");


    var yLabelsGroup = chartGroup.append("g")
        .attr("class", "y-labels")
        .attr("transform", "rotate(-90)")
    
    var yHealthLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 50)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .attr("class", "active")
        .attr("value", "healthcare")
        .text("Lacks Healthcare (%)");
    
    var ySmokesLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 30)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .attr("class", "inactive")
        .attr("value","smokes")
        .text("Smokes (%)");
    
    var yObesityLabel = yLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 10)
        .attr("x", 0 - (height/2))
        .attr("dy", "1em")
        .attr("class", "inactive")
        .attr("value","obesity")
        .text("Obese (%)");

    // attach event listener to axes labels
    labelsGroup.selectAll("text")
        .on("click", function() {
            // get selected value
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                chosenXAxis = value;
                console.log(chosenXAxis);
                // update x axis scale
                xLinearScale = xScale(hpdata, chosenXAxis);
                xAxis = renderXAxis(xLinearScale, xAxis);

                // change classes to bold text
                switch (chosenXAxis) {
                    case "poverty":
                        xPovertyLabel.classed("active", true).classed("inactive", false);
                        xAgeLabel.classed("inactive", true);
                        xIncomeLabel.classed("inactive", true);
                        break;
                    case "age":
                        xAgeLabel.classed("active", true).classed("inactive", false);
                        xPovertyLabel.classed("inactive", true);
                        xIncomeLabel.classed("inactive", true);
                        break;
                    case "income":
                        xIncomeLabel.classed("active", true).classed("inactive", false);
                        xAgeLabel.classed("inactive", true);
                        xPovertyLabel.classed("inactive", true);
                        break;
                }
            }
        })
    
    yLabelsGroup.selectAll("text")
        .on("click", function() {
            // update y axis scale
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                chosenYAxis = value;
                console.log(chosenYAxis);
                yLinearScale = yScale(hpdata, chosenYAxis);
                yAxis = renderYAxis(yLinearScale, yAxis);

                // change classes to bold text
                switch (chosenYAxis) {
                    case "healthcare":
                        yHealthLabel.classed("active", true).classed("inactive", false);
                        ySmokesLabel.classed("inactive", true);
                        yObesityLabel.classed("inactive", true);
                        break;
                    case "smokes":
                        ySmokesLabel.classed("active", true).classed("inactive", false);
                        yHealthLabel.classed("inactive", true);
                        yObesityLabel.classed("inactive", true);
                        break;
                    case "obesity":
                        yObesityLabel.classed("active", true).classed("inactive", false);
                        ySmokesLabel.classed("inactive", true);
                        yHealthLabel.classed("inactive", true);
                        break;
                }
            }
            
        })

}).catch(function(error) {
    console.log(error);
});
