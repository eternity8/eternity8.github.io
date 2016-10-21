//Globals

//Canvas Dimensions
var canvasWidth = 600;
var canvasHeight = 600;
var viewradius = canvasWidth/2 - 20;

//Zoom Interactive Defaults
var circleSize = 0.002*viewradius
var startScale=400;
var maxScale=400;
var minScale=1;

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
    //General variables that update once per zoom loop
    //May remove last three if redundant
    var current = {
      year: minYear,
      scaleFactor: startScale,
      zoomout: false, //1 zoom-out, -1 zoom-in
      newEmbarked: 0,
      newDisembarked: 0,
      newAdded: 0
    };

    //---one-time-functions---

    //Initial Data Preparation - executes once at start
    (function prepareData(){
      for (i=0;i<totalVoyages;i++){
        //Convert string type to number
        currentV = Voyages[i];
        currentV.yearam = +currentV.yearam;
        currentV.embarked = +currentV.embarked;
        currentV.disembarked = +currentV.disembarked;
        currentV.rand = +currentV.rand;
        currentV.landingRegion = +currentV.landingRegion;
        currentV.baseRadius = +currentV.baseRadius; //1514=0,1866=1, scaled
        currentV.x=0;
        currentV.y=0;
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
    //roundFloat: Rounding
    function roundFloat(longNumber,numDP = 2){
      return +inFloat.toFixed(numDP);
    }
    //scaleFactor: updates zoom scale factor using mouse scroll input
    function updateDirection(deltaY){
      if (deltaY>0){
        current.zoomout = true;
      } else{
        current.zoomout = false;
      }
    }
    function updateScaleFactor(deltaY){
      //do Nothing if scaleFactor out of bounds
      if(current.zoomout){
      current.scaleFactor*=1.1;
      } else{
      current.scaleFactor*=(10/11);
      }
    }

    function updateYear(){
      if (current.zoomout){
        current.year++;
      } else {
        current.year--;
      }
    }
    //Saves current visible data in lastVisible
    function storeLastVisible(){
      lastVisible.index = visible.index;
      lastVisible.total = visible.total;
      lastVisible.year = visible.year;
      lastVisible.embarked = visible.embarked;
      lastVisible.disembarked = visible.disembarked;
    }
    function updateVisible(){

      var currentIndex = visible.index;
      var scaledYear = current.year;
      var voyage;
      current.newAdded = 0;
      current.newEmbarked = 0;
      current.newDisembarked = 0;
      if (current.zoomout){
        while(Voyages[currentIndex].yearam<scaledYear){
          voyage = Voyages[currentIndex];
          current.newEmbarked += voyage.embarked;
          current.newDisembarked += voyage.disembarked;
          current.newAdded++;
          visible.regionCount[voyage.region]++;
          currentIndex++;
        }
      } else {
        while(Voyages[currentIndex].yearam>scaledYear){
          voyage = Voyages[currentIndex];
          current.newEmbarked -= voyage.embarked;
          current.newDisembarked -= voyage.disembarked;
          current.newAdded--;
          visible.regionCount[voyage.region]--;
          currentIndex--;
        }
      }

      //Note: current values could be negative
      visible.index = currentIndex;
      visible.total+=current.newAdded;
      visible.embarked+=current.newEmbarked;
      visible.disembarked+=current.newDisembarked;
    }

    function updateTextPanel(){
      //textdata - year,total voyages,embarked,died
      var textdata = [current.year, visible.total,visible.embarked,
                        visible.embarked-visible.disembarked];
      textFields.data(textdata).text(function(d){return d;});

    }

    function updateCirclePositions(){

    }
    function drawCircles(){

    }

    //---update functions---

    //updateTheta - will add

    //updateArc - will add

    //ZOOM HANDLER FUNCTION
    function myZoomHandler(event){
      updateDirection(event.deltaY);

      //Do nothing if already at full zoom level
      if( ((current.zoomout) && (current.year == maxYear)) ||
          ((!current.zoomout) && (current.year == minYear)) )
      {
        return;
      }

      updateScaleFactor(event.deltaY);
      updateYear();
      storeLastVisible();
      updateVisible();
      updateTextPanel();
      updateCirclePositions();
      drawCircles();

    }



    //Add Zoom Event Listener
    myCanvas.addEventListener("wheel",myZoomHandler);
  });
});
