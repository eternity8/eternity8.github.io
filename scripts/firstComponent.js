
width = 350;
height = 350;
d3.select("svg").attr("width",width)
                .attr("height",height);

d3.csv("http://localhost/data/slavedata3.csv", function(myData){
              console.log(myData[0]);

              function makeRadius(year){
                return (year-1514)/352 * width/2;
              }

              function makeTheta(i){
                return i;
              }
              var mySVG = d3.select("svg");
              mySVG.call(d3.zoom().on("zoom",function(){mySVG.attr("transform","scale("+ 2 +")")}));
              var circles = mySVG.append("g").attr("transform",function(){return "translate(" + width/2 + ", " + height/2 + ")";}).selectAll("circle")
                  .data(myData).enter().append("circle");

              d3.select("svg").append("circle").attr("cx",0)
                                               .attr("cy",0)
                                               .attr("r",1)
                                               .attr("id","Middle");
              circles.attr("cx",function(d,i){return makeRadius(d.yearam)*Math.cos(makeTheta(i));})
                     .attr("cy",function(d,i){return makeRadius(d.yearam)*Math.sin(makeTheta(i));})
                     .attr("r",1);

  //            function addValToObject(myObject){myObject["newKey"]="Hello";};

  //            circles.data.addValToObject(d);

            });
