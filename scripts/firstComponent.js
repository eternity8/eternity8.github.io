
width = 1000;
height = 1000;
minYear = 1800;
var mySVG = d3.select("#zoomBox").attr("width",width)
                .attr("height",height);

var textFields = d3.selectAll(".paneltext");

d3.csv("http://localhost/data/slavedata3.csv", function(myData){
              //Display something to console
              console.log(myData[0]);

              //Functions for defining data point positions
              function makeRadius(year){
                return (year-minYear)/352 * width/2;
              }

              function makeTheta(i){
                return i;
              }
              //Functions for applying zoom
              function myZoomHandler(){
                scaleFactor = (d3.event.transform.k);
                group.attr("transform", "translate(" + width/2 +", " + height/2 +") scale("+d3.event.transform.k+ ")");
                circles.style("visibility","hidden");
                visible = circles.filter(function(d,i){var radius = makeRadius(d.yearam);
                                                      //      if(i===4){console.log(makeRadius(d.yearam)+ " " + width/2 + " " + radius*scaleFactor);};
                                                        return radius*scaleFactor<(width/2)-20;});
                visible.style("visibility","visible");
                var year = d3.max(visible.data(),function(d){return +d.yearam;});
                var numVoyages = visible.size();
                var embarked = d3.sum(visible.data(),function(d){return +d.embarked;});
                var died = d3.sum(visible.data(),function(d){return +d.embarked - +d.disembarked;})
                textdata = [year, numVoyages,embarked,died];
                textFields.data(textdata).text(function(d){return d;});


              }
              //define zoom behaviour and scale Extent
              var zoom = d3.zoom().scaleExtent([1,400]).on("zoom",myZoomHandler);

              mySVG.call(zoom);

              var group = mySVG.append("g").attr("id","cgroup").attr("transform",function(){return "translate(" + width/2 + ", " + height/2+") scale( " +400+ ")"});
              var circles = group.selectAll("circle").data(myData).enter().filter(function(d){return +d.yearam>minYear;}).append("circle");
              mySVG.call(zoom.transform, d3.zoomIdentity.scale(400));
              var centreCircle = group.append("circle").attr("cx",0)
                                    .attr("cy",0)
                                    .attr("r",0.2)
                                    .attr("id","Middle");

              circles.attr("cx",function(d,i){return makeRadius(d.yearam)*Math.cos(makeTheta(i));})
                     .attr("cy",function(d,i){return makeRadius(d.yearam)*Math.sin(makeTheta(i));})
                     .attr("r",0.01);


  //            function addValToObject(myObject){myObject["newKey"]="Hello";};

  //            circles.data.addValToObject(d);

            });
