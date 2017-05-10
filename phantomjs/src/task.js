/**
 * 网页抓取分析服务系列之二（设备模拟）
 */
var system = require('system');
var page = require('webpage').create();
var config = require('./config.js')();
// 这里单独运行时候，将编码设置为 gbk, 由于要写到 mongodb
// 我就改成了 utf-8
phantom.outputEncoding = 'utf-8';

if(system.args.length === 1) {
	console.log('Usage: phantomjs task.js keyWord [device] like[iphone5 | iphone6| ipad]');
	phantom.exit();
}

var key = system.args[1],
	domin = 'https://www.baidu.com/', //默认
	param = 's?word=' + encodeURI(key) + '&ie=utf-8';
	time = Date.now(),
	result = {
		code: 0,
		msg: '抓取失败',
		word: key,
		time: 0,
		datalist: []
	};

// 模拟客户端，添加设备信息
var device = '',
	width = 300,
	height = 300,
	isMobile = false;

if(system.args[2] && (system.args[2] == 'iphone5' || system.args[2] == 'iphone6' || system.args[2] == 'ipad')) {
	isMobile = true;
	if(system.args[2] == 'iphone5' || system.args[2] == 'iphone6') {
		domin = 'https://m.baidu.com/';
	}
	device = system.args[2];
	page.settings['userAgent'] = config[device]['userAgent'];
	page.viewportSize = config[device]['screen'];
	// 裁剪图片尺寸
	page.clipRect = {
	  top: 0,
	  left: 0,
	  width: page.viewportSize.width,
	  height: page.viewportSize.height
	};
}

var url = domin + param;
page.open(url,function(status) {
	if(status === 'success') {
		//用于页面加载外部脚本,加载完成回调
		page.includeJs('../../view/js/jquery-2.13.js', function() {
			var data = page.evaluate(function() {
				var ret = [];
				var results = $('.result');
				// 下面要注意一点 电脑、ipad、iPhone 样式有区别
				// ipad 和 iphone 里面就没有图片
				results.each(function(e){
					var obj = {};
					obj.title = ($(this).find('.t a').text()) ? ($(this).find('.t a').text()) : ($(this).find('.c-title').text());
					obj.info = ($(this).find('.c-abstract').text()) ? ($(this).find('.c-abstract').text()) : ($(this).find('.c-color').text());
					obj.link = ($(this).find('.t a').attr('href')) ? ($(this).find('.t a').attr('href')) : ($(this).find('.c-container a').attr('href'));
					obj.pic = ($(this).find('.c-img').attr('src')) ? ($(this).find('.c-img').attr('src')) : '没有图片';
					ret.push(obj);
				})
				return ret;
			});
			result.device = config[device] || 'desktop';
			result.datalist = data;
			result.time = Date.now() - time;
			result.code = 1;
			result.msg = '抓取成功';
			// 截图
			if(isMobile) {
				var picName = '../screen_shot/' + 'baidu_' + config[device]['name'] + '.png';
				page.render(picName, {format: 'png', quality: '100'});
			} else {
				var picName = '../screen_shot/' + 'baidu.png';
				page.render(picName, {format: 'png', quality: '100'});
			}
			console.log(JSON.stringify(result, undefined, 4));
			setTimeout(function() {
				page.close();
				phantom.exit();
			},0);
		});

	} else {
		console.log('Load error');
		phantom.exit();
	}
})