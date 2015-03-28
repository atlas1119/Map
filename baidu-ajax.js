
(function( window, undefined ) {

var baiduAjax = {};

baiduAjax.extend = function (dest) {
     sources = Array.prototype.slice.call(arguments, 1);
     for (var j = 0, len = sources.length, src; j < len; j++) {
         src = sources[j] || {};
         for (var i in src) {
              if (src.hasOwnProperty(i)) {
                   dest[i] = src[i];
               }
          }
     }
     return dest;
}

baiduAjax.format = function(tpl,obj){
		for (var key in obj) {
			var reg = new RegExp("#{"+key+"}","g");
				tpl = tpl.replace(reg,obj[key]);
		};

		return tpl;
}

baiduAjax.post = function(url, data, onsuccess){
    $.ajax({
           url:url,
           data:data,
           type:'POST',
           success: onsuccess
    });

}

baiduAjax.get = function(url, onsuccess) {
    $.ajax({
           type:'GET',
           url:url,
           success: onsuccess
    });

}

/**
* 解析一个非皮肤类广告(上方：search_ad_ppim)
* @function
* @grammar baiduAjax.parseRUAd(dataJson)
* @param {object}   dataJson  返回的数据
* 
*/
baiduAjax.parseRUTopAd = function(dataJson,position){
  var adTpl = ["<div style='' id='#{position}'>",
               "<a href='#{aLink}' target='_blank'>#{aLinkText}</a><br/>",
               "<a href='#{aLink}' target='_blank' style='display:block;'>",
                   "<img src='#{imgSrc}' alt='#{imgAlt}' width='75px' height='56px'/>",
                   "<p style='display:inline-block;width:440px;'>",
                      "<span style='vertical-align:top;display:inline-block;word-break:break-all;width:432px;font-size:12px;margin-left:8px;'>#{imgTitle}</span>",
                      "<span style='vertical-align:top;display:inline-block;color: #080;font-size: small;margin-left:8px;'>#{aLink}</span>",
                   "</p>",
               "</a>",
              "</div>"].join("");

  var aLink,aLinkText,imgSrc,imgTitle,imgAlt;
  if(dataJson.status == 0){ //成功
        var adInfos;
        if(typeof(dataJson.adInfo) == "string"){
            adInfos = eval("(" + dataJson.adInfo + ")");
        }else{
            adInfos = dataJson.adInfo;
        }
    //暂时先取广告的第一条数据
    aLink = adInfos[position].ads[0].target_url;
    if(adInfos[position].ads[0].extend_info && adInfos[position].ads[0].extend_info.title){
        aLinkText = adInfos[position].ads[0].extend_info.title;
    }else{
       aLinkText = "";
    }
    
    //取img的第一个
    if(adInfos[position].ads[0].img_list && adInfos[position].ads[0].extend_info && adInfos[position].ads[0].img_list.length > 0){
      if(adInfos[position].ads[0].extend_info.description){
        imgTitle = adInfos[position].ads[0].extend_info.description;
      }else{
        imgTitle = "";
      }
      
      imgAlt = aLinkText;
      imgSrc = adInfos[position].ads[0].img_list[0].img_url;
    }


    return baiduAjax.format(adTpl,{
      aLink : aLink,
      aLinkText : aLinkText,
      imgTitle : imgTitle,
      imgAlt : imgAlt,
      imgSrc : imgSrc,
      position : position
    });
  }else{
      return "";
  }

  return "";
}
/**
* 解析一个非皮肤类广告(右方：search_ad_im_1 )
* @function
* @grammar baiduAjax.parseRUAd(dataJson)
* @param {object} 	dataJson 	返回的数据
* 
*/
baiduAjax.parseRUAd = function(dataJson,position){
	var adTpl = ["<div style='' id='#{position}'>",
				 	"<a href='#{aLink}' target='_blank' style='display:block;'>",
				 		"<img src='#{imgSrc}' title='#{imgTitle}' alt='#{imgAlt}' width='300px' height='250px'/>",
				 	"</a>",
				 	"<br/><a href='#{aLink}' target='_blank'>#{aLinkText}</a>",
				 "</div>"].join("");

	var aLink,aLinkText,imgSrc,imgTitle,imgAlt;
	if(dataJson.status == 0){ //成功
        var adInfos;
        if(typeof(dataJson.adInfo) == "string"){
            adInfos = eval("(" + dataJson.adInfo + ")");
        }else{
            adInfos = dataJson.adInfo;
        }
		//暂时先取广告的第一条数据
		aLink = adInfos[position].ads[0].target_url;
    if(adInfos[position].ads[0].extend_info && adInfos[position].ads[0].extend_info.title){
        aLinkText = adInfos[position].ads[0].extend_info.title;
    }else{
       aLinkText = "";
    }
		
		//取img的第一个
		if(adInfos[position].ads[0].img_list && adInfos[position].ads[0].extend_info && adInfos[position].ads[0].img_list.length > 0){
			imgTitle = adInfos[position].ads[0].extend_info.title;
			imgAlt = adInfos[position].ads[0].extend_info.title;
			imgSrc = adInfos[position].ads[0].img_list[0].img_url;
		}


		return baiduAjax.format(adTpl,{
			aLink : aLink,
			aLinkText : aLinkText,
			imgTitle : imgTitle,
			imgAlt : imgAlt,
			imgSrc : imgSrc,
      position : position
		});
	}else{
      return "";
  }

	return "";
}

/**
* 解析一个皮肤类广告(左侧：search_ad_show_1，右侧：search_ad_show_2)
* @function
* @grammar baiduAjax.parseSkinAd(dataJson)
* @param {object}   dataJson    返回的数据
* 
*/
baiduAjax.parseSkinAd = function(dataJson,position){
    var adTpl = ["<div style='background:url(#{imgSrc}) no-repeat;width:100%;height:100%;'>",
                  "<a href='#{aLink}' target='_blank' style='display:block;width:100%;height:100%;'>",
                  "</a>",
                 "</div>"].join("");
    var tplStr;

    var aLink,imgSrc,imgTitle;
    if(dataJson.status == 0){ //成功
        var adInfos;
        if(typeof(dataJson.adInfo) == "string"){
            adInfos = eval("(" + dataJson.adInfo + ")");
        }else{
            adInfos = dataJson.adInfo;
        }
        
        //暂时先取广告的第一条数据
        aLink = adInfos[position].ads[0].target_url;
        
            //取img的第一个
        if(adInfos[position].ads[0].img_list && adInfos[position].ads[0].img_list.length > 0){
            //imgTitle = adInfos[position].ads[0].img_list[0].anchor;
            imgSrc = adInfos[position].ads[0].img_list[0].img_url;
        }

        tplStr = baiduAjax.format(adTpl,{
                aLink : aLink,
                imgSrc : imgSrc
        });

        return {
            url : aLink,
            tpl : tplStr
        };
    }else{
      return {
        url:"",
        tpl:""
      };
    }

    return "";
}
/**
* 对左侧皮肤做特别处理（onclick）
* @function
* @grammar baiduAjax.clickSkinLeft()
* @param {object}   dataJson    返回的数据
* 
*/
baiduAjax.clickSkinLeft = function(e,url){
     var evt = e || window.event,
         elem;
     if(evt.target){
        elem = evt.target;
     }else{
        elem = evt.srcElement;
     }
     //判断事件的目标
     if(elem && elem.tagName.toUpperCase() != 'A'){
         window.open(url, "_blank");
     }

     return false;
}

/**
* 广告点击统计
* @function
* @grammar baiduAjax.clickStatistics()
* @param {object}   data   post数据
* 
*/
baiduAjax.clickStatistics = function(data){
    
    baiduAjax.post("/cse/adclick",data,function(){
        
    });

     return false;
}
//暴露接口
window.baiduAdUtil = baiduAjax;

})( window );