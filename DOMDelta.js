(function(ns) {
  var prevState = ns.prevState || [];
  var currentState = [];
  var domGUID = ns.domGUID || 0;
  var nodeTypes = [];
  
  $('body').contents().each(function processNodes() {
    var jqThis = $(this);
    var val = "";
    var childs = [];
    var thisUID = -1;
    
    if(this.domDeltaID) { thisUID = this.domDeltaID; }
    else { 
      thisUID = this.domDeltaID = ns.domGUID++; 
      val += "ADDED NODE: " + this.domDeltaID + "; ";
    }
    
    if(nodeTypes.indexOf(this.nodeType) == -1) nodeTypes.push(this.nodeType);
    
    var style = window.getComputedStyle(this);
    
    if(jqThis.contents().length > 0) {
      // Make sure children are processed first so we can get a UID for each of them
      jqThis.contents().each(processNodes);
      
      jqThis.contents().each(function() {
        childs.push(this);
      });
    }
    
    currentState[thisUID] = {style: style, children:childs};
  });
  
  console.log("NodeTypes", nodeTypes);
  console.log("Previous State", ns.prevState);
  console.log("Current State", currentState);
  ns.prevState = currentState;
  ns.domGUID = domGUID;
  
})(window.top);
