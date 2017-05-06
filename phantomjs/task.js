var system = require('system');
var page = require('webpage').create();

var url = 'https://www.baidu.com/s?ie=utf-8&f=8&rsv_bp=1&tn=baidu&wd='

phantom.outputEncoding = 'gbk';

if(system.args.length === 1) {
	console.log('Usage phantomjs task.js word');
	phantom.exit();
}
var key = system.args[1],
	time = Date.now(),
	result = {
		code: 0,
		msg: '抓取失败',
		word: key,
		time: 0,
		datalist: []
	};

url = url + encodeURI(key);


page.open(url,function(status) {
	if(status === 'success') {
		console.log('success===>1');
		page.includeJs('../view/js/jquery-2.13.js', function() {
			console.log('success===>2');
			var data = page.evaluate(function() {
				console.log('success===>3');
				var ret = [];
				var results = $('.c-container');
				results.each(function(e){
					var obj = {};
					obj.title = $(this).find('.t a').text();
					obj.info = $(this).find('.c-abstract').text();
					obj.link = $(this).find('.t a').attr('href');
					obj.pic = $(this).find('.c-img').attr('src');
					ret.push(obj);
				})
				return ret;
			});
			result.datalist = data;
			result.time = Date.now() - time;
			result.code = 1;
			result.msg = '抓取成功';
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