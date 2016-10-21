var width = 600;
var height = 600;
var minYear = 1514;
var maxYear = 1866;
var myFrag = document.createDocumentFragment();
var myCanvas = document.getElementById("myCanvas");
var ctx = myCanvas.getContext("2d");
var mySVG = d3.select(myFrag).append("svg")
              .attr("width",width)
              .attr("height",height);
var scaleFactor = 400;
var viewradius = width/2 -20;
var circleSize = 0.002*viewradius
var legendRectWidth = 40;
var legendRectSpacing = 5;
var legendPerColumn = 4;
var legendTextWidth = 320;
var opacity = 0.2;
var pieRadiusPercent = 1.0;

var textFields = d3.selectAll(".paneltext");


d3.csv("http://localhost/data/smallSlaveData.csv", function(myData){
  d3.csv("http://localhost/data/regions.csv", function(dRegions){

              //Test: display something to console
              console.log("Canvas Version");

              //Rounding function
              function roundFloat(inFloat,decimals=2){
                return +inFloat.toFixed(decimals);
              }

              //Data Point Radius Function
              function makeRadius(year){
                return (roundFloat((year-minYear)/(maxYear-minYear) * viewradius));
              }

              //Angle Funcitons
              function makeTheta(d){
                return roundFloat(d.rand*(dRegions[d.landingRegion].percentRadians) +dRegions[d.landingRegion].minRadians);
              }
              function makeTheta2(d){
                return roundFloat(d.rand*6.28);
              }

              function updateTheta(d){
                return (roundFloat((d.rand*(dRegions[d.landingRegion].percentRadians)+dRegions[d.landingRegion].minRadians),4));
              }

              //Arc Update Function
              function updateArc(arc,r,minTheta,maxTheta,color){
                var flag1 =0;
                var flag2 = 1;
                if (maxTheta-minTheta>3.14) { flag1=1; flag2=1;}
                d3.select(arc).attr("d","M "+0 + " " + 0 + " L "+ r*Math.cos(minTheta)+" "+r*Math.sin(minTheta)
                              +" A "+ r + " " + r + " "+ 0+ " " +flag1+" "+flag2+" "+r*Math.cos(maxTheta) + " "+r*Math.sin(maxTheta)
                              +" z")
                              .attr("fill",color);

              }

              function createLegend(){
              var legendDiv = d3.select("#legend")
              legendDiv.append("h3").text("Region of Slave Landing").style("text-align","center");
              legendgroups = legendDiv.append("svg").attr("height",600).attr("width",200).selectAll("g").data(dRegions).enter().append("g")
              legendgroups.attr("transform",function(d,i){return "translate( " +Math.floor(i/legendPerColumn) *(2*legendRectSpacing+legendRectWidth+legendTextWidth)+", " +(legendRectWidth+legendRectSpacing)*(i%legendPerColumn)+")";});
              rectangles = legendgroups.append("rect").attr("fill",function(d){return d.color;}).attr("width",legendRectWidth).attr("height",legendRectWidth);
              legendText = legendgroups.append("text").text(function(d){return d.regionName;}).attr("x",legendRectWidth+legendRectSpacing).attr("y",legendRectWidth-legendRectSpacing);
              legendDiv.select("svg").attr("height",legendPerColumn*(legendRectWidth+legendRectSpacing)).attr("width",(legendRectWidth+legendTextWidth+legendRectSpacing*2)*2);
            }


              //Zoom Update Function
              function myZoomHandler(event){

                //get scaleFactor generated from zoom event
                if(event.deltaY>0){
                  scaleFactor*=1.1;
                } else{
                  scaleFactor*=(10/11);
                }
                scaleFactor2 = scaleFactor;
                function isVisible(d,i){return makeRadius(d.yearam)*scaleFactor2<viewradius;}
                visible = circles.filter(function(d,i){return isVisible(d,i);});


                //Update text panel figures
                var year = d3.max(visible.data(),function(d){return +d.yearam;});
                var numVoyages = visible.size();
                var embarked = d3.sum(visible.data(),function(d){return +d.embarked;});
                var died = d3.sum(visible.data(),function(d){return +d.embarked - +d.disembarked;})
                textdata = [year, numVoyages,embarked,died];
                textFields.data(textdata).text(function(d){return d;});

                //Update angle by region
                var temp =0;
                for(i=0;i<8;i++){
                  var newpercent = (function(){return (visible.filter(function(d){
                    return d.landingRegion==i;}).size())/(visible.size());})();

                  dRegions[i].percentVisible =newpercent;
                  dRegions[i].percentRadians =newpercent*6.28;
                  dRegions[i].minRadians = temp;
                  temp+= newpercent*6.28;
                  dRegions[i].maxRadians=temp;




                }
                //updateArcs
                arcs.each(function(d,i){updateArc(this,pieRadiusPercent*viewradius/scaleFactor2,+dRegions[i].minRadians,+dRegions[i].maxRadians,dRegions[i].color);})


          /*      if(visible.size()==10){
                  visible.transition().attr("cx",function(d,i){return makeRadius(d.yearam)*Math.cos(updateTheta(d));})
                       .attr("cy",function(d,i){return makeRadius(d.yearam)*Math.sin(updateTheta(d));});
                }*/

                ctx.clearRect(0,0,width,height);
                ctx.save();
                ctx.translate(300,300);
                var r, theta, x, y, color;
                visible.each(function(d){
                  r = makeRadius(d.yearam);
                  theta = updateTheta(d);
                  x = r*Math.cos(theta);
                  y = r*Math.sin(theta);
                  color = dRegions[d.landingRegion].color;
                  me = d3.select(this);
                  ctx.beginPath();
                  ctx.fillStyle=color;
                  ctx.arc(x,y,circleSize,0,Math.PI*2,1);
                  ctx.fill();
                });
                ctx.restore();
              }



              //Create <g> for circles
              var group = mySVG.append("g")
                                .attr("id","cgroup")

              //create Arcs
              var arcs = group.selectAll("path").data(dRegions).enter().append("path");
              arcs.attr("d","M 100 100 L 200 200").style("opacity",opacity);
              var circles = group.selectAll("circle").data(myData).enter().append("circle");

              //Create Legend
              createLegend();


              //Define Starting Attributes for all Circles
              circles.attr("cx",function(d,i){return makeRadius(d.yearam)*Math.cos(makeTheta2(d));})
                     .attr("cy",function(d,i){return makeRadius(d.yearam)*Math.sin(makeTheta2(d));})
                     .attr("r",circleSize)
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
              myCanvas.addEventListener("wheel",myZoomHandler);
    });
});
