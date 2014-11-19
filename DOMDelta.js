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

    var attrNames = null;
    var attrVals = null;

    // Gather attributes
    if(this.attributes) {
    	attrNames = [];
    	attrVals = [];

    	for (var i = 0; i < this.attributes.length; i++) {
		  var attrib = this.attributes[i];
		  if (attrib.specified) {
		  	attrNames.push(attrib.name);
		  	attrVals.push(attrib.value);
		  }
		}
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
    currentState[thisUID] = {style: style, children:childs, childrenIDs:childIDs, dom:this, attrNames:attrNames, attrVals:attrVals, classList: this.className ? this.className.split(' ') : null };
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

      if(currentState[i]) {}
      else { console.log("POSSIBLY REMOVED: Undefined current state element"); continue; }
      
      var dom = currentState[i].dom;
      var style = currentState[i].style;
      var prevStyle = prevState[i].style;
      var classList = currentState[i].classList;
      var prevClassList = prevState[i].classList;
      var attrNames = currentState[i].attrNames;
      var prevAttrNames = prevState[i].attrNames;
      var attrVals = currentState[i].attrVals;
      var prevAttrVals = prevState[i].attrVals;

      // Find class add/removals
      if(classList) {
      	if(prevClassList) {
      		// Adds
      		$.each(classList, function(index, className) {
      			if(className.trim().length > 0) {
	      			if(prevClassList.indexOf(className) == -1) {
	      				console.log("Added class to: ", dom, "Class: ", className);
	      			}
      			}
      		});
      		// Removes
      		$.each(prevClassList, function(index, className) {
      			if(className.trim().length > 0) {
	      			if(classList.indexOf(className) == -1) {
	      				console.log("Removed class from: ", dom, "Class: ", className);
	      			}
      			}
      		});
      	}

      	else {
      		console.log("Added classes to: ", dom, "Classes: ", classList);
      	}
      }

      else {
      	if(prevClassList) {
      		console.log("Removed classes from: ", dom, "Classes: ", classList);
      	}
      }

      // Find attribute add/remove/change
      if(attrNames) {
      	if(prevAttrNames) {
      		// Adds/changes
      		$.each(attrNames, function(index, attrObj) {
      			// Adds
      			if(prevAttrNames.indexOf(attrObj) == -1) {
      				console.log("Added attribute to: ", dom, "Attribute: ", attrObj);
      			}

      			// Changes
      			else {
      				if(attrVals[index] != prevAttrVals[index]) {
      					console.log("Changed attribute on: ", dom, "Prev: ", prevAttrVals[index], "New: ", attrVals[index]);
      				}
      			}
      		});
      		// Removes
      		$.each(prevAttrNames, function(index, attrObj) {
      			if(attrNames.indexOf(attrObj) == -1) {
      				console.log("Removed attribute from: ", dom, "Attribute: ", attrObj);
      			}
      		});
      	}

      	else {
      		console.log("Added attributes to: ", dom, "Attributes: ", attrNames, attrVals);
      	}
      }

      else {
      	if(prevAttrNames) {
      		console.log("Removed attributes from: ", dom, "Attributes: ", prevAttrNames);
      	}
      }
      
      // Make sure a style was generated for our item in question
      if(style && prevStyle) {
        // Find changed and added properties
        $.each(style, function(key, value) {
          if(key in prevStyle) {
            if((prevStyle[key] != style[key])) {
              console.log("DOM Node:", dom, "Property", key, "PREV: ", prevStyle[key], "NEW: ", style[key]);
            }
          }
          
          else {
            console.log("DOM Node:", dom, "New Property", key, "NEW: ", style[key]);
          }
          
          testsRan++;
        });
        
        // Find removed properties
        $.each(prevStyle, function(key, value) {
          if(!(key in style)) {
            console.log("DOM Node:", dom, "Removed Property", key, "NEW: ", style[key]);
          }
        });
      }
      
      // Now diff children additions/removals
      $.each(currentState[i].childrenIDs, function(index, value) {
        if(prevState[i].childrenIDs.indexOf(value) == -1) {
          console.log("Added child to: ", dom, "Child: ", currentState[i].children[index]);
        }
      });
      $.each(prevState[i].childrenIDs, function(index, value) {
        if(currentState[i].childrenIDs.indexOf(value) == -1) {
          console.log("Removed child from: ", dom, "Child: ", prevState[i].children[index]);
        }
      });
    }
    
    console.log("Tested " + testsRan + " properties for differences.");

    // CLean out UIDs and reset the diff capture
    ns.prevState = null;
    ns.domGUID = null;


    $('body').contents().each(function cleanNodes() {
    	var jqNode = $(this);
    	this.domDeltaID = null;
    	if(jqNode.contents().length > 0) jqNode.contents().each(cleanNodes);
    });
  }
  
  else {
    console.log("First frame captured, run again after making some changes to see diff");
    ns.prevState = currentState;
  	ns.domGUID = domGUID;
  }
  
  
  
})(window.top);
