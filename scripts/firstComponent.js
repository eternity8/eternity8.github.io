
width = 350;
height = 350;
var mySVG = d3.select("#zoomBox").attr("width",width)
                .attr("height",height);

d3.csv("http://localhost/data/slavedata3.csv", function(myData){
              //Display something to console
              console.log(myData[0]);

              //Functions for defining data point positions
              function makeRadius(year){
                return (year-1514)/352 * width/2;
              }

              function makeTheta(i){
                return i;
              }
              //Functions for applying zoom
              function myZoomHandler(){
                mySVG.select("g").attr("transform", "translate(" + width/2 +", " + height/2 +") scale("+d3.event.transform.k+ ")");
              }
              var zoom = d3.zoom().scaleExtent([1,50]).on("zoom",myZoomHandler);

              mySVG.call(zoom);

              var circles = mySVG.append("g").attr("transform",function(){return "translate(" + width/2 + ", " + height/2 + ")";}).selectAll("circle")
                  .data(myData).enter().append("circle");

              d3.select("svg").select("g").append("circle").attr("cx",0)
                                               .attr("cy",0)
                                               .attr("r",0.4)
                                               .attr("id","Middle");

              circles.attr("cx",function(d,i){return makeRadius(d.yearam)*Math.cos(makeTheta(i));})
                     .attr("cy",function(d,i){return makeRadius(d.yearam)*Math.sin(makeTheta(i));})
                     .attr("r",0.4);

  //            function addValToObject(myObject){myObject["newKey"]="Hello";};

  //            circles.data.addValToObject(d);

            });
