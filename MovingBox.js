
boxList = [];
var Box = function()
{
	var temp = document.createElement("div");
	temp.className="box";
	temp.style.left=50;
	temp.style.top=0;
	this.htmlBox = document.getElementById("container").appendChild(temp);
	this.hpos = 0;
	this.vpos = 0;
	this.state = 1;
	this.step = 1;
	this.moveSpeed=1;
}
Box.prototype = {
	setHPos: function(h){
		this.hpos=h;
	},
	setVPos: function(v){
		this.vpos=v;
	},
	getHPos: function(){
		return this.hpos;
	},
	getVPos: function(){
		return this.vpos;
	},
	setState: function(stateNum){
	this.state = stateNum;
	},

	getState: function(){
		return this.state;
	},
	getStep: function(){
		return this.step;
	},
	changeSpeed: function(){
		this.moveSpeed+= window.event.wheelDelta/30;
		var x = Math.pow(2,((-1/80)*(this.moveSpeed)))
		this.step= 1+ 20/(1+x);
		//	debugger;
	},
	moveBox: function(){
	//	debugger;
		var state= this.getState();
		var box = this.htmlBox;
		var nextState=state;
		var hpos = this.getHPos();
		var vpos = this.getVPos();
		var step = this.getStep();
		switch(state)
		{
			case 1:
			{
				hpos+=step;
				if(hpos>=150)
				{
					hpos=150;
					nextState=2;
					box.style.background="blue";
				}	
				break;
			}
			case 2:
			{
				vpos+=step;
				if(vpos>=150)
				{
					vpos=150;
					nextState=3;
					box.style.background="pink";
				}
				break;
			}
			case 3:
			{
				hpos-=step;
				if(hpos<=0)
				{
					hpos=0;
					nextState=4;
					box.style.background="orange";
				}
				break;
			}
			case 4:
			{
				vpos-=step;
				if(vpos<=0)
				{
					vpos=0;
					nextState=1;
					box.style.background="red";
				}	
				break;
			}
			default: {}
		}
		//update position
		box.style.left = hpos+"px";
		box.style.top  = vpos+"px";
		this.setHPos(hpos);
		this.setVPos(vpos);
		this.setState(nextState);
	},
	stopMoveBox: function(){
	//	debugger;
	clearInterval(this.loop);
	}
}

var container = document.getElementById("container");
container.loop = 1;
container.initiateMoveLoop=function(){
	self=this;
	this.loop = setInterval(self.moveBoxes,10);
	}
container.endMoveLoop=function(){
	self = this;
	clearInterval(self.loop);
}
container.changeSpeed=function(){
	for(i=0;i<boxList.length;i++)
	{
		boxList[i].changeSpeed.call(boxList[i]);
	}
}
container.moveBoxes = function(){

	for(i=0;i<boxList.length;i++)
	{
	boxList[i].moveBox.call(boxList[i]);
	}
}


container.onwheel=container.changeSpeed;
container.onmouseenter=container.initiateMoveLoop;
container.onmouseleave=container.endMoveLoop;
window.onclick = function(){var x = new Box();
				boxList.push(x);};

debugger;
		