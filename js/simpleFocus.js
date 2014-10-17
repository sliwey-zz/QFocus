/**
 *  simpleFocus.js   v1.0.0
 *  
 *	author: sliwey
 *  date: 2014-8-20
 *  update: 2014-10-15	
 */

;(function($) {

	var defaluts = {
		width : 600,
		height : 300,
		title : true,
		type : "fade",		
		duration : 500,		// 动画持续时间
		interval : 5000,	// 自动播放时间间隔
		prevBtn : null,		// 左切换按钮
		nextBtn : null,		// 右切换按钮
		navControl : true
	};

	var CSS_SHOW = "show",
		canTransition = supportCSS3("transition");

	$.fn.extend({
		simpleFocus : function(options) {
			var setting = $.extend({}, defaluts, options);
			init(setting, this);
			return this;
		}
	});


	function init(setting, _this) {
		var images = _this.find("li"),
			length = images.length,
			interval,
		    duration,
		    titles, title,
			len, img, i,
			prev, next,
			options = {},
			style;			// 要执行的动画函数
			
		
		// 必要元素初始化
		if (canTransition) {
			images.eq(0).addClass(CSS_SHOW);
		} else {
			images.addClass(CSS_SHOW).hide();
			images.eq(0).show();
		}
		images.css("width", setting.width);
		_this.css({"width" : setting.width, "height" : setting.height});

		// 设置切换按钮
		if (!setting.prevBtn && !setting.nextBtn) {
			_this.append("<span class='simpleFocus-prev'>&lsaquo;</span><span class='simpleFocus-next'>&rsaquo;</span>");
		}

		// 设置title
		if (setting.title) {
			for (i = 0; i < length; i++) {
				img = images.eq(i);
				title = img.find("a").attr("title");
				img.append("<p class='simpleFocus-title'><span>" + title + "</span></p>");
			}
		}

		// 设置切换条
		if (setting.navControl) {
			_this.append(createNav(length));
			nav = _this.find(".simpleFocus-nav dd");
		}

		// 设置动画持续时间
		duration = {
			"transition-duration" : setting.duration + 'ms'
		};

		for (i = 0; i < length; i++) {
			images.eq(i).css(duration);
		}

		titles = _this.find(".simpleFocus-title");
		len = titles.length;
		for (i = 0; i < len; i++) {
			titles.eq(i).css(duration);
		}

		prev = setting.prevBtn || _this.find(".simpleFocus-prev");
		next = setting.nextBtn || _this.find(".simpleFocus-next");

		// fade
		if (setting.type == "fade") {

			// 每次都创建个新的动画函数，使同一个页面能多次调用
			style = new Animation.Fade();
			options = {
				_this : _this,
				obj : images,
				duration : setting.duration
			};
			prev.on("click", $.extend({d : 0}, options), style);
			next.on("click", $.extend({d : 1}, options), style);	
		}
		
		// slide
		if (setting.type == "slide") {
			var wrapUl = _this.children("ul");
			var first = images.eq(0).clone(true);
			var last = images.eq(length - 1).clone(true);
			
			wrapUl.append(first);
			wrapUl.prepend(last);
			wrapUl.addClass("slide");

			wrapUl.css("width", _this.width() * (length + 2));

			if (canTransition) {
				wrapUl.css({
					"transition-duration": "0s",
					"transform":"translate3d(" + (-_this.width()) + "px, 0, 0)",
					"left":"0"
				});
			} else {
				wrapUl.css("left", -_this.width());
			}

			// 每次都创建个新的动画函数，使同一个页面能多次调用
			style = new Animation.Slide();
			options = {
				_this: _this,
				obj : images,
				duration : setting.duration
			};
			prev.on("click", $.extend({d:0}, options), style);
			next.on("click", $.extend({d:1}, options), style);
		}

		// 控制显隐元素
		_this.on("mouseenter mouseleave", function(event) {
			var target = $(event.relatedTarget),
				title = images.find(".simpleFocus-title");
			if (event.type == "mouseenter") {
				prev.addClass(CSS_SHOW);
				next.addClass(CSS_SHOW);
				title.addClass(CSS_SHOW);
				
				// 暂停自动播放
				clearInterval(interval);    
			} else {
				prev.removeClass(CSS_SHOW);
				next.removeClass(CSS_SHOW);
				title.removeClass(CSS_SHOW);

				// 自动播放
				interval = auto(style, options, setting.interval);    
			}
		});
		
		// 切换条事件绑定
		if (setting.navControl) {
			nav.each(function(i) {
				$(this).on("click", function() {
					style($.extend({active : i}, options));
				});
			});
		}


		// 自动播放
		// interval = auto(style, options, setting.interval);
	};
	
	var Animation = {
		Fade : function() {
			var _this,
				index = 0,		// 当前图片下标
				before, after,
				flag = true,
				first = 0,
				second = 0,
				isFirst = true,
				images, length,
				duration,
				active,
				status,
				step = 1;

			function _fade(param) {
				if (isFirst) {
					_this = param._this || param.data._this;
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

				active = typeof param.active == "number" ? param.active : -1;
				status = changeStatus(index, active);
				// console.log(index, active,status)

				if (param.data && param.data.d === 0 || status.direction === 0) {
					
					// 向左    
					if (status.direction === 0) {
						step = status.step;
					} else {
						step = 1;
					}
					before = index - step;    
					if (before < 0) {
						before = length + before;
					}

					if (canTransition) {
						images.eq(index).removeClass(CSS_SHOW);
						images.eq(before).addClass(CSS_SHOW);
					} else {
						images.eq(index).fadeOut(duration);
						images.eq(before).fadeIn(duration);
					}

					index = before;
				} else {

					// 向右    
					if (status.direction === 1) {
						step = status.step;
					} else {
						step = 1;
					}    	
					after = index + step;        		
					if (after >= length) {
						after = length - after;
					}
				
					if (canTransition) {
						images.eq(index).removeClass(CSS_SHOW);
						images.eq(after).addClass(CSS_SHOW);
					} else {
						images.eq(index).fadeOut(duration);
						images.eq(after).fadeIn(duration);
					}

					index = after;
				}
				_this.find(".simpleFocus-nav dd").eq(index).addClass("selected").siblings("dd").removeClass("selected");
			};

			// 返回动画函数
			return _fade;
		},

		Slide : function() {
			var _this,
				wrap,
				index = 0,
				before, after,
				flag = true,
				first = 0,
				second = 0,
				isFirst = true,
				images, length,
				duration,
				active,
				status,
				distance,
				step = 1;
					
			function _slide(param) {
				if (isFirst) {
					_this = param._this || param.data._this;
					wrap = _this.children("ul");
					images = param.obj || param.data.obj;
					length = images.length;
					distance = images.eq(0).width();
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

				// active = typeof param.active == "number" ? param.active : -1;
				// status = changeStatus(index, active);

				if (param.data && param.data.d === 0 || status.direction === 0) {      		

					// 向左

					before = index - 1;    
					if (before < 0) {
						before = length + before;
					}
					if (canTransition) {
						wrap.css({
							"transition-duration": "0s",
							"transform":"translate3d(" + (-_this.width()) + "px, 0, 0)"
						});
						// images.eq(prev).addClass(CSS_SHOW).css("left", "0");
					} else {
						images.eq(index).animate({"left": distance}, duration);
						// images.eq(prev).show().animate({"left": "0"}, duration);
					}

					index = before;
				} else {                     	

					// 向右
					after = index + step;        		
					if (after >= length) {
						after = length - after;
					}

					if (canTransition) {
						images.eq(index).css("left", -distance);
						// images.eq(next).addClass(CSS_SHOW).css("left", "0");
					} else {
						images.eq(index).animate({"left": -distance}, duration);
						// images.eq(next).show().animate({"left": "0"}, duration);
					}

					index = after;
				}
			};

			function isFirst() {
				var self = _this;
			};

			function isLast() {

			};

			// 返回动画函数	
			return _slide;
		}
	}

	function auto(fn, options, interval) {
		return setInterval(function() {
			fn(options);
		}, interval);
	};

	function supportCSS3(style) {
		var prefix = ["webkit", "Moz", "ms", "o"],
			supportStyle = document.documentElement.style,
			styleTemp = style.split("-"),
			length = styleTemp.length,
			i,suffix,
			styleArr = [style];

			if (length > 1) {
				for (i = 0; i < length; i++) {
					styleTemp[i] = styleTemp[i].charAt(0).toUpperCase() + styleTemp[i].substring(1);
				}
			}

			suffix = styleTemp.join('');

			for (i = 0; i < 4; i++) {
				styleArr.push(prefix[i] + suffix);
			}

			for (i = 0; i < 5; i++) {
				if (styleArr[i] in supportStyle) {
					return true;
				}
			}
			return false;
	};

	function createNav(num) {
		var html = "<div class='simpleFocus-nav'><dl>";

		for (var i = 0; i < num; i++) {
			if (i == 0) {
				html += "<dd class='selected'></dd>";	
			} else {
				html += "<dd></dd>";	
			}
		}

		html += "</dl></div>";

		return html;
	};

	function changeStatus(cur, active) {
		var direction,step;

		if (active === -1) {
			return {};
		}
		if (cur <= active) {
			direction = 1;
			step = active - cur;
		} else {
			direction = 0;
			step = cur - active;
		}

		return {
			direction : direction,
			step : step
		};
	};

})(jQuery);