
Atlas.Ajax = Atlas.Class.extend({

  options: {
        url:"",
        method: "GET", 
        async: true, 
        data: "",
        headers: null,
        username: "", 
        password: "",  

        onsuccess: Atlas.Util.nullFn,
        onfailure:  Atlas.Util.nullFn,
        onbeforerequest: Atlas.Util.nullFn,

        noCache: false

    },

    initialize: function (options) {
        Atlas.Util.setOptions(this, options);

    },

    request: function() {
	    options = this.options || {};

	    var data = options.data || "",
        url = options.url,
	    async = !(options.async === false),
	    username = options.username || "",
	    password = options.password || "",
	    method = (options.method || "GET").toUpperCase(),
	    headers = options.headers || {},
	    eventHandlers = {},
	    key,
	    xhr;
	    /**
         * readyState发生变更时调用
         * @ignore
         */
	    function stateChangeHandler() {
		    if (xhr.readyState == 4) {
			    try {
				    var stat = xhr.status;
			    } catch(ex) {
				    // 在请求时，如果网络中断，Firefox会无法取得status
				    fire('failure');
				    return;
			    }

			    //fire(stat);

			    // http://www.never-online.net/blog/article.asp?id=261
			    // case 12002: // Server timeout      
			    // case 12029: // dropped connections
			    // case 12030: // dropped connections
			    // case 12031: // dropped connections
			    // case 12152: // closed by server
			    // case 13030: // status and statusText are unavailable

			    // IE error sometimes returns 1223 when it 
			    // should be 204, so treat it as success
			    if ((stat >= 200 && stat < 300) || stat == 304 || stat == 1223) {
				    fire('success');
			    } else {
				    fire('failure');
			    }

			    window.setTimeout(function() {
				    // 避免内存泄露
				    xhr.onreadystatechange = new Function();
				    if (async) {
					    xhr = null;
				    }
			    },
			    0);
		    }
	    }

	    /**
         * 获取XMLHttpRequest对象
         * 
         * @ignore
         * @return {XMLHttpRequest} XMLHttpRequest对象
         */
	    function getXHR() {
		    if (window.ActiveXObject) {
			    try {
				    return new ActiveXObject("Msxml2.XMLHTTP");
			    } catch(e) {
				    try {
					    return new ActiveXObject("Microsoft.XMLHTTP");
				    } catch(e) {}
			    }
		    }
		    if (window.XMLHttpRequest) {
			    return new XMLHttpRequest();
		    }
	    }

	    /**
         * 触发事件
         * 
         * @ignore
         * @param {String} type 事件类型
         */
	    function fire(type) {
		    type = 'on' + type;
		    var handler = eventHandlers[type],
		    globelHandler = Atlas.Ajax[type];

		    // 不对事件类型进行验证
		    if (handler) {
			    if (type != 'onsuccess') {
				    handler(xhr);
			    } else {
				    handler(xhr, xhr.responseText);
			    }
		    } else if (globelHandler) {
			    //onsuccess不支持全局事件
			    if (type == 'onsuccess') {
				    return;
			    }
			    globelHandler(xhr);
		    }
	    }

	    for (key in options) {
		    // 将options参数中的事件参数复制到eventHandlers对象中
		    // 这里复制所有options的成员，eventHandlers有冗余
		    // 但是不会产生任何影响，并且代码紧凑
		    eventHandlers[key] = options[key];
	    }

	    headers['X-Request-With'] = 'XMLHttpRequest';

	    try {
		    xhr = getXHR();

		    if (method == 'GET') {
			    //url += (url.indexOf('?') >= 0 ? '&': '?');
			    if (data) {
				    url += data + '&';
				    data = null;
			    }
			    if (options['noCache']) url += 'b' + (new Date()).getTime() + '=1';
		    }

		    if (username) {
			    xhr.open(method, url, async, username, password);
		    } else {
			    xhr.open(method, url, async);
		    }

		    if (async) {
			    xhr.onreadystatechange = stateChangeHandler;
		    }

		    // 在open之后再进行http请求头设定
		    if (method == 'POST') {
			    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		    }

		    for (key in headers) {
			    if (headers.hasOwnProperty(key)) {
				    xhr.setRequestHeader(key, headers[key]);
			    }
		    }

		    fire('beforerequest');
		    xhr.send(data);

		    if (!async) {
			    stateChangeHandler();
		    }
	    } catch(ex) {
		    fire('failure');
	    }

	    return xhr;
   }

});
/**
* 发送一个post请求
* @function
* @grammar Atlas.Ajax.post(url, data[, onsuccess])
* @param {string} 	url 		发送请求的url地址
* @param {string} 	data 		发送的数据
* @param {Function} [onsuccess] 请求成功之后的回调函数，function(XMLHttpRequest xhr, string responseText)
*   
* @returns {XMLHttpRequest} 	发送请求的XMLHttpRequest对象
*/
Atlas.Ajax.post = function(url, data, onsuccess) {
    var ajax = new Atlas.Ajax({
            url:url,
            data:data,
            method:'POST',
           onsuccess: onsuccess,
           onfailure:function(){
                 alert("请求失败！");
           }
    });

	return ajax.request();
};
/**
* 发送一个get请求
* @function
* @grammar Atlas.Ajax.get(url[, onsuccess])
* @param {string} 	url 		发送请求的url地址
* @param {Function} [onsuccess] 请求成功之后的回调函数，function(XMLHttpRequest xhr, string responseText)
*  
* @returns {XMLHttpRequest} 	发送请求的XMLHttpRequest对象
*/
Atlas.Ajax.get = function(url, onsuccess) {
    var ajax = new Atlas.Ajax({
           url:url,
           headers:{"accept-encoding":"gzip,deflate"},
           onsuccess: onsuccess,
           onfailure:function(){
                 alert("请求失败！");
           }
    });

	return ajax.request();
};