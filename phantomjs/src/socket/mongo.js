var mongoose = require('mongoose');

//连接数据库
mongoose.connect('mongodb://localhost/hht');

var db = mongoose.connection;

db.on('error', function(){
    console.log("数据库连接错误");
});
db.once('open', function(){
    console.log("数据库已连接");
});


//构建数据模型
var Result = mongoose.model('results', {
	keyword: String,
	device: String,
	data: Array
});

module.exports = Result;