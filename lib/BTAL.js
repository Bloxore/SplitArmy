(function (cjs, an) {

var p; // shortcut to reference prototypes
var lib={};var ss={};var img={};
lib.webFontTxtInst = {};
var loadedTypekitCount = 0;
var loadedGoogleCount = 0;
var gFontsUpdateCacheList = [];
var tFontsUpdateCacheList = [];
lib.ssMetadata = [];



lib.updateListCache = function (cacheList) {
	for(var i = 0; i < cacheList.length; i++) {
		if(cacheList[i].cacheCanvas)
			cacheList[i].updateCache();
	}
};

lib.addElementsToCache = function (textInst, cacheList) {
	var cur = textInst;
	while(cur != null && cur != exportRoot) {
		if(cacheList.indexOf(cur) != -1)
			break;
		cur = cur.parent;
	}
	if(cur != exportRoot) {
		var cur2 = textInst;
		var index = cacheList.indexOf(cur);
		while(cur2 != null && cur2 != cur) {
			cacheList.splice(index, 0, cur2);
			cur2 = cur2.parent;
			index++;
		}
	}
	else {
		cur = textInst;
		while(cur != null && cur != exportRoot) {
			cacheList.push(cur);
			cur = cur.parent;
		}
	}
};

lib.gfontAvailable = function(family, totalGoogleCount) {
	lib.properties.webfonts[family] = true;
	var txtInst = lib.webFontTxtInst && lib.webFontTxtInst[family] || [];
	for(var f = 0; f < txtInst.length; ++f)
		lib.addElementsToCache(txtInst[f], gFontsUpdateCacheList);

	loadedGoogleCount++;
	if(loadedGoogleCount == totalGoogleCount) {
		lib.updateListCache(gFontsUpdateCacheList);
	}
};

lib.tfontAvailable = function(family, totalTypekitCount) {
	lib.properties.webfonts[family] = true;
	var txtInst = lib.webFontTxtInst && lib.webFontTxtInst[family] || [];
	for(var f = 0; f < txtInst.length; ++f)
		lib.addElementsToCache(txtInst[f], tFontsUpdateCacheList);

	loadedTypekitCount++;
	if(loadedTypekitCount == totalTypekitCount) {
		lib.updateListCache(tFontsUpdateCacheList);
	}
};
// symbols:
// helper functions:

function mc_symbol_clone() {
	var clone = this._cloneProps(new this.constructor(this.mode, this.startPosition, this.loop));
	clone.gotoAndStop(this.currentFrame);
	clone.paused = this.paused;
	clone.framerate = this.framerate;
	return clone;
}

function getMCSymbolPrototype(symbol, nominalBounds, frameBounds) {
	var prototype = cjs.extend(symbol, cjs.MovieClip);
	prototype.clone = mc_symbol_clone;
	prototype.nominalBounds = nominalBounds;
	prototype.frameBounds = frameBounds;
	return prototype;
	}


(lib.TitleText = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.text = new cjs.Text("BananaToken\nArcade", "normal 700 32px 'Montserrat'", "#6C5A49");
	this.text.textAlign = "center";
	this.text.lineHeight = 45;
	this.text.lineWidth = 298;
	this.text.parent = this;
	this.text.setTransform(151,2);
	if(!lib.properties.webfonts['Montserrat']) {
		lib.webFontTxtInst['Montserrat'] = lib.webFontTxtInst['Montserrat'] || [];
		lib.webFontTxtInst['Montserrat'].push(this.text);
	}

	this.timeline.addTween(cjs.Tween.get(this.text).wait(1));

}).prototype = getMCSymbolPrototype(lib.TitleText, new cjs.Rectangle(0,0,302,91.9), null);


(lib.BgLogo3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#C8AD55").s().p("EAAqA7tQrEgJpxh8QqJiAlwjbQlojXlQo8Qk4oRjcrBQjXq1g+p8Qg/qeCEmVQCBmSG+nsQGjnQJKmpQJKmrI5j/QJfkQGlAAQGpAAJqEMQJMEAJPGkQJaGrGWHMQG5HxBdGZQBeGhhOKSQhMJ1jSKlQjXK1kmISQk+I+lUD3QlTD3qEB8QorBuqdAAIhhgBg");
	this.shape.setTransform(95.9,95.5,0.25,0.25,0,0,0,0,-0.1);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.BgLogo3, new cjs.Rectangle(0,0,191.8,191.1), null);


(lib.BgLogo2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFDD00").s().p("EAAqA7tQrEgJpxh8QqJiAlwjbQlojXlQo8Qk4oRjcrBQjXq1g+p8Qg/qeCEmVQCBmSG+nsQGjnQJKmpQJKmrI5j/QJfkQGlAAQGpAAJqEMQJMEAJPGkQJaGrGWHMQG5HxBdGZQBeGhhOKSQhMJ1jSKlQjXK1kmISQk+I+lUD3QlTD3qEB8QorBuqdAAIhhgBg");
	this.shape.setTransform(95.9,95.5,0.25,0.25,0,0,0,0,-0.1);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.BgLogo2, new cjs.Rectangle(0,0,191.8,191.1), null);


(lib.BgLogo1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer_1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFF275").s().p("EAAqA7tQrEgJpxh8QqJiAlwjbQlojXlQo8Qk4oRjcrBQjXq1g+p8Qg/qeCEmVQCBmSG+nsQGjnQJKmpQJKmrI5j/QJfkQGlAAQGpAAJqEMQJMEAJPGkQJaGrGWHMQG5HxBdGZQBeGhhOKSQhMJ1jSKlQjXK1kmISQk+I+lUD3QlTD3qEB8QorBuqdAAIhhgBg");
	this.shape.setTransform(95.9,95.5,0.25,0.25,0,0,0,0,-0.1);

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1));

}).prototype = getMCSymbolPrototype(lib.BgLogo1, new cjs.Rectangle(0,0,191.8,191.1), null);


(lib.BananaTokenArcadeLogosvg = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Banana Token Arcade Logo.svg
	this.shape = new cjs.Shape();
	this.shape.graphics.lf(["#FBEE9B","#FFFB42","#FFFB53","#FFFD80","#FFFFC8","#FFFFD4","#F3E379","#EED64E","#FFFBCC"],[0.012,0.251,0.31,0.42,0.569,0.6,0.788,0.871,1],-28.9,0,29.2,0).s().p("AARFbQhJgCg7gVQhGgYgsgwQhdhkAfiXQAZh1Bbh1QABg2AGgsQAAgGAEgFQAEgFAHABQBRAIBKAaIAEACQAFADACAGQABAGgDAFQgOAcgfA1QgbAvgKAnQgaBeAmBYQAnBbBYAhQBcAiBSg3QAFgDAGACQAGABADAGIAjBPQACACAAAEQABAHgFAEQgEAFgHAAQgJACgRAWQgVAZgGAEQgUAMgaADQhDAKhIAAIgdAAgAiRjkQAAAIgFAEQhfB4gTB7QgYCcB3BRQA0AkBKAMQA3AIBQgFQBDgEALgCQAsgIAWgcQANgRAHgGIAIgFIgVgwQhNAthagYQhegag0hWQgagtgKgzQgKgxAIgzQAHg1Aeg7IAxhWQg6gTg8gIQgFAtAAAqg");
	this.shape.setTransform(111.4,111.2);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.rf(["#FFFBCC","#FBF2BB","#F0D98E","#EED688","#EBBB10","#C3922E"],[0,0.11,0.341,0.369,0.69,1],6.4,-0.8,0,6.4,-0.8,30.9).s().p("AgmFIQh1gRhAhFQgqgugPhEQgOg/ANhBQAVhrBgh5QgBgYACgcIAGgzQBPAHBJAbQgHAPgNAVIgXAiQgfAygNA6QgMA5AGA7QAJA6AgAxQAhA0AwAcQA0AeA9gDQA9gCAvgiIAjBPQgPgCgNASIgXAeQgLAMgUAGQgNADgXADQhEAGgiACIgcAAQgoAAgigEg");
	this.shape_1.setTransform(111.4,111.2);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f().ls(["#FBC926","#FFFBCC","#F8F0BB","#E7D28E","#CCA246","#C3922E","#EED688","#FFFBCC"],[0.012,0.251,0.298,0.412,0.549,0.6,0.871,1],-98.5,0,98.5,0).ss(2).p("AAFvLQBsAACdBEQCVBBCXBrQCZBtBnB0QBxB/AXBoQAYBqgUCnQgTCgg1CsQg3CwhLCHQhRCShXA/QhWA+ikAgQiXAei5gDQizgCifgfQilghhdg3Qhcg3hViSQhPiGg5izQg3ixgPihQgQirAhhmQAhhmByh+QBqh1CVhtQCVhsCRhBQCahFBrAAg");
	this.shape_2.setTransform(109.5,111.7);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.lf(["#FBC337","#FFD049","#FFDC38","#FFDD37","#FFE188","#FFF57B"],[0.012,0.251,0.58,0.6,0.871,1],71.4,-60.4,-69.7,74.1).s().p("AAKPLQizgCifgfQilghhdg3Qhcg3hViSQhPiGg5izQg3ixgPihQgQirAhhmQAhhmByh+QBqh1CVhtQCVhsCRhBQCahFBrAAQBsAACdBEQCVBBCXBrQCZBtBnB0QBxB/AXBoQAYBqgUCnQgTCgg1CsQg3CwhLCHQhRCShXA/QhWA+ikAgQiMAcioAAIgcgBg");
	this.shape_3.setTransform(109.5,111.7);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.lf(["#FBB900","#FFF173","#FEE962","#FDD335","#FBB900","#F2CD5B","#EED688","#FFF1B6"],[0.012,0.251,0.322,0.459,0.6,0.78,0.871,1],-67.3,-66.1,76.5,73.4).s().p("AAMRDQjKgCiygjQi6glhpg+Qhng9hgikQhZiXg/jKQg9jFgSi2QgSi/Amh0QAlhyB/iNQB4iECnh6QCoh6CihJQCuhNB3AAQB6AACwBMQCoBJCpB4QCsB6B0CDQB+CPAbB0QAbB3gWC8QgWCzg8DCQg+DGhUCXQhbCkhhBHQhhBGi4AkQieAei+AAIgdAAg");
	this.shape_4.setTransform(109.5,109.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,219.2,218.3);


// stage content:
(lib.BTALogoAnimation2 = function(mode,startPosition,loop) {
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_299 = function() {
		let event = new Event("animationFinished");

		document.dispatchEvent(event);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(299).call(this.frame_299).wait(1));

	// Text
	this.instance = new lib.TitleText();
	this.instance.parent = this;
	this.instance.setTransform(199,306.6,1,1,0,0,0,151,46);
	this.instance.alpha = 0;
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(202).to({_off:false},0).to({alpha:1},30).wait(37).to({alpha:0},30).wait(1));

	// Banana Token Metal.ai
	this.instance_1 = new lib.BananaTokenArcadeLogosvg();
	this.instance_1.parent = this;
	this.instance_1.setTransform(200.1,200.1,0.875,0.875,0,0,0,109.5,109.2);
	this.instance_1.alpha = 0;
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(59).to({_off:false},0).to({alpha:1},13).wait(107).to({y:143.6},30,cjs.Ease.cubicIn).wait(60).to({alpha:0},30).wait(1));

	// Bg Logo 1
	this.instance_2 = new lib.BgLogo1();
	this.instance_2.parent = this;
	this.instance_2.setTransform(200.2,200.1,3.8,3.8,0,0,0,95.9,95.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({regX:95.8,scaleX:1,scaleY:1,x:200,y:200},59,cjs.Ease.cubicInOut).to({regX:95.9,scaleX:1.5,scaleY:1.5,x:200.1},90,cjs.Ease.elasticOut).to({scaleX:4,scaleY:4,x:200.2},60,cjs.Ease.cubicIn).wait(91));

	// Bg Logo 2
	this.instance_3 = new lib.BgLogo2();
	this.instance_3.parent = this;
	this.instance_3.setTransform(200,200,1,1,0,0,0,95.8,95.5);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(59).to({_off:false},0).to({scaleX:2.5,scaleY:2.5},90,cjs.Ease.elasticOut).wait(151));

	// Bg Logo 3
	this.instance_4 = new lib.BgLogo3();
	this.instance_4.parent = this;
	this.instance_4.setTransform(200,200,1,1,0,0,0,95.8,95.5);
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(59).to({_off:false},0).to({scaleX:4.5,scaleY:4.5,x:200.1,y:200.1},90,cjs.Ease.elasticOut).wait(151));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(35.8,37.2,728.6,726);
// library properties:
lib.properties = {
	id: '155795F5679BF945B1B91F4D223DAA62',
	width: 400,
	height: 400,
	fps: 60,
	color: "#FFFFFF",
	opacity: 1.00,
	webfonts: {},
	manifest: [],
	preloads: []
};



// bootstrap callback support:

(lib.Stage = function(canvas) {
	createjs.Stage.call(this, canvas);
}).prototype = p = new createjs.Stage();

p.setAutoPlay = function(autoPlay) {
	this.tickEnabled = autoPlay;
}
p.play = function() { this.tickEnabled = true; this.getChildAt(0).gotoAndPlay(this.getTimelinePosition()) }
p.stop = function(ms) { if(ms) this.seek(ms); this.tickEnabled = false; }
p.seek = function(ms) { this.tickEnabled = true; this.getChildAt(0).gotoAndStop(lib.properties.fps * ms / 1000); }
p.getDuration = function() { return this.getChildAt(0).totalFrames / lib.properties.fps * 1000; }

p.getTimelinePosition = function() { return this.getChildAt(0).currentFrame / lib.properties.fps * 1000; }

an.bootcompsLoaded = an.bootcompsLoaded || [];
if(!an.bootstrapListeners) {
	an.bootstrapListeners=[];
}

an.bootstrapCallback=function(fnCallback) {
	an.bootstrapListeners.push(fnCallback);
	if(an.bootcompsLoaded.length > 0) {
		for(var i=0; i<an.bootcompsLoaded.length; ++i) {
			fnCallback(an.bootcompsLoaded[i]);
		}
	}
};

an.compositions = an.compositions || {};
an.compositions['155795F5679BF945B1B91F4D223DAA62'] = {
	getStage: function() { return exportRoot.getStage(); },
	getLibrary: function() { return lib; },
	getSpriteSheet: function() { return ss; },
	getImages: function() { return img; }
};

an.compositionLoaded = function(id) {
	an.bootcompsLoaded.push(id);
	for(var j=0; j<an.bootstrapListeners.length; j++) {
		an.bootstrapListeners[j](id);
	}
}

an.getComposition = function(id) {
	return an.compositions[id];
}



})(createjs = createjs||{}, AdobeAn = AdobeAn||{});
var createjs, AdobeAn;

//Start code
var canvas, stage, exportRoot, fnStartAnimation;
function BTALinit(custom) {
	canvas = document.createElement("canvas");

	var comp=AdobeAn.getComposition("155795F5679BF945B1B91F4D223DAA62");
	var lib=comp.getLibrary();
	try {
		if(!(typeof gFontsFamilies === 'undefined' || gFontsFamilies === null))
			LoadGFonts(gFontsFamilies, comp);
		if(!(typeof totalTypekitFonts === 'undefined' || totalTypekitFonts === null)) {
			var typekitObject = {type: 'Typekit', loadedFonts: 0, totalFonts: totalTypekitFonts, callOnLoad: lib.tfontAvailable};
			Typekit.load({
			async: true,
			'fontactive': function(family) {
				isFontAvailable(family, typekitObject);
				}
			});
		}
	} catch(e) {};
	handleComplete({},comp);

	createjs.Ticker.addEventListener("tick", () => {
		custom.clearRect(0,0,240,240)
		custom.drawImage(canvas, 0, 0, 240, 240);
	});
}
function handleComplete(evt,comp) {
	//This function is always called, irrespective of the content. You can use the variable "stage" after it is created in token create_stage.
	var lib=comp.getLibrary();
	var ss=comp.getSpriteSheet();
	exportRoot = new lib.BTALogoAnimation2();
	stage = new lib.Stage(canvas);
	//Registers the "tick" event listener.
	fnStartAnimation = function() {
		stage.addChild(exportRoot);
		createjs.Ticker.setFPS(lib.properties.fps);
		createjs.Ticker.addEventListener("tick", stage);
	}
	//Code to support hidpi screens and responsive scaling.
	function makeResponsive(isResp, respDim, isScale, scaleType) {
		var lastW, lastH, lastS=1;
		window.addEventListener('resize', resizeCanvas);
		resizeCanvas();
		function resizeCanvas() {
			var w = lib.properties.width, h = lib.properties.height;
			var iw = window.innerWidth, ih=window.innerHeight;
			var pRatio = window.devicePixelRatio || 1, xRatio=iw/w, yRatio=ih/h, sRatio=1;
			if(isResp) {
				if((respDim=='width'&&lastW==iw) || (respDim=='height'&&lastH==ih)) {
					sRatio = lastS;
				}
				else if(!isScale) {
					if(iw<w || ih<h)
						sRatio = Math.min(xRatio, yRatio);
				}
				else if(scaleType==1) {
					sRatio = Math.min(xRatio, yRatio);
				}
				else if(scaleType==2) {
					sRatio = Math.max(xRatio, yRatio);
				}
			}
			canvas.width = w*pRatio*sRatio;
			canvas.height = h*pRatio*sRatio;
			canvas.style.width = w*sRatio+'px';
			canvas.style.height = h*sRatio+'px';
			stage.scaleX = pRatio*sRatio;
			stage.scaleY = pRatio*sRatio;
			lastW = iw; lastH = ih; lastS = sRatio;
			stage.tickOnUpdate = false;
			stage.update();
			stage.tickOnUpdate = true;
		}
	}
	makeResponsive(false,'both',false,1);
	AdobeAn.compositionLoaded(lib.properties.id);
	fnStartAnimation();
}
