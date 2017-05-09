/**
 * 控制模块
 */
function player() {
	//node 节点
	this.$playList = $('.playlist');
	this.$title = $('.title');
	this.$singer = $('.singer');
	this.$time = $('.time');
	this.$volume = $('.volume');
	this.$volumeSlider = $('.volume-slider');
	this.$volumeValue = $('.volume-slider-value');
	this.$progress = $('.progress');
	this.$proSlider = $('.progress-slider-value');
	this.$coverLink = $('.play-cover');
	this.$cover = $('.play-cover img');
	this.$prev = $('.fa-step-backward');
	this.$next = $('.fa-step-forward');
	this.$play = $('.fa-play');
	this.$pause = $('.fa-pause');
	this.$pattern = $('.fa-random');
	this.$patternDesc = $('.desc');

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
	this.$pattern.addEventListener('click', this.pattern.bind(this));
	this.$pause.addEventListener('click', this.pause.bind(this));
	this.$volume.addEventListener('click',this.setVolume.bind(this));
	//播放时间改变触发
	this.audio.addEventListener('timeupdate', this.progress.bind(this));
	//播放结束之后触发
	this.audio.addEventListener('ended',this.playModel.bind(this));
	this.$progress.addEventListener('click', this.setProgress.bind(this));
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
 * 默认列表循环，单曲循环
 */
player.prototype.oneLoop = function() {
	this.loadAndPlay(this.playListIndex);
}
/**
 * 随机
 */
player.prototype.randLoop = function() {
	//产生随机数
	let len = this.playList.length,
		rand = Math.floor(Math.random() * len);
	this.playListIndex = rand;
	this.loadAndPlay(this.playListIndex);
}
/**
 * 产生不同模式,状态机
 */
player.prototype.pattern = function(e) {
	let pattern = e.target.dataset.model || 'order';
	const arr = ['order','one','random'];
	if(pattern && (pattern == 'order' || pattern == 'one' || pattern == 'random')) {
		switch(pattern) {
			case 'order': 
				{
					this.$pattern.dataset.model = 'one'; 
					this.$patternDesc.innerHTML = '单曲';
					return 'one'; 
					break;
				}
			case 'one': 
				{
					this.$pattern.dataset.model = 'random';
					this.$patternDesc.innerHTML = '随机'; 
					return 'random'; 
					break;
				}
			
			case 'random':
				{
					this.$pattern.dataset.model = 'order';
					this.$patternDesc.innerHTML = '顺序'; 
					return 'order'; 
					break;
				}
		}
	}
	return 'order';
}
/**
 * 播放模式
 */
player.prototype.playModel = function() {
	let pattern = this.$pattern.dataset.model || 'order';
	if(pattern && (pattern == 'order' || pattern == 'one' || pattern == 'random')) {
		switch(pattern) {
			case 'order': this.next(); break;
			case 'one':   this.oneLoop(); break;
			case 'random': this.randLoop(); break;
		}
	}
}
/**
 * 加载播放列表,以及播放列表 Item 位置
 */
player.prototype.loadPlaylist = function() {
	var ind,
		arr = this.playList.map(function(list,index){
		ind = index + 1;
		return  '<div class="playlist-item" data-index="' + index + '">' + ind + '.  ' + list.title + ' ' + list.artist +
		'</div>';
		}),
		innerHTML = arr.join('');
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
 * 点击快进歌曲
 */
player.prototype.setProgress = function(e) {
	//当前歌曲时间 = 点击位置所占比例 x 总时间
	this.audio.currentTime = e.offsetX / this.$progress.clientWidth * this.audio.duration;
	this.play();	
}
/**
 * 声音控制
 */
player.prototype.setVolume = function(e) {
	//这里情况比较特殊，不能采用上面的方法，因为这里 hover 上去元素才显示出来，
	//而且我们把事件绑定在最外层
	const rect = this.$volume.getBoundingClientRect();
	//这里需要多减去一个声音 icon 的宽度
	let volume = (e.x - rect.left - 15) / this.$volumeSlider.clientWidth;
	//限制范围 [0,1]
	if(volume < 0) {
		volume = 0;
	}
	if(volume > 1) {
		volume = 1;
	}
	if(volume >= 0 && volume <= 1) {
		this.$volumeValue.style.width = volume * 100 + '%';
		this.audio.volume = volume;
	}
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