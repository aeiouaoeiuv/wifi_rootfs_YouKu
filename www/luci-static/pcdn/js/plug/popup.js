 //弹窗遮罩层以及tip提示
 (function($){
   var popup={},
   //判断是不是IE6
   isIE6=function(){
    if ($.browser.msie && $.browser.version == "6.0") return true;
    return false;
   },
   //获取整个浏览器的高度包含滚动高度
   brHeight=function(){
    var bd=document.body,doc=document.documentElement;
    var clientHeight=Math.max(doc.clientHeight,doc.clientHeight,doc.scrollHeight,bd.clientHeight,bd.clientHeight,bd.scrollHeight);
    var scrollTop=bd.scrollTop || doc.scrollTop;
    return (clientHeight+scrollTop)+"px";
   };
   //默认弹层配置
    popup.defaults={
       "okBtn":".ok",
       "cancelBtn":".cancel",
       "okBtnClick":null,
       "closeBtn":".pop-close",
       "layerCss":{},
       "mask":true 
   };
   popup.overLay=function(){
     //固定只出现一个遮罩层节点
     var overLay=$("#YKRouterOverLayId");
     if(overLay.length==0){
        var position="fixed",height="100%";
        if(isIE6()===true){
         position="absolute";
         height=brHeight();
       }
       overLay=$('<div id="YKRouterOverLayId"></div>').css({
        "background":"#000",
        "opacity":0.65,
        "z-index":2000,
        "left":0,
        "top":0,
        "position":position,
        "width":"100%",
        "height":height
        }).appendTo($(document.body));
     }
     overLay.show();
     return overLay; 
   }; 
   //按照id获取弹层
   popup.showId=function(id,option){
     var layer=$("#"+id),overlay=null,
     settings=$.extend({},popup.defaults,option || {});
     if(!$.isEmptyObject(settings.layerCss)) layer.css(settings.layerCss);
     layer.css("z-index",4000).show();
     if(settings.mask) overlay=popup.overLay();
     var okBtn=layer.find(settings.okBtn),
     cancelBtn=layer.find(settings.cancelBtn),
     closeBtn=layer.find(settings.closeBtn);
     //确认
     okBtn.one("click",function(){
      settings.okBtnClick && settings.okBtnClick(layer,overlay);
     });
     //取消
     cancelBtn.one("click",function(){
      popup.close(layer,overlay,"hide");
     });
     //关闭
     closeBtn.one("click",function(){
       popup.close(layer,overlay,"hide");
     });
   };
   //简单对话框
   popup.simpleBox=function(option){
     var templateVal={
        "title":"提示",
        "content":"内容",
        "okBtnName":"确定",
        "cancelBtnName":"取消"
     },
     settings=$.extend(popup.defaults,templateVal,option || {}),
    //默认模板
     template='<div class="popup simple-pop">'+
     '<div class="title">'+
     '<span class="name">{{title}}</span><span class="pop-close"></span>'+
    '</div>'+
     '<div class="pop-con">'+
    '<div class="text-tip">{{content}}</div>'+
     '</div>'+
    '<div class="pop-btns">'+
    '<span class="normal-btn ok">{{okBtnName}}</span><span class="gray-btn2 cancel">{{cancelBtnName}}</span>'+
     '</div>'+
    '</div>';
     template=template.replace(/\{\{([a-zA-Z0-9\-_]+)\}\}/gm,function(t,k){
       return settings[k];  
     });
     var layer=$(template).appendTo($(document.body)),overlay=null;
     layer.css("z-index",4000).show();
     if(settings.mask) overlay=popup.overLay();
     layer.delegate(settings.okBtn, "click", function(e) {
        settings.okBtnClick && settings.okBtnClick(layer,overlay);
     });
     if(settings.hideCancel==true){
       layer.find(settings.cancelBtn).hide();
     }
     layer.delegate(settings.cancelBtn,"click",function(e){
      popup.close(layer,overlay);
     });
     layer.delegate(settings.closeBtn,"click",function(e){
       popup.close(layer,overlay);
     });
   };
   //错误提示
   popup.errorTip=function(error,option){
    var settings=$.extend(popup.defaults,option || {}),
    template='<div class="popup error-msg">'+
    '<a href="javascript:;" class="pop-close"></a>'+
    '<div class="pop-con"><span class="msg">'+error+'</span></div>'+
    '<div class="pop-btns"><span class="normal-btn ok">'+(settings.okBtnName || "知道了")+'</span></div>'+
    '</div>';
     var layer=$(template).appendTo($(document.body)),overlay=null;
     layer.css("z-index",4000).show();
     if(settings.mask) overlay=popup.overLay();
     layer.delegate(settings.okBtn, "click", function(e) {
       if(settings.okBtnClick){
          settings.okBtnClick(layer,overlay);
       }else{
          popup.close(layer,overlay);
       }
     });
     layer.delegate(settings.closeBtn,"click",function(e){
      popup.close(layer,overlay);
     });
   };
   //成功提示
   popup.tip=function(msg,option,flag){
     var flag=flag?flag:"success";
     if(flag=="success"){
       var cls="right";
     }else if(flag=="fail"){
       var cls="warn";
     }
     var configs={
     "template":'<div class="tip" style="position:fixed;_position:absolute"><span class="'+cls+'"></span><span>'+msg+'</span></div>',
     "fadeOut":1000,
     "delay":1000,
     "position":"center",
     "tipCss":{},
	   "endFn":null
     },
     timer,
     settings=$.extend(true,configs,option),
     layer=$(settings.template).appendTo($(document.body));
     var tipCss=settings.tipCss;
     layer.css("z-index",4000).show();
     if(settings.position=='center'){
      tipCss["top"]="50%";
      tipCss["left"]="50%";
      tipCss["margin-left"]=-layer.width()/2+'px';
      tipCss["margin-top"]=-layer.height()/2+'px';
     }else if($.isArray(settings.position) && settings.position.length>=2){
      tipCss["left"]=settings.position[0]+"px";
      tipCss["top"]=settings.position[1]+"px";
     }
     layer.css(tipCss);
     clearTimeout(timer);
     timer=setTimeout(function(){
       if(settings.fadeOut){
        layer.fadeOut(settings.fadeOut,function(){
         layer.remove();
		 settings.endFn && settings.endFn(); 
       });
      }else{
      　layer.remove();
	    settings.endFn && settings.endFn(); 
      }
     },settings.delay);
   };
   //升级弹窗
   popup.upGrade=function(duration,delay){
     if(!duration || isNaN(duration)) duration=2;
     var template='<div class="manual-update popup" id="upGradeProgress">'+
       '<div class="con" id="startUpGrade">'+
       '<p class="head clrfx"><span class="tt">系统正在升级</span><span class="remain-time">大约需'+duration+'分钟</span></p>'+
       '<div class="progress-bg"><div class="progress-val" id="progressVal" style="width:0%"></div></div>'+
       '<p class="notice">为避免损坏路由器，升级过程中请不要中断连接，也不要断电</p>'+
      '</div>'+
      '<div class="con" style="display:none" id="finishPanel">'+
      '<div class="complate">'+
       '<p>手动升级完成！</p>'+
       '<p class="redirect">若没有跳转，请点击  <a href="http://wifi.youku.com">重新登录</a>  手动跳转。</p>'+
      '</div>'+
     '</div>'+
     '</div>';
     var millSeconds=duration*60*1000;//毫秒
     var layer=$(template).appendTo($(document.body)),overlay=null;
     layer.css("z-index",4000).show();
     overlay=popup.overLay();
     overlay.show();
     $("#progressVal").animate({width:"100%"},millSeconds,'linear',function(){
        $("#startUpGrade").hide();
        $("#finishPanel").show();
     });
   };
   //重启路由/恢复出厂设置/设置等导致路由重新连接提示
   popup.reConnect=function(delay,msg,url){
     var template='<div class="manual-restart popup">'+
      '<div class="title"><span class="name">系统重启</span></div>'+
      '<div class="waiting">'+msg+'</div>'+
     '</div>';
     var layer=$(template).appendTo($(document.body)).css("z-index",4000).show();
     setTimeout(function(){cycleChackState(delay,url);}, 30000);
   };
   //关闭弹层
   popup.close=function(layer,overlay,flag){
     var flag=flag?flag:"remove";
     if(flag=="hide"){
         layer.hide();   
     }else if(flag=="remove"){
         layer.remove();
     }
     overlay && overlay.fadeOut();
   };
   //循环检测联网状态
   function cycleChackState(delay,url){
    var timer=null;
    if(timer) clearInterval(timer);
    var url=url?url:"http://wifi.youku.com/luci-static/pcdn/images/login/logo.png?rd=";
    timer=setInterval(function(){
      loadImg();
    },delay);
    function loadImg(){
      var img = new Image();
      img.onload=function(){
        clearInterval(timer);
        timer=null;
        img=null; 
        location.href="http://wifi.youku.com";
      };
      img.onerror=function(){};
      img.src=url+new Date().getTime();
    }
   }
   window.popup=popup;
   window.cycleChackState=cycleChackState;
 })(window.jQuery);

