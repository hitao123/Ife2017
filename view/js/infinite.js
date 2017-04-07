
function Infinite(options) {
	this.options = options;
	this.container = $(this.options.ele);
	this.init();
}
/**
 * 初始化数据
 */
Infinite.prototype.init = function() {
	this.createLoad();
	//监听滚动事件
	window.addEventListener('scroll',() => {
		let pageHeight = document.body.scrollTop;
		let viewHeight = window.innerHeight;
		console.log(viewHeight,this.container.clientHeight,pageHeight + viewHeight);
		if(pageHeight + viewHeight >= this.container.clientHeight) {
			this.Load();
			this.Loadmore(20)
				.then(res => {
					this.removeLoad();
					this.addData(res.length);
				})
				.catch(err => {
					console.log(err);
				});
		}
	});
}
/**
 * 创建数据
 */
Infinite.prototype.createItem = function(len) {
	let wrap = document.createDocumentFragment();
	for (let i = 0; i < len; i++) {
		let item = document.createElement('div');
		item.className = 'item';
		if(i < 10) {
			item.innerText = '00' + i;
		} else {
			item.innerText = '0' + i;
		}
		wrap.appendChild(item);
	}
	return wrap;
}
/**
 * 插入数据
 */
Infinite.prototype.addData = function(len) {
	this.container.appendChild(this.createItem(len));
}
/**
 * 创建 loading
 */
Infinite.prototype.createLoad = function() {
	let load = document.createElement('div');
	load.className = 'load';
	load.innerText = '正在加载中';
	this.loader = load;
}
/**
 * 显示 loading
 */
Infinite.prototype.Load = function() {
	this.container.appendChild(this.loader);
}
/**
 * 移除 loading
 */
Infinite.prototype.removeLoad = function() {
	let last = this.container.lastElementChild;
	if(last === this.loader) {
		this.container.removeChild(this.loader);
	}
}
/**
 * load more
 */
Infinite.prototype.Loadmore = function(len) {
	//模拟接口数据
	return new Promise((resolve,reject) => {
		setTimeout(() => {
			let data = [];
			for(let i = 0; i < len; i++) {
				data.push(`$item{i}`);
			}
			resolve(data);
		},2000);
	});
}

function $(ele) {
	return document.querySelector(ele);
}
