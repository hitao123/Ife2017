// observer
function Observer (data) {
	this.data = data;
	this.recursive(data);
	this.events = new Event();
}

//递归方法
Observer.prototype.recursive = function(obj) {
	let val;
	for(let key in obj) {
		//筛选仅包含自身属性的元素，不包括原型上的属性
		if(obj.hasOwnProperty(key)) {
			val = obj[key];
			if(typeof val === 'object') {
				//this.recursive(val); //是 object 继续递归
				new Observer(val);
			}
			this.print(key,val);	
		}
	}
}
//输出
//Object.defineProperty(obj, prop, descriptor)
//定义属性的对象 定义或修改的属性的名称 定义或修改的属性的描述符
//这里修改的是由属性决定的
Observer.prototype.print = function(key,val) {
	let _this = this;
	Object.defineProperty(this.data,key,{
		enumerable: true,
		configurable: true,
		get: function() {
			console.log("访问了" + key);
			return val;
		},
		set: function(newVal) {
			console.log("设置了" + key);
			console.log('新的' + key + '=' + newVal);
			_this.events.emit(key,val,newVal);
			if(newVal == val){
				return
			} else if(newVal === 'object') {
				new Observer(newVal);
			}
		}
	});
}
/**
 * 监听事件
 */
Observer.prototype.$watch = function(attr,callback) {
	this.events.on(attr,callback);
}

/**
 * 定义事件
 */
function Event() {
	this.events = {};
}
/**
 * 监听事件
 */
Event.prototype.on = function(attr,callback) {
	if(this.events[attr]) {
		//不止一个事件,将函数添加到数组里面
		this.events[attr].push(callback);
	} else {
		this.events[attr] = [callback];
	}
}
/**
 * 移除事件
 */
Event.prototype.off = function(attr,callback) {
	for (let key in this.events) {
		if(this.events.hasOwnProperty(key) && key === attr) {
			delete this.events[key];
		}
	}
}
/**
 * 发送事件
 */
Event.prototype.emit = function(attr,...arg) {
	this.events[attr] && this.events[attr].forEach(function(item){
		item(...arg);
	});
}



//测试数据
let data = {
	user: {
		name: "bob",
		age: 23
	},
	job: {
		salary: 10000,
		workday: 5
	},
	test: "test"
}

let da = new Observer(data);
da.$watch('test',function(oldVal,newVal){
	console.log(`原来oldVal=${oldVal},现在newVal=${newVal}`);
});
da.data.test = "haha";
console.log(da);
