/*	Background dot line animation
	Modified version of this: http://codepen.io/MarcoGuglielmelli/pen/lLCxy?editors=0010
*/
var canvasAnimation = function(m){
    return function(args){
        var width, height, largeHeader, canvas, ctx, points, target, divider = 30, animateHeader = true,
        	//	Let's add some colour
    		rainbow = ["rgba(248, 12, 18)", "rgba(238, 17, 0)", "rgba(255, 51, 17)", "rgba(255, 68, 34)", "rgba(255, 102, 68)", "rgba([255, 153, 51)", "rgba(254, 174, 45)", "rgba(204, 187, 51)", "rgba(208, 195, 16)", "rgba(170, 204, 34)", "rgba([105, 208, 37)", "rgba(34, 204, 170)", "rgba(18, 189, 185)", "rgba(17, 170, 187)", "rgba(68, 68, 221)", "rgba(51, [17, 187)", "rgba(59, 12, 189)", "rgba(68, 34, 153)"];

        function initHeader(element) {
            var browserWidth = typeof window !== "undefined"? window.innerWidth: null;

            if(browserWidth) {
                if(browserWidth <= 640) {
                    divider = 10;
                }
            }

        	canvas = element;
        	//	Size it according to containing element
            width = canvas.parentNode.clientWidth;
            height = canvas.parentNode.clientHeight;
            target = {x: width/2, y: height/2};

            canvas.width = width;
            canvas.height = height;
            ctx = canvas.getContext('2d');

            // create points
            points = [];
            for(var x = 0; x < width; x = x + width/divider) {
                for(var y = 0; y < height; y = y + height/divider) {
                    var px = x + Math.random()*width/divider;
                    var py = y + Math.random()*height/divider;
                    var p = {x: px, originX: px, y: py, originY: py };
                    points.push(p);
                }
            }

            // for each point find the 5 closest points
            for(var i = 0; i < points.length; i++) {
                var closest = [];
                var p1 = points[i];
                for(var j = 0; j < points.length; j++) {
                    var p2 = points[j]
                    if(!(p1 == p2)) {
                        var placed = false;
                        for(var k = 0; k < 5; k++) {
                            if(!placed) {
                                if(closest[k] == undefined) {
                                    closest[k] = p2;
                                    placed = true;
                                }
                            }
                        }

                        for(var k = 0; k < 5; k++) {
                            if(!placed) {
                                if(getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                    closest[k] = p2;
                                    placed = true;
                                }
                            }
                        }
                    }
                }
                p1.closest = closest;
            }

            // assign a circle to each point
            for(var i in points) {
                var c = new Circle(points[i], 2+Math.random()*2, 'rgba(255,255,255,0.3)');
                points[i].circle = c;
            }
        }

        // Event handling
        function addListeners() {
            if(!('ontouchstart' in window)) {
                window.addEventListener('mousemove', mouseMove);
            }
            window.addEventListener('scroll', scrollCheck);
            window.addEventListener('resize', resize);
        }

        function mouseMove(e) {
            var posx = posy = 0;
            if (e.pageX || e.pageY) {
                posx = e.pageX;
                posy = e.pageY;
            }
            else if (e.clientX || e.clientY)    {
                posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            target.x = posx;
            target.y = posy;
        }

        function scrollCheck() {
            if(document.body.scrollTop > height) animateHeader = false;
            else animateHeader = true;
        }

        function resize() {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        }

        // animation
        function initAnimation() {
            animate();
            for(var i in points) {
                shiftPoint(points[i]);
            }
        }

        function animate() {
            var maxDist = 25000,
                pActive = 0.3,
                cActive = 0.6;
            if(animateHeader) {
                ctx.clearRect(0,0,width,height);
                for(var i in points) {
                    var dist = Math.abs(getDistance(target, points[i]));

                    if(dist < maxDist) {
                        points[i].active = pActive - ((dist/maxDist) * pActive);
                        points[i].circle.active = cActive - ((dist/maxDist) * cActive);
                    } else {
                        points[i].active = 0;
                        points[i].circle.active = 0;
                    }

                    drawLines(points[i]);
                    points[i].circle.draw();
                }
            }
            requestAnimationFrame(animate);
        }

        //	Custom tween - no need for a lib.
        function tweenTo(point, time, options) {
        	var timeInMs = time * 1000,
        		oX = 0 + point.x,
        		oY = 0 + point.y,
        		easeInOutQuad = function (t) {
    		    	//	Ref: https://gist.github.com/gre/1650294
        			return t<.5 ? 2*t*t : -1+(4-2*t)*t;
    	    	},
    	    	start = (new Date()).getTime(),
        		animateTo = function(){
        			var now = (new Date()).getTime(),
        				diff = now - start;
        			if(diff < timeInMs) {
        				var eValue = easeInOutQuad(diff/timeInMs),
        					newX = ((1 - eValue) * oX) + eValue * options.x,
        					newY = ((1 - eValue) * oY) + eValue * options.y;
        				point.x = newX;
        				point.y = newY;
    			    	requestAnimationFrame(animateTo);
        			} else {
        				options.onComplete();
        			}
        		};
        	requestAnimationFrame(animateTo);
        }

        function shiftPoint(p) {
            tweenTo(p,
            	2+10*Math.random(),
            	{
            		x: p.originX-50+Math.random()*100,
                	y: p.originY-50+Math.random()*100,
                	onComplete: function() {
                    	shiftPoint(p);
                	}
            	}
            );
        }

        // Canvas manipulation
        function drawLines(p) {
            if(!p.active) return;
    		var offset = parseInt((rainbow.length - 1) * (p.y/height), 10);
    		offset = offset > rainbow.length - 1?
    			rainbow.length - 1:
    			offset < 0? 0: offset;

            for(var i in p.closest) {
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.closest[i].x, p.closest[i].y);
                ctx.strokeStyle = rainbow[offset].split(")").join(", " + p.active/3 + ")");
                ctx.stroke();
            }
        }

        function Circle(pos,rad,color) {
            var _this = this;

            // constructor
            (function() {
                _this.pos = pos || null;
                _this.radius = rad || null;
                _this.color = color || null;
            })();

    		var offset = parseInt((rainbow.length - 1) * (_this.pos.y/height), 10);
    		offset = offset > rainbow.length - 1?
    			rainbow.length - 1:
    			offset < 0? 0: offset;

            this.draw = function() {
                if(!_this.active) return;
                ctx.beginPath();
                ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = rainbow[offset].split(")").join(", " + _this.active/2 + ")");
                ctx.fill();
            };
        }

        // Util
        function getDistance(p1, p2) {
            return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
        }

        var aniComponent = {
        	config: function(ctrl){
        		return function(element, isInitialized) {
                    if (isInitialized) {
                    	return;
                    }
    			    initHeader(element);
    			    initAnimation();
    			    addListeners();
        		}
        	},
        	controller: function(data){

        	},
        	view: function(ctrl){
        		return m('canvas', {config: aniComponent.config(ctrl), className: "ani-canvas"});
        	}
        };


    	return m(aniComponent, args);
    };
};

module.exports = canvasAnimation;
