
/**
 * 由于考虑到可能运行于较老的环境, 所以尽量不使用ES6语法
 */
!(function (model) {
  /**这表示这个JS代码的使用严格模式运行 */
  "use strict"
  /**
   * 系统常量
   * 使用 Object.freeze 可以创建一个不可变的对象
   */
  var Constants = Object.freeze({
    BaseUrl: "http://45.77.220.216/",

  });

  window.jPustNotificationOpened = function (){
    location.href = "remind.html";
  };

  /**
   * JS 目前有两种语法标准
   * 这种是ES6的语法标准, 编码非常简洁
   */
  var Utils = new class Utils {
    get URLParams() {
      var obj = {};
      for (var item of location.search.substr(1).split("&").map(o => o.split("="))) {
        if (typeof item[1] != "undefined") obj[item[0]] = encodeURIComponent(item[1]);
      }
      return obj;
    }

    abc() {
      console.log(123)
    }
  }

  /**
   * 这种是ES5的语法标准, 编码非常麻烦
   */
  var Utils = new function Utils() {
    var utils = this;
    var addGetMethod = function (Key, method = function () { }) {
      Object.defineProperty(utils, Key, {
        get: method,
        enumerable: true,
        configurable: true
      });
    }

    /**
     * 添加一个获取URL参数的GET方法
     * 这个方法作为属性使用
     * 
     * Utils.URLParams 即可
     */
    addGetMethod("URLParams", function (obj = {}) {
      for (var item of location.search.substr(1).split("&").map(function (o) { return o.split("=") })) {
        if (typeof item[1] != "undefined") obj[item[0]] = encodeURIComponent(item[1]);
      }
      return obj;
    })
    /**
     * 这个方法需要加上()运行
     * 
     * Utils.dateFormat()
     */
    Utils.prototype.dateFormat = function (date, formatStr) {
      /*
      函数：填充0字符
      参数：value-需要填充的字符串, length-总长度
      返回：填充后的字符串
      */
      var zeroize = function (value, length) {
        if (!length) {
          length = 2;
        }
        value = new String(value);
        for (var i = 0, zeros = ''; i < (length - value.length); i++) {
          zeros += '0';
        }
        return zeros + value;
      };
      return formatStr.replace(/"[^"]*"|'[^']*'|\b(?:d{1,4}|M{1,4}|yy(?:yy)?|([hHmstT])\1?|[lLZ])\b/g, function ($0) {
        switch ($0) {
          case 'd': return date.getDate();
          case 'dd': return zeroize(date.getDate());
          case 'ddd': return ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
          case 'dddd': return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
          case 'M': return date.getMonth() + 1;
          case 'MM': return zeroize(date.getMonth() + 1);
          case 'MMM': return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
          case 'MMMM': return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()];
          case 'yy': return new String(date.getFullYear()).substr(2);
          case 'yyyy': return date.getFullYear();
          case 'h': return date.getHours() % 12 || 12;
          case 'hh': return zeroize(date.getHours() % 12 || 12);
          case 'H': return date.getHours();
          case 'HH': return zeroize(date.getHours());
          case 'm': return date.getMinutes();
          case 'mm': return zeroize(date.getMinutes());
          case 's': return date.getSeconds();
          case 'ss': return zeroize(date.getSeconds());
          case 'l': return date.getMilliseconds();
          case 'll': return zeroize(date.getMilliseconds());
          case 'tt': return date.getHours() < 12 ? 'am' : 'pm';
          case 'TT': return date.getHours() < 12 ? 'AM' : 'PM';
        }
      });
    }

    return utils;
  };

  /**后端接口 */
  var services = (function createApis(apis) {
    var url = apis;
    if (typeof (apis) != "string") {
      for (var k in apis) {
        apis[k] = createApis(apis[k]);
      }
    }
    /**
     * 接口调用
     * @param 接口入参
     * @param method 接口调用方式 GET PUST GETURL 这种方法特别对应的是[client/advice/list2/$cursor/$count] 这种URL 
     */
    else apis = function (params = {}, method = "POST") {
      return new Promise(function (resolve, reject) {
        let __url = String(url);
        if (method == "GETURL") {
          for (var key in params) {
            __url = __url.replace(new RegExp(`[$]${key}`, "ig"), params[key]);
          }
          params = {};
          method = "GET";
        };

        $('.loading').show();
        $.ajax({
          type: method,
          url: Constants.BaseUrl + __url,
          data: params,
          dataType: "json",
          xhrFields: {
            withCredentials: true
          },
          success: function (response, xhr) {
            $('.loading').hide();
            resolve(response);
          },
          error: function (e) {
            $('.loading').hide();
            reject(e);
          }
        })
      });
    };

    return apis;
  })({
    // 返回结果统一说明：r=1 成功 r=0 失败
    reg: {
      reg     : "client/reg/reg",      // 注册 post
      getmcode: "client/reg/getmcode", // 获取图形验证码 get
      hosts   : "client/reg/hosts"     // 备用host get
    },

    login : "client/login/login",                 // 登录 post
    advice: "client/advice/list2/$cursor/$count", // 提醒 get

    user: {
      get         : "client/user/get",                         // 我的详情 get
      pushadvice  : "client/user/pushadvice/$pushadvice",      // 推送提醒 get
      nodisturbing: "client/user/nodisturbing/$nodisturbing",  // 免打扰 get
      modpwd      : "client/user/modpwd",                      // 修改密码 post
      forgetpwd   : "client/reg/forgetpwd",                    // 忘记密码 post
      hasregid    : "client/user/hasregid",                    // 是否已添加极光pushregid get 返回结果 hasregid:0 否 hasregid:1 是
      pushregid   : "client/user/addregid/$pushregid"          // 添加极光pushregid get
    },

    article: {
      list: "client/article/list2/$cursor/$count", // 圈子列表 get
      get : "client/article/get/$id"               // 圈子详情 get
    },

    symbol: {
      symbol  : "client/symbol/list2/$selectedExchange/$cursor/$count",   // 币种字典 get 
      mysymbol: "client/mysymbol/list2/$selectedExchange/$cursor/$count", // 已关注币种 get
      add     : "client/mysymbol/add",                                    // 添加关注币种 post
      del     : "client/mysymbol/del",                                    // 取消关注币种 post
      search  : "client/symbol/search/$selectedExchange/$cursor/$count"   // 币种字典搜索 get selectedExchange = word
    }
  });


  model.services = services;
  model.Constants = Constants;
  model.Utils = Utils;
  /**
   * 下拉加载
   * 需要容器设定高度
   */
  model.jQuery.fn.dropDownLoad = function (backCall) {
    var $this = $(this);
    $this.css("overflow-y", "scroll");
    $this.on('touchmove', function (e) {
      if ((this.scrollHeight - this.clientHeight) <= this.scrollTop + 50/*在接近底部[50]像素的时候触发加载*/) {
        if (backCall) { backCall(); }
      }
    });
    //初始化执行一次
    if (backCall) { backCall(); }
  }

})(window)

function createDiv(){
	var createDiv = document.createElement('div');
		childDiv1 = document.createElement('div'),
		childDiv2 = document.createElement('div'),
		childDiv3 = document.createElement('div');
		childSpan = document.createElement('span');
		
	createDiv.className = 'pop_wrap';
	childDiv1.className = 'quit';
	childDiv2.className = 'qu_title';
	childDiv3.className = 'qu_btn';
	childSpan.className = 'affirm';
	childSpan.innerText = '确定';
//	childDiv3.innerHTML = '<span class = "affirm">确定<span>';
	childDiv3.appendChild(childSpan);
	childDiv1.appendChild(childDiv2);
	childDiv1.appendChild(childDiv3);
	createDiv.appendChild(childDiv1);
	document.body.appendChild(createDiv);
	
	$('.affirm').click(function(){
		$('.pop_wrap').css('display','none');
		$('.quit').css('display','none');
	})
	
}

function closes(a){
	a = a || 2000;
	if($('.pop_wrap').css('display') == 'block'){
		setTimeout(function(){
			$('.pop_wrap').css('display','none');
	$('.quit').css('display','none');
		},a)
	}
}