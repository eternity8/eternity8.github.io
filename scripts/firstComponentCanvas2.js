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

d3.csv("http://localhost/data/smallSlaveData.csv", function(myData){
  d3.csv("http://localhost/data/regions.csv", function(dRegions){

              //Test: display something to console
              console.log("Canvas Version");
              function myZoomHandler(){
                console.log("Made It!");
                return;
              }

              myCanvas.addEventListener("wheel",myZoomHandler);
    });
});
