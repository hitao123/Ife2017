const WIDTH = 300,
	HEIGHT = 300,
	PI = Math.PI,
	WI = WIDTH/2,
	HG = HEIGHT/2,
	R3 = 90,
	R4 = 60,
	R5 = 40,
	rad = PI/30;

function isEmptyObject(obj) {
	let t;
	for(t in obj) {
		return false
	}
	return true
}


function Clock() {
	let canvas_clock = document.getElementById('clock'),
		canvas_pointer = document.getElementById('pointer'),
		ctx_clock = canvas_clock.getContext('2d'),
		ctx_pointer = canvas_pointer.getContext('2d');
	this.time = {};
	this.canvas_clock = canvas_clock;
	this.canvas_pointer = canvas_pointer;
	this.ctx_clock = ctx_clock;
	this.ctx_pointer = ctx_pointer;

	this.canvas_clock.width = WIDTH;
	this.canvas_clock.height = HEIGHT;

	this.canvas_pointer.width = WIDTH;
	this.canvas_pointer.height = HEIGHT;
	//初始化 表盘 时针 分针 秒针 位置
	this.init();

	//让时分秒钟开始运动
	let _this = this;
	setInterval(function(){
		_this.ctx_pointer.clearRect(0, 0, WIDTH, HEIGHT);
		let date = new Date(),
		 	second = (date.getSeconds() - 15 + 60) % 60,
		 	minute = (date.getMinutes() - 15 + 60) % 60,
		 	hour = (date.getHours() - 3 + 24) % 24,
			x1 = WIDTH/2 + R3*Math.cos(second*rad),
			y1 = HEIGHT/2 + R3*Math.sin(second*rad),
			x2 = WIDTH/2 + R4*Math.cos(minute*rad),
			y2 = WIDTH/2 + R4*Math.sin(minute*rad),
			x3 = WIDTH/2 + R5*Math.cos(5*hour*rad),
			y3 = HEIGHT/2 + R5*Math.sin(5*hour*rad),
			alarm;
			alarm = _this.time;
		_this.drawPointer(x1,y1);
		_this.drawPointer(x2,y2);
		_this.drawPointer(x3,y3);
		if(!isEmptyObject(alarm)) {
			//这里才是正确时间，上面的时间是对表盘的校正
			if(alarm['hour'] == date.getHours() && alarm['minute'] == date.getMinutes() && alarm['second'] == date.getSeconds()) {
				alert("wake up");
			}
		}
	},1000);
	//设置监听
	$('.set').on('click', function() {
		_this.getClock();
	});
}

Clock.prototype = {
	constructor: Clock,
	init: function() {
		this.ctx_clock.beginPath();
		this.ctx_clock.arc(WI,HG,120,0,PI*2,true); // 绘制大圆
		this.ctx_clock.stroke();
		this.ctx_clock.closePath();

		this.ctx_clock.beginPath();
		this.ctx_clock.arc(WI,HG,110,0,PI*2,true); // 绘制小圆
		this.ctx_clock.stroke();
		this.ctx_clock.closePath();

		this.ctx_clock.beginPath();
		this.ctx_clock.arc(WI,HG,5,0,PI*2,true); // 绘制中心
		this.ctx_clock.fill();
		this.ctx_clock.closePath();

		// 绘制表盘表格
		const R1 = 100,
			  R2 = 110,
			  arr = {
			  	"0":  3,
			  	"5":  4,
			  	"10": 5,
			  	"15": 6,
			  	"20": 7,
			  	"25": 8,
			  	"30": 9,
			  	"35": 10,
			  	"40": 11,
			  	"45": 12,
			  	"50": 1,
			  	"55": 2
		};
		for(let i = 0; i < 60; i++) {
			let x1 = WIDTH/2 + R1*Math.cos(i*rad),
				y1 = HEIGHT/2 + R1*Math.sin(i*rad),
				x2 = WIDTH/2 + R2*Math.cos(i*rad),
				y2 = WIDTH/2 + R2*Math.sin(i*rad),
				x3 = WIDTH/2 + R3*Math.cos(i*rad),
				y3 = HEIGHT/2 + R3*Math.sin(i*rad);
			this.ctx_clock.beginPath();
			if(i % 5 == 0) {
				this.ctx_clock.lineWidth = 1;
				this.ctx_clock.font = "14px serif";
				this.ctx_clock.textAlign = "center";
				this.ctx_clock.strokeText(arr[i], x3, y3, 10);
				this.ctx_clock.lineWidth = 3;
			} else {
				this.ctx_clock.lineWidth = 2;
			}
			this.ctx_clock.moveTo(x1,y1);
			this.ctx_clock.lineTo(x2,y2);
			this.ctx_clock.stroke();
			this.ctx_clock.closePath();
		}
		let date = new Date(),
			second = (date.getSeconds() - 15 + 60) % 60,
			minute = (date.getMinutes() - 15 + 60) % 60,
			hour = (date.getHours() - 3 + 24) % 24,
		    x1 = WIDTH/2 + R3*Math.cos(second*rad),
			y1 = HEIGHT/2 + R3*Math.sin(second*rad),
			x2 = WIDTH/2 + R4*Math.cos(minute*rad),
			y2 = WIDTH/2 + R4*Math.sin(minute*rad),
			x3 = WIDTH/2 + R5*Math.cos(5*hour*rad),
			y3 = HEIGHT/2 + R5*Math.sin(5*hour*rad);
		this.drawPointer(x1,y1);
		this.drawPointer(x2,y2);
		this.drawPointer(x3,y3);
	},
	drawPointer: function(x,y) {
		this.ctx_pointer.beginPath();
		this.ctx_pointer.moveTo(150,150);
		this.ctx_pointer.lineTo(x,y);
		this.ctx_pointer.stroke(); 
		this.ctx_pointer.closePath();
	},
	getClock: function() {
		let hour = parseInt($('.hour').val()),
			minute = parseInt($('.minute').val()),
			second = parseInt($('.seconds').val()),
			arr = {};
		if(hour && minute && second) {
			arr['hour'] = hour;
			arr['minute'] = minute;
			arr['second'] = second;
		}
		this.time = arr;
	}
}
