//Globals

//Canvas Dimensions
var canvasWidth = 600;
var canvasHeight = 600;
var viewradius = width/2 - 20;

//Zoom Interactive Defaults
var circleSize = 0.002*viewradius
var scaleFactor=400;

//Pie Chart Defaults
var opacity = 0.2;
var pieRadiusPercent = 1.0;

//Voyage Year Range
var minYear = 1514;
var maxYear = 1866;

//DOM Elements
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");
var textFields = d3.selectAll(".paneltext");

//Legend Dimensions
var legendRectWidth = 40;
var legendRectSpacing = 5;
var legendPerColumn = 4;
var legendTextWidth = 320;

d3.csv("http://localhost/data/essentialSlaveData.csv", function(Voyages){
  d3.csv("http://localhost/data/regions.csv", function(dRegions){

    console.log("Canvas Re-Write!");

    //---pseudo-globals---
    var totalVoyages = Voyages.length;
    var scaledYear = 1514;
    //Visible Objects - Stores information about current visible selection
    var visible = {
      index: 0,
      embarked: 224,
      disembarked: 166,
      total: 1,
      year: 1514,
      regionCount: [0,0,0,0,0,0,0,0]
    };
    //lastVisible - Stores history of last visible selection
    var lastVisible = {
      index: 0,
      embarked: 224,
      disembarked: 166,
      total: 1,
      year: 1514,
      regionCount: [0,0,0,0,0,0,0,0]
    };

    //---one-time-functions---

    //Initial Data Preparation - executes once at start
    (function prepareData(){
      for (i=0;i<totalVoyages;i++){
        //Convert string type to number
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
    })();

    //Legend Creation - executes once at start
    (function createLegend(){
    var legendDiv = d3.select("#legend");
    legendDiv.append("h3").text("Region of Slave Landing").style("text-align","center");
    legendgroups = legendDiv.append("svg").attr("height",600).attr("width",200).selectAll("g").data(dRegions).enter().append("g")
    legendgroups.attr("transform",function(d,i){return "translate( " +Math.floor(i/legendPerColumn) *(2*legendRectSpacing+legendRectWidth+legendTextWidth)+", " +(legendRectWidth+legendRectSpacing)*(i%legendPerColumn)+")";});
    rectangles = legendgroups.append("rect").attr("fill",function(d){return d.color;}).attr("width",legendRectWidth).attr("height",legendRectWidth);
    legendText = legendgroups.append("text").text(function(d){return d.regionName;}).attr("x",legendRectWidth+legendRectSpacing).attr("y",legendRectWidth-legendRectSpacing);
    legendDiv.select("svg").attr("height",legendPerColumn*(legendRectWidth+legendRectSpacing)).attr("width",(legendRectWidth+legendTextWidth+legendRectSpacing*2)*2);
  ``})();

    //makeRadius and makeTheta only used in initial data setup

    //---helper functions---
    //Rounding
    function roundFloat(longNumber,numDP = 2){
      return +inFloat.toFixed(numDP);
    }

    //---update functions---

    //updateTheta - will add

    //updateArc - will add

    //ZOOM HANDLER FUNCTION
    function myZoomHandler(event){

    }

    //Add Zoom Event Listener
    myCanvas.addEventListener("wheel",myZoomHandler);
  });
});  
