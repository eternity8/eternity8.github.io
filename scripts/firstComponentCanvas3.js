//Globals

//DOM and D3 Elements
var canvas = document.getElementById("myCanvas");
var svgLayer = document.getElementById("svgLayer");
var container = svgLayer;
var svgD3 = d3.select("#svgLayer");
var groupD3 = svgD3.append("g");
var subSelectionD3 = svgD3.append("path").attr("id","subSelection")
    subSelectionD3.attr("clip-path","url(#clipRegion)")
                  .attr("fill-rule", "evenodd")
                  .attr("fill-opacity",0.6)
                  .attr("fill","gray")
                  .attr("stroke","#4d4d4d")
                  .attr("stroke-width",5);
var subSelection = document.getElementById("subSelection");
var useClipD3 = d3.select("#useRegion");
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

//Bar chart preferences
var chartPrefs = {
  regionWidth: 60,
  barThickness: 0.8,
  offsetX: 100,
  offsetY: 600,
  yBarScale: 1,
  maxBarHeight: 300,
  fixedScale:false
};


var data1 = [1,0,0,0,0,0,0,0];

var chartContainerD3 = d3.select("body").append("svg").attr("id","chartContainer");
var chartContainer = document.getElementById("#chartContainer");
chartContainerD3.attr("width",600).attr("height",600);
var bars = chartContainerD3.selectAll("rect").data(data1).enter().append("rect");
chartContainerD3.style("visibility","hidden");



//EssentialSlaveData variables: yearam, embarked, disembarked, rand, landingRegion, baseRadius, shiftedYear
d3.csv("data/essentialSlaveData.csv", function(Voyages){
  //Regions variables: regionName, percentVisible, percentRadians, minRadians, maxRadians, color
  d3.csv("data/regions.csv", function(dRegions){

    console.log("Canvas Re-Write!");








    //---pseudo-globals---
    var totalVoyages = Voyages.length;
    var scaledYear = 1514;
    var arcsD3=groupD3.selectAll("path").data(dRegions).enter().append("path").attr("id",function(d,i){return "arcR"+i;});


    //Visible Objects - Stores information about current visible selection

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
    //Data on selected and sub selected regions (for interactivity)
    var selection = {
      isDefault: true,
      subSelected: true,
      current: "default",
    //  currentRegion: NaN, Note: plan to implement this so I can change color of dots based on selection
      currentID: "#defaultClip", //for selectors (clipPath-use(currentID))
      //subYear values are stored once dragging complete (dragEnd)
      subLowerYear: 0,
      subUpperYear: 0,
      //Temporary sub-selections used while clicking/dragging
      //stored as relative co-ordinates
      tempSubDimensions: {
        //Note: tempR1 could be smaller than tempR2
        startYear: 1514,
        tempR1: 0,
        tempR2: 0,
        tempX1: 0,
        tempY1: 0,
        tempX2: 0,
        tempY2: 0
      },
      //Dimensions of current subselection
      subDimensions: {
        //dragRad values are temporarily stored radii while dragging
        R1: 0,      //copied from tempR1 on dragStart
        R2: 0,
        x1: 0,
        y1: 0
      }
    };
    //Stores data from input events, used in mouse click and drag detection
    var eventLog = {
      mouseDown: 0,
      dragStart: 0,
      zoomDrag: false,
      isDragging: false,
      dragCount: 0,
      startEvent: undefined,
      draggingEvent: undefined,
      endEvent: undefined

    };
    //preferences
    var preferences = {
      //adjust zoom scaling method (true: add/minus years, false: times/divide current year by factor)
      zoomIsLinear: true,
      zoomSpeed: 4,
      minDragCount: 2,
      //toggles whether scroll speed affects zoom speed
      useDelta: true,
      showArcs: true,
      showColors: true
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

    (function regionDataPointers(){
      for (i=0;i<8;i++){
        dRegions[i].indexList = [];

      }
      for (i=0;i<totalVoyages;i++){
        var regionID = Voyages[i].landingRegion;
        dRegions[regionID].indexList.push(i);
      }
      for (i=0;i<8;i++){
        dRegions[i].totalRegion = dRegions[i].indexList.length;
      }
    })();

    //Legend Creation - executes once at start
    (function createLegend(){
    var legendDiv = d3.select("#legend");
    legendDiv.append("h3").text("Region of Slave Landing");
    legendgroups = legendDiv.append("svg").attr("height",600).attr("width",200).selectAll("g").data(dRegions).enter().append("g")
    legendgroups.attr("transform",function(d,i){return "translate( " +Math.floor(i/legendPerColumn) *(2*legendRectSpacing+legendRectWidth+legendTextWidth)+", " +(legendRectWidth+legendRectSpacing)*(i%legendPerColumn)+")";});
    rectangles = legendgroups.append("rect").attr("fill",function(d){return d.color;}).attr("width",legendRectWidth).attr("height",legendRectWidth);
    legendText = legendgroups.append("text").text(function(d){return d.regionName;}).attr("x",legendRectWidth+legendRectSpacing).attr("y",legendRectWidth-legendRectSpacing);
    legendDiv.select("svg").attr("height",legendPerColumn*(legendRectWidth+legendRectSpacing)).attr("width",(legendRectWidth+legendTextWidth+legendRectSpacing*2)*2);
  ``})();



    //makeRadius and makeTheta only used in initial data setup -overridden

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
        //Faster Scrolling advances year faster
        if (preferences.useDelta){
          yearStep += (Math.abs(deltaY/50));
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
      current.year = Math.ceil(current.year);
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
      drawChartData(visible.regionCount);
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
      //Use large arc if arc angle is greater than pi
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
            .style("stroke-width",5).attr("class","arc");
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
        circleSize=scale*0.8;
      //  console.log(circleSize);
        var x, y, theta, r, color, regionID, length, region,voyage;
        ctx.clearRect(0,0,canvasWidth,canvasHeight);
        ctx.save();
        ctx.translate(canvasWidth/2,canvasHeight/2);
        //New Painting Implementation based on regions
        for (rID=0;rID<8;rID++){
          region = dRegions[rID];
          length = visible.regionCount[rID];
          //set circle fill color
          if(preferences.showColors){
            //  if(selection.currentRegion==rID)
              ctx.fillStyle = region.color;
          }
          ctx.beginPath();
          for (i=0;i<length;i++){
            voyage=Voyages[region.indexList[i]];
            r = voyage.shiftedYear*scale;
            if(preferences.showArcs){
              theta = voyage.rand*region.percentRadians+region.minRadians;
            }
            else{
              theta = voyage.rand*twoPi;
            }
            x = r*Math.cos(theta);
            y = r*Math.sin(theta);
            ctx.moveTo(x,y);
            ctx.arc(x,y,circleSize,0,twoPi,1);
          }
          ctx.fill();
          ctx.closePath();
        }
/*        //old painting implementation
        ctx.beginPath();
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
        ctx.fill(); */
        ctx.restore();
    }
    function zoomSubSelection(event){
      //Note: should add that on zoomDrag end, if startYear greater than viewradius, zoom out to startYear (i.e. make current.year=startYear)
      if(eventLog.mouseDown){
        // IMPLEMENT PROPERLY LATER
        if (!eventLog.zoom){
          eventLog.zoomDrag=true;
          eventLog.isDragging=true;
          selection.subSelected=true;

        }

        mouseMoveHandler(event);
        selection.tempSubDimensions.tempR1 = yearToRadius(selection.tempSubDimensions.startYear);
      }
      else if(selection.subUpperYear>current.year){
          clearSubSelection();
        }
     else if(selection.subSelected){
        selection.tempSubDimensions.tempR1 = yearToRadius(selection.subUpperYear);
        selection.tempSubDimensions.tempR2 = yearToRadius(selection.subLowerYear);
        drawSubRegion();
        }
    }

    function zoomToYear(year){
      console.log("pretend it just zoomed to start year!");
      //Note: THIS DOES NOTHING YET, BUT SHOULD DO SOMETHING
      //Will zoom to the specified year in a way compatible with the existing functions


    }

    //---update functions---

    //updateTheta - will add

    //updateArc - will add
    function preZoomHandler(event){
      d3.select("#scrollHere").style("visibility","hidden");
      myZoomHandler(event);
    }
    //ZOOM HANDLER FUNCTION
    function myZoomHandler(event){
      event.preventDefault();
    //  console.log("Zoom Triggered");
//      console.log(event.deltaY);
      updateDirection(event.deltaY);

      //Do nothing if already at full zoom level
      if( ((current.zoomout) && (current.year== maxYear)) ||
          ((!current.zoomout) && (current.year == minYear)) )
      {
        return;
      }
      //Update scroll count
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
      zoomSubSelection(event);
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
      else if (key =="b"){

        chartContainerD3.style("visibility","visible");

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
      eventLog.isDragging=false;
      eventLog.startEvent = event;
      console.log("startEventID: " + d3.select(event.target).attr("id"));
      eventLog.dragStart=true;
  //    console.log(event.target);
      clickStart();
//      svgD3.append("circle").attr("cx",event.clientX).attr("cy",event.clientY-100).attr("r",15).attr("fill","blue");
    }
    function mouseMoveHandler(event){
      if(eventLog.mouseDown){
        if((eventLog.dragCount>preferences.minDragCount)||(eventLog.zoomDrag==true)){
          eventLog.isDragging = true;
          eventLog.draggingEvent = event;
      //    console.log("moving");
      //    console.log(event.target);
          dragUpdate();
        }
        else{
          eventLog.dragCount++;
        }
      }

      //svgD3.append("circle").attr("cx",event.clientX).attr("cy",event.clientY-100).attr("r",4).attr("fill","purple");
    }
    function mouseUpHandler(event){
      eventLog.mouseDown=false;
      eventLog.endEvent = event;
      eventLog.dragStart=false;

      eventLog.dragCount=0;
      if(eventLog.isDragging){
        dragEnd();
        eventLog.isDragging=false;
        eventLog.zoomDrag=false;
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
    function processMousePos(mouseX,mouseY){
      //console.log("Initial: " + mouseX + " "+ mouseY);
      //Convert to relative coordinates
      var relPos = toRelativePos([mouseX,mouseY]);
      var x1 = relPos[0];
      var y1 = relPos[1];
      //Calculate distance from centre (radius)
      var rad = mouseToRadius(x1,y1);
      //console.log("Before: " + x1 + " " + y1 + " " + rad);
      //cap max radius at viewradius (adjust point to (280,0) if outside range)
      if(rad>viewradius){
        rad = viewradius;
        x1 = canvasWidth/2;
        y1 = canvasWidth/2-viewradius;
      }
      //console.log("After: " + x1+" "+ y1 + " " + rad);
      return [x1,y1,rad];
    }
    //Note current implemented input is array [x,y]
    function toRelativePos(rawInputPos){
      var convertedPos = [0,0];
      //x shift
      convertedPos[0] = rawInputPos[0];
      //y shift
      convertedPos[1] = rawInputPos[1]-50; //note: based on current css, (also - need to factor in window scroll)
      return convertedPos;
    }

    //Note: based on relative coordinates, call toRelativePos first for absolute co-ordinates
    function mouseToRadius(xpos,ypos){
      //Radius calculation - distance formula, should add newton approximation for faster version.
      centre = canvasWidth/2;
      var radius = Math.sqrt(Math.pow((centre - xpos),2)+Math.pow((centre - ypos),2));
      return radius;
      //Note: current implementation changes x and y if r greater than view rad
    }
    console.log("MouseToRadius: " +mouseToRadius(301,20));
    function yearToRadius(year){
      var radius = (year-1514)*(viewradius/(current.year-1513));
      return radius;
    }

    function radiusToYear(radius,floor=true){
      var year;
      //Accounts for adjustment by one (1513) used elsewhere
      if(radius==280){
        year = current.year;
      }
      else{
        year = (radius/viewradius)*(current.year-1513)+1514;
      }
      return Math.floor(year); //note: will be slightly out if current year is not matched to match viewrad
    }

    function clickStart(){
      //get mouse position
      var mouseX = eventLog.startEvent.clientX;
      var mouseY = eventLog.startEvent.clientY;
      //return relative co-ordinates and calculated radius, capped at viewradius
      var cleanXYR = processMousePos(mouseX,mouseY);
      //store adjusted coordinates and radius
      selection.tempSubDimensions.tempX1=cleanXYR[0];
      selection.tempSubDimensions.tempY1=cleanXYR[1];
      selection.tempSubDimensions.tempR1=cleanXYR[2];
      console.log("cleanRad: " + cleanXYR[2]);
      console.log("radActive: " + radiusToYear(279.99));
      console.log("radView: " + radiusToYear(280));
      console.log("radOut: " + radiusToYear(280.01));
      console.log("radVeryOut: " + radiusToYear(400));
      selection.tempSubDimensions.startYear = radiusToYear(cleanXYR[2]);
    }
    function toggleArcs(){
      preferences.showArcs = !(preferences.showArcs);
      var arcs = d3.selectAll(".arc");
      if (preferences.showArcs){
        updateArcs();
        updateCirclePositions();
        arcs.style("visibility","visible");
      }
      else {
        arcs.style("visibility","hidden");
        clearSelection();
      }
      updateCirclePositions();
      toggleLegend();
    }

    function toggleColors(forceOn=false){
      if(forceOn){
        preferences.showColors= true;
      }
      else{
        preferences.showColors=(!preferences.showColors);
      }

      updateCirclePositions();
      toggleLegend();
    }

    function toggleLegend(){
      if (preferences.showColors || preferences.showArcs){
        d3.select("#legend").style("visibility","visible");
      }
      else {
        d3.select("#legend").style("visibility","hidden");
      }
    }
    function clickEnd(){
      var target = eventLog.endEvent.target;
      var targetClass = d3.select(target).attr("class");
      var targetID = d3.select(target).attr("id");
      console.log("ClickEnd target: " + target);
      console.log("ClickEnd targetID: "+targetID);
      console.log("ClickEnd target class: "+targetClass);
      console.log("currentSelection: " +selection.current);
      if(targetID=="button1"){
        toggleArcs();
        return;
      }
      else if(targetID=="button2"){
        toggleColors();
        return;
      }
      //If clicked on arc
      else if(targetClass=="arc"){
        //clicked selected arc - do nothing

        if(target==selection.current){
          toggleSubSelection();
        }
        //clicked unselected arc - change selection
        else{
          //clear previous selection
          if(selection.isDefault){
          selection.isDefault = false;
          //showSubSelection();
          } else{
            setArcBorder(selection.current,"clear");
          }
          //set new selection
          selection.current=target;
          selection.currentID="#"+ d3.select(target).attr("id");
        /*  if(d3.select(target).matches(".arc")){
          //  selection.currentRegion = d3.select(target).data.regionID
        }*/

          console.log("selectionID: "+selection.currentID);
          setArcBorder(target);
          console.log("Clipping Region!");
         clipSubRegion();
        }
      }
      else if(targetID=="subSelection"){
        hideSubSelection();
      }
      else{ //clicked on window - clear selection
          clearSelection();
        }
    }
    function toggleSubSelection(){
      var status = selection.subStatus;
      if (status=="visible"){
        hideSubSelection();
      }
      else if (status=="hidden"){
        showSubSelection();
      }
      else if (status=="cleared"){
        //do Nothing
      }
    }
    function clearSelection(){
      if(!selection.isDefault){
        currentSelection = selection.current;
        selection.isDefault = true;
        setArcBorder(currentSelection,"clear");
        selection.current = "default";
      }
      clipSubRegion();
      hideSubSelection();
    }

    function hideSubSelection(){
      subSelectionD3.attr("visibility","hidden");
      selection.subStatus = "hidden";
    }
    function showSubSelection(){
      subSelectionD3.attr("visibility", "visible");
      selection.subStatus = "visible";
    }
    function clearSubSelection(){
      subSelectionD3.attr("visibilty","hidden");
      subSelectionD3.attr("d","");
      selection.subStatus = "cleared";
      selection.subSelected = false;
    }
    function updateSubDimensions(){
      var r1 = selection.tempSubDimensions.tempR1;
      var r2 = selection.tempSubDimensions.tempR2;
      var lowerR = Math.min(r1,r2);
      var upperR = Math.max(r1,r2);
      selection.subLowerYear=radiusToYear(lowerR);
      selection.subUpperYear=radiusToYear(upperR);
      selection.subDimensions.R1= lowerR;
      selection.subDimensions.R2= upperR;
    }
    function dragEnd(){
      var startTarget = eventLog.startEvent.target;
      var endTarget = eventLog.endEvent.target;
      console.log("End Target Object: " + endTarget);
      console.log("End Target ID: " + d3.select(endTarget).attr("id"));
      var startedOff = startTarget.matches("#svgLayer");
      var endedOff = endTarget.matches("#svgLayer");
      if((startedOff && endedOff)&&(!eventLog.zoomDrag)){
        console.log("Didn't Update Sub Dimensions!");
      }
      else
      {
        //Zoom out if necessary so entire sub selection is in view
        //Only important at end of a zoomDrag
        if (selection.subUpperYear > current.year){
          zoomToYear(current.year);
        }

        updateSubDimensions();
        console.log("finished dragging!");
        console.log("Year Lower: " + selection.subLowerYear);
        console.log("Year Upper: " + selection.subUpperYear);
      }
    }
    function dragUpdate(){
      //get mouse position
      var mx = eventLog.draggingEvent.clientX;
      var my = eventLog.draggingEvent.clientY;
      //process coordinates
      var cleanXYR = processMousePos(mx,my);

      //Special tasks when dragging first starts
      if (eventLog.dragStart){
        selection.subSelected=true; //need to FIX THIS - just put it here temporarily. Never goes back to false.
        selection.subStatus="visible";
        showSubSelection();
        console.log("started dragging!");
        eventLog.dragStart=false;
        //Note: Possibly transfer X1,Y1 and r1 from tempSubDimensions to subDimensions on dragStart
      }
      else{
        console.log("dragging");
      }

      //store processed data in tempSubDimensions
      selection.tempSubDimensions.tempX2 = cleanXYR[0];
      selection.tempSubDimensions.tempY2 = cleanXYR[1];
      selection.tempSubDimensions.tempR2 = cleanXYR[2];
      drawSubRegion();
    }

    function drawSubRegion(){
      //note: sub-region clip path is not inside the normal svg <g> translation
      //note: currently drawing temp selection (while dragging), not final selection
      var r1 = selection.tempSubDimensions.tempR1;
      var r2 = selection.tempSubDimensions.tempR2;
      var centre = 300;
      var endX1 = centre+r1*Math.cos(twoPi-0.01);
      var endY1 = centre+r1*Math.sin(twoPi-0.01);
      var endX2 = centre+r2*Math.cos(twoPi-0.01);
      var endY2 = centre+r2*Math.sin(twoPi-0.01);

      //Move: M xStartPos yStartPos
      //Arc: A xradius yradius Xrotation largeArcFlag sweepFlag xFinishPos yFinishPos
      subSelectionD3.attr("d","M " + (centre +r1) + " " + centre +
                              " A " + r1 + " " + r1 + " 0 1 1 " + (endX1) + " " + (endY1) + " z" +
                              " M " + (centre+r2) + " " + centre +
                              " A " + r2 + " " + r2 + " 0 1 1 " + (endX2) + " " + (endY2) + " z");

    }

    function clipSubRegion(){
      console.log(selection.subSelected);
      if((!selection.isDefault)){
        console.log("changing clip Path");
        useClipD3.attr("xlink:href",selection.currentID);
      }
      else{
        console.log("clearing clip Path");
        useClipD3.attr("xlink:href","#defaultClip");
      }
    }
//    drawSubRegion();
    clipSubRegion();
    function setup(){
      //EVENT LISTENERS
      //Add Zoom Event Listener
      svgLayer.addEventListener("wheel",preZoomHandler);
      //Click and Drag Event Listeners
      document.getElementById("scrollHere").addEventListener("wheel",preZoomHandler);
  //    svgLayer.addEventListener("mousedown",mouseDownHandler);
      svgLayer.addEventListener("mousemove",mouseMoveHandler);
//      svgLayer.addEventListener("mousedown",mouseDownHandler);
//      svgLayer.addEventListener("mouseup",mouseUpHandler);
      window.addEventListener("mousedown",mouseDownHandler);
      window.addEventListener("mouseup",mouseUpHandler);
      window.addEventListener("keydown",keyHandler)
    }


    function updateBars(){
      var maxdata = d3.max(visible.regionCount);
      console.log(maxdata);
      var barThickness = chartPrefs.barThickness;
      var regionWidth = chartPrefs.regionWidth;
      var barHeight;
      var regionLeft, regionMid,barLeft;
      var barWidth = regionWidth*barThickness;

      bars.attr("x",function(d,i){return (chartPrefs.offsetX + regionWidth*(i+1/2-barThickness/2));})
          .attr("y",function(d,i){return (chartPrefs.offsetY - (d/(maxdata))*chartPrefs.maxBarHeight);})
          .attr("width",regionWidth*barThickness)
          .attr("height", function(d,i){return (d/maxdata)*chartPrefs.maxBarHeight;})
          .attr("fill",function(d,i){return dRegions[i].color;});
    }
    function drawChartData(regiondata){
      bars.data(regiondata);
      updateBars();
    }
    updateBars();
    setup();
  });
});
