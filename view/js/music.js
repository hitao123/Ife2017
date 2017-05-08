/**
 * 控制模块
 */
function player() {
	//node 节点
	this.$playList = $('.playlist');
	this.$title = $('.title');
	this.$singer = $('.singer');
	this.$time = $('.time');
	this.$volumeSlider = $('.volume-slider');
	this.$proSlider = $('.progress-slider-value');
	this.$coverLink = $('.play-cover');
	this.$cover = $('.play-cover img');
	this.$prev = $('.icon-prev');
	this.$next = $('.icon-next');
	this.$play = $('.icon-play');
	this.$pause = $('.icon-pause');

	this.playList = playlist;
	this.playListIndex = 0;
	this.audio = new Audio();
	this.init();
	this.visualizer = new Visualizer('visualizer', this.audio);
}
/**
 * 初始化参数
 */
player.prototype.init = function() {
	var _this = this;
	this.$prev.addEventListener('click', this.prev.bind(this));
	this.$next.addEventListener('click', this.next.bind(this));
	this.$play.addEventListener('click', this.play.bind(this));
	this.$pause.addEventListener('click', this.pause.bind(this));
	//播放时间改变触发
	this.audio.addEventListener('timeupdate', this.progress.bind(this));
	//播放结束之后触发
	this.audio.addEventListener('ended',this.next.bind(this));
	this.$proSlider.addEventListener('click', function(e) {
		_this.setProgress(e);
	});
	this.loadPlaylist();
	this.loadAndPlay(0);
}
/**
 * 播放
 */
player.prototype.play = function() {
	//这里有一个注意的地方，SVG 图标 我们让 pause display,
	//这样才可以切换状态
	this.audio.play();
	this.$play.style.display = 'none';
	this.$pause.style.display = 'inline-block';	
}
/**
 * 暂停
 */
player.prototype.pause = function() {
	this.audio.pause();
	this.$play.style.display = 'inline-block';
	this.$pause.style.display = 'none';
}
/**
 * 加载歌曲名、歌手、进度条、专辑封面图片
 */
player.prototype.load = function() {
	this.$title.innerHTML = this.song.title;
	this.$singer.innerHTML = this.song.artist;
	// this.$time.innerHTML = $('.time');
	this.$coverLink.href = 'https://music.douban.com' + this.song.album;
	this.$cover.src = this.song.picture;
	this.audio.src = this.song.url;
}
/**
 * 下一曲
 */
player.prototype.next = function() {
	this.playListIndex++;
	if(this.playListIndex > this.playList.length - 1) {
		this.playListIndex = 0;
	}
	this.loadAndPlay(this.playListIndex);
}
/**
 * 上一曲
 */
player.prototype.prev = function() {
	this.playListIndex--;
	if(this.playListIndex < 0) {
		this.playListIndex = this.playList.length - 1;
	}
	this.loadAndPlay(this.playListIndex);
}
/**
 * 加载播放列表,以及播放列表 Item 位置
 */
player.prototype.loadPlaylist = function() {
	var ind;
	var arr = this.playList.map(function(list,index){
		ind = index + 1;
		return  '<div class="playlist-item" data-index="' + index + '">' + ind + '.  ' + list.title + ' ' + list.artist +
		'</div>';
	})
	var innerHTML = arr.join('');
	this.$playList.innerHTML = innerHTML;
	//最外层绑定事件
	var _this = this;
	this.$playList.addEventListener('click', function(e) {
		//HTMLElement.dataset 属性允许我们访问所有在元素上自定义的data属性 
		//(这种属性一般以data-开头）它的结构是一个DOMString映射表，
		//对每一个自定义的数据属性都有一个实体与之对应
		if(e.target.dataset.index) {
			_this.loadAndPlay(parseInt(e.target.dataset.index));
		}
	});
	this.$playListItems = $$('.playlist-item');
}
/**
 * 时间进度显示，数字以及进度条
 */
player.prototype.progress = function() {
	let time = parseInt(this.song.length - this.audio.currentTime),
		minute = parseInt(time / 60),
		second = parseInt(time % 60);
		if(second < 10) {
			second = '0' + second;
		}
		this.$time.innerHTML = '-' + minute + ':' + second;
		this.$proSlider.style.width = (this.audio.currentTime / this.song.length)* 100 + '%';
}
/**
 * 点击设置进度条
 */
player.prototype.setProgress = function(e) {
	this.audio.currentTime = e.offsetX / this.$proSlider.clientWidth * this.audio.duration	
}
/**
 * 声音控制
 */
player.prototype.setVolume = function() {

}
/**
 * 点击播放列表时候，加载，播放歌曲
 */
player.prototype.loadAndPlay = function(index) {
	let len = this.playList.length;
	for(let i = 0; i < len; i++) {
		this.$playListItems[i].className = 'playlist-item';
	}
	this.playListIndex = index;
	this.$playListItems[this.playListIndex].className = 'playlist-item active';
	//保留整首歌曲信息
	this.song = this.playList[this.playListIndex];
	this.load();
	this.play();
}


/**
 * Helper
 */

function $(selector) {
	return document.querySelector(selector);
}
function $$(selector) {
	return document.querySelectorAll(selector);
}

new player();