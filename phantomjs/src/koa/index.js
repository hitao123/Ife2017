/**
 * 网页抓取分析服务系列之四（数据交互）
 */

const koa = require('koa');
const fs = require('fs');
const path = require('path');
//下载图片
const request = require('request');
//生成图片ID
const uuid = require('node-uuid');
//路由模块
const router = require('koa-router')();
//静态文件
const static = require('koa-static');
//获取提交表单数据
const bodyParser = require('koa-bodyparser');
const mongoose = require('mongoose');
const exec = require('child_process').exec;


const app = new koa();
const staticPath = './image';

//全局变量
var cmd = '',
	html = '',
	postData = '',
	jsonData = {};

// //连接数据库
// mongoose.connect('mongodb://localhost/hht');
// //构建数据模型
// var Result = mongoose.model('results', {
// 	keyword: String,
// 	device: String,
// 	data: Array
// });
// var db = mongoose.connection;

// db.on('error', function(){
//     console.log("数据库连接错误");
// });
// db.once('open', function(){
//     console.log("数据库已连接");
// });


//静态图片资源
app.use(static(path.join(__dirname,'/images')));
// 中间件 这里用来处理提交表单
app.use(bodyParser());
app.use(async (ctx, next) => {
	if (ctx.url === '/' && ctx.method === 'POST') {
	    //当POST请求的时候，中间件koa-bodyparser解析POST
	    //表单里的数据并显示出来
	    let word = '哈哈',
	    	device = 'desktop',
	    postData = ctx.request.body;
	    word = postData['keyword'] || '哈哈';
	    device = postData['device'] || 'desktop';
	    cmd = 'phantomjs  ' + path.join('../','task.js') + ' ' + word + ' ' + device;
	    jsonData = await handlerTask(cmd);
		//添加uuid
	    jsonData.datalist = jsonData.datalist.map((item,index) => {
	    	if(item.pic) {
	    		// 百度这里图片没有后缀的，无法截取文件格式
	    		let picId = uuid.v1().split('-').join('') + '.jpg';
	    		return Object.assign({},item, {
	    			picId: picId
	    		});
	    	}
	    	return item
	    });
	    // console.log(jsonData,"****");
	    //目录不存在，新建目录
	    if(!fsExistsSync(path.join(__dirname,'/images/'))) {
	    	//创建目录
	    	fs.mkdir(__dirname + '/images/', function (err) {
	    	    if(err) {
	    	  		throw err;
	    	    }
	    	    console.log('创建目录成功')
	    	});
	    }
	    //下载图片
	    let len = jsonData.datalist.length;
	    for (let i = 0; i < len; i++) {
	    	if(jsonData.datalist[i]['pic']) {
	    		let pa = path.join(__dirname,'/images/') + jsonData.datalist[i]['picId'];
	    		console.log('正在下载中',pa);
	    		let msg = await downLoad(jsonData.datalist[i]['pic'], pa);
	    		console.log(msg);
	    	}
	    }
	    await next();
	} else {
		//其他情况走路由
		await next();
	}
})


//路由控制，首页显示
router.get('/', async (ctx, next) => {
	let res = ctx.response;
	//读取文件,这里为了不重复读，加一个判断
	if(!html) {
		html = await readFile(path.resolve(__dirname,'view','index.html'))
	}
	res.set({
	    'Content-Type': 'text/html; charset=utf-8',
	    'Cache-Control': 'max-age=1000'
	});
	res.body = html;
});

//处理 提交表单
router.post('/',async (ctx, next) => {
	let res = ctx.response;
	res.type = 'application/json';
	res.body = jsonData;
});

app.use(router.routes());

app.listen(3000);
console.log('Server start at http://localhost:3000')

/**
 * Helper
 */
function readFile(path) {
	return new Promise((resolve,reject) => {
		fs.readFile(path, 'utf-8', (err, data) => {
		    if (err) {
		  	    throw err;
		  	    reject(err);
		    }
		    resolve(data);
		});
	})
}
//调用服务
function handlerTask(cmd) {
	return new Promise((resolve,reject) => {
		exec(cmd, (error, stdout, stderr) => {
		    if (error) {
			    // console.error(`exec error: ${error}`);
			    reject(`exec error: ${error}`);
			    return;
		    }
		    // console.log(`stdout: ${stdout}`);
		    resolve(JSON.parse(stdout));
		});
	})
}

// 生成图片
function downLoad(url, path) {
    return new Promise((resolve, reject) => {
        request.head(url, function (err, res, body) {
            if (err) {
                reject(err);
                return
            }
	        request(url).pipe(fs.createWriteStream(path));
	        resolve(path + '图片下载成功');
        })
    })
}

// 检查文件或者文件夹是否存在
function fsExistsSync(path) {
    try{
        fs.accessSync(path);
    }catch(e){
        return false;
    }
    return true;
}