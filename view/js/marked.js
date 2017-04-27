;(function(marked) {
	if (typeof module !== 'undefined' && typeof exports === 'object') {
		module.exports = marked();
	} else if (typeof define === 'function' && define.amd) {
	  define(marked);
	} else {
	  window.marked = marked();
	}
}(function() {

	/**
	 * block grammar
	 */
	var block = {
		newline: /^\n+/, //新行
		heading: /^ *(#{1,6})+ *([^\n]+?) *(?:\n+|$)/, //标题
		hr: /^( *[-*_]){3,} *(?:\n+|$)/, //分隔行
		code: /^( {4}[^\n]+\n*)+/, //代码块
		text: /^[^\n]+/, //文本
		//这个用途不知道
		lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/, 
		blockquote: /^( *>[^\n]+(\n[^\n]+)*\n*)+/, //引用
    //[\s\S]+?任意字符（包括回车换行）出现任意多次
		list: /^( *)(bull) [\s\S]+?(?:\n{2,}(?! )(?!\1bull )\n*|\s*$)/, //列表
		item: /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/, //列表的子条目	
		html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/, //HTML
    paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag))+)\n*/ //段落
	};

	block.bullet = /(?:[*+-]|\d+\.)/;

	block.item = replace(block.item, 'gm')
	  (/bull/g, block.bullet)
	  ();

	block.list = replace(block.list)
	  (/bull/g, block.bullet)
	  ();

	block._tag = '(?!(?:'
	  + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code'
	  + '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo'
	  + '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

	block.html = replace(block.html)
	  ('comment', /<!--[\s\S]*?-->/)
	  ('closed', /<(tag)[\s\S]+?<\/\1>/)
	  ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
	  (/tag/g, block._tag)
	  ();

	block.paragraph = replace(block.paragraph)
	  ('hr', block.hr)
	  ('heading', block.heading)
	  ('lheading', block.lheading)
	  ('blockquote', block.blockquote)
	  ('tag', '<' + block._tag)
	  ();

  /**
   * marked("### 123\r1. 23\r 1. 56") ==> '<h1>123</h1><ol><li>23</li><li>56</li></ol>'
   * return Parser.parse(Lexer.lex(src, opt), opt)
   * | |
   *  V
   * Lexer.lex(src) => this.token = [{type: heading, level: 1},{}];
   * 
   * Parser.parse(Lexer.lex(src));
   * Parser.parse(this.token[])
   * 
   */
  
  /**
   * 内部语法
   * 段落里面 可能有 strong em link image 
   */
  
  var inline = {
    escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
    autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
    url: noop,
    tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
    link: /^!?\[(inside)\]\(href\)/,
    reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
    nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
    strong: /^__([\s\S]+?)__(?!_)|^\*\*([\s\S]+?)\*\*(?!\*)/,
    em: /^\b_((?:[^_]|__)+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
    code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
    br: /^ {2,}\n(?!\s*$)/,
    del: noop,
    text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
  };

  inline._inside = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
  inline._href = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

  inline.link = replace(inline.link)
    ('inside', inline._inside)
    ('href', inline._href)
    ();

  inline.reflink = replace(inline.reflink)
    ('inside', inline._inside)
    ();

  inline.rules = merged({},inline);

  function InlineLexer(links,options) {
    this.options = options || marked.defaults;
    this.links = links;
    this.rules = inline.rules;
    this.renderer = this.options.renderer || new Renderer;
    this.renderer.options = this.options;

    if(!links) {
      throw new Error("links needed");
    }

  }

  //私有属性
  InlineLexer.rules = inline;

  //私有方法
  InlineLexer.output = function(src,links,options) {
    var inline = new InlineLexer(links,options);
    return inline.output(src);
  }
  //这里要对前面解析后的文本进行进一步解析
  //如标题 可能加上斜体，强调
  InlineLexer.prototype.output = function(src) {
    var out = '',
        link,
        href,
        text,
        cap;
    while(src) {

      //escape
      if(cap = this.rules.escape.exec(src)) {
        src = src.substring(cap[0].length);
        out += cap[1];
        continue;
      }

      //strong
      if(cap = this.rules.strong.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.strong(this.output(cap[2] || cap[1]));
        continue;
      }

      //em
      if(cap = this.rules.em.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.em(this.output(cap[2] || cap[1]));
        continue;
      }

      //br
      if(cap = this.rules.br.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.br();
        continue;
      }

      //code
      if(cap = this.rules.code.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.code(escape(cap[2], true));
        continue;
      }

      //auto link
      if(cap = this.rules.autolink.exec(src)) {
        src = src.substring(cap[0].length);
        if (cap[2] === '@') {
          text = cap[1].charAt(6) === ':'
            ? this.mangle(cap[1].substring(7))
            : this.mangle(cap[1]);
          href = this.mangle('mailto:') + text;
        } else {

        }
        text = escape(cap[1]);
        href = text;
        out += this.renderer.link(href, null, text);
        continue;
      }

      // link
      if (cap = this.rules.link.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.outputLink(cap, {
          href: cap[2],
          title: cap[3]
        });
        continue;
      }
      
      //text
      if(cap = this.rules.text.exec(src)) {
        src = src.substring(cap[0].length);
        out += this.renderer.text(escape(cap[0]));
        continue;
      }
      if (src) {
        throw new Error('Infinite loop ');
      }
    }
    return out;
  }
  InlineLexer.prototype.outputLink = function(cap,link) {
    var href = escape(link.href)
      , title = link.title ? escape(link.title) : null;

    return cap[0].charAt(0) !== '!'
      ? this.renderer.link(href, title, this.output(cap[1]))
      : this.renderer.image(href, title, escape(cap[1]));
  }
  InlineLexer.prototype.mangle = function(text) {
    var out = '',
        l = text.length,
        i = 0,
        ch;
    for (; i < l; i++) {
      ch = text.charCodeAt(i);
      if (Math.random() > 0.5) {
        ch = 'x' + ch.toString(16);
      }
      out += '&#' + ch + ';';
    }
    return out;
  }
	/**
	 * 解析类型
	 */
  function Lexer(options) {
  	this.tokens = []; //解析的类型数组
  	this.tokens.links = {}; // 这个给后面的参数
  	this.options = options || marked.defaults;
  	this.rules = block; //匹配规则
  }

  //私有属性
  Lexer.rule = block;

  //私有函数 
  //参数 [字符串,可选部分]
  //这里使用私有函数提供外部接口，什么目的？？？
  Lexer.lex = function(src,options) {
  	var lexer = new Lexer(options);
  	return lexer.lex(src);
  }

  //处理换行、制表符、空格
  Lexer.prototype.lex = function(src) {
  	src = src
  	.replace(/\r\n|\n/g,'\n')
  	.replace(/\t/g,'    ')
  	.replace(/\u00a0/,' ')
  	.replace(/\u2424/,'\n');
  	return this.process(src,true);
  }

  //将匹配结果转换为相应类型
  Lexer.prototype.process = function(src,top,bq) {
  	var src = src.replace(/^ +$/gm, ''),
  			next,
  			loose,
  			cap,
  			bull,
  			b,
  			item,
  			space,
  			i,
  			l;
  	while(src) {
  		
  		//新行 newline,假如没有匹配成功返回 null
  		//exec(src) 结果返回一个数组 
  		//[匹配到的全部字符串,括号中的分组捕获的字符串,index: 开始匹配位置, input: 原始字符串]
  		if(cap = this.rules.newline.exec(src)) {
  			
  			//这里是截取字符串
  			src = src.substring(cap[0].length);
  			if(cap[0].length > 1) {
  				this.tokens.push({
  					type: 'space'
  				});
  			}
  		}
  		
  		//代码块 code
  		if(cap = this.rules.code.exec(src)) {
  			src = src.substring(cap[0].length);
  			cap = cap[0].replace(/^ {4}/gm,'');
  			this.tokens.push({
  				type: 'code',
  				text: cap
  			});
  			continue;
  		}
  		
  		//heading 标题
  		if(cap = this.rules.heading.exec(src)) {
  			src = src.substring(cap[0].length);
  			this.tokens.push({
  				type: 'heading',
  				level: cap[1].length,
  				text: cap[2]
  			});
  			continue;
  		}
  		
  		//hr 分割线
  		if(cap = this.rules.hr.exec(src)) {
  			src = src.substring(cap[0].length);
  			this.tokens.push({
  				type: 'hr'
  			});
        continue;
  		}
  		
  		//quote 引用
  		if(cap = this.rules.blockquote.exec(src)) {
  			src = src.substring(cap[0].length);
  			this.tokens.push({
  			  type: 'blockquote_start'
  			});
  			cap = cap[0].replace(/^ *> ?/gm, '');
  			
  			//这里是 > 后面的内容
  			this.process(cap, top, true);
  			this.tokens.push({
  			  type: 'blockquote_end'
  			});
  			continue;
  		}
  		
  		//list 列表
  		if(cap = this.rules.list.exec(src)) {
  			src = src.substring(cap[0].length);
  			bull = cap[2].length;
  			this.tokens.push({
  				type: 'list_start',
  				ordered: bull > 1
  			});
  			
  			//获取所有item
  			cap = cap[0].match(this.rules.item);

  			next = false;
  			l = cap.length;
  			i = 0;
  			for(; i < l ; i++) {
  				item = cap[i];
  				
  				//去除前面的标号 或者 新号
  				space = item.length;
  				item = item.replace(/^ *([*+-]|\d+\.) +/, '');
  				
  				// indexOf() 成功返回匹配到的位置，否则返回 -1
  				// ~ 为取反运算符 0011 ==》1100 -1 => 0
  				// 2 => -1
  				if(~item.indexOf('\n ')) {
  					item = item.replace(/^ {1,4}/gm, '');
  				}
  				//
  				this.tokens.push({
  				  type: 'list_item_start'
  				});

  				this.process(item, false, bq);

  				this.tokens.push({
  				  type: 'list_item_end'
  				});
  			}

  			this.tokens.push({
  				type: 'list_end'
  			});
  			continue;
  		}
  		
  		//paragraph 段落,这里边包括解析 strong,link
  		if(top && (cap = this.rules.paragraph.exec(src))) {
  			src = src.substring(cap[0].length);
  			this.tokens.push({
  				type: 'paragraph',
  				text: cap[1].charAt(cap[1].length -1) == '\n'
  					? cap[1].slice(0,-1) : cap[1]
  			});
        continue;
  		}
  		
  		//text 文本
  		if(cap = this.rules.text.exec(src)) {
  			src = src.substring(cap[0].length);
  			this.tokens.push({
  				type: 'text',
  				text: cap[0]
  			});
  			continue;
  		}
  		
  		//HTML
  		if(cap = this.rules.html.exec(src)) {
  			src = src.substring(cap[0].length);
  			this.tokens.push({
  				type: 'html',
  				text: cap[0]
  			});
  			continue;
  		}
  		if(src) {
  			throw new Error("infinite loop");
  		}
  	}
  	return this.tokens;
  }
  


	/**
	 * Renderer
	 */
	function Renderer(options) {
		this.options = options || {};
	}
	Renderer.prototype.code = function(code,lang,escaped) {
		if(!lang) {
			return '<pre><code>'
						+ (escaped ? code : escape(code))
						+ '</code></pre>';
		}
		return '<pre><code class="'
				+ this.options.langPrefix
				+ '">'
				+ escaped ? code : escape(code,true)
				+ '</code></pre>';
	}
	Renderer.prototype.blockquote = function(text) {
		return '<blockquote>\n' + text + '</blockquote>\n';
	}
	Renderer.prototype.html = function() {
		return html;
	}
	Renderer.prototype.heading = function(text,level) {
		return '<h' + level + '>' + text + '</h' + level + '>';
	}
	Renderer.prototype.hr = function() {
		return '<hr>\n';
	}
  Renderer.prototype.br = function() {
    return '<br>\n';
  }
	Renderer.prototype.list = function(text,order) {
		var type = order ? 'ol' : 'ul';
		return '<' + type + '>' + text + '</' + type + '>';
	}
	Renderer.prototype.listItem = function(text) {
		return '<li>' + text + '</li>';
	}
	Renderer.prototype.paragraph = function(text) {
		return '<p>' + text + '</p>';
	}
	Renderer.prototype.strong = function(text) {
		return "<strong>" + text + "</strong>";
	}
	Renderer.prototype.em = function(text) {
		return "<em>" + text + "</em>";
	}
	Renderer.prototype.link = function(href,title,text) {
		
		//安全问题
		// if (this.options.sanitize) {
		//   try {
		//     var prot = decodeURIComponent(unescape(href))
		//       .replace(/[^\w:]/g, '')
		//       .toLowerCase();
		//   } catch (e) {
		//     return '';
		//   }
		//   if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
		//     return '';
		//   }
		// }
		var out = '<a href="' + href + '"';
		if (title) {
		  out += ' title="' + title + '"';
		}
		out += '>' + text + '</a>';
		return out;
	}	
	Renderer.prototype.image = function(src,alt,title) {
		var out = '<img src="' + src + '" alt="' + alt + '"';
		if(title) {
			out += ' title="' + title + '"'; 
		}
		out += '/>';
		return out
	}
	Renderer.prototype.text = function(text) {
		return text;
	}
	Renderer.prototype.del = function(text) {
		'<del>' + text + '</del>';
	}

	/**
	 * Parser 
	 */
	function Parser(options) {
		this.token = null;
		this.tokens = [];
		this.options = options || marked.defaults;
		this.options.renderer = this.options.render || new Renderer;
		this.renderer = this.options.renderer;
		this.renderer.options = this.options;
	}
	
	//私有方法
	Parser.parse = function(src, options) {
		var parse = new Parser(options);
		//这里是原型链上的parse 方法
		return parse.parse(src);
	} 
  //Array 是一个对象 this.tokens = []
  //this.tokens.link = {}
  //this.tokens.push({})
  //src [links: {},{},{}];
	Parser.prototype.parse = function(src) {
		this.inline = new InlineLexer(src.links,this.options);
		//数组逆序，这里必须逆序
    //[{h1},{p},{image}]
    //[{image},{p},{h1}]
		this.tokens = src.reverse();
		var out = '';
		while(this.pop()) {
			out += this.wrap();
		}
		//这里返回的就是解析后的 HTML 字符串
		return out;
	}
	
	//弹出解析后的类型数组，栈顶元素，一个解析后对象
  //比如 {text: '*a* **AAA**',type: 'paragraph'}
	Parser.prototype.pop = function() {
		return this.token = this.tokens.pop();
	}
	
	//当前栈顶元素
	Parser.prototype.top = function() {
		return this.tokens[this.tokens.length -1] || 0;
	}
	
	//解析文本内部
  // [{},{type: text,text: text}]
	Parser.prototype.parseText = function() {
		var body = this.token.text;
		while(this.top().type == 'text') {
			body += '\n' + this.pop().text;
		}
		return this.inline.output(body);
	}
	
	//根据类型返回包裹后的 HTML字符串
  Parser.prototype.wrap = function() {
  	switch(this.token.type) {
  		case 'space': {
        return '';
      }
  		case 'hr': {
  			return this.renderer.hr();
      }
  		case 'heading': {
        return this.renderer.heading(
        this.inline.output(this.token.text),
        this.token.level);
      }
  		case 'code': {
        return this.renderer.code(
        this.token.text,
        this.token.lang,
        this.token.escaped);
      } 
  		case 'blockquote_start': {
        var body = '';
        while(this.pop().type !== 'blockquote_end') {
          body += this.wrap();
        }
        return this.renderer.blockquote(body);
      }
  		case 'list_start': {
        var body = '',
          ordered = this.token.ordered;
        while(this.pop().type !== 'list_end') {
          body += this.wrap(); 
        }
        return this.renderer.list(body,ordered);
      }
  		case 'list_item_start': {
  			var body = '';
        while (this.pop().type !== 'list_item_end') {
          body += this.token.type === 'text'
            ? this.parseText()
            : this.wrap();
        }
        return this.renderer.listItem(body);
      }
  		case 'paragraph': {
  			return this.renderer.paragraph(this.inline.output(this.token.text));
      }
  		case 'html': {
  			return this.renderer.html();
      }
  		case 'text': {
  			return this.renderer.paragraph(this.parseText());;
      }
  	}
  }
	
	/**
	 * Helper
	 */
	
	/**
	 * escape html
	 * escape("<script></script>");
	 * return "&lt;script&gt;&lt;script&gt;"
	 */
	function escape(html,encode) {
		return html.replace(!encode ? /&(?!#?\w+;)/g : /&/g,'&amp;')
		  .replace(/>/g,'&gt;')
			.replace(/</g,'&lt;')
			.replace(/"/g,'&quot;')
			.replace(/'/g,'&#39');
	}
	
	/**
	 * unescape html
	 */
	function unescape(html) {
		return html.replace(/&(#(?:\d+)|(?:x[0-9A-Fa-f]+)|(?:\w+))/,function(match,n){
			n = n.toLowerCase();
			if(n.charAt(0) == '#') {
				return n.charAt(1) == 'x' ? String.fromCharCode(parseInt(n.substring(2),16)) 
				: String.fromCharCode(+n.substring(2));
			}
			return ''
		})
	}
	
	/**
	 * merge object  
	 * merged({},{a:1},{c:2}) 
	 * return {a:1,b:2}
	 */
	function merged(obj) {
		var i = 1,
			key,
			target;
		for (; i < arguments.length; i++) {
			target = arguments[i];
			for(key in target) {
				if(Object.hasOwnProperty.call(target,key)) {
					obj[key] = target[key];
				}
			}
		}
		return obj;
	}
	
	//空操作
	function noop() {}

	function replace(regex, opt) {
	  regex = regex.source;
	  opt = opt || '';
	  return function self(name, val) {
	    if (!name) return new RegExp(regex, opt);
	    val = val.source || val;
	    val = val.replace(/(^|[^\[])\^/g, '$1');
	    regex = regex.replace(name, val);
	    return self;
	  };
	}

  /**
   * marked
   * marked(src,[opt,callback])
   */
  function marked(src,opt,callback) {
    if(callback || typeof opt === 'function') {
      if(!callback) {
        callback = opt;
        opt = null;
      }
      opt = merged({},marked.defaults,opt || {});
      var highlight = opt.highlight,
          tokens,
          pendings,
          i = 0;
      try {
        tokens = Lexer.lex(src, opt)
      } catch(e) {
        return callback(e);
      }
      pendings = tokens.length;
    }
    try {
      if(opt) {
        opt = merged({},marked.defaults,opt);
      }
      return Parser.parse(Lexer.lex(src, opt), opt);
    } catch(e) {
      console.log(e);
    }
  }
  /**
   * [defaults options]
   * 
   */
  marked.defaults = {
    breaks: false,
    pedantic: false,
    sanitize: false,
    sanitizer: null,
    mangle: true,
    smartLists: false,
    silent: false,
    highlight: null,
    langPrefix: 'lang-',
    headerPrefix: '',
    renderer: new Renderer
  };
  return marked;

}))



