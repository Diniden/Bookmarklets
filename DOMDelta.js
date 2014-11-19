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
    var childIDs = [];
    var thisUID = -1;
    
    if(this.domDeltaID) { thisUID = this.domDeltaID; }
    else { 
      thisUID = this.domDeltaID = ns.domGUID++; 
      val += "ADDED NODE: " + this.domDeltaID + "; ";
    }
    
    if(nodeTypes.indexOf(this.nodeType) == -1) nodeTypes.push(this.nodeType);
    
    var tempstyle = window.getComputedStyle(this);
    var style = null;
    
    // Deep copy the computed style in case the function returns the same object
    if(tempstyle) {
      style = {};
      $.each(tempstyle, function(key, value) {
        style[key] = value;
      });
    }
    
    if(jqThis.contents().length > 0) {
      // Make sure children are processed first so we can get a UID for each of them
      jqThis.contents().each(processNodes);
      
      jqThis.contents().each(function() {
        childs.push(this);
        childIDs.push(this.domDeltaID);
      });
    }
    
    // Record the state of affairs for the node
    currentState[thisUID] = {style: style, children:childs, childrenIDs:childIDs, dom:this};
  });
  
  console.log("NodeTypes", nodeTypes);
  console.log("Previous State", ns.prevState);
  console.log("Current State", currentState);
  
  if(prevState.length > 0) {
    var testsRan = 0;
    console.log("Calculating Diff...");
    for(var i=0,end=currentState.length; i!=end; ++i) {
      // See if the UID exists in the prev state
      if(!(i in prevState)) {
        console.log("Added element: ", currentState[i]);
        continue;
      }
      
      var dom = currentState[i].dom;
      var style = currentState[i].style;
      var prevStyle = prevState[i].style;
      
      // Make sure a style was generated for our item in question
      if(style && prevStyle) {
        $.each(style, function(key, value) {
          if(key in prevStyle) {
            if(!(prevStyle[key] === style[key])) {
              console.log("DOM Node:", dom, "Property", key, "PREV: ", prevStyle[key], "NEW: ", style[key]);
            }
          }
          
          else {
            console.log("DOM Node:", dom, "New Property", key, "NEW: ", style[key]);
          }
          
          testsRan++;
        });
      }
      
      $.each(prevStyle, function(key, value) {
        if(!(key in style)) {
          console.log("DOM Node:", dom, "Removed Property", key, "NEW: ", style[key]);
        }
      });
    }
    console.log("Tested " + testsRan + " properties for differences.");
    
    // Now diff children additions/removals
    $.each(currentState[i].childrenIDs, function(index, value) {
      if(prevState[i].childrenIDs.indexOf(value) == -1) {
        console.log("Added child to: ", dom, "Child: ", currentState[i].children[value]);
      }
    });
    
    $.each(prevState[i].childrenIDs, function(index, value) {
      if(currentState[i].childrenIDs.indexOf(value) == -1) {
        console.log("Removed child from: ", dom, "Child: ", prevState[i].children[value]);
      }
    });
  }
  
  else {
    console.log("First frame captured, run again after making some changes to see diff");
  }
  
  ns.prevState = currentState;
  ns.domGUID = domGUID;
  
})(window.top);
