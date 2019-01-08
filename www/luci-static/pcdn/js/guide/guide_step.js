$(function(){
	var scrollGuideArea=$("#guideScroll"),
    modeChangeSet=$("#modeChangeSet"),
    bindAccount=$("#bindAccount"),
    setWifiAccount=$("#setWifiAccount"),
    ignoreClass="ignore";
    var routerChanelItem1=$('#routerChanelItem1');        
	  $.data(routerChanelItem1,"type",1);
    var disableSelectConnType=$("#disableSelectConnType");

  $.ajaxSetup({
　　　//请求失败遇到异常触发
　　　error: function (data) { if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}}
　});
	//footer
  $.getJSON($("#footerurl").val(), function(data){
        $("#sysversion").html(data['sysversion']);
        $("#MacAddr").html(data['MacAddr']);
        $("#wanIP").html(data['wanIP']);
        $("#routerQQ").html(data['routerQQ']);
        $("#routerWX").html(data['routerWX']);
        $("#routerHotline").html(data['routerHotline']);
  });
  
  function Uncode_utf8(pValue){
      return unescape(pValue.replace(/&#x/g,'%u').replace(/\\u/g,'%u').replace(/;/g,''));
  }
  
  var user_waiting = false;
  var pppoeStateNotice=$("#pppoeStateNotice");
  var setNetConnType=$("#setNetConnType");
  var connTypeArr=["检测到您需要使用宽带拨号方式上网","检测到您需要使用动态IP方式上网"];
  var pppoeConnStatus=["正在连接互联网…","已连接互联网（宽带拨号）","未连接互联网，点击\"保存\"按钮重新连接"];
  var pppoeTimer=null;
  var pppoeConnDelay=1000;
  var pppoeRequestAjax=null;
  var disConnectBtn=$("#disConnectBtn");
  var currentPPPOEState=null;
  //开始获取拨号状态和强制结束拨号
  function startWatchPPPOE(){
      clearInterval(pppoeTimer);
      pppoeTimer=setInterval(function(){watchWideBandState();},pppoeConnDelay);
  }
  function stopWatchPPPOE(){
      clearInterval(pppoeTimer);
      pppoeTimer=null;
      pppoeRequestAjax && pppoeRequestAjax.abort(); 　
      formSaveBtnState.resetInit(setNetConnType);
  }
  //监视宽带连接状态
   function watchWideBandState(){
    pppoeRequestAjax=$.getJSON($("#getPPPoEStatusUrl").val()+"?time="+new Date().getTime(),{},function(data){
      if(!data || !data.status) return false;
      if(data.status=="0"){
         disableSelectConnType.hide();
         pppoeStateNotice.html(pppoeConnStatus[2]);
         disConnectBtn.hide();
		 stopWatchPPPOE();
      }else if(data.status=="1"){
         disableSelectConnType.show();
         pppoeStateNotice.html(pppoeConnStatus[0]);
         disConnectBtn.hide();
         formSaveBtnState.loading(setNetConnType,"拨号中");
      }else if(data.status=="2"){
         disableSelectConnType.hide();
         pppoeStateNotice.html(pppoeConnStatus[1]);
         disConnectBtn.show();
		 stopWatchPPPOE();
         currentPPPOEState=2;
		 scrollGuideStep(1);
      }else if(data.status=="3"){
         disableSelectConnType.hide();
         pppoeStateNotice.html("返回码:"+data.errcode+"&nbsp;&nbsp;&nbsp;描述:"+data.errmsg);
         disConnectBtn.hide();
         stopWatchPPPOE();
      }else if(data.status=="4"){
          if (user_waiting == false) {
              disableSelectConnType.hide();
              pppoeStateNotice.html(pppoeConnStatus[2]);
              disConnectBtn.hide();
              stopWatchPPPOE();
          }
          else {//用户等待中
              disableSelectConnType.show();
              pppoeStateNotice.html(pppoeConnStatus[0]);
              disConnectBtn.hide();
              formSaveBtnState.loading(setNetConnType, "拨号中");
          }
        }   
      });  
    }
     //断开拨号
    disConnectBtn.on("click",function(){
      disableSelectConnType.hide();
      $(this).hide();
      user_waiting = false;
      stopWatchPPPOE();
	  disConnectBtn.hide();
      $.getJSON($("#pppoeStopUrl").val(),{},function(){
         if(currentPPPOEState==2){
          startWatchPPPOE();
        }else {
         pppoeStateNotice.html(pppoeConnStatus[2]);
        } 
      });
    });
  //设置联网方式
  $.getJSON($("#getssidurl").val(), function(data){
    $("#wifiName").val(data['name']);
    var broadbandDialUp=$('#broadbandDialUp'),
    proto = data["proto"];
	pppoeStateNotice.html("");
	  if(proto == "pppoe"){
        routerChanelItem1.selectCurrent(0);
	      broadbandDialUp.removeClass('hide');
	      $.data(routerChanelItem1,"type",1);
	  }else{
        routerChanelItem1.selectCurrent(1);
	      broadbandDialUp.addClass('hide');
        $.data(routerChanelItem1,"type",2);
	  }
  });
  
    //选择连接方式
    routerChanelItem1.selectNode(function (eleObj){
      var broadbandDialUp=$('#broadbandDialUp'),
      comnInputs=modeChangeSet.find(".comn-input"),
      errTips=modeChangeSet.find(".error-tip");
       comnInputs.removeClass("error focus");
       errTips.hide();
	   pppoeStateNotice.html("");
         if(eleObj.attr('data-val')=='1'){
             formSaveBtnState.resetInit(setNetConnType);
             broadbandDialUp.removeClass('hide');
             $.data(routerChanelItem1,"type",1);
         }else if(eleObj.attr('data-val')==2){
            broadbandDialUp.addClass('hide');
            $.data(routerChanelItem1,"type",2);
         }
    });
    //PPPOE表单验证
    validate(modeChangeSet,{
    	submitBtn:".action-btn",
    	ignore:".hide .comn-input",
    	autoReset:true,
    	submitHandler:function(form){
         //网络类型设置下一步
         modeChangeNextStep(modeChangeSet);
    	}
    });
    //修改联网方式内部方法
    function restart_net_service(conType, requestObj) {
        var apply_xhr = new XHR();
        apply_xhr.get($("#saveWanUrl").val(), requestObj,
            function () {

                var checkfinish = function () {
                    apply_xhr.get($("#saveStatus").val(), null,
                        function (x) {
                            if (x.responseText == 'finish') {
                                if (conType == "pppoe") {
                                    user_waiting = true;
                                    startWatchPPPOE();
                                }
                                else {
                                    formSaveBtnState.resetInit(setNetConnType);
                                    popup.tip("保存成功！");
                                    scrollGuideStep(1); 
                                }
                            } else {
                                window.setTimeout(checkfinish, 1000);
                            }
                        }
                     );
                }

                checkfinish();
            }
        );
    }
    //宽带连接表单成功之后下一步
   function modeChangeNextStep(eleObj){
    var connType=$.data(routerChanelItem1,"type");
    var connTypeRequestObj={};
     //宽带拨号
	 if(connType==1){
      formSaveBtnState.loading(setNetConnType,"拨号中");
      connTypeRequestObj.proto="pppoe";
      disableSelectConnType.show();
      var username = $("#broadbandUser").val();     
      var password = $("#broadbandPass").val();
      connTypeRequestObj.username=username;
      connTypeRequestObj.password = password;
     }else if(connType==2){
      //动态ip
      formSaveBtnState.loading(setNetConnType,"保存");
      connTypeRequestObj.proto = "dhcp";
     }
	 if (connTypeRequestObj.proto != null)
	     restart_net_service( connTypeRequestObj.proto, connTypeRequestObj );
   }
    //WIFI设置相关
    //路由器密码和管理员密码是不是一致
    var passwordSame=$("#passwordSame");
    passwordSame.toggleNode("checkbox","checkboxed",function(that){
       var adminPassContainer=$("#adminPassContainer");
       if(that.hasClass("checkboxed")){
         adminPassContainer.addClass("hide");
       }else if(that.hasClass("checkbox")){
         adminPassContainer.removeClass("hide");
       }
    });
    var guideSetNowSave=$("#guideSetNowSave");
    //WIFI设置表单验证
    validate(setWifiAccount,{
      submitBtn:".save-btn",
      autoReset:true,
      ignore:".hide .comn-input",
      submitHandler:function(){
        //引导流程结束
        guideSuccess(setWifiAccount);
      }
    });
	
    //已经绑定，直接下一步
    $("#bindednext").on("click",function(){
       scrollGuideStep(2);
    });
	
	//循环检测联网状态
   function cycleChackWifi(delay){
    var timer=null;
    if(timer) clearInterval(timer);
    var url="http://wifi.youku.com/luci-static/pcdn/images/login/logo.png?rd=";
    timer=setInterval(function(){
      loadImg();
    },delay);
    function loadImg(){
      var img = new Image();
      img.onload=function(){
        clearInterval(timer);
        timer=null;
        img=null; 
        $("#btnFinishSet").removeClass("disable-btn").addClass("action-btn");
	    $("#btnFinishSet").attr("href","http://wifi.youku.com");
		$("#wifimoderef1").hide();
		$("#wifimoderef2").hide();
		$("#btnFinishSet").html("立刻体验");
      };
      img.onerror=function(){};
      img.src=url+new Date().getTime();
    }
   }
   
  //引导流程结束成功提交
  function guideSuccess(eleObj){
    var submitBtn=$("#guideSetNowSave"),
    guideSuccessCon=$("#guideSuccessCon");
    formSaveBtnState.loading(submitBtn);
    $("#TheWifiName").html($("#wifiName").val());
    var flag = 0;
    if(passwordSame.is(".checkboxed")) flag=1;
    var submitBtn=eleObj.find(".save-btn");
	var connectiontype = $("#connectiontype").val();
	
	var successfunc = function(){
	    var timer=null,delay=10000;
        formSaveBtnState.loading(submitBtn,"已生效，正在重启（"+Math.ceil(delay/1000)+"）秒"); 
        if(timer) clearInterval(timer); 
        timer=setInterval(function(){
           if(delay<=0){
              clearInterval(timer);
              formSaveBtnState.resetInit(submitBtn);
              //弹窗设置成功提示弹窗
              setWifiAccount.find(".comn-form").addClass("hide");
              guideSuccessCon.removeClass("hide");
          }else{
              delay-=1000;
			  var currentSecond=Math.ceil(delay/1000);
              submitBtn.next(".load-btn").html('<span class="loading"></span><span>已生效,正在重启('+currentSecond+')秒</span>');
          }
        },1000);
	}
	
	var successfunconwifi = function(){
	    var timer=null,delay=10000;
        formSaveBtnState.loading(submitBtn,"已生效，正在重启（"+Math.ceil(delay/1000)+"）秒"); 
        if(timer) clearInterval(timer); 
        timer=setInterval(function(){
           if(delay<=0){
              clearInterval(timer);
              formSaveBtnState.resetInit(submitBtn);
              //弹窗设置成功提示弹窗
              setWifiAccount.find(".comn-form").addClass("hide");
			  $("#btnFinishSet").removeClass("action-btn").addClass("disable-btn");
			  $("#btnFinishSet").removeAttr("href");
			  $("#wifimoderef1").show();
			  $("#wifimoderef2").show();
			  $("#btnFinishSet").html("请连接WiFi...");
              guideSuccessCon.removeClass("hide");
              cycleChackWifi(1000);
          }else{
              delay-=1000;
			  var currentSecond=Math.ceil(delay/1000);
              submitBtn.next(".load-btn").html('<span class="loading"></span><span>已生效,正在重启('+currentSecond+')秒</span>');
          }
        },1000);
	}
	
	if (connectiontype == "line") {
      $.ajax({type: "GET",
         url: $("#setWifiInfo").val(),
         cache: false,
         data: {"wifiName":$("#wifiName").val(),
      	        "wifiPassword":$("#wifiPassword").val(),
                "flag":flag,//flag=1 wifi密码和管理密码相同
                 "adminPassword":$("#adminPassword").val()},
         dataType: "json",
         timeout: 10000,
         success: function(data){ 
             successfunc();
         },
         error: function(data){
		   if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}
           formSaveBtnState.resetInit(submitBtn);
           popup.tip("保存失败！",{},"fail");
         }
       });
	 }else{
	   $.ajax({type: "GET",
         url: $("#setWifiInfo").val(),
         cache: false,
         data: {"wifiName":$("#wifiName").val(),
      	        "wifiPassword":$("#wifiPassword").val(),
                "flag":flag,//flag=1 wifi密码和管理密码相同
                "adminPassword":$("#adminPassword").val()},
         dataType: "json",
         timeout: 10000,
         success: function(data){ 
            successfunconwifi();
         },
         error: function(data){ 
		   if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}
           successfunconwifi();
         }
       }); 
	 }
    }
	//跳过
	scrollGuideArea.find('.skip').on('click',function(){
	  var index=$(this).attr("data-index");
	  scrollGuideStep(parseInt(index));
   });
   //上一步
   $("#prevStepWiFi").on("click",function(){
     scrollGuideStep(0); 
   });
   //引导流程转移
   function scrollGuideStep(index,callback){
	  if(!index || isNaN(index)) index=0;
          if(index=="1"){
	     $("div.second-index").addClass("current");
	  }else if(index=="2"){
	  	 $("div.third-index").addClass("current");
	  }
	  var marginLeft=-index*990+"px";
	  scrollGuideArea.animate({"margin-left":marginLeft},400,"linear",function(){
		 $.isFunction(callback) && callback();
	 });
   }
    if(!!window.ActiveXObject || "ActiveXObject" in window){
    window.onbeforeunload=function(){
     $("input").blur();
    }
  }
});
