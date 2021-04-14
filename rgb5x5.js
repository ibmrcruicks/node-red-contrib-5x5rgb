var state = false;

const RGB5x5 = require("./rgb5x5matrix.js");

module.exports = function(RED) {
    "use strict"

    function rgb5x5NodeOut(n) {

        RED.nodes.createNode(this,n);

        this.bus = n.bus;
        this.address = n.address;
        this.command = n.command;
	this.color = n.color;
	this.across = n.across;
	this.down = n.down;
        this.matrix = new RGB5x5(parseInt(this.bus), parseInt(this.address));	
        var node = this;

	node.matrix.Initialize();


node.on("input", function(msg) {
	var cmd = node.command;
        if (cmd === "msg") {
		if(!(typeof msg.payload === "string") || (msg.payload.length == 0)) {
			node.error(`RGB5x5 : command in msg.payload missing`);
			return 0;
		} 
                cmd = msg.payload;
	}

        if (cmd === "on") {  
		node.matrix.DisplayOn();
		return;
	}
	if (cmd === "off") {
		node.matrix.DisplayOff();
		return;
	}
	if (cmd === "clear") {
		node.matrix.DisplayClear();
		return;
	}
	if (cmd === "pixel") {
		if(msg.matrix) {
			var pixel= msg.matrix;
			if(Array.isArray(msg.matrix)){
				pixel=msg.matrix[0];
			}
			if( ("x" in pixel) && ("y" in pixel) && ("color" in pixel)) {
				node.matrix.SetPixelColor(pixel.x,pixel.y,pixel.color);
			}
			return;
		}
		if(("across" in node) && ("down" in node) && ("color" in node)) {
			node.matrix.SetPixelColor(node.across,node.down,node.color);
			return;
		}
		
	}
	if (cmd === "display") {
		if(msg.matrix) {
			if(!Array.isArray(msg.matrix) || !(msg.matrix.length == 1 || msg.matrix.length == 25)){
				node.error('RGB5x5 : missing/invalid display matrix');
				return;
			}
			node.matrix.ShowMatrix(msg.matrix);
			return;
		}
		if(node.color) {
			node.matrix.ShowMatrix( [node.color] );
			return;
		}
	}            
	node.error(`unknown command ${node.command}`);
});
node.on('close', function() {
	console.log("RGB5x5 : turning off");
	node.matrix.DisplayOff();
});
}
    RED.nodes.registerType("rgb5x5",rgb5x5NodeOut);
}
