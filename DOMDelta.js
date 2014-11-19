(function(ns) {
  var prevState = ns.prevState || [];
  var currentState = [];
  var domGUID = ns.domGUID = ns.domGUID || 0;
  var nodeTypes = [];
  
  $('body').contents().each(function processNodes() {
    var selfNode = this;
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
    
    // Record the state of affairs for the node
    currentState[thisUID] = {style: style, children:childs, dom:this};
  });
  
  console.log("NodeTypes", nodeTypes);
  console.log("Previous State", ns.prevState);
  console.log("Current State", currentState);
  
  if(prevState.length > 0) {
    console.log("Calculating Diff...");
    for(var i=0,end=currentState.length; i!=end; ++i) {
      var dom = currentState[i].dom;
      var style = currentState[i].style;
      var prevStyle = prevState[i].style;
      
      // Make sure a style was generated for our item in question
      if(style) {
        $.each(style, function(key, value) {
          if(key in prevStyle) {
            if(!(prevStyle[key] === style[key])) {
              console.log("DOM Node:", dom, "Property", key, "PREV: ", prevStyle[key], "NEW: ", style[key]);
            }
          }
          
          else {
            console.log("DOM Node:", dom, "New Property", key, "NEW: ", style[key]);
          }
        });
      }
    }
  }
  
  else {
    console.log("First frame captured, run again after making some changes to see diff");
  }
  
  ns.prevState = currentState;
  ns.domGUID = domGUID;
  
})(window.top);
