
// 提供外部接口
//

var http = require('http');
var fs = require('fs');
var path = require('path');
var request = require('request');
var uuid = require('node-uuid');
var exec = require('child_process').exec;
// var Result = require('./mongo.js');




module.exports = async function crawl(task){

	let keyword = task.keyword || 'haha',
		device = task.device || 'desktop',
		pn = task.pn || '0';
	var cmd = 'phantomjs  ' + path.join('../','task.js') + ' ' + keyword + ' ' + device + ' ' + pn;
	let jsonData = await handlerTask(cmd);

	// 	let ret = new Result({
	// 		keyword: word,
	// 		device: device,
	// 		data: jsonData
	// 	});
	// 	//保存到mongodb 数据库
	// 	ret.save(err => {
	// 	  if (err) {
	// 	    console.log(err);
	// 	  } else {
	// 	  	console.log('写入数据成功');
	// 	  }
	// 	});

	//添加uuid
    jsonData.datalist = jsonData.datalist.map((item,index) => {
    	if(item.pic) {
    		// 百度这里图片没有后缀的，无法截取文件格式
    		let picId = uuid.v1().split('-').join('') + '.jpg';
    		return Object.assign({}, item, {
    			picId: picId
    		});
    	}
    	return item
    });
    console.log("start=====>");
    console.log(jsonData.datalist);
    console.log("end======>");
    //目录不存在，新建目录
    if(!fsExistsSync(path.join(__dirname,'/static/images/'))) {
    	//创建目录
    	fs.mkdir(__dirname + '/static/images/', function (err) {
    	    if(err) {
    	  		throw err;
    	    }
    	    console.log('创建目录成功')
    	});
    }
    //下载图片
    let len = jsonData.datalist.length,
    	imgArr = [];
    for (let i = 0; i < len; i++) {
    	if(jsonData.datalist[i]['pic']) {
    		let pa = path.join(__dirname,'/static/images/') + jsonData.datalist[i]['picId'];
    		console.log('正在下载中\n', pa);
    		imgArr.push(downLoad(jsonData.datalist[i]['pic'], pa));
    	}
    }
    // 等待图片下载完成
    await Promise.all(imgArr, function(result) {
    	console.log(result);
    });
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
	return jsonData;
} 


