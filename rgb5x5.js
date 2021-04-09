var state = false;

module.exports = function(RED) {
    "use strict"

    function rgb5x5NodeOut(n) {
        RED.nodes.createNode(this,n);

        this.bus = n.bus;
        this.address = n.address;
        this.command = n.command;
        this.matrix = require("rgb5x5matrix.js");
      
        var node = this;
        node.on("input", function(msg) {
                            if (node.command === "msg") {
                              node.command = msg.payload;
                            }
                            if (node.command === "on") {  
                              node.matrix.on();
                            }
                            if (node.command === "off") {
                              node.matrix.off();
                            }
                            if (node.command === "clear") {
                              node.matrix.clear();
                            }
                            if (node.command === "setPixel") {
                            }
                            if (node.command === "displayMatrix") {
                            }            
                            if (node.command === "msg") {
                              node.warn(`checking contents of ${msg.payload}`);
                            }
                        }
                    });
        }
        node.on('close', function() {
            node.matrix.off();
        });
    }
    RED.nodes.registerType("rgb5x5",rgb5x5NodeOut);
}
