
/*************************************************************
 *
 *
 *	1. 		$( para, obj )			类似jQuery的$函数
 *
 *	2.		getByClass( sName,obj )		通过class名获取对象
 *
 *  3.		getStyle( obj, para )		获取对象的非行间样式
 *
 *	4. 		bufferMove( obj, json, fn )		缓冲运动
 *
 * 			tween时间框架的数据整合
 * 	5. 		moveNextPos( startTime, nowPos, target, times, styleNum)
 *
 * 			tween时间运动框架
 *	6. 		tweenMove( obj, json, times, styleNum, fn)
 *
 * 	7. 		oEvent		事件函数集合
 *
 *
 *
 * 	json	TweenStyles( tween运动方式 )  
 * 			tween( tween时间函数 )
 * 
 *
 * ***********************************************************
 */



/*************************************************************
 *
 * 	oEvent     事件对象封装
 *
 * 	@ bind 			--> 	给对象添加事件
 * 	@ unbind 		--> 	删除对象中的事件
 * 	@ getEvent  	--> 	获取事件对象	
 * 	@ getType 		--> 	获取事件的类型
 * 	@ getTarget 	--> 	获取事件的源元素对象
 * 	@ preventDefault  --> 	阻止默认行为
 * 	@ stopBubble 	--> 	阻止冒泡传递
 * 
 */

var oEvent = {

	// 添加事件
	bind : function( obj, eName, fn ){
		if( obj.addEventListener ){
			obj.addEventListener( eName, fn, false );
		}else if( obj.attachEvent ){
			// 可以被删除//
			obj.attachEvent( 'on'+eName, fn );    
			// 下面这种写法创建的事件无法被删除，因为函数fn未被传递给detachEvent
			// obj.attachEvent( 'on'+eName, function( event ){
			// 	return fn.call( obj, event );
			// } );
		}else{
			obj['on'+eName] = fn;
		}
	},

	// 删除事件
	unbind : function( obj, eName, fn ){
		if( obj.removeEventListener ){
			obj.removeEventListener( eName, fn, false);
		}else if( obj.detachEvent ){
			obj.detachEvent( 'on'+eName, fn );
		}else{
			obj['on'+eName] = null;
		}
	},

	// 获取event对象
	getEvent : function( event ){
		return event ? event : window.event;
	},

	// 获取事件类型
	getType : function( event ){
		return event.type;
	},

	// 获取事件的目标元素
	getTarget : function( event ){
		return event.target || event.srcElement;
	},

	// 阻止事件的默认行为
	preventDefault : function( event ){
		if( event.preventDefault ){
			event.preventDefault();
		}else{
			event.returnValue = false;
		}
	},

	// 阻止事件冒泡
	stopBubble : function( event ){
		if( event.stopPropagation ){
			event.stopPropagation();
		}else{
			event.cancelBubble = true;
		}
	}
}


/*************************************************************
 *
 *	封装类似jQuery 的$()函数，通过ID、CLASS获取对象
 *
 *	$( para, obj )
 *
 *	@ para	   --> 	  获取对象时传入的参数
 *	@ obj      --> 	  获取class对象时的限定范围
 * 
 */

function $look( para, obj ){
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




/**********************************************************
 *
 *	通过class名来获取对象集合
 *
 *	getByClass( sName,obj )
 *
 *	@ sName 	--> 	目标对象的class名
 *	@ obj 		--> 	限定目标对象的范围
 * 
 */

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


/************************************************
 *
 *	获取元素对象的属性值
 *
 *		getStyle( obj, para )
 *
 * 	@ obj 		-->			需要获取属性的对象
 *  @ para 		--> 		获取的属性
 *
 */

function getStyle( obj, para ){
	para = para.split(' ').join('');
	return obj.currentStyle ? obj.currentStyle[para] : getComputedStyle( obj, false )[para];
}




/* 
 *****************************************************************
 * 
 *  缓冲运动
 *  
 *  	bufferMove( obj, json, fn )
 *
 *  @ obj 	-->		运动的元素对象
 *  @ json	--> 	参与运动的属性( 可以传入多个属性 )
 *  @ fn 	-->		运动结束后可以调用的回调函数
 *
 *	&  调用了函数 getStyle( obj, attr )
 * 
 */ 

function bufferMove( obj, json, fn ){
	var iTime = 30; 				// 缓冲运动时间颗粒
	var G = 5; 					    // 缓冲运动轨迹坡度，值越大速度越慢，轨迹越接近匀速
	var MAXspeed = 20;				// 设定运动的最大速度
	clearInterval( obj.timer );

	obj.timer = setInterval(function(){
		var timerSwitch = true;
		for( attr in json ){
			if( attr == 'opacity' ){		// 找出运动属性的初始值
				var nowPos = Math.round(parseInt( getStyle( obj, 'opacity' )*100 ));				
				nowPos = nowPos == 56 ? 58 : nowPos;
			}else{
				var nowPos = parseInt( getStyle( obj, attr ) );
			}
			if( nowPos != json[attr] ){		// 只要有任意一个属性未到达目标点，都关闭开关
				timerSwitch = false;
			}
			var iSpeed = ( json[attr] - nowPos )/G;
			
			iSpeed = iSpeed > 0 ? Math.ceil( iSpeed ) : Math.floor( iSpeed );
			if( Math.abs( iSpeed ) > MAXspeed ){	// 限定运动的最大速度
				iSpeed = iSpeed > 0 ? MAXspeed : -MAXspeed;
			}
			var end = parseInt(nowPos) + parseInt(iSpeed);
			if( attr == 'opacity' ){
				console.log( '当前的opacity：' + nowPos +'---加 '+
					iSpeed+ ' 之后赋值：'+ end )
				obj.style.opacity = end/100;
				obj.style.filter = 'alpha(opacity='+ end +')';
			}else{
				obj.style[attr] = end + 'px';
			}
		}
		if ( timerSwitch ) {			// 开关打开  清除定时器 结束运动
			clearInterval( obj.timer );
			if ( fn ) { fn() }
		}
		
	}, iTime)
}

/******************************************************************
 *
 *	Tween曲线下，目标下次应到达的位置
 *	
 *    moveNextPos( startTime, nowPos, target, times, changeStyle)
 *
 *	@ startTime 	--> 	整个运动开始的起始时间戳
 *	@ nowPos 		--> 	目标当前的位置
 *	@ target  		--> 	运动过程的终点
 *	@ times 	 	--> 	整个运动过程的时间总量	
 *	@ changeStyle   --> 	运动方式
 *
 *  &&&&&&& 调用了 Tween 曲线函数
 */

function moveNextPos( startTime, nowPos, target, times, styleNum){
	var nowTime = new Date().getTime();
	var passTime = nowTime - startTime;
	var odd = target - nowPos;
	changeStyle = TweenStyles[styleNum]
	return Tween[changeStyle]( passTime, nowPos, odd, times );
}


/*********************************************************************
 *
 *	Tween 运动
 *		使用Tween运动曲线来改变目标对象的属性
 *  	tweenMove( obj, json, times, styleNum, fn)
 *
 *	@ obj 		--> 		需要运动的对象
 *	@ json 		--> 		发生改变的属性集合
 *	@ times 	--> 		运动过程总时长
 *	@ styleNum  --> 		运动方式标签
 *	@ fn 		--> 		运动结束后调用的函数
 *
 * **************************************************************
 * 	&&&&&&&&&   调用了 Tween 曲线运动函数	
 * 				getStyle( obj, attr )
 *
*		### Tween 提供的运动方式 ###
 *
 * 		1.  加速类
 * 			2	easeIn 		-->		加速
 * 			5	easeInStrong-->		强力加速
 * 			8	elasticIn   --> 	先上劲，强力加速到结束
 * 				
 * 			
 *    	2.  减速类
 *     		3	easeOut 	  --> 	减速
 *     		6	easeOutStrong -->   高速启动，强力减速
 *
 * 		3.	平缓类
 * 		
 *   		1	linear		-->	 	匀速
 *   		4	easeBoth 	--> 	先加速，再减速
 *   		14	bounceIn 	--> 	弹两下，中速到终点
 *
 * 		4.  复杂运动
 * 			12	bounceOut   -->     酝酿加速，撞墙，回弹减速停止
 * 			16	bounceBoth  --> 	开头结尾各弹两下
 *   		7	easeBothStrong 			
 *   				-->  	缓慢启动，强力加速，强力减速，缓慢结束
 *      	9	elasticOut			
 *      		    --> 	高速出发，超出结束位置，左右回弹减速至停止
 *          10  elasticBoth
 *            	    --> 	缓慢回弹加速，高度运行，缓慢回弹减速
 *            	    
 *          11  backIn		--> 	回弹一下，中速运行结束
 *          12  backOut 	--> 	中速运行，超出很长目标，回弹结束
 *          13  backBoth 	--> 	开始、结束都发生回弹，中速运行
 *
 * **********************************************************************
 */

function tweenMove( obj, json, times, styleNum, fn){
	var iTime = 30;				// 单位时间颗粒
	styleNum = styleNum == undefined ? 2 : styleNum;
	times = times == undefined ? 500 : times;
	var changeStyle = TweenStyles[styleNum];   //把数字转换为运动方式
	clearInterval(obj.timer);			// 每次调用此函数会先清理之前的函数
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
		iT = Math.min( nowTime-startTime, times);
		if ( iT == times ) {
			clearInterval(obj.timer);
			if ( fn ) { fn() };
		};
		for( attr in json ){
			var nextPos = Math.round( Tween[changeStyle]( iT, iB[attr], iC[attr], times ) );

			if( attr == 'opacity'){
				obj.style.opacity = nextPos/100;
				obj.style.filter = 'alpha(opacity='+ nextPos +')';
			}else{
				obj.style[attr] = nextPos + 'px';
			}
		}

	},iTime)
	
}



// Tween 曲线运动下的运动方式

var TweenStyles = {
	'1'  : 	'linear',
	'2'  : 	'easeIn',
	'3'  : 	'easeOut',
	'4'  : 	'easeBoth',
	'5'  : 	'easeInStrong',
	'6'  : 	'easeOutStrong',
	'7'  : 	'easeBothStrong',
	'8'  : 	'elasticIn',
	'9'  : 	'elasticOut',
	'10' : 	'elasticBoth',
	'11' :  'backIn',
	'12' :  'backOut',
	'13' :  'backBoth',
	'14' :  'bounceIn',
	'15' :  'bounceOut',
	'16' :  'bounceBoth'
}



/*****************************************************************
 *
 *	Tween 时间框架
 *
 *	tween[moveStyle]( t, b, c, d ) 			--> 	单个运动颗粒
 *	注意: 此函数只是告诉你，你想从北京去深圳花费100天时间的话，使用
 *		  各种运动方式的话，你下一个时间颗粒结束应到达的地方，比如石家庄
 *		  
 *  ---->  此框架只返回:目标从当前位置出发需要到达的下一个位置
 * 	
 *	@   t 		--> 	从第一步启程到当前过去的毫秒数
 *	@ 	b 		-->		当前目标的位置
 *	@	c 		--> 	目标位置 - 当前位置( 剩余的路程 )
 *	@	d 		--> 	设定的完成整套运动耗费的总时间
 * 
 */

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

