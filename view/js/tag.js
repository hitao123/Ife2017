//IE8 以上
function $(attr) {
	return document.querySelector(attr);
}
function $$(attr) {
	return document.querySelectorAll(attr);
}

//定义变量
var paper = $('.tags'); //获取包裹的一层
var form = $('#form');
var tags = [];
var AngelX = Math.PI/360; //角度系数
var AngelY = -Math.PI/360; //角度系数
var speed = 3; //速度
const RADIUS = 220; // 球的半径大小
const FALL_LENGTH = RADIUS*1.5; // 系数
const CX = paper.offsetWidth/2; //原点坐标
const CY = paper.offsetHeight/2; //原点坐标

function init() {
	var tagEle = $$('.tag'); //获取所有class为 tag
	for(let i = 0 ; len = tagEle.length, i < len; i++) {
		let a,b;
		let k = (2 * (i+1) - 1)/len - 1;
		    a = Math.acos(k); //Z轴夹角
		    b = a * Math.sqrt(len * Math.PI); //平面内夹角
		let x = RADIUS* Math.sin(a) * Math.cos(b); // x轴坐标
			  y = RADIUS* Math.sin(a) * Math.sin(b); // y轴坐标
			  z = RADIUS* Math.cos(a); //z轴坐标
		tagEle[i].style.color = "rgb("+parseInt(Math.random()*255)+","+parseInt(Math.random()*255)+","+parseInt(Math.random()*255)+")";
		let t = new tag3D(tagEle[i],x,y,z); //初始化球上坐标
		tags.push(t);
		t.initState();
	}
	animate();
}

/**
 * 创建 tag
 */
function tag3D(ele,x,y,z) {
	this.ele = ele;
	this.x = x;
	this.y = y;
	this.z = z;
}
// /**
//  * 根据y轴坐标变化,调整透明度,和字体大小
//  * 
//  */
tag3D.prototype.initState = function() {
	let scale = FALL_LENGTH / (FALL_LENGTH - this.z);
			alpha = (this.z + RADIUS) / (2*RADIUS);
			ele = this.ele;
	ele.style.fontSize = parseInt(14 * scale) + "px";
	ele.style.opacity = alpha + 0.5;
	ele.style.filter = "alpah(opacity=" + ((alpha + 0.5) * 100) + ")";
	ele.style.zIndex = parseInt(scale * 100);
	ele.style.left = this.x + CX - ele.offsetWidth/2 + "px";
	ele.style.top = this.y + CY - ele.offsetHeight/2 + "px";
}
/**
 * 绕x轴旋转
 * 
 */
function rotateX() {
	let sin = Math.sin(AngelX),
	    cos = Math.cos(AngelX);
	tags.forEach(function(tag){
		let y1 = tag.y * cos - tag.z * sin,
		    z1 = tag.z * cos + tag.y * sin;
		tag.y = y1;
		tag.z = z1;
	});
}
/**
 * 这里公式一定要弄清楚，坑了半天一直坐标不对
 * 绕x轴旋转
 */
function rotateY() {
	let sin = Math.sin(AngelY),
	    cos = Math.cos(AngelY);
	tags.forEach(function(tag){
		let x1 = tag.x * cos - tag.z * sin;
		let z1 = tag.z * cos + tag.x * sin;
		tag.x = x1;
		tag.z = z1;
	});
}

paper.addEventListener('mousemove',function(e){
	  let base_angel = Math.PI/360;
		AngelX = (e.clientX / document.body.scrollWidth - 0.5) * speed * base_angel;
		AngelY = (e.clientY / document.body.scrollHeight - 0.5) * speed * base_angel;
});

function animate() {
	setInterval(function(){
		rotateX();
		rotateY();
		tags.forEach(function(tag){
			tag.initState();
		});
	},20);
}

form.addEventListener('submit',function(e){
	e.preventDefault(); //阻止默认事件
	let count = this.count.value || 50,
			speed = this.speed.value || 3,
			content = this.content.value || 'Hello World',
			str = '';
			for(let i = 0; i < count; i++) {
				str += `<a class="tag" href="##">${content}</a>`;
			}
		paper.innerHTML = str;
		init();
});

init();


