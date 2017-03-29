// observer
function Observer (data) {
	this.data = data;
	this.recursive(data);
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
			} else {
				this.print(key,val);
			}
		}
	}
}
//输出
//Object.defineProperty(obj, prop, descriptor)
//定义属性的对象 定义或修改的属性的名称 定义或修改的属性的描述符
//这里修改的是由属性决定的
Observer.prototype.print = function(key,val) {
	Object.defineProperty(this.data,key,{
		enumerable: true,
		configurable: true,
		get: function() {
			console.log("访问了" + key);
			return val
		},
		set: function(newVal) {
			console.log("设置了" + key);
			if(newVal == val) return 
			val = newVal;
		}
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
console.log(da);
