/**
 * 网页抓取分析服务系列之五（并发控制）
 * 当需要去多个源(一般是小于 10 个)汇总数据的时候，
 * 用 eventproxy 方便；当需要用到队列，需要控制并发数，
 * 使用 async
 */
const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const async = require('async');
const exec = require('child_process').exec;
// const bodyParser = require('body-parser');
// 底下的顺序必须严格由上至下，否则报 404
const app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);
var crawl = require('./crawl.js');

//中间件, 解析 ajax post过来的数据
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));
// 静态文件中间件
app.use(express.static(path.join(__dirname,'static')));
//路由
app.get('/', function(req,res) {
	res.sendFile(path.join(__dirname, 'view', 'index.html'));
});
//路由
app.post('/', function(req,res) {
	let params = req.body;
	res.set('Content-Type', 'application/json');
	res.send(params);
})


//建立全局的异步队列，保证服务器内最多有五个爬取任务同时进行
//task内包含了爬取所需要的关键词、设备、页码，
//以及提交本次爬取任务的客户端的socket
const queue = async.queue(async function(task, callback) {
    let crawlInfo = await crawl(task);
    //crawl 开启进程， phantom  task.js keyword iphone pn   
    // 爬取数据完成后，向客户端发送数据
    // 将爬取结果返回客户端
    task.socket.emit('crawl', crawlInfo);       
    callback();
}, 5);
//所有任务执行完之后的回调
queue.drain = function() {
    console.log('all items have been processed');
};

// socket.io
io.on('connection', function(socket) {
	socket.on('submit', function(json) {
		//并发控制
		let data = JSON.parse(json);
		//多个设备
		for (let i = 0; len = data.devices.length, i < len; i++) {
			//多页
			for (let j = 0; j < data.pn; j++) {
				//生成任务待执行队列
				//api http://caolan.github.io/async/docs.html#queue
				queue.push(
					{
						keyword: data.keyword,
						device: data.devices[i],
						pn: j,
						socket: socket
					},
					function(err){
						if(err) {
							console.log(err);
						}
					console.log('items waiting to be processed:' + queue.length());
					console.log('items running:' + queue.running());
				});
			}
		}
	})
})



server.listen(3000, function() {
	console.log('Server start at http://localhost:3000')
})

