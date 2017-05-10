/**
 * 网页抓取分析服务系列之三（服务封装）
 */

var mongoose = require('mongoose');
var http = require('http');
var url = require('url');
//执行bash命令，它的参数是一个命令字符串
var exec = require('child_process').exec;

//连接mongodb 数据库,假如没有hht数据库，会新建一个
mongoose.connect('mongodb://localhost/hht');

//构建数据模型 类似 mysql table , mongodb 会将 
// model result => results 复数形式， 查看数据时注意
var Result = mongoose.model('result', {
	keyword: String,
	device: String,
	data: Array
});

http.createServer((req, res) => {
	//设置响应头
    res.writeHead(200, {"Content-Type": "text/plain"});
    //第二个参数为true时，使用querystring模块来解析URL中德查询字符串部分
    var result = url.parse(req.url,true).query;
    var keyword = result.word || '哈哈';
    var device = result.device || 'desktop';
    //Promise 回调
    getResultFromBD(keyword,device)
		.then(res => {
			//创建一个实体, 类似mysql insert new line
			var data = JSON.parse(res).datalist;
			// console.log(data);
			var ret = new Result({
				keyword: keyword,
				device: device,
				data: data
			});
			//保存到mongodb 数据库, write new line
			// 这里会写入两次，一个请求执行一次，浏览器
			// 默认会发送 /favicon 这个请求
			ret.save(err => {
			  if (err) {
			    console.log(err);
			  } else {
			  	console.log('写入数据成功');
			  }
			});
		})
		.catch(e => {
			console.log(e);
		});
    // 响应
    res.write('hello node!');
    res.end();	
}).listen(8000);

console.log('server started at http://localhost:8000');

function getResultFromBD(keyword,device) {
	// task.js 结果获取是异步的
	return new Promise((resolve,reject) => {
		var cmd = 'phantomjs task.js ' + keyword;
		if(device) {
			cmd  = cmd + ' ' + device;
		}
		// console.log('cmd = ',cmd);
		// 开启子进程来处理 task.js , 并将结果返回
		exec(cmd, (error, stdout, stderr) => {
		  if (error) {
		    // console.error(`exec error: ${error}`);
		    reject(`exec error: ${error}`);
		    return;
		  }
		  // console.log(`stdout: ${stdout}`);
		  resolve(stdout);
		});
	}); 
} 






