


// 轮播图部分
(function(){

var iNum = 0;
var timer = null;
var dir = true;

autoPlay( dir );

$('.banner').mouseenter( function(){
	clearInterval( timer );
})

$('.banner').mouseleave( function(){
	clearInterval( timer );
	autoPlay( dir );
})

$('#ban_left').click( function(){
	dir = false;
	iNum = iNum == 0 ? 3 : --iNum;
	changPic( iNum );
	clearInterval( timer );
	autoPlay( dir );
} );
$('#ban_right').click( function(){
	dir = true;
	iNum = iNum == 3 ? 0 : ++iNum;
	changPic( iNum );
	clearInterval( timer );
	autoPlay( dir );
} )

$('#ban_li a').click( function(){
	clearInterval( timer );
	var num = $(this).index();
	dir = num < iNum ? false : true;
	iNum = num;
	changPic( num );
} )



function autoPlay( dir ){
	timer = setInterval(function(){
		if ( dir ) {
			iNum = iNum == 3 ? 0 : ++iNum;
		}else{
			iNum = iNum == 0 ? 3 : --iNum;
		}
		changPic( iNum );
	},2000)
}


function changPic( iNum ){
	$('.banner ul li').eq( iNum ).fadeIn( 500 ).siblings().fadeOut( 500 );
	$('#ban_li a').eq( iNum ).css( {
		'color' : '#F60606',
		'background' : '#fff'
	}).siblings().css({
		'color' : '#Fff',
		'background' : '#F60606'
	})
}

})();


// 放大镜部分
(function(){


oEvent.bind( $look('#float'), 'mousemove', showMini );
oEvent.bind( $look('#float'), 'mouseout', hideMini );


// 显示放大镜、显示浮动白块、限定浮动白块位置
function showMini( ev ){
	var ev = oEvent.getEvent( ev );
	var x = ev.clientX - $look('#box').offsetLeft - 3 - $look('#mini').offsetWidth/2;
	var y = ev.clientY - $look('#box').offsetTop - 3 - $look('#mini').offsetHeight/2;

	$look('#mini').style.opacity = '0.5';
	$look('#max').style.display = 'block';
	$look('#mini').style.left = x + 'px';
	$look('#mini').style.top = y + 'px';
	if( x <= 0 ){
		$look('#mini').style.left = 0;
	}
	if( x >= $look('#float').offsetWidth - $look('#mini').offsetWidth ){
		$look('#mini').style.left = $look('#float').offsetWidth - $look('#mini').offsetWidth + 'px';
	}
	if( y <= 0 ){
		$look('#mini').style.top = 0;
	}
	if( y >= $look('#float').offsetHeight - $look('#mini').offsetHeight ){
		$look('#mini').style.top = $look('#float').offsetHeight - $look('#mini').offsetHeight + 'px';
	}

	$look('#maximg').style.marginLeft = -3 * $look('#mini').offsetLeft + 'px';
	$look('#maximg').style.marginTop = -3*$look('#mini').offsetTop + 'px';


}

// 隐藏放大镜
function hideMini(){
	$look('#mini').style.opacity = '0';
	$look('#max').style.display = 'none';
}



})();

(function(){

var oDiv2 = document.getElementById('div2');
var oDiv3 = document.getElementById('div3');

new Drag( oDiv3 );
new LimitDrag( oDiv2 );



function Drag( oDiv ){
	this.oDiv = oDiv;
	this.disX = 0;
	this.disY = 0;

	var _this = this;
	this.oDiv.onmousedown = function( ev ){
		_this.down( ev );
		return false;
	}
}

Drag.prototype.down = function( ev ){
	var _this = this;

	var ev = ev || event;
	this.disX = ev.clientX - this.oDiv.offsetLeft;
	this.disY = ev.clientY - this.oDiv.offsetTop;

	document.onmousemove = function( ev ){
		_this.move( ev );
	}

	document.onmouseup = function(){
		_this.up();
	}
}

Drag.prototype.move = function( ev ){
	var ev = ev || event;
	this.oDiv.style.left = ev.clientX - this.disX + 'px';
	this.oDiv.style.top = ev.clientY - this.disY + 'px';
}

Drag.prototype.up = function(){
	document.onmousemove = null;
	document.onmouseup = null;
}



function LimitDrag( oDiv ){
	Drag.call( this, oDiv );	
}

for ( var attr in Drag.prototype ) {
	LimitDrag.prototype[attr] = Drag.prototype[attr];
}

LimitDrag.prototype.move = function( ev ){
	var ev = ev || event;
	var left = ev.clientX - this.disX;
	var top = ev.clientY - this.disY;
	left = left <= 0 ? 0 : left;
	left = left >= document.documentElement.clientWidth-this.oDiv.offsetWidth ? document.documentElement.clientWidth-this.oDiv.offsetWidth : left;
	top = top <= 0 ? 0 : top;
	top = top >= document.documentElement.clientHeight-this.oDiv.offsetHeight ? document.documentElement.clientHeight-this.oDiv.offsetHeight : top;

	this.oDiv.style.left = left + 'px';
	this.oDiv.style.top = top + 'px';
}


})();