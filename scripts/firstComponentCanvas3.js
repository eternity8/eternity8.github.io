//Globals

//DOM and D3 Elements
var canvas = document.getElementById("myCanvas");
var svgLayer = document.getElementById("svgLayer");
var container = svgLayer;
var svgD3 = d3.select("#svgLayer");
var groupD3 = svgD3.append("g");

var ctx = canvas.getContext("2d");
var textFields = d3.selectAll(".paneltext");
var canvasd3 = d3.select(canvas);

//Canvas Dimensions
var canvasWidth = 600;
var canvasHeight = 600;
var viewradius = canvasWidth/2 - 20;
canvasd3.attr("width",canvasWidth);
canvasd3.attr("height",canvasHeight);
groupD3.attr("transform", "translate("+ canvasWidth/2 + ", " +canvasHeight/2 + " )");
//Zoom Interactive Defaults
var circleSize = 0.002*viewradius
var startScale=2;
var maxScale=400;
var minScale=1;

//Pie Chart Defaults
var opacity = 0.2;
var pieRadiusPercent = 1.0;

//Math Constants
var twoPi = Math.PI*2;

//Voyage Year Range
var minYear = 1514;
var maxYear = 1866;



//Legend Dimensions
var legendRectWidth = 40;
var legendRectSpacing = 5;
var legendPerColumn = 4;
var legendTextWidth = 320;

//EssentialSlaveData variables: yearam, embarked, disembarked, rand, landingRegion, baseRadius, shiftedYear
d3.csv("http://localhost/data/essentialSlaveData.csv", function(Voyages){
  //Regions variables: regionName, percentVisible, percentRadians, minRadians, maxRadians, color
  d3.csv("http://localhost/data/regions.csv", function(dRegions){

    console.log("Canvas Re-Write!");

    //---pseudo-globals---
    var totalVoyages = Voyages.length;
    var scaledYear = 1514;
    var arcsD3=groupD3.selectAll("path").data(dRegions).enter().append("path");
    //Visible Objects - Stores information about current visible selection
    var selection = {
      isDefault: true,
      subSelected: false,
      current: "default",

      subLower: 0,
      subUpper: 0
    }
    var visible = {
      index: 0,
      embarked: 224,
      disembarked: 166,
      total: 1,
      year: 1514,
      regionCount: [1,0,0,0,0,0,0,0]
    };
    //lastVisible - Stores history of last visible selection
    var lastVisible = {
      index: 0,
      embarked: 224,
      disembarked: 166,
      total: 1,
      year: 1514,
      regionCount: [1,0,0,0,0,0,0,0]
    };
    //General variables that update once per zoom loop
    //May remove last three if redundant
    var current = {
      year: minYear,
      yearStep: 5,
      scaleFactor: startScale,
      zoomout: false, //1 zoom-out, -1 zoom-in
      newEmbarked: 0,
      newDisembarked: 0,
      newAdded: 0,
      scrollCount:0
    };
    var eventLog = {
      mouseDown: 0,
      dragStart: 0,
      dragging: 0,
      startEvent: undefined,
      endEvent: undefined

    };
    //preferences
    var preferences = {
      //adjust zoom scaling method (true: add/minus years, false: times/divide current year by factor)
      zoomIsLinear: true,
      zoomSpeed: 4,
      //toggles whether scroll speed affects zoom speed
      useDelta: true,
      showArcs: true
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
        currentV.shiftedYear = +currentV.shiftedYear;
        currentV.x=0; //currently redundant (x and y not stored)
        currentV.y=0;
      }
      for (i=0;i<dRegions.length;i++)
      {
        currentR = dRegions[i];
        currentR.percentVisible = +currentR.percentVisible;
        currentR.percentRadians = +currentR.percentRadians;
        currentR.minRadians= +currentR.minRadians;
        currentR.maxRadians= +currentR.maxRadians;
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
    function updateScaleLinear(deltaY){
      if (preferences.useDelta){

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
    //Added preferences, haven't added zoomSpeed in. Current useDelta adjustment is really bad.
    function updateYear(deltaY){
      //Case: linear Zooming (year spacing consistent)
      if(preferences.zoomIsLinear){
        var yearStep = preferences.zoomSpeed;

        if (preferences.useDelta){
          yearStep += (
            Math.abs(deltaY/50));
        }
        if (yearStep>100){
          yearStep=100;
        }
        if (!current.zoomout){
          yearStep *= (-1)
        }
        current.year+=yearStep;
      }
      else {
        //Case: zooming by ratio (50%, 100% zoom etc.) Not using at this point
        var yearFactor = current.scaleFactor;
        if (!current.zoomout){
          yearFactor = -1/yearFactor;
        }
        if (preferences.useDelta){
          //put something here to make delta affect yearFactor
        }
        console.log(current.scrollCount);
        current.year+=yearFactor*(current.scrollCount);
      }
      current.year = Math.floor(current.year);
      if (current.year<minYear)
      {
        current.year=minYear;
      }
      if (current.year>maxYear)
      {
        current.year=maxYear;
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
      var updatedYear = current.year;
      var voyage;
      current.newAdded = 0;
      current.newEmbarked = 0;
      current.newDisembarked = 0;
      //zoom out, i starts at one above last visible index, ends at highest entry for current year
      if (current.zoomout){
        for(i=currentIndex+1;i<totalVoyages;i++){
          //break condition
          if(Voyages[i].yearam>updatedYear){
            i--;
            //console.log("Breaking at index " + i);
            break;
          }
          //console.log("adding... i = " + i);
          voyage = Voyages[i];
          current.newEmbarked += voyage.embarked;
          current.newDisembarked += voyage.disembarked;
          current.newAdded++;
          visible.regionCount[voyage.landingRegion]++;
        }
        if (i>=totalVoyages){
          i--;
        }
        visible.index=i;
      } else {
        //zoom in, i starts at last visible index, ends at highest entry for current year
        for(i=currentIndex;i>0;i--){
          if(Voyages[i].yearam<=updatedYear){
            break;
          }
          //console.log("removing... i = " + i);
          voyage = Voyages[i];
          current.newEmbarked -= voyage.embarked;
          current.newDisembarked -= voyage.disembarked;
          current.newAdded--;
          visible.regionCount[voyage.landingRegion]--;
        }
          visible.index=i;
      }

      //Note: current values could be negative
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
    function updateRegions(){

      var thetaRange;
      var tempMinTheta=0;
//      console.log("start "+ visible.regionCount);
      for(i = 0;i<8;i++)
      {
  //      console.log("Before " + dRegions[i].minRadians,dRegions[i].percentRadians);
        dRegions[i].minRadians = tempMinTheta;
        thetaRange = twoPi *visible.regionCount[i]/visible.total;
        dRegions[i].percentRadians = thetaRange;
        tempMinTheta += thetaRange;
        dRegions[i].maxRadians = tempMinTheta;

  //      console.log("After " + dRegions[i].minRadians,dRegions[i].percentRadians);
      }
    }
    //drawArc: Redraws a pie chart arc (called from updateArcs)
    function drawArc(arc,r,minTheta,maxTheta){
      var flag1 =0;
      var flag2 = 1;
      var x1 = r*Math.cos(minTheta);
      var y1 = r*Math.sin(minTheta);
      var x2 = r*Math.cos(maxTheta);
      var y2 = r*Math.sin(maxTheta);

      if(maxTheta-minTheta>Math.PI) {
        flag1=1;
      }
      d3.select(arc).attr("d","M 0 0 L " + x1 + " " + y1 + " A " + r + " " + r + " " + 0 + " " + flag1 + " " + flag2 + " " + x2 + " " + y2 + " z");
    }

    (function setupArcs(){
      arcsD3.attr("fill",function(d){return d.color;})
            .style("fill-opacity",opacity)
            .style("stroke",function(d){return d.color})
            .style("stroke-opacity",0)
            .style("stroke-width",2).attr("class","arc");
  //    arcsD3.on("click",function(d,i){console.log(d.regionName);
  //    });
    })();

    function updateArcs(){
    arcsD3.each(function(d,i){drawArc(this,viewradius,d.minRadians,d.maxRadians);});
    }

    function updateCirclePositions(){
        var upperIndex = visible.index;
        var scaleYear = current.year-1513;
        var scale = viewradius/scaleYear;
        circleSize=scale/2;
      //  console.log(circleSize);
        var x, y, theta, r, color, regionID;
        ctx.clearRect(0,0,canvasWidth,canvasHeight);
        ctx.save();
        ctx.translate(canvasWidth/2,canvasHeight/2);

        ctx.beginPath()
        for (i=0;i<=upperIndex;i++){
          regionID = Voyages[i].landingRegion;
          r = Voyages[i].shiftedYear*scale;
          theta = Voyages[i].rand * dRegions[regionID].percentRadians + dRegions[regionID].minRadians;
          x = r*Math.cos(theta);
          y = r*Math.sin(theta);
    //    console.log(x+ " " + y);

//          ctx.fillStyle = dRegions[regionID].color;
          ctx.moveTo(x,y);
          ctx.arc(x,y,circleSize,0,twoPi,1);

        }
        ctx.fill();
        ctx.restore();
    }

    //---update functions---

    //updateTheta - will add

    //updateArc - will add

    //ZOOM HANDLER FUNCTION
    function myZoomHandler(event){
      event.preventDefault();
      console.log("Zoom Triggered");
//      console.log(event.deltaY);
      updateDirection(event.deltaY);

      //Do nothing if already at full zoom level
      if( ((current.zoomout) && (current.year== maxYear)) ||
          ((!current.zoomout) && (current.year == minYear)) )
      {
        return;
      }
      if(current.zoomout){
        current.scrollCount++;
      }
      else{
        current.scrollCount--;
      }
      updateYear(event.deltaY);
      storeLastVisible();
      updateVisible();
      updateTextPanel();
      updateRegions();
      updateCirclePositions(); //this draws the circles too (best do do it all at once)
      if(preferences.showArcs){
        updateArcs();
      }

    }

    //KEYBOARD HANDLER
    function keyHandler(event){
      key = event.key;
      if (key=="a")
      {
        if(preferences.zoomSpeed>1){
          preferences.zoomSpeed--;
        }

      }
      else if (key =="d")
      {
        if(preferences.zoomSpeed<100)
        preferences.zoomSpeed++;
      }
      console.log(preferences.zoomSpeed);
    }

    //MOUSE CLICK HANDLER
    function mouseDownHandler(event){
      console.log("down");
      eventLog.mouseDown = true;
      eventLog.dragging=false;
      eventLog.startEvent = event;
  //    console.log(event.target);
      clickStart();
//      svgD3.append("circle").attr("cx",event.clientX).attr("cy",event.clientY-100).attr("r",15).attr("fill","blue");
    }
    function mouseMoveHandler(event){
      if(eventLog.mouseDown){
        eventLog.dragging = true;
        dragUpdate();
      }
      //svgD3.append("circle").attr("cx",event.clientX).attr("cy",event.clientY-100).attr("r",4).attr("fill","purple");
    }
    function mouseUpHandler(event){
      eventLog.mouseDown=false;
      eventLog.endEvent = event;
      if(eventLog.dragging){
        dragEnd();
        eventLog.dragging=false;
      }
      else{
        clickEnd();
      }
      console.log("up");
    //  svgD3.append("circle").attr("cx",event.clientX).attr("cy",event.clientY-100).attr("r",15).attr("fill","red");
  //    console.log(event.target);

    }
    updateCirclePositions();

    function setArcBorder(arc,clear=false){
      var newOpacity=1;
      if(clear){
        newOpacity=0;
      }
      d3.select(arc).style("stroke-opacity",newOpacity);
    }

    function clickStart(){
      eventLog.dragStart=true;
    }

    function clickEnd(){
      target = eventLog.endEvent.target;
      //If clicked on arc
      if(target.tagName="path"){
        //clicked selected arc - do nothing
        //clicked unselected arc - change selection
        if(target!=selection.current){
          //clear previous selection
          if(selection.isDefault){
          selection.isDefault = false;
          } else{
            setArcBorder(selection.current,"clear");
          }
          //set new selection
          selection.current=target;
          setArcBorder(target);
        }
      } else{ //clicked on window - clear selection
        if(!selection.isDefault){
          selection.isDefault = true;
          console.log("cleared current selection!")
        } else{
          setArcBorder(current,"clear");
        }
      }
    }

    function dragEnd(){
      console.log("finished dragging!");
    }
    function dragUpdate(){
      if (eventLog.dragStart){
        console.log("started dragging!");
        eventLog.dragStart=false;
      }
      else{
        console.log("dragging");
      }
    }
    function setup(){
      //EVENT LISTENERS
      //Add Zoom Event Listener
      svgLayer.addEventListener("wheel",myZoomHandler);
      //Click and Drag Event Listeners

  //    svgLayer.addEventListener("mousedown",mouseDownHandler);
      svgLayer.addEventListener("mousemove",mouseMoveHandler);
//      svgLayer.addEventListener("mousedown",mouseDownHandler);
//      svgLayer.addEventListener("mouseup",mouseUpHandler);
      window.addEventListener("mousedown",mouseDownHandler);
      window.addEventListener("mouseup",mouseUpHandler);
      window.addEventListener("keydown",keyHandler)
    }


    setup();
  });
});
