
var minYear = 1514;
var maxYear = 1866;
var mySVG = d3.select("#zoomBox");
var width = mySVG.attr("width");
var height = mySVG.attr("height");
var viewradius = width/2 -20;
var legendRectWidth = 40;
var legendRectSpacing = 5;
var legendPerColumn = 4;
var legendTextWidth = 320;




var textFields = d3.selectAll(".paneltext");


d3.csv("http://localhost/data/slavedata3.csv", function(myData){
  d3.csv("http://localhost/data/regions.csv", function(dRegions){

              //Test: display something to console
              console.log("latestversion");

              //Data Point Radius Function
              function makeRadius(year){
                return (year-minYear)/(maxYear-minYear) * viewradius;
              }

              //Angle Funcitons
              function makeTheta(d){
                return d.rand*BroadRegionPercent[d.landingRegion]+BroadRegionSummary[d.landingRegion];
              }
              function makeTheta2(d){
                return d.rand*6.28;
              }

              function updateTheta(d){
                return d.rand*(dRegions[d.landingRegion].percentRadians)+dRegions[d.landingRegion].minRadians;
              }

              //Zoom Update Function
              function myZoomHandler(){

                //get scaleFactor generated from zoom event
                scaleFactor = (d3.event.transform.k);

                //Apply scaleFactor to circles
                group.attr("transform", "translate(" + width/2 +", " + height/2 +") scale("+d3.event.transform.k+ ")");

                //Update visibility
                circles.style("visibility","hidden");
                visible = circles.filter(function(d,i){return makeRadius(d.yearam)*scaleFactor<viewradius;});


                //Update text panel figures
                var year = d3.max(visible.data(),function(d){return +d.yearam;});
                var numVoyages = visible.size();
                var embarked = d3.sum(visible.data(),function(d){return +d.embarked;});
                var died = d3.sum(visible.data(),function(d){return +d.embarked - +d.disembarked;})
                textdata = [year, numVoyages,embarked,died];
                textFields.data(textdata).text(function(d){return d;});
                function getPercent(data){
                  return(+d.region);
                }
                //Update angle by region
                var temp =0;
                for(i=0;i<8;i++){
                  var newpercent = (function(){return (visible.filter(function(d){
                    return d.landingRegion==i;}).size())/(visible.size());})();

                  dRegions[i].percentVisible =newpercent;
                  dRegions[i].percentRadians =newpercent*6.28;
                  dRegions[i].minRadians = temp;
                  temp+= newpercent*6.28;
/*                  if(i==2)
                  {
                    console.log(dRegions[i]);
                  }
*/                }

                visible.style("visibility","visible");
                if(visible.size()==10){
                  visible.transition().attr("cx",function(d,i){return makeRadius(d.yearam)*Math.cos(updateTheta(d));})
                       .attr("cy",function(d,i){return makeRadius(d.yearam)*Math.sin(updateTheta(d));});
                }
                else if(visible.size()>=10){
                  visible.attr("cx",function(d,i){return makeRadius(d.yearam)*Math.cos(updateTheta(d));})
                       .attr("cy",function(d,i){return makeRadius(d.yearam)*Math.sin(updateTheta(d));});
                }
              }

              //Initialize Zoom Behaviour and Scale Boundaries
              var zoom = d3.zoom().scaleExtent([1,400]).on("zoom",myZoomHandler);
              mySVG.call(zoom);

              //Create Circles
              var group = mySVG.append("g")
                                .attr("id","cgroup")
                                .attr("transform",function(){return "translate(" + width/2 + ", " + height/2+") scale( " +400+ ")"});

              var circles = group.selectAll("circle").data(myData).enter().append("circle");

              //Create Legend
              var legendDiv = d3.select("#legend")
              legendDiv.append("h3").text("Region of Slave Landing").style("text-align","center");
              legendgroups = legendDiv.append("svg").attr("height",600).attr("width",200).selectAll("g").data(dRegions).enter().append("g")
              legendgroups.attr("transform",function(d,i){return "translate( " +Math.floor(i/legendPerColumn) *(2*legendRectSpacing+legendRectWidth+legendTextWidth)+", " +(legendRectWidth+legendRectSpacing)*(i%legendPerColumn)+")";});
              rectangles = legendgroups.append("rect").attr("fill",function(d){return d.color;}).attr("width",legendRectWidth).attr("height",legendRectWidth);
              legendText = legendgroups.append("text").text(function(d){return d.regionName;}).attr("x",legendRectWidth+legendRectSpacing).attr("y",legendRectWidth-legendRectSpacing);
              legendDiv.select("svg").attr("height",legendPerColumn*(legendRectWidth+legendRectSpacing)).attr("width",(legendRectWidth+legendTextWidth+legendRectSpacing*2)*2);

              //Define Starting Attributes for all Circles
              circles.attr("cx",function(d,i){return makeRadius(d.yearam)*Math.cos(makeTheta2(d));})
                     .attr("cy",function(d,i){return makeRadius(d.yearam)*Math.sin(makeTheta2(d));})
                     .attr("r",0.4)
                     .style("fill",function(d){return dRegions[d.landingRegion].color;});

              //Display Data for One Circle
  /*            console.log(circles.filter(function(d,i){
                return i===3;
              }).data());
*/
              //Define Centre Circle for Reference
/*              var centreCircle = group.append("circle").attr("cx",0)
                                    .attr("cy",0)
                                    .attr("r",0.4)
                                    .attr("id","Middle");
*/
              //Initialize Zoom To Maximum Scale (fully zoomed in)
              mySVG.call(zoom.transform, d3.zoomIdentity.scale(400));
    });
});
