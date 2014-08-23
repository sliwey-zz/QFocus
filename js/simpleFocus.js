/**
 *  simpleFocus.js   v1.0.0
 *  
 *	author: sliwey
 *  date: 2014-8-20
 *  update: 2014-8-23	
 */

;(function($) {

	var defaluts = {
		width : 600,
		height : 300,
		title : true,
		type : "fade",		
		duration : 500,		// 动画持续时间
		interval : 5000		// 自动播放时间间隔
	};

	$.fn.extend({
		simpleFocus : function(options) {
			var setting = $.extend({}, defaluts, options);
			init(setting, this);
			return this;
		}
	});
	
	var CSS_SHOW = "show";

	var init = function(setting, _this) {
		var images = _this.find("li"),
			length = images.length,
			interval,
		    duration,
		    titles, title,
			len, img, i,
			prev, next,
			options = {},
			autoOpt = {},	// 自动播放参数
			style,			// 要执行的动画函数
			
			// slide
			step = 0,
			left = [],
			right = [];
		
		// 必要元素初始化
		images.eq(0).addClass(CSS_SHOW);
		_this.css({"width" : setting.width, "height" : setting.height});
		_this.append("<span class=\"prev\"></span><span class=\"next\"></span>");

		// 设置title
		if (setting.title) {
			for (i = 0; i < length; i++) {
				img = images.eq(i);
				title = img.find("a").attr("title");
				img.append("<p class=\"title\">"+title+"</p>");
			}
		}

		// 设置动画持续时间
		duration = {
			"transition-duration" : setting.duration + 'ms',
			"-webkit-transition-duration" : setting.duration + 'ms'
		};

		for (i = 0; i < length; i++) {
			images.eq(i).css(duration);
		}

		titles = _this.find(".title");
		len = titles.length;
		for (i = 0; i < len; i++) {
			titles.eq(i).css(duration);
		}

		prev = _this.find(".prev");
		next = _this.find(".next");
		prev.css(duration);
		next.css(duration);

		// fade
		if (setting.type == "fade") {

			// 每次都创建个新的动画函数，使同一个页面能多次调用
			style = new Fade();
			options = {
				obj : images,
				duration : setting.duration
			};
			prev.on("click", $.extend({d:0}, options), style);
			next.on("click", $.extend({d:1}, options), style);
		}
		
		// slide
		if (setting.type == "slide") {
			step = _this.width();
			_this.children("ul").addClass("slide");
			images.eq(length - 1).css("left", -step);
			images.eq(1).css("left", step);

			// 即将显示的图片进入容器等待
			left.push(length - 1);
			right.push(1);

			// 每次都创建个新的动画函数，使同一个页面能多次调用
			style = new Slide();
			options = {
				obj : images,
				duration : setting.duration,
				left : left,
				right : right,
				step : step
			};
			prev.on("click", $.extend({d:0}, options), style);
			next.on("click", $.extend({d:1}, options), style);
		}
	
		// 设置自动播放参数
		autoOpt = {
			obj : images,
			type : setting.type,
			duration : setting.duration
		};
		$.extend(autoOpt, options);

		// 控制显隐元素
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
					interval = auto(style, autoOpt, setting.interval);    
				}
			});
		});

		// 自动播放
		interval = auto(style, autoOpt, setting.interval);
	};
	
	var Fade = function() {
		var index = 0,		// 当前图片下标
			before, after,
			flag = true,
			first = 0,
			second = 0,
			isFirst = true,
			images, length,
			duration;

		var _fade = function(param) {
			if (isFirst) {
				images = param.obj || param.data.obj,
				length = images.length,
				duration = param.duration || param.data.duration;
				isFirst = false;
			}
				

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

		// 返回动画函数
		return _fade;
	};

	var Slide = function() {
		var index = 0,
			prev, next,
			before, after,
			flag = true,
			first = 0,
			second = 0,
			direction,
			isFirst = true,
			images, length,
			duration,
			left = [],
			right = [],
			step = 0;
				
		var _slide = function(param) {
			if (isFirst) {
				images = param.obj || param.data.obj;
				length = images.length;
				duration = param.duration || param.data.duration;
				left = param.left || param.data.left;
				right = param.right || param.data.right;
				step = param.step || param.data.step;
				isFirst = false;
			} 

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

		// 返回动画函数	
		return _slide;
	};

	var auto = function(fn, options, interval) {
		return setInterval(function() {
			fn(options);
		}, interval);
	};
})(jQuery);