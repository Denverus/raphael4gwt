/*
 * raphael extensions made by sgurin.
 * 
 * 
 * new shapes: 
 * 
 * printLetters() - print() that return a set of letters and support for text onpath.
 * 
 * 
 * set operations: 
 * 
 * union, intersect, etc
 * 
 * 
 * transformation / filters : 
 * 
 * the only one that support both svg and vml containers are blur() and emboss(). the
 * rest only support SVG, like convolution, color matrix, etc.
 *  
 * @author: sgurin
 */

(function() {
	/**
	 * do the job of putting all letters in a set returned bu printLetters in a path
	 * @param p - can be a rpahael path obejct or string
	 */
	var _printOnPath = function(text, paper, p) {
		if(typeof(p)=="string")
			p = paper.path(p).attr({stroke: "none"});
		for ( var i = 0; i < text.length; i++) {		
			var letter = text[i];
			var newP = p.getPointAtLength(letter.getBBox().x);
			var newTransformation = letter.transform()+
			 	"T"+(newP.x-letter.getBBox().x)+","+
		        (newP.y-letter.getBBox().y-letter.getBBox().height);		
			//also rotate the letter to correspond the path angle of derivative
		    newTransformation+="R"+
		        (newP.alpha<360 ? 180+newP.alpha : newP.alpha);
		    letter.transform(newTransformation);
		}
		text._rm_topathPath=p;
	};
	
	/** print letter by letter, and return the set of letters (paths), just like the old raphael print() method did. */
	Raphael.fn.printLetters = function(x, y, str, font, size, 
			letter_spacing, line_height, onpath) {
		letter_spacing=letter_spacing||size/1.5;
		line_height=line_height||size;
		this.setStart();
		var x_=x, y_=y;
		for ( var i = 0; i < str.length; i++) {
			if(str.charAt(i)!='\n') {
				var letter = this.print(x_,y_,str.charAt(i),font,size);
				x_+=letter_spacing;				
			}
			else {
				x_=x;
				y_+=line_height;
			}
		}
		var set = this.setFinish();
		if(onpath) {
			_printOnPath(set, this, onpath);
		}
		return set;
	};	
	
})();


/* set operations - very inefficient because raphael sets are arrays and not objects (maps-sets) */
(function() {
	/**
	 * so users can change the meaning of belonging to a set
	 * @param s1
	 * @param s2
	 * @returns
	 */
	Raphael.st._elEquals=function(s1, s2) {
		return s1==s2;
	};
	/**
	 * 
	 * @param el
	 * @returns
	 */
	Raphael.st.contains = function(el) {
		for(var i = 0; i < this.length; i++) 
			if(Raphael.st._elEquals(this[i], el))
				return true;		
		return false;
	};
	Raphael.st.containsAll = function(other) {
		//TODO
	};
	/**
	 * @returns a new set that is the intersection of this and the other set param
	 */
	Raphael.st.intersect = function(other) {
		if(!other)return[];
		var ret = this.paper.set();
		for(var i = 0; i < this.length; i++) {
			if(other.contains(this[i]))
				ret.push(this[i]);
		}
		return ret;
	};	
	/**
	 * @returns this plus other set els added
	 */
	Raphael.st.add = function(other) {
		if(!other)return this;
		for(var i = 0; i < other.length; i++) 
			if(!this.contains(other[i]))
				this.push(other[i]);
		return this;
	};
	/**
	 * @returns this with other set els removed
	 */
	Raphael.st.substract = function(other) {
		if(!other)return this;
		for(var i = 0; i < other.length; i++) 
			if(this.contains(other[i]))
				this.exclude(other[i]);
		return this;
	};	
	/**
	 * @return this set with all elements for which f return true removed.
	 */
	Raphael.st.remove = function(f) {
//		window.alert(this.length);
		var set = this;
		this.forEach(function(el, idx) {
			var result = f(el, idx);
			result = typeof(result)=="object" ? (result+"")=="true" : result;
//			window.alert("set: "+set+", el: "+el+", result: "+result);
			if(result) {
				set.exclude(el);
//				alert("excluded! "+typeof(el)+" - "+typeof(false));
			}
			return true;
		});
		
//		for ( var i = 0; i < this.length; i++) {
//			var result = f(this.items[i],i);
////			alert
//			if(this.items[i] && result) {
//				this.exclude(this.items[i]);
//			}
//		}
		return set;
	};
})();






/* attribute change notifications. use like this:
 * circle1.addAttrChangeListener("transform", function(attrName, oldValue, newValue){
 * ...
 * })
 *  */
(function() {
	Raphael.st._attrChangeListeners = Raphael.el._attrChangeListeners = {};
	Raphael.st.addAttrChangeListener = Raphael.el.addAttrChangeListener = 
		function(attr, tl) {
		if(!this._attrChangeListeners[attr])
			this._attrChangeListeners[attr]=[];
		this._attrChangeListeners[attr].push(tl);
	};
	Raphael.st.___attr = Raphael.st.attr;
	Raphael.el.___attr = Raphael.el.attr;
	Raphael.st.attr = Raphael.el.attr = function(name, value) {
		if ( name != null && Raphael.is(name, "object") ) {
			var params = name;
			for(var attr in params) {
				var listeners = this._attrChangeListeners[attr];
				if(listeners) {
					for ( var i = 0; i < listeners.length; i++) {
						listeners[i](attr, this.___attr(attr), params[attr]);
					}
				}
			}
		}
		else if (name!=null && value!=null) {
			var listeners = this._attrChangeListeners[attr];
			if(listeners) {
				for ( var i = 0; i < listeners.length; i++) {
					listeners[i](name, this.___attr(name), value);
				}
			}
		}
		return this.___attr(name, value);
	};
})();




//blur plugin: use like shape1.blur(2);
(function () {
  if (Raphael.vml) {
      var reg = / progid:\S+Blur\([^\)]+\)/g;
      Raphael.el.blur = function (size) {
          var s = this.node.style,
              f = s.filter;
          f = f.replace(reg, "");
          if (size != "none" && size!=0 && size!="0") {
              s.filter = f + " progid:DXImageTransform.Microsoft.Blur(pixelradius=" + (+size || 1.5) + ")";
              s.margin = Raphael.format("-{0}px 0 0 -{0}px", Math.round(+size || 1.5));
          } else {
              s.filter = f;
              s.margin = 0;
          }
      };
  } else {
      var $ = function (el, attr) {
          if (attr) {
              for (var key in attr) if (attr.hasOwnProperty(key)) {
                  el.setAttribute(key, attr[key]);
              }
          } else {
              return document.createElementNS("http://www.w3.org/2000/svg", el);
          }
      };
      Raphael.el.blur = function (size) {
          // Experimental. No WebKit support.
    	  if (size != "none" && size!=0 && size!="0") {
              var fltr = $("filter"),
                  blur = $("feGaussianBlur");
              fltr.id = "r" + (Raphael.idGenerator++).toString(36);
              $(blur, {stdDeviation: +size || 1.5});
              fltr.appendChild(blur);
              this.paper.defs.appendChild(fltr);
              this._blur = fltr;
              $(this.node, {filter: "url(#" + fltr.id + ")"});
          } else {
              if (this._blur) {
                  this._blur.parentNode.removeChild(this._blur);
                  delete this._blur;
              }
              this.node.removeAttribute("filter");
          }
      };
      Raphael.st.blur =  function(size) {
		for ( var i = 0; i < this.items.length; i++) {
			this.items[i].blur(size);
		}
	  };
  }
})();
//emboss plugin, use like shape1.emboss(1.0)
(function () {
  if (Raphael.vml) {
      var reg = / progid:\S+Emboss\([^\)]+\)/g;
      Raphael.el.emboss = function (bias) {
          var s = this.node.style,
              f = s.filter;
          f = f.replace(reg, "");
          if (bias != "none") {
              s.filter = f + " progid:DXImageTransform.Microsoft.Emboss(bias=" + (bias || 0.0) + ")";
              //s.margin = Raphael.format("-{0}px 0 0 -{0}px", Math.round(+size || 1.5));
          } else {
              s.filter = f;
              //s.margin = 0;
          }
      };
  } else {        
      Raphael.el.emboss = function (bias) {
    	  
      	if(!bias ||bias=="0") {
      		return this.convolveClear(Raphael.el.emboss.EMBOSS_TRANS_NAME);
      	}
      	else {
      		var factor = bias;        				
      		var embossKernel =
      			
      			[	factor*-1,	0, 		0, 
      				0,			1, 		0,
      				0,			0, 		factor]; 
      			
      		return this.convolve(Raphael.el.emboss.EMBOSS_TRANS_NAME, 
      			3, embossKernel, 1.0, bias, null);
      	}
      };
      Raphael.st.emboss =  function(bias) {
      	for ( var i = 0; i < this.items.length; i++) {
			this.items[i].emboss(bias);
		}
      };
      Raphael.el.emboss.EMBOSS_TRANS_NAME="embossTransformation";
  }
})();



/*
 * pixel convolution tranformation (only svg). only squeare kernels allowed.
 * you can add many convolutions. Their name must be a valid html id. For example:
 * image.convolve("emboss1", 3, 3, [0.4,0,0,0,1,0,0,0,0.5])
 * image.convolve("conv2", 2,2,[1,2,2,3])
 * image.convolveClear("emboss1")
 * @author: SebastiÃ¡n Gurin <sgurin @ montevideo  DOT com  DOT uy>
 */
(function () {
    if (Raphael.vml) {    	
    	//TODO
    	Raphael.el.convolve = function (convolutionName, kernelXSize, kernel, 
        		divisor, bias,  preserveAlpha) {
    		return this;
    	};
    	 Raphael.el.convolveClear = function (convolutionName) {
    		 return this;
    	 };
    } 
    else {
        var $ = function (el, attr) {
            if (attr) {
                for (var key in attr) if (attr.hasOwnProperty(key)) {
                    el.setAttribute(key, attr[key]);
                }
            } else {
                return document.createElementNS("http://www.w3.org/2000/svg", el);
            }
        };
        Raphael.el.convolve = function (convolutionName, kernelXSize, kernel, 
        		divisor, bias,  preserveAlpha) {
        	
//        	debugger;
        	//convolution configuration
            var convolveConfig = {
            	order: kernelXSize+"",
            	kernelMatrix: kernel.join(" ")
            };
            if(divisor) convolveConfig["divisor"]=divisor;
            if(bias) convolveConfig["bias"]=bias;
            if( preserveAlpha) convolveConfig["preserveAlpha"]= preserveAlpha;            
            else convolveConfig["preserveAlpha"]="true";
            
        	//if not exists create a main filter element
        	if(this.mainFilter==null) {
        		this.mainFilter = $("filter");
        		this.mainFilter.id = "convolutionMainFilter"
                this.paper.defs.appendChild(this.mainFilter);
        		$(this.node, {filter: "url(#convolutionMainFilter)"});
        	}
        	
            //create or gets the filter primitive element feConvolveMatrix:
            var convolveFilter = this._convolutions==null?null:this._convolutions[convolutionName];
            if(convolveFilter==null){
            	convolveFilter = $("feConvolveMatrix");
            }
            this.mainFilter.appendChild(convolveFilter);
            
            //apply configuration and register
            $(convolveFilter, convolveConfig);  
            if(! this._convolutions)
            	 this._convolutions={}
            this._convolutions[convolutionName] = convolveFilter;
            
	        return this;
        };
        Raphael.st.convolve =  function(convolutionName, kernelXSize, kernel, 
        		divisor, bias,  preserveAlpha) {
        	for ( var i = 0; i < this.items.length; i++) {
				this.items[i].convolve(convolutionName, kernelXSize, kernel, 
		        		divisor, bias,  preserveAlpha);
			}
        };
        Raphael.el.convolveClear = function (convolutionName) {
        	if (this._convolutions!=null && this._convolutions[convolutionName]!=null &&
        			this.mainFilter!=null) {   
        		try {
        			this.mainFilter.removeChild(this._convolutions[convolutionName]);
        			this._convolutions[convolutionName]=null;
        		}catch(ex){alert("error removing filter for conv named : "+convolutionName);}
        		
            }  
            return this;
        };
        Raphael.st.convolveClear =  function(convolutionName) {
        	for ( var i = 0; i < this.items.length; i++) {
				this.items[i].convolveClear(convolutionName);
			}
        };
        Raphael.el.convolveClearAll=function() {
        	if(this.mainFilter!=null) {
	        	this.paper.defs.removeChild(this.mainFilter);
	        	this.mainFilter=null;
	        	this._convolutions=null;
	        	this.node.removeAttribute("filter");
        	}
        };
        Raphael.st.convolveClearAll =  function() {
        	for ( var i = 0; i < this.items.length; i++) {
				this.items[i].convolveClearAll();
			}
        };
    }
    
})();

//and now some convolution based transformations


/* emboss2 support constant orientated embossing using prewittCompassGradient
 * 
 * orientation can be any of 
 * "north", "north-east",  "east", "sourth east","south", "south west", "west", 
 * "worth west"
 * 
 * factor can be an integer >1.0
 * 
 * divisor and bias are optional
 * */
(function () {
Raphael.el.emboss2=function(factor, orientation, divisor, bias) {
	divisor=divisor||1.0;
	bias=bias||100;
	
	var k = null;
	if(orientation=="north") {
		k=[
			-factor, 0, 0, 
			0, 1, 0, 
			0, 0, factor];
	}
	else if(orientation=="north-east") {
		k=[
			0, 0, factor, 
			0, 1, 0, 
			-factor, 0, 0];
	}
	else if(orientation=="east") {
		k=[
			0, 0, 0, 
			-factor, 1, factor,
			0, 0, 0];
	}
	else if(orientation=="south-east") {
		k=[
			-factor, 0, 0, 
			0, 1, 0, 
			0, 0, factor];
	}
	else if(orientation=="south") {
		k=[
			0, -factor, 0, 
			0, 1, 0, 
			0, factor, 0];
	}
	else if(orientation=="south-west") {
		k=[
			0, 0, -factor,
			0, 1, 0, 
			factor, 0, 0];
	}
	else if(orientation=="west") {
		k=[
			0, 0, 0, 
			factor, 1, -factor,
			0, 0, 0];
	}
	else if(orientation=="north-west") {
		k=[
			factor, 0, 0, 
			0, 1, 0, 
			0, 0, -factor];
	}	
	if(k){
		this.convolve("prewittCompassGradient1", 3,  k, divisor, bias);
	}	
	return this;
}
})();




(function () {
var multiplyFor=function(data, n, x) {
	var D = [];
	for(var i = 0; i< n; i++)
		for(var j = 0; j<n; j++)
			D[i*n+j] = data[i*n+j]*x;
	return D;
}; 
Raphael.el.sobel=function(size, multiplier, divisor, bias) {
	divisor=divisor||1.0;
	bias=bias||1.0;

	if(size==1) {
		this.convolve("sobel1", 3, multiplyFor([
			-1, 0, +1,
			-2, 0, +2,
			-1, 0, +1], 
			3, multiplier), divisor, bias);			
		this.convolve("sobel2", 3, multiplyFor([
			+1, +2, +1,
			0, 0, 0,
			-1,-2,-1], 
			3, multiplier), divisor, bias);	
	}
	else if(size==2) {
		this.convolve("sobel1", 4, multiplyFor([
			-1, 0, 0, 1,
			-2, 0, 0, 2,
			-2, 0, 0, 2,
			-1, 0, 0, 1], 
			4, multiplier), divisor, bias);
		this.convolve("sobel2", 4, multiplyFor([
			+1, +2, +2, +1,
			0, 0, 0, 0,
			0, 0, 0, 0,
			0, 0, 0, 0,
			-1, -2, -2, -1], 
			4, multiplier), divisor, bias);	
	}		
	else if(size==3) {
		this.convolve("sobel1", 5, multiplyFor([
			-1, 0, 0, 0, 1,
			-2, 0, 0, 0, 2,
			-3, 0, 0, 0, 3,
			-2, 0, 0, 0, 2,
			-1, 0, 0, 0, 1], 
			5, multiplier), divisor, bias);			
		this.convolve("sobel2", 5, multiplyFor([
			+1, +2, +3, +2, +1,
			0, 0, 0, 0, 0,
			0, 0, 0, 0, 0,
			0, 0, 0, 0, 0,
			-1, -2, -3, -2, -1], 
			5, multiplier), divisor, bias);		
	}
	else if(size==4) {
		this.convolve("sobel1",6, multiplyFor([
			-1, 0, 0, 0, 0, 1,
			-2, 0, 0, 0, 0, 2,
			-3, 0, 0, 0, 0, 3,
			-3, 0, 0, 0, 0, 3,
			-2, 0, 0, 0, 0, 2,
			-1, 0, 0, 0, 0, 1], 
			6, multiplier), divisor, bias);
		this.convolve("sobel2", 6, multiplyFor([
			+1, +2, +3, +3, +2, +1,
			0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 
			0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0,
			-1, -2, -3, -3, -2, -1], 
			6, multiplier), divisor, bias);
	}
	else if(size==5) {
		this.convolve("sobel1",7, multiplyFor([
			-1, 0, 0, 0, 0, 0, 1,
			-2, 0, 0, 0, 0, 0, 2,
			-3, 0, 0, 0, 0, 0, 3,
			-4, 0, 0, 0, 0, 0, 4,
			-3, 0, 0, 0, 0, 0, 3,
			-2, 0, 0, 0, 0, 0, 2,
			-1, 0, 0, 0, 0, 0, 1], 
			7, multiplier), divisor, bias);			
		this.convolve("sobel2", 7, multiplyFor([
			+1, +2, +3, +4, +3, +2, +1,
			0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 
			-1, -2, -3, -4, -3, -2, -1], 
			7, multiplier), divisor, bias);	
	}	
	return this;
};
})();





    
    
/*
 * colorMatrix support  for raphael. Only available on svg
 * @author: SebastiÃ¡n Gurin <sgurin @ montevideo  DOT com  DOT uy>
 */
(function () {
    if (Raphael.vml) {    	
    	//TODO
    } 
    else {
        var $ = function (el, attr) {
            if (attr) {
                for (var key in attr) if (attr.hasOwnProperty(key)) {
                    el.setAttribute(key, attr[key]);
                }
            } else {
                return document.createElementNS("http://www.w3.org/2000/svg", el);
            }
        };
        Raphael.el.colorMatrix = function (tname, matrix) {        	
            var filterConfig = {
            	type: "matrix", 
            	values : matrix.join(" ")
            };
        	//if not exists create a main filter element
        	if(this.colorMainFilter==null) {
        		this.colorMainFilter = $("filter");
        		this.colorMainFilter.id = "colorMainFilter"
                this.paper.defs.appendChild(this.colorMainFilter);
        		$(this.node, {filter: "url(#colorMainFilter)"});
        	}
        	
            //create or gets the filter primitive element feColorMatrix:
            var colorFilter = this._colorFilters==null?null:this._colorFilters[tname];
            if(colorFilter==null){
            	colorFilter = $("feColorMatrix");
            }
            this.colorMainFilter.appendChild(colorFilter);
            
            //apply configuration and register
            $(colorFilter, filterConfig);  
            if(! this._colorFilters)
            	 this._colorFilters={}
            this._colorFilters[tname] = colorFilter;
            
	        return this;
        };

        Raphael.st.colorMatrix =  function(tname, matrix) {
        	for ( var i = 0; i < this.items.length; i++) {
				this.items[i].colorMatrix(tname, matrix);
			}
        };
        Raphael.el.colorMatrixClear = function (tName) {
        	if (this._colorFilters!=null && this._colorFilters[tName]!=null &&
        			this.colorMainFilter!=null) {   
        		try {
        			this.colorMainFilter.removeChild(this._colorFilters[tName]);
        			this._colorFilters[tName]=null;
        		}catch(ex){alert("error removing filter for color matrix named : "+tName);}
        		
            }  
            return this;
        };
        Raphael.el.colorMatrixClearAll=function() {
        	if(this.colorMainFilter!=null) {
	        	this.paper.defs.removeChild(this.colorMainFilter);
	        	this.colorMainFilter=null;
	        	this._colorFilters=null;
	        	this.node.removeAttribute("filter");
        	}
        };
    }
})();     
    
/* raphael support for http://www.w3.org/TR/SVG/filters.html#feComponentTransfer (SVG ONLY!)
 * in this first version, only type="linear" supported
 * @author: SebastiÃ¡n Gurin <sgurin @ montevideo  DOT com  DOT uy>
 */
(function () {
    if (Raphael.vml) { 
		//TODO
    } 
    else {
        var $ = function (el, attr) {
            if (attr) {
                for (var key in attr) if (attr.hasOwnProperty(key)) {
                    el.setAttribute(key, attr[key]);
                }
            } else {
                return document.createElementNS("http://www.w3.org/2000/svg", el);
            }
        };
			/**use like this:
				el.componentTransferLinear("myTransf1", {funcR: {slope: 4, intercept: -1}, funcG: {slope: 4, intercept: -1}, funcB: {slope: 4, intercept: -1}})
			*/
        Raphael.el.componentTransferLinear = function (tName, funcs) {       	
//        	alert("componentTransferLinear");
	     	//if not exists create a main filter element
	     	if(this.componentTransfersMainFilter==null) {
	     		alert("***componentTransfersMainFilter created");
	     		this.componentTransfersMainFilter = $("filter");
	     		this.componentTransfersMainFilter.id = "componentTransfersMainFilter"
	             this.paper.defs.appendChild(this.componentTransfersMainFilter);
	     		$(this.node, {filter: "url(#componentTransfersMainFilter)"});
	     	}
        	
            //create or gets the filter primitive element feComponentTransfer with its feFuncX childs:
            var componentTransferFilter = this._componentTransfers==null?null:this._componentTransfers[tName], 
					funcR=null, funcG=null, funcB=null ;
            if(componentTransferFilter==null){
//            	debugger;
//            	alert("*componentTransfersMainFilter created");
            	componentTransferFilter = $("feComponentTransfer");
				funcR = $("feFuncR");
				funcG = $("feFuncG");
				funcB = $("feFuncB");
				componentTransferFilter.appendChild(funcR);
				componentTransferFilter.appendChild(funcG);
				componentTransferFilter.appendChild(funcB);
            }
            else {
            	funcR = componentTransferFilter.childNodes[0];
            	funcG = componentTransferFilter.childNodes[1];
            	funcB = componentTransferFilter.childNodes[2];
            }
            //debugger;
            $(funcR, funcs["funcR"]); funcR.setAttribute("type", "linear");
            $(funcG, funcs["funcG"]); funcG.setAttribute("type", "linear");
            $(funcB, funcs["funcB"]); funcB.setAttribute("type", "linear");            
            this.componentTransfersMainFilter.appendChild(componentTransferFilter);
            
            //register          
            if(! this._componentTransfers)
            	 this._componentTransfers={}
            this._componentTransfers[tName] = componentTransferFilter;
            
	        return this;
        };
        Raphael.st.componentTransferLinear =  function(tname, funcs) {
        	for ( var i = 0; i < this.items.length; i++) {
				this.items[i].componentTransferLinear(tname, funcs);
			}
        };
        
        Raphael.el.componentTransferClear = function (tName) {
        	if (this._componentTransfers!=null && this._componentTransfers[tName]!=null &&
        			this.componentTransfersMainFilter!=null) {   
        		try {
        			this.componentTransfersMainFilter.removeChild(this._componentTransfers[tName]);
        			this._componentTransfers[tName]=null;
        		}catch(ex){alert("error removing filter for conv named : "+tName);}
        		
            }  
            return this;
        };
        Raphael.el.componentTransferClearAll=function() {
        	if(this.componentTransfersMainFilter!=null) {
	        	this.paper.defs.removeChild(this.componentTransfersMainFilter);
	        	this.componentTransfersMainFilter=null;
	        	this._componentTransfers=null;
	        	this.node.removeAttribute("filter");
        	}
        };
    }
    
})();
/*
 *  'feMorphology' support  for raphael. Only available on svg
 *  use shape1.morphology(morphname, operator, radius)
 *  where operator cah be "erode" or "dilate" and radius an int. morphname is 
 *  the name of your transformation and can be used later for unregistering the 
 *  transf using shape1.morphologyClear(morphname).
 * @author: SebastiÃ¡n Gurin <sgurin @ montevideo  DOT com  DOT uy>
 */
(function () {
    if (Raphael.vml) {    	
    	//TODO
    } 
    else {
        var $ = function (el, attr) {
            if (attr) {
                for (var key in attr) if (attr.hasOwnProperty(key)) {
                    el.setAttribute(key, attr[key]);
                }
            } else {
                return document.createElementNS("http://www.w3.org/2000/svg", el);
            }
        };
        Raphael.el.morphology = function (tname, operator, radius) {        	
            var filterConfig = {
            	"operator": operator, 
            	"radius" : radius
            };
        	//if not exists create a main filter element
        	if(this.morphologyMainFilter==null) {
        		this.morphologyMainFilter = $("filter");
        		this.morphologyMainFilter.id = "morphologyMainFilter"
            this.paper.defs.appendChild(this.morphologyMainFilter);
        		$(this.node, {filter: "url(#morphologyMainFilter)"});
        	}
        	
            //create or gets the filter primitive element feColorMatrix:
            var morphologyFilter = this._morphologyFilters==null?null:this._morphologyFilters[tname];
            if(morphologyFilter==null){
            	morphologyFilter = $("feMorphology");
            }
            this.morphologyMainFilter.appendChild(morphologyFilter);
            
            //apply configuration and register
            $(morphologyFilter, filterConfig);  
            if(! this._morphologyFilters)
            	 this._morphologyFilters={}
            this._morphologyFilters[tname] = morphologyFilter;
            
	        return this;
        };
        
        Raphael.el.morphologyClear = function (tName) {
        	if (this._morphologyFilters!=null && this._morphologyFilters[tName]!=null &&
        			this.morphologyMainFilter!=null) {   
        		try {
        			this.morphologyMainFilter.removeChild(this._morphologyFilters[tName]);
        			this._morphologyFilters[tName]=null;
        		}catch(ex){alert("error removing filter for morphology named : "+tName);}
        		
            }  
            return this;
        };
        Raphael.el.morphologyClearAll=function() {
        	if(this.morphologyMainFilter!=null) {
	        	this.paper.defs.removeChild(this.morphologyMainFilter);
	        	this.morphologyMainFilter=null;
	        	this._morphologyFilters=null;
	        	this.node.removeAttribute("filter");
        	}
        };
        
        Raphael.st.morphology =  function(tname, operator, radius) {
        	for ( var i = 0; i < this.items.length; i++) {
				this.items[i].morphology(tname, operator, radius);
			}
        }
    }
})();     
    