/**
 * 简单封装
 */
function $(ele) {
	return document.querySelector(ele);
}
function $$(ele) {
	return document.querySelectorAll(ele);
}
/**
 * rgba数组 获取 rgb
 */
function getRGB(arr) {
	return 'rgb(' + arr.slice(0,3).join(',') + ')';
}
/**
 * rgb 转换为 16进制值 如rgbToCSS([23,34,45])
 */
function rgbToCSS(rgb) {
	let r = rgb[0],
	    g = rgb[1],
	    b = rgb[2];
	//假如有不是数字的返回 #000000
	if(isNaN(r) || isNaN(g) || isNaN(b)) {
		return '#000000';
	} else {
		let str = '';
		//加上前导 0
		if(parseInt(r) <= 15) {
			str += '0' + parseInt(r).toString(16);
		} else {
			str += parseInt(r).toString(16);
		}
		if(parseInt(g) <= 15) {
			str += '0' + parseInt(g).toString(16);
		} else {
			str += parseInt(g).toString(16);
		}
		if(parseInt(b) <= 15) {
			str += '0' + parseInt(b).toString(16);
		} else {
			str += parseInt(b).toString(16);
		}
		return '#' + str;
	}
}
/**
 * rgb 转换为 HSL
 */
function rgbToHSL(rgb) {
	let r = rgb[0] / 255,
	    g = rgb[1] / 255,
	    b = rgb[2] / 255;
	let min = Math.min.apply(Array, [r, g, b]),
	    max = Math.max.apply(Array, [r, g, b]);
	let h, s, l;
	if (max == min) {
	    h = 0;
	}
	else if (max == r && g >= b) {
	    h = 60 * (g - b) / (max - min);
	}
	else if (max == r && g < b) {
	    h = 60 * (g - b) / (max - min) + 360;
	}
	else if (max == g) {
	    h = 60 * (b - r) / (max - min) + 120;
	}
	else if (max == b) {
	    h = 60 * (r - g) / (max - min) + 240;
	}
	l = (max + min) / 2;
	if (l == 0 || max == min) {
	    s = 0;
	}
	else if (l > 0 && l <= 0.5) {
	    s = (max - min) / (2 * l);
	}
	else if (l > 0.5) {
	    s = (max - min) / (2 - 2 * l);
	}
	return [Math.round(h), Math.round(s * 100) / 100, Math.round(l * 100) / 100];
}
// /**
//  *  HSL 转换为 rgb
//  */
// function hslToRGB(hsl) {
// 	let h = hsl[0] - 0,
// 	    s = hsl[1] - 0,
// 	    l = hsl[2] - 0;
// 	let r, g, b;
// 	if (s == 0) {
// 	    r = g = b = l;
// 	}
// 	else {
// 	    let p, q, k;
// 	    if (l < 0.5) {
// 	        q = l * (1 + s);
// 	    }
// 	    else if (l >= 0.5) {
// 	        q = l + s - (l * s);
// 	    }
// 	    p = 2 * l - q;
// 	    k = h / 360;

// 	    r = singleColorCalculation(k + 1 / 3, p, q);
// 	    g = singleColorCalculation(k, p, q);
// 	    b = singleColorCalculation(k - 1 / 3, p, q);

// 	}
// 	return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];

// 	function singleColorCalculation(k) {
// 	    let color;
// 	    if (k < 0) {
// 	        k += 1;
// 	    }
// 	    if (k > 1) {
// 	        k -= 1;
// 	    }
// 	    if (k * 6 < 1) {
// 	        color = p + ((q - p) * 6 * k);
// 	    }
// 	    else if (k * 6 >= 1 && k < 0.5) {
// 	        color = q;
// 	    }
// 	    else if (k >= 0.5 && 3 * k < 2) {
// 	        color = p + ((q - p) * 6 * (2 / 3 - k));
// 	    }
// 	    else {
// 	        color = p;
// 	    }
// 	    return color;
// 	}
// }
/**
 * move selector
 */
function moveSelector(selector,pos) {
	selector.style.left = pos.x + 'px';
	selector.style.top = pos.y + 'px';
}



/**
 * Picker
 */
function Picker(options) {
	this.options = options;
	this.HSLSelPos = {
		x: 0,
		y: 0
	};
	this.RGBSelPos = {
		x: 0,
		y: 0
	};
	this.colorRGB = getRGB(this.options.rgb); //rgb(255,255,255)
	this.colorHSL = rgbToHSL(this.options.rgb); //[255,0,0]
	this.renderHSL(this.options.id[0],this.colorRGB);
	this.renderRGB(this.options.id[1]);
	//初始化输入框	
	this.updateInputHSL(this.colorHSL);
	this.updateInputRGB(this.options.rgb); 
	//更新位置
	this.updateHSLPos();
	this.updateRGBPos();
	//监听输入
	this.handleInput($$('.hsl'));
	this.handleInput($$('.rgb'));
	$('.back-color').style.backgroundColor = getRGB(this.options.rgb);
}
/**
 * 渲染canvas 函数
 */
Picker.prototype.renderHSL = function(id,rgb) {
	let canvas = document.getElementById(id);
	let sel = $('.region-circle');
	let _this = this;
	let ctx = this.hslCtx = canvas.getContext("2d");
	let isDown = true;// 开关，只有鼠标点击取色器材监听
	// HSL canvas 距离视窗 上边和左边距离
	this.HSLPos = {
	    top: canvas.getBoundingClientRect().top,
	    left: canvas.getBoundingClientRect().left
	};
	//由于设置了width ，这里就不进行设置了
	ctx.beginPath();
	const grad = ctx.createLinearGradient(0,0,canvas.width,canvas.height);
	grad.addColorStop(0,'rgb(255,255,255)');
	grad.addColorStop(0.5,rgb);
	grad.addColorStop(1,'rgb(0,0,0)');
	ctx.fillStyle = grad;
	ctx.rect(0,0,canvas.width,canvas.height);
	ctx.fill();
	//添加监听事件
	canvas.addEventListener('click',function(e){
		_this.clickHSL(e,sel);
		isDown = true;
	});

}
/**
 * 渲染色相
 */
Picker.prototype.renderRGB = function(id,rgb) {
	let canvas = document.getElementById(id);
	let sel = $('.color-circle');
	let ctx = this.rgbCtx = canvas.getContext("2d");
	let _this = this;
	const num = 12;
	//由于设置了width ，这里就不进行设置了
	// HSL canvas 距离视窗 上边和左边距离
	this.RGBPos = {
	    top: canvas.getBoundingClientRect().top,
	    left: canvas.getBoundingClientRect().left
	};
	ctx.beginPath();
	const grad = ctx.createLinearGradient(0,0,0,canvas.height);
	for(let i = 0; i < num; i++) {
		let r = [255,255,255,255,255,153,0,0,0,102,255,255],
		g = [0,51,102,153,255,255,255,255,0,0,0,0],
		b = [0,0,0,0,0,0,0,255,255,255,255,102];
		let rgb = 'rgb(' + r[i] + ',' + g[i] + ',' + b[i] +')';
		grad.addColorStop(i/num,rgb);
	}
	ctx.fillStyle = grad;
	ctx.rect(0,0,canvas.width,canvas.height);
	ctx.fill();
	//添加监听事件
	canvas.addEventListener('click',function(e){
		_this.clickRGB(e,sel);
	});
}
/**
 * 点击 HSL canvas
 */
Picker.prototype.clickHSL = function(event,selector) {
	let ctx = this.hslCtx; //hsl 绘图环境
	let mouseX = event.pageX - this.HSLPos.left - 5;
	let mouseY = event.pageY - this.HSLPos.top - 5;
	//边界控制
	if(mouseX <= 0) {
		mouseX = 3;
	} 
	if(mouseY <= 0) {
		mouseY = 3;
	}
	this.HSLSelPos = {
		x: mouseX,
		y: mouseY
	};
	//移动小圆点
	moveSelector(selector,this.HSLSelPos);
	//更新右边 输入框
	this.HSLdata = ctx.getImageData(mouseX, mouseY, 1, 1).data;
	this.colorHSL = rgbToHSL(this.HSLdata.slice(0,3)); //返回一个数组
	//更新输入框
	this.updateInputHSL(this.colorHSL);
	this.updateInputRGB(this.HSLdata.slice(0,3));
	//更新rgb值
	let color = rgbToCSS(this.HSLdata.slice(0,3));
	$('.input-color').value = color;
	//更新background
	$('.back-color').style.backgroundColor = color; 
}
/**
 * 点击 RGB canvas
 */
Picker.prototype.clickRGB = function(event,selector) {
	let ctx = this.rgbCtx; //rgb 绘图环境
	let mouseX = event.pageX - this.RGBPos.left - 5;
	let mouseY = event.pageY - this.RGBPos.top - 5;
	//边界控制
	if(mouseX <= 0) {
		mouseX = 3;
	} 
	if(mouseY <= 0) {
		mouseY = 3;
	}
	this.RGBSelPos = {
		x: mouseX,
		y: mouseY
	};
	moveSelector(selector,this.RGBSelPos);
	//更新左边 HSL 渐变
	this.RGBdata = ctx.getImageData(mouseX, mouseY, 1, 1).data; 
	//返回一个数组 
	const rgb = getRGB(this.RGBdata);
	this.renderHSL(this.options.id[0],rgb);
	//更新输入框 RGB HSL
	const hslLeft = this.HSLSelPos.x; //HSL 左侧距离
	const hslTop = this.HSLSelPos.y; //HSL 上边距离
	this.HSLdata = this.hslCtx.getImageData(hslLeft, hslTop, 1, 1).data;
	// 计算 hsl
	this.colorRGB = this.RGBdata.slice(0,3); //返回一个数组
	this.colorHSL = rgbToHSL(this.HSLdata.slice(0,3)); //返回一个数组
	//更新输入框
	this.updateInputHSL(this.colorHSL);
	this.updateInputRGB(this.colorRGB);
	//更新rgb值
	let color = rgbToCSS(this.RGBdata.slice(0,3));
	$('.input-color').value = color;
	//更新background
	$('.back-color').style.backgroundColor = color;
}
/**
 * 
 */
Picker.prototype.updateInputHSL = function(hsl) {
	let hslArr = $$(this.options.input[1]);
	let hs = hsl;
	if(hslArr.length !== hs.length) {
		return
	} else {
		for(let i = 0; i < hslArr.length; i++) {
			hslArr[i].value = hs[i];
		} 
	}
}
/**
 * 
 */
Picker.prototype.updateInputRGB = function(rgb) {
	let rgbArr = $$(this.options.input[0]);
	let rg = rgb;
	if(rgbArr.length !== rg.length) {
		return
	} else {
		for(let i = 0; i < rgbArr.length; i++) {
			rgbArr[i].value = rg[i];
		} 
	}
}
/**
 * 处理输入
 */
Picker.prototype.handleInput = function(selector) {
	const sele = selector;
	const len = sele.length;
	for(let i = 0; i < len; i++) {
		let that = this;
		sele[i].addEventListener('change',function(e){
			if(that.checkInput(e.target.value,sele[i])) {
				that.options.rgb[i] = parseInt(e.target.value);
				that.renderHSL(that.options.id[0],getRGB(that.options.rgb));
				that.updateHSLPos();
				that.updateRGBPos();
				$('.back-color').style.backgroundColor = getRGB(that.options.rgb);
			}
		});
	}
}
/**
 * 校验输入
 */
Picker.prototype.checkInput = function(val,selector) {
	const value = val;
	const sele = selector;
	const len = sele.length;
	// 校验
	if(sele.name === 'R' || sele.name === 'G' || sele.name === 'B') {
		if(parseInt(value) >= 0 && parseInt(value) <= 255) {
			return true;
		} else {
			value = 0;
			return false;
		}
	} else if(sele.name === 'H') {
		if(parseInt(value) >= 0 && parseInt(value) <= 360) {
			return true;
		} else {
			value = 0;
			return false; 
		}
	} else if(sele.name === 'S') {
		if(parseInt(value) >= 0 && parseInt(value) <= 1) {
			return true;
		} else {
			value = 0;
			return false; 
		}
	} else if(sele.name === 'L'){
		if(parseInt(value) >= 0 && parseInt(value) <= 1) {
			return true;
		} else {
			value = 0;
			return false; 
		}
	} else {
		value = 0;
		return false;
	}	
}
/**
 * 
 */
Picker.prototype.updateHSLPos = function() {
	//获取l值，根据该值计算 top 和 left
	const l = this.colorHSL[2];
	// 斜边长度
	const length = 400 * Math.sqrt(2); //勾股定理 等腰直角
	let left = parseInt(length * l / Math.sqrt(2));
	let top = left;
	this.HSLSelPos = {
	    x: left,
	    y: top
	};
	moveSelector($('.region-circle'), this.HSLSelPos);
}
/**
 * 
 */
Picker.prototype.updateRGBPos = function() {
	const h = this.colorHSL[0];
	this.RGBSelPos.y = h / 360 * 400;
	moveSelector($('.color-circle'), this.RGBSelPos);
}
/**
 * 
 */
Picker.prototype.getCurColor = function() {

}
/**
 * 
 */
Picker.prototype.setColor = function() {

}