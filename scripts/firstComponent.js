

d3.csv("http://localhost/data/smallSlaveData.csv", function(myData){
              console.log(myData[0]);
              d3.select("#viewbox").append("svg").selectAll("circle")
                  .data(myData).enter().append("circle")
                      .attr("cx",function(d){return 0.2})
                      .attr("cy",function(d){return Math.sqrt(+d.yeararm-1514-cx)})
                      .attr("r",function(d){return 10});
            });
