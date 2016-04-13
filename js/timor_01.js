/*
 *
 *	1. getStyle( obj, attr )      获取对象的非行内样式
 *
 *	2. getByClass( sName, obj )   通过class获取对象	
 *
 *
 *	3. $( para, obj )		封装 window.onload, 
 *							通过ID 获取对象
 *							通过class 获取对象
 *
 *	4. opaChange( obj, target )	  缓冲的速度改变对象的透明度
 *
 *
 * 	5. move( obj, attr, target )	改变对象的位置、宽高(缓冲)
 *
 *
 * 	6. goodMove( obj, json, fn)		使用缓冲改变多个对象属性
 *
 *
 * 	7. timeMove( obj, json, time, moveStyle, fn )
 * 									tween时间运动函数
 * 
 */


// getStyle(obj,attr); 用于获取元素的非行间样式
// 直接使用对象的style属性只能取得元素的行内样式
// 如果要获取元素的非行间样式，即css样式表中的设置，及header中的style标签，需要使用函数
// 由于currentStyle();只能兼容IE
// 	getComputedStyle(obj,false)['className']; IE 不支持
// 需要对这两个函数进行封装

function getStyle(obj,para){
	para = para.split(' ').join('');
	return obj.currentStyle ? obj.currentStyle[para] : getComputedStyle(obj,false)[para];
}



// 通过class名来获取对象

function getByClass( sName,obj ){
	var obj = obj || document;
	if(document.getElementsByClassName){
		return obj.getElementsByClassName(sName);
	}
	var all = obj.getElementsByTagName('*');
	var end = [];
	for(var i = 0; i < all.length; i++){
		var arr = all[i].className.split(' ');
		for(var j = 0; j < arr.length; j++){
			if(arr[j] == sName){
				end.push(all[i]);
			}
		}
	}
	return end;
}




// 类似jQuery的$符的整合函数
function $timor( para, obj){
	var lowPara = (typeof para).toLowerCase();
	if(lowPara == 'function'){
		return window.onload = para;
	}else if(lowPara == 'string'){
		var obj = obj || document;
		var fPara = para.charAt(0);
		var sPara = para.slice(1);
		if(fPara == '#'){
			return obj.getElementById(sPara);
		}else if(fPara == '.'){
			if(document.getElementsByClassName){
				return obj.getElementsByClassName(sPara);
			}else{
				var arr = [];
				var all = obj.getElementsByTagName('*');
				for(var i = 0; i < all.length; i++){
					var arrName = all[i].className.split(' ');
					for(var j = 0; j < arrName.length; j++){
						if(arrName[j] == sPara){
							arr.push(all[i]);
						}
					}
				}
				return arr;
			}
		}
	}
}



// 带有缓冲效果的透明度改变
// 		@ obj     --->	需要改变透明度的对象
// 						
// 		@ target  --->	运动的目标位置(结束时需要达到的透明度)
function opaChange( obj, target){
	var timer = null; 
	var times = 50;			// 单位时间间隔大小
	var G = 6;				// 缓冲运动初速度的强度
	timer = setInterval(function(){
		var nowPosition = parseInt(getStyle( obj, 'opacity' )*100);
		
		if(nowPosition == target){
			clearInterval(timer);
		}else{
			var iSpeed = (target - nowPosition)/G; // 单位时间内的速度
			iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);
			var end = parseInt(getStyle( obj, 'opacity' )*100) + iSpeed;
			console.log(end)
			obj.style.opacity = end/100;
			obj.style.filter = 'alpha(opacity=' + end + ');';
		}
		
	},times)
}





// 带有缓冲效果的运动
// 		@ obj     --->	运动的对象
// 		@ attr    --->	被改变的样式( left, top, right, 
// 						bottom, width, height)
// 		@ target  --->	运动的目标位置(可以是位置或宽高)
function move( obj, attr, target){
	var timer = null; 
	var times = 50;			// 单位时间间隔大小
	var G = 6;				// 缓冲运动初速度的强度
	timer = setInterval(function(){
		var nowPosition = parseInt(getStyle( obj, attr ));
		
		if(nowPosition == target){
			clearInterval(timer);
		}else{
			var iSpeed = (target - nowPosition)/G; // 单位时间内的速度
			iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);
			var end = parseInt(getStyle( obj, attr )) + iSpeed;
			obj.style[attr] = end + 'px';
		}
		
	},times)
}




// 完整缓冲运动函数封装
// @ obj	-->		执行运动的元素
// @ json	-->		需要改变的属性
// @ fn 	-->		可能会调用的回调函数
// @ 
// 			调用了函数 getStyle( obj, attr )
function goodMove( obj, json, fn){
	var iTime = 30;			// 单位时间间隔
	var iSpeed = 0;			// 单位时间间隔的速度
	var G = 6;				// 缓冲运动的初速度强度

	obj.timer = setInterval(function(){
		var onOff = true;		// 时钟的开关
		for(var attr in json){
			var nowPos = attr == 'opacity' ? parseInt(getStyle( obj, attr )*100) : parseInt(getStyle( obj, attr));  		// 当前属性的值
			if(nowPos != json[attr]){
				onOff = false;
			}
			iSpeed = (json[attr] - nowPos)/G;
			iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);		// 根据方向进行取整
			var end = nowPos + iSpeed;
			if( attr == 'opacity' ){
				obj.style.opacity = end/100;
				obj.style.filter = 'alpha(opacity='+ end +')';
			}else{
				obj.style[attr] = end + 'px';
			}
		}
		if( onOff ){
			clearInterval(obj.timer);
			if( fn ){ fn(); }
		}
	},iTime)
}


// 利用Flash的Tween时间运动函数，DOM对象的时间运动
// 
// 
// @ obj      -->   发生运动的对象 
// @ json	  -->	运动的目标(可以是多个属性目标)
// @ time 	  -->	运动过程花费的中时间
// @ moveSytle  -->	  运动的方式
// @ fn 	  -->	运动结束后可以调用其他函数
// 
// 
function timeMove( obj, json, time, moveStyle, fn ){
	var iTime = 30;			// 单位时间颗粒

	moveStyle = moveStyle || 'linear';		//默认运动方式是匀速
	time = time || 500;			// 运动总时长

	var iB = {};
	var iC = {};
	for( attr in json ){
		if( attr == 'opacity'){
			iB[attr] = parseInt(getStyle( obj, attr )*100);
			iC[attr] = parseInt(json[attr]) - parseInt(getStyle( obj, attr )*100); 
		}else{
			iB[attr] = parseInt(getStyle( obj, attr ));
			iC[attr] = parseInt(json[attr]) - parseInt(getStyle( obj, attr )); 
		}
	}

	var startTime = new Date().getTime();

	obj.timer = setInterval(function(){
		var nowTime = new Date().getTime();
		iT = Math.min( nowTime-startTime, time);

		if ( iT == time ) {
			clearInterval(obj.timer);
			if ( fn ) { fn() };
		};

		// console.log(nowTime)
		for( attr in json ){
			// 通过
			var value = Math.round(Tween[moveStyle]( iT, iB[attr], iC[attr], time));
			if( attr == 'opacity'){
				obj.style.opacity = value/100;
				obj.style.filter = 'alpha(opacity='+ value +')';
			}else{
				obj.style[attr] = value + 'px';
			}				
		}
	},iTime)



// Tween 运动曲线
// @ t 		-->		运动开始到当前状态过去了的时间累计值
// @ b 		-->		运动元素属性的初始位置
// @ c 		-->		对象到达目标位置，属性需要走过的路程
// @ d 		--> 	整个运动过程设定的时间
// @


var Tween = {
	linear: function(t, b, c, d) { //匀速
		return c * t / d + b;
	},
	easeIn: function(t, b, c, d) { //加速曲线
		return c * (t /= d) * t + b;
	},
	easeOut: function(t, b, c, d) { //减速曲线
		return -c * (t /= d) * (t - 2) + b;
	},
	easeBoth: function(t, b, c, d) { //加速减速曲线
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t + b;
		}
		return -c / 2 * ((--t) * (t - 2) - 1) + b;
	},
	easeInStrong: function(t, b, c, d) { //加加速曲线
		return c * (t /= d) * t * t * t + b;
	},
	easeOutStrong: function(t, b, c, d) { //减减速曲线
		return -c * ((t = t / d - 1) * t * t * t - 1) + b;
	},
	easeBothStrong: function(t, b, c, d) { //加加速减减速曲线
		if ((t /= d / 2) < 1) {
			return c / 2 * t * t * t * t + b;
		}
		return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
	},
	elasticIn: function(t, b, c, d, a, p) { //正弦衰减曲线（弹动渐入）
		if (t === 0) {
			return b;
		}
		if ((t /= d) == 1) {
			return b + c;
		}
		if (!p) {
			p = d * 0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
	},
	elasticOut: function(t, b, c, d, a, p) { //正弦增强曲线（弹动渐出）
		if (t === 0) {
			return b;
		}
		if ((t /= d) == 1) {
			return b + c;
		}
		if (!p) {
			p = d * 0.3;
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
	},
	elasticBoth: function(t, b, c, d, a, p) {
		if (t === 0) {
			return b;
		}
		if ((t /= d / 2) == 2) {
			return b + c;
		}
		if (!p) {
			p = d * (0.3 * 1.5);
		}
		if (!a || a < Math.abs(c)) {
			a = c;
			var s = p / 4;
		} else {
			var s = p / (2 * Math.PI) * Math.asin(c / a);
		}
		if (t < 1) {
			return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) *
				Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
		}
		return a * Math.pow(2, -10 * (t -= 1)) *
			Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
	},
	backIn: function(t, b, c, d, s) { //回退加速（回退渐入）
		if (typeof s == 'undefined') {
			s = 1.70158;
		}
		return c * (t /= d) * t * ((s + 1) * t - s) + b;
	},
	backOut: function(t, b, c, d, s) {
		if (typeof s == 'undefined') {
			s = 3.70158; //回缩的距离
		}
		return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
	},
	backBoth: function(t, b, c, d, s) {
		if (typeof s == 'undefined') {
			s = 1.70158;
		}
		if ((t /= d / 2) < 1) {
			return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
		}
		return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
	},
	bounceIn: function(t, b, c, d) { //弹球减振（弹球渐出）
		return c - Tween['bounceOut'](d - t, 0, c, d) + b;
	},
	bounceOut: function(t, b, c, d) {
		if ((t /= d) < (1 / 2.75)) {
			return c * (7.5625 * t * t) + b;
		} else if (t < (2 / 2.75)) {
			return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
		} else if (t < (2.5 / 2.75)) {
			return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
		}
		return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
	},
	bounceBoth: function(t, b, c, d) {
		if (t < d / 2) {
			return Tween['bounceIn'](t * 2, 0, c, d) * 0.5 + b;
		}
		return Tween['bounceOut'](t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
	}
}
}