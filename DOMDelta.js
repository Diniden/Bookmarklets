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

    var styleNames = null;
    var styleVals = null;

    // Gather attributes
    if(this.style) {
    	styleNames = [];
    	styleVals = [];

    	for (var sName in this.style) {
		  	styleNames.push(sName);
		  	styleVals.push(this.style[sName]);
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
    currentState[thisUID] = {style: style, children:childs, childrenIDs:childIDs, dom:this, styleNames:styleNames, styleVals:styleVals, attrNames:attrNames, attrVals:attrVals, classList: this.className ? this.className.split(' ') : null };
  });
  
  // console.log("NodeTypes", nodeTypes);
  // console.log("Previous State", ns.prevState);
  // console.log("Current State", currentState);
  
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
      var styleNames = currentState[i].styleNames;
      var prevStyleNames = prevState[i].styleNames;
      var styleVals = currentState[i].styleVals;
      var prevStyleVals = prevState[i].styleVals;
      var changelist = [];

      // Find class add/removals
      if(classList) {
      	if(prevClassList) {
      		// Adds
      		$.each(classList, function(index, className) {
      			if(className.trim().length > 0) {
	      			if(prevClassList.indexOf(className) == -1) {
	      				changelist.push(["Added class to: ", dom, "Class: ", className]);
	      			}
      			}
      		});
      		// Removes
      		$.each(prevClassList, function(index, className) {
      			if(className.trim().length > 0) {
	      			if(classList.indexOf(className) == -1) {
	      				changelist.push(["Removed class from: ", dom, "Class: ", className]);
	      			}
      			}
      		});
      	}

      	else {
      		changelist.push(["Added classes to: ", dom, "Classes: ", classList]);
      	}
      }

      else {
      	if(prevClassList) {
      		changelist.push(["Removed classes from: ", dom, "Classes: ", classList]);
      	}
      }

      // Find attribute add/remove/change
      if(attrNames) {
      	if(prevAttrNames) {
      		// Adds/changes
      		$.each(attrNames, function(index, attrObj) {
      			// Adds
      			if(prevAttrNames.indexOf(attrObj) == -1) {
      				changelist.push(["Added attribute", attrObj, "to:", dom, "Attribute:", attrObj]);
      			}

      			// Changes
      			else {
      				if(attrVals[index] != prevAttrVals[index]) {
      					changelist.push(["Changed attribute:", attrObj, "on:", dom, "Prev:", prevAttrVals[index], "New:", attrVals[index]]);
      				}
      			}
      		});
      		// Removes
      		$.each(prevAttrNames, function(index, attrObj) {
      			if(attrNames.indexOf(attrObj) == -1) {
      				changelist.push(["Removed attribute", attrObj, "from:", dom, "Attribute:", attrObj]);
      			}
      		});
      	}

      	else {
      		changelist.push(["Added attributes to: ", dom, "Attributes: ", attrNames, attrVals]);
      	}
      }

      else {
      	if(prevAttrNames) {
      		changelist.push(["Removed attributes from: ", dom, "Attributes: ", prevAttrNames]);
      	}
      }

      // Find style add/remove/change
      if(styleNames) {
      	if(prevStyleNames) {
      		// Adds/changes
      		$.each(styleNames, function(index, styleObj) {
      			// Adds
      			if(prevStyleNames.indexOf(styleObj) == -1) {
      				changelist.push(["Added style:", styleObj, "to:", dom]);
      			}

      			// Changes
      			else {
      				if(styleVals[index] != prevStyleVals[index]) {
      					changelist.push(["Changed style:", styleObj, "on:", dom, "Prev:", prevStyleVals[index], "New:", styleVals[index]]);
      				}
      			}

      			testsRan++;
      		});
      		// Removes
      		$.each(prevStyleNames, function(index, styleObj) {
      			if(styleNames.indexOf(styleObj) == -1) {
      				changelist.push(["Removed style:", styleObj, "from:", dom]);
      			}
      		});
      	}

      	else {
      		changelist.push(["Added styles:", styleNames, "to:", dom, "Values: ", styleVals]);
      	}
      }

      else {
      	if(prevStyleNames) {
      		changelist.push(["Removed styles from: ", dom, "Styles: ", prevStyleNames]);
      	}
      }
      
      // Now diff children additions/removals
      $.each(currentState[i].childrenIDs, function(index, value) {
        if(prevState[i].childrenIDs.indexOf(value) == -1) {
          changelist.push(["Added child to: ", dom, "Child: ", currentState[i].children[index]]);
        }
      });
      $.each(prevState[i].childrenIDs, function(index, value) {
        if(currentState[i].childrenIDs.indexOf(value) == -1) {
          changelist.push(["Removed child from: ", dom, "Child: ", prevState[i].children[index]]);
        }
      });

      if(changelist.length > 0) {
      	var changelistSummaries = [];
      	$.each(changelist, function(index, value) {
      		changelistSummaries.push(changelist[index].join(" "));
      		changelistSummaries.push(changelist[index]);
      	});
      	console.log("ELEMENT:", dom, "CHANGES:", {changes: changelistSummaries});
      }
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

console.log("DOM delta", "1.0.2");
