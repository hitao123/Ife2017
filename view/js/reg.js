/**
 * 电话号码匹配
 */
function regTel(str) {
	let reg = /^1[345789]\d{9}$/;
	return reg.test(str) ? true : false;
}

regTel(15671641692); 
regTel(12671641692); //没有12开头的
regTel(1567164192); // 没有11位

/**
 * 没有使用正则
 */
// function regRepeat(str) {
// 	let arr = str.split(' ');
// 	for(let i = 0; len = arr.length, i < len;) {		
// 		if(arr[i++] === arr[i]) return true
// 	}
// 	return false
// }
/**
 * 重复字符串匹配 \d == [0-9] \D == [^0-9] \s == [\n\t..] \w == [0-9a-zA-Z_]
 * \b  匹配单词边界 \1 表示第一个匹配 ,在替换的地方需要使用 $1
 */ 
function regRepeat(str) {
	let reg = /^([a-zA-Z]+)\s+\1\b/g;
	return reg.test(str) ? true : false;
}
regRepeat('hello world hello test'); //true
regRepeat('hello hello  test');