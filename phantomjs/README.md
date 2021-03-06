### 根据关键词截取不同设备屏幕

>功能：根据参数不同可以截取不同设备的屏幕大小
>环境：phantomjs (PhantomJS 是一个无脚本的WebKit脚本)

#### 用法

```
    1. 网页抓取分析服务系列之二（设备模拟）
    进入 phantomjs/src 目录 运行命令
      phantomjs task.js keyword [device]
      device 可选 仅有三种设备可选 iphone5、iphone6、ipad

    2. 网页抓取分析服务系列之三（服务封装）
    npm install 安装依赖
    进入 phantomjs/src 目录 运行命令
      node index 开启服务
      打开浏览器 访问 http://localhost:8000/?word=哈哈&device=iphone5
    
    3. 网页抓取分析服务系列之四（数据交互）
    我们这里 2,3,4 依赖放在一起，这里不需要 npm install
    进入 phantomjs/src/koa 目录 运行命令
      node index
      打开浏览器输入关键字，选择url ，点击查询

    4. 网页抓取分析服务系列之五（并发控制）
    
```

#### 学习使用jshint

##### 安装sublime 插件 jsHint Gutter
    
> 这个比较简单，使用快捷键就可以了

##### NODE 环境全局安装 jshint

>需要配置 .jshintrc 文件，[配置参考](http://jshint.com/docs/options/),下面简单介绍一下配置项

```
    {
      "sub":true, //选项可以抑制使用[]符号表示法时使用符号的警告
      "laxbreak":true, //禁止大多数关于代码中可能不安全的换行符的警告
      "laxcomma":true, //禁止关于逗号优先编码风格的警告
      "asi": true, //禁止关于缺少分号的警告
      "browser": true, //让JSHint知道一些预定义全新的浏览器暴露的全局变量
      "loopfunc":true, //禁止关于循环内的函数的警告
      "expr":true, //禁止关于使用表达式的警告
      "node": true, //在Node运行时环境中运行时，此选项可定义全局变量
      "esversion: 6": true, //选项告诉JSHint你的代码使用ECMAScript 6的具体语法
      "bitwise": true, //禁止使用按位运算符，例如 ^,|
      "curly": true, //循环和条件中的块周围放置花括号,它可能会导致错误
      "latedef": false, //禁止在定义之前使用变量
      "expr": true, // 禁止关于使用表达式的警告
      "eqeqeq": false, //禁止使用==和!=赞成===和 !== 
      "eqnull": false, //禁止有关== null比较的警告
      "newcap": true, //要求大写构造函数的名称 yes
      "noarg": true, //选项禁止使用arguments.caller和 arguments.callee
      "undef": true, //禁止使用明确未声明的变量  yes
      "proto": true, //禁止关于__proto__属性的警告
      "strict": false, //选项要求代码以ECMAScript 5的严格模式运行。 严格模式 是选择限制JavaScript变体的一种方式
      "freeze": true, //选项禁止覆盖原生对象的原型
    }
```

##### 踩坑之路
1. 在使用`koa-static` 模块的时候，访问静态资源 404 ，后来查到原因

```
  app.use(static(path.join(__dirname,'/static/')));
  静态资源需要在static 目录下新建目录，如图片建立images
  static/images 二级目录，这样才可以访问 http://localhost:port/images/x.png
  
```