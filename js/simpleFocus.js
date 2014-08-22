/**
 *  simpleFocus.js   v1.0.0
 *  
 *	author: sliwey
 *  date: 2014-1-20
 *  update: 2014-8-20	
 */

;(function($) {
	var defaluts = {
		width : 600,
		height : 300,
		title : true,
		type : "fade",
		duration : 500
	};

	$.fn.extend({
		simpleFocus : function(options) {
			var setting = $.extend({}, defaluts, options);
			init(setting, this);
			return this;
		}
	});
	
	var 
		// 通用
		CSS_SHOW = "show",

		// slide
		step = 0,
		left = [],
		right = [],
		direction;

	var init = function(setting, _this) {
		var images = _this.find("li"),
			length = images.length,
			interval,
		    duration,
		    titles,
			title,
			len,
			img,
			i,
			prev,
			next;
		
		duration = {
			"transition-duration" : setting.duration + 'ms',
			"-webkit-transition-duration" : setting.duration + 'ms'
		};

		for (i = 0; i < length; i++) {
			images.eq(i).css(duration);
		}

		images.eq(0).addClass(CSS_SHOW);
		_this.css({"width" : setting.width, "height" : setting.height});
		_this.append("<span class=\"prev\"></span><span class=\"next\"></span>");
		
		prev = _this.find(".prev");
		next = _this.find(".next");

		images.each(function() {
			$(this).on("mouseenter mouseleave", function(event) {
				var target = $(event.relatedTarget);
				if (event.type == "mouseenter") {
					prev.addClass(CSS_SHOW);
					next.addClass(CSS_SHOW);
					$(this).find(".title").addClass(CSS_SHOW);
					
					// 暂停自动播放
					clearInterval(interval);    
				} else if (target.parents(".simpleFocus").length == 0){
					prev.removeClass(CSS_SHOW);
					next.removeClass(CSS_SHOW);
					$(this).find(".title").removeClass(CSS_SHOW);

					// 自动播放
					interval = auto(images, setting.type, setting.duration);    
				}
			});
		});

		
		// _this.on("mouseenter mouseleave", function(event) {
		// 	if (event.type == "mouseenter") {
		// 		prev.addClass(CSS_SHOW);
		// 		next.addClass(CSS_SHOW);
		// 		images.eq(index).find(".title").addClass(CSS_SHOW);
				
		// 		// 暂停自动播放
		// 		clearInterval(interval);    
		// 	} else {
		// 		prev.removeClass(CSS_SHOW);
		// 		next.removeClass(CSS_SHOW);
		// 		images.eq(index).find(".title").removeClass(CSS_SHOW);

		// 		// 自动播放
		// 		interval = auto(images, setting.type, setting.duration);     
		// 	}
		// });
		
		if (setting.type == "fade") {
			prev.css(duration).on("click",{d:0,obj:images,duration:setting.duration},fade);
			next.css(duration).on("click",{d:1,obj:images,duration:setting.duration},fade);
		}
		

		if (setting.title) {
			for (i = 0; i < length; i++) {
				img = images.eq(i);
				title = img.find("a").attr("title");
				img.append("<p class=\"title\">"+title+"</p>");
			}
		}
		titles = _this.find(".title");
		len = titles.length;
		for (i = 0; i < len; i++) {
			titles.eq(i).css(duration);
		}

		// slide
		if (setting.type == "slide") {
			step = _this.width();
			_this.children("ul").addClass("slide");
			images.eq(length - 1).css("left", -step);
			images.eq(1).css("left", step);
			// 进容器
			left.push(length - 1);
			right.push(1);

			prev.css(duration).on("click",{d:0,obj:images,duration:setting.duration},slide);
			next.css(duration).on("click",{d:1,obj:images,duration:setting.duration},slide);
		}

		// 自动播放
		interval = auto(images, setting.type, setting.duration);
	};
	
	var fade = (function() {
		var index = 0,		// 当前图片下标
			before,
			after,
			flag = true,
			first = 0,
			second = 0;

		var _fade = function(param) {
			var images = param.obj || param.data.obj,
				length = images.length,
				duration = param.duration || param.data.duration;

			// 控制两次点击的时间间隔大于动画时间	
			if (flag) {
				first = new Date();
				flag = false;
			} else {
				second = new Date();
				if (second - first <= duration) {
					return false;
				} else {
					first = second;
				}
			}

			if (param.data && param.data.d == 0) {
				
				// 向左    
				before = index - 1;    
				if (before < 0) {
					before = length + before;
				}

				images.eq(index).removeClass(CSS_SHOW);
				images.eq(before).addClass(CSS_SHOW);

				if (param.data) {
					images.eq(index).find(".title").removeClass(CSS_SHOW);
					images.eq(before).find(".title").addClass(CSS_SHOW);
				}

				index = before;
			} else {

				// 向右             	
				after = index + 1;        		
				if (after >= length) {
					after = length - after;
				}
				
				images.eq(index).removeClass(CSS_SHOW);
				images.eq(after).addClass(CSS_SHOW);

				if (param.data) {
					images.eq(index).find(".title").removeClass(CSS_SHOW);
					images.eq(after).find(".title").addClass(CSS_SHOW);
				}

				index = after;
			}
		}	
		return _fade;
	})();

	var slide = (function() {
		var index = 0,
			prev,
			next,
			before,
			after,
			flag = true,
			first = 0,
			second = 0;
				
		var _slide = function(param) {
			var images = param.obj || param.data.obj,
				length = images.length,
				duration = param.duration || param.data.duration;

			// 控制两次点击的时间间隔大于动画时间	
			if (flag) {
				first = new Date();
				flag = false;
			} else {
				second = new Date();
				if (second - first <= duration) {
					return false;
				} else {
					first = second;
				}
			}

			if (param.data && param.data.d == 0) {      		

				// 向左
				if (direction == 0) {		// 与上次操作方向相同
					prev = left.shift();
				} else {					// 与上次操作方向相反
					prev = left.pop();
				}

				images.eq(index).css("left", step);
				images.eq(prev).addClass(CSS_SHOW).css("left", "0");
				if (param.data) {
					images.eq(index).find(".title").removeClass(CSS_SHOW);
					images.eq(prev).find(".title").addClass(CSS_SHOW);
				}

				right.push(index);
				if (left.length == 0) {
					before = prev - 1;
					if (before < 0) {
						before = length + before;
					}
					if (before === right[0]) {
						right.shift();
					}
					images.eq(before).removeClass(CSS_SHOW).css("left", -step);
					left.push(before);
				}

				index = prev;
				direction = 0;
			} else {                     	

				// 向右
				if (direction == 1) {		// 与上次操作方向相同
					next = right.shift();
				} else {					// 与上次操作方向相反
					next = right.pop();
				}
				
				images.eq(index).css("left", -step);
				images.eq(next).addClass(CSS_SHOW).css("left", "0");
				if (param.data) {
					images.eq(index).find(".title").removeClass(CSS_SHOW);
					images.eq(next).find(".title").addClass(CSS_SHOW);
				}

				left.push(index);
				if (right.length == 0) {
					after = next + 1;
					if (after >= length) {
						after = length - after;
					}
					if (left[0] === after) {
						left.shift();	
					}
					images.eq(after).removeClass(CSS_SHOW).css("left", step);
					right.push(after);
				}

				index = next;
				direction = 1;
			}
		}		
		return _slide;
	})();

		

// 	var changeType = {
// 		flag : true,
// 		first : 0,
// 		second : 0,
// 		index : 0,			// 当前图片下标

// 		fade : function(param) {
// 			var images = param.obj || param.data.obj,
// 				length = images.length,
// 				duration = param.duration || param.data.duration,
// 				before,
// 				after;
// console.log(index+2)
// 			// 控制两次点击的时间间隔大于动画时间	
// 			if (changeType.flag) {
// 				changeType.first = new Date();
// 				changeType.flag = false;
// 			} else {
// 				changeType.second = new Date();
// 				if (changeType.second - changeType.first <= duration) {
// 					return false;
// 				} else {
// 					changeType.first = changeType.second;
// 				}
// 			}


// 			if (param.data && param.data.d == 0) {
				
// 				// 向左    
// 				before = index - 1;    
// 				if (before < 0) {
// 					before = length + before;
// 				}

// 				images.eq(index).removeClass(CSS_SHOW);
// 				images.eq(before).addClass(CSS_SHOW);

// 				if (param.data) {
// 					images.eq(index).find(".title").removeClass(CSS_SHOW);
// 					images.eq(before).find(".title").addClass(CSS_SHOW);
// 				}

// 				index = before;
// 			} else {

// 				// 向右             	
// 				after = index + 1;        		
// 				if (after >= length) {
// 					after = length - after;
// 				}
				
// 				images.eq(index).removeClass(CSS_SHOW);
// 				images.eq(after).addClass(CSS_SHOW);

// 				if (param.data) {
// 					images.eq(index).find(".title").removeClass(CSS_SHOW);
// 					images.eq(after).find(".title").addClass(CSS_SHOW);
// 				}

// 				index = after;
// 			}
// 		},

// 		slide : function(param) {
// 			var images = param.obj || param.data.obj,
// 				length = images.length,
// 				duration = param.duration || param.data.duration,
// 				prev,
// 				next,
// 				before,
// 				after;
// console.log(index+2)
// 			// 控制两次点击的时间间隔大于动画时间	
// 			if (changeType.flag) {
// 				changeType.first = new Date();
// 				changeType.flag = false;
// 			} else {
// 				changeType.second = new Date();
// 				if (changeType.second - changeType.first <= duration) {
// 					return false;
// 				} else {
// 					changeType.first = changeType.second;
// 				}
// 			}

// 			if (param.data && param.data.d == 0) {      		

// 				// 向左
// 				if (direction == 0) {		// 与上次操作方向相同
// 					prev = left.shift();
// 				} else {					// 与上次操作方向相反
// 					prev = left.pop();
// 				}

// 				images.eq(index).css("left", step);
// 				images.eq(prev).addClass(CSS_SHOW).css("left", "0");
// 				if (param.data) {
// 					images.eq(index).find(".title").removeClass(CSS_SHOW);
// 					images.eq(prev).find(".title").addClass(CSS_SHOW);
// 				}

// 				right.push(index);
// 				if (left.length == 0) {
// 					before = prev - 1;
// 					if (before < 0) {
// 						before = length + before;
// 					}
// 					if (before === right[0]) {
// 						right.shift();
// 					}
// 					images.eq(before).removeClass(CSS_SHOW).css("left", -step);
// 					left.push(before);
// 				}

// 				index = prev;
// 				direction = 0;
// 			} else {                     	

// 				// 向右
// 				if (direction == 1) {		// 与上次操作方向相同
// 					next = right.shift();
// 				} else {					// 与上次操作方向相反
// 					next = right.pop();
// 				}
				
// 				images.eq(index).css("left", -step);
// 				images.eq(next).addClass(CSS_SHOW).css("left", "0");
// 				if (param.data) {
// 					images.eq(index).find(".title").removeClass(CSS_SHOW);
// 					images.eq(next).find(".title").addClass(CSS_SHOW);
// 				}

// 				left.push(index);
// 				if (right.length == 0) {
// 					after = next + 1;
// 					if (after >= length) {
// 						after = length - after;
// 					}
// 					if (left[0] === after) {
// 						left.shift();	
// 					}
// 					images.eq(after).removeClass(CSS_SHOW).css("left", step);
// 					right.push(after);
// 				}

// 				index = next;
// 				direction = 1;
// 			}
// 		}
// 	};

	var auto = function(_obj, _type, _duration) {
		return setInterval(function() {
			switch (_type) {
				case "fade": 
					fade({
						obj : _obj,
						duration : _duration
					});
					break;
				case "slide":
					slide({
						obj : _obj,
						duration : _duration
					});
			}
		},5000);
	};
})(jQuery);