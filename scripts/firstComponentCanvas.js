var width = 600;
var height = 600;
var minYear = 1514;
var maxYear = 1866;
var myCanvas = document.getElementById("myCanvas");
var ctx = myCanvas.getContext("2d");
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


d3.csv("http://localhost/data/essentialSlaveData.csv", function(Voyages){
  d3.csv("http://localhost/data/regions.csv", function(dRegions){

              //Test: display something to console
              console.log("Canvas Version");

              //pseudo-globals
              var totalVoyages = Voyages.length;
              var scaledYear = 1514;
              //Objects
              var visible = {
                  index: 0,
                  embarked:224,
                  disembarked:166,
                  total: 1,
                  year: 1514,
                  regionCount: [0,0,0,0,0,0,0,0]
              };
              var lastVisible = {
                  index: 0,
                  embarked:224,
                  disembarked:166,
                  total: 1,
                  year: 1514,
                  regionCount: [0,0,0,0,0,0,0,0]
              };

              //Initial Data Preparation
              //Assumes that stated variables are present (yearam,embarked,etc.)
              //Later assumes csv rows are sorted by year (ascending)
              for (i=0;i<totalVoyages;i++){
                current = Voyages[i];
                current.yearam = +current.yearam;
                current.embarked = +current.embarked;
                current.disembarked = +current.disembarked;
                current.rand = +current.rand;
                current.landingRegion = +current.landingRegion;
                current.baseRadius = +current.baseRadius;
                current.x=0;
                current.y=0;
              }

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
                return roundFloat(d.rand*Math.PI*2);
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
            ``}


              //Zoom Update Function
              function myZoomHandler(event){

                //get scaleFactor generated from zoom event
                if(event.deltaY>0){
                  scaleFactor*=1.1;
                } else{
                  scaleFactor*=(10/11);
                }
                scaleFactor2 = scaleFactor;

                //Function to update the Years in view
                scaledYear+=1;


                //Store current visible in lastVisible
                var currentIndex = visible.index;

                lastVisible.index = currentIndex;
                lastVisible.total = visible.total;
                lastVisible.year = visible.year;
                lastVisible.embarked = visible.embarked;
                lastVisible.disembarked = visible.disembarked;

                //Update visible region
                var numAdded=0;
                var newEmbarked=0;
                var newDisembarked=0;
                while ( (Voyages[currentIndex].yearam) <= scaledYear ){
                    currentVoyage = Voyages[currentIndex];
                    newEmbarked += currentVoyage.embarked;
                    newDisembarked += currentVoyage.disembarked;
                    visible.regionCount[currentVoyage.region]++;
                    currentIndex++;
                    numAdded++;
                }

                visible.index=currentIndex;
                visible.numVisible += numAdded;
                visible.year=scaledYear;
                visible.embarked += newEmbarked;
                visible.disembarked += newDisembarked;


                //Update text panel figures
                var numVoyages = visible.numVisible;
                var embarked = visible.embarked;
                var died = visible.embarked-visible.disembarked;
                textdata = [scaledYear, numVoyages,embarked,died];
                textFields.data(textdata).text(function(d){return d;});

                //Update angle by region
                var temp =0;
                var newpercent = 0;
                for(i=0;i<8;i++){
                  newpercent =visible.regionCount[i]/visible.total
                  dRegions[i].percentVisible = newpercent;
                  dRegions[i].percentRadians =newpercent*6.28;
                  dRegions[i].minRadians = temp;
                  temp+= newpercent*6.28;
                  dRegions[i].maxRadians=temp;
                }
                //updateArcs
//                arcs.each(function(d,i){updateArc(this,pieRadiusPercent*viewradius/scaleFactor2,+dRegions[i].minRadians,+dRegions[i].maxRadians,dRegions[i].color);})


          /*      if(visible.size()==10){
                  visible.transition().attr("cx",function(d,i){return makeRadius(d.yearam)*Math.cos(updateTheta(d));})
                       .attr("cy",function(d,i){return makeRadius(d.yearam)*Math.sin(updateTheta(d));});
                }*/

                ctx.clearRect(0,0,width,height);
                ctx.save();
                ctx.translate(300,300);
                var r, theta, x, y, color;
                var total = visible.total;
                for(i=0;i<total;i++) {
                  d = Voyages[i];
                  r = d.baseRadius*viewradius;
                  theta = updateTheta(d);
                  x = r*Math.cos(theta);
                  y = r*Math.sin(theta);
                  color = dRegions[d.landingRegion].color;
                  me = d3.select(this);
                  ctx.beginPath();
                  ctx.fillStyle=color;
                  ctx.arc(x,y,circleSize,0,Math.PI*2,1);
                  ctx.fill();
                }
                ctx.restore();
              }


              //create Arcs
/*              var arcs = group.selectAll("path").data(dRegions).enter().append("path");
              arcs.attr("d","M 100 100 L 200 200").style("opacity",opacity);
*/

              //Create Legend
              createLegend();

/*circedefs
              //Define Starting Attributes for all Circles
              circles("cx",function(d,i){return makeRadius(d.yearam)*Math.cos(makeTheta2(d));})
                     ("cy",function(d,i){return makeRadius(d.yearam)*Math.sin(makeTheta2(d));})
                     ("r",circleSize)
                     color: dRegions[d.landingRegion].color;});
*/
              myCanvas.addEventListener("wheel",myZoomHandler);
    });
});
