$(document.body).ready(function(){
  var ckClass="checkbox",
  ckClassed="checkboxed",
  rdClass="select-open",
  rdClassed="select-close";
  $('#isMergeChbox').toggleNode(ckClass,ckClassed);
  $('#net2d4G').toggleNode(rdClass,rdClassed);
  $('#hideNetForFind1').toggleNode(ckClass,ckClassed);
  $('#hideNetForFind2').toggleNode(ckClass,ckClassed);
  $('#netTo5G').toggleNode(rdClass,rdClassed);
  $('#visitorChoice').toggleNode(rdClass,rdClassed);
  $('#routerChanelItem1').selectNode();
  $('#routerChanelItem2').selectNode();
  $('#wifiStrengthList').selectNode();
  
  var connectiontype = $("#connectiontype").val();
  
  function disableGuestMode(){
      $("#wifiStrengthdisable").show();
	  $("#guestdisable").show();
	  $("#saveBtnDisable").show();
	  
	  $("#wifiStrengthList").hide();
	  $("#guestenable").hide();
	  $("#saveBtnAboutGuest").hide();
  }
  
  function enableGuestMode(){
      $("#wifiStrengthdisable").hide();
	  $("#guestdisable").hide();
	  $("#saveBtnDisable").hide();

	  $("#wifiStrengthList").show();
	  $("#guestenable").show();
	  $("#saveBtnAboutGuest").show();
  }
  
  var isExistPublicnet = true;
  var  initWifiBaseSet={},initWifiModeSet={};
    $.ajaxSetup({
　　　  //请求失败遇到异常触发
　　　  error: function (data) { if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}}
　  });

  $('#saveBtnAboutGuest').on('click',function(){
     var _this=$(this);
	 var submitBtn=$("#saveBtnAboutGuest");
     var currentVal = $('#wifiStrengthList').find("li.current").attr("data-val");
     var wifiMode = "1";
     wifiMode=currentVal;
     var guestmode = "false";
     var changeState=true;
     if ($('#visitorChoice').hasClass(rdClass))
     {
        guestmode = "true";
     }
     if(initWifiBaseSet.startGuest != guestmode || initWifiBaseSet.wifiStrength != wifiMode){
	   if ( !isExistPublicnet && initWifiBaseSet.startGuest != guestmode) {
	       formSaveBtnState.resetInit(submitBtn);
	       popup.simpleBox({
           "content":"初始设置访客模式，需要重启路由，您确定要重启路由吗？",
           "okBtnClick":function(layer,overlay){
                popup.close(layer);
                $.getJSON($("#guestseturl").val(),
					 {guestMode:guestmode, strengMode:wifiMode},
                     function(data){ var status = data['status'];
                     popup.reConnect(5000,"初始设置访客模式操作生效，重启路由，等待设备重启...");
                });
            }
          });
	   
	   }else{
	       
	       formSaveBtnState.loading(submitBtn);
		   $.ajax({type: "GET",
			 url: $("#guestseturl").val(),
			 cache: false,
			 data: {guestMode:guestmode, strengMode:wifiMode},
			 dataType: "json",
			 timeout: 30000,
			 success: function(data){
			 if(guestmode == "true" && data && data['guestSSID'])
			 {
				 $('#guestreference').html("已开启，客人可以通过\"" + data['guestSSID'] + "\"WiFi专线上网，无需密码");
			 }else{
				 $('#guestreference').html("开启后，可以为客人提供专属WiFi上网，不必透露WiFi密码");
			 }
				formSaveBtnState.resetInit(submitBtn); 
				 popup.tip("保存成功！");
				  initWifiBaseSet.startGuest=guestmode;
				  initWifiBaseSet.wifiStrength=wifiMode;
			   },
			   error: function(data){
				  if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}
				  formSaveBtnState.resetInit(submitBtn);
				  popup.tip("保存失败！",{},"fail");
				   initWifiBaseSet.startGuest=guestmode;
				   initWifiBaseSet.wifiStrength=wifiMode;
			   }
		   });
	   }
     }else{
       popup.simpleBox({
          content:'您未做任何修改，无需保存~',
          hideCancel:true,
          okBtnName:"我知道了",
          okBtnClick:function(layer,overlay){
            popup.close(layer,overlay);
          }
        });
    } 
  });
  //2.4G网络模式设置
  var wifiModeSetForm=$("#wifiModeSetForm");
  validate(wifiModeSetForm,{
    submitHandler:function(){
      wifiModeSet();
    }
  });
  //2.4G网络模式设置表单验证成功回调
  function wifiModeSet(){
   var openflag = "false";
   if ($('#net2d4G').hasClass(rdClass)){
         openflag = "true";
   }
   var username = $("#routerName1").val();
   var userpwd = $("#routerPassword1").val();
   var channal = $('#routerChanel1').text();
   if (channal == "自动"){ 
        channal = "0";
   }
   var hidden = "true";
   if ($('#hideNetForFind1').hasClass(ckClass)){
      hidden = "false";
    }
   if(initWifiModeSet.open!=openflag || initWifiModeSet.username!=username || initWifiModeSet.pwd!=userpwd || initWifiModeSet.channel!=channal || initWifiModeSet.hidden!=hidden){
     if (openflag == "true"){
		 popup.simpleBox({
		 "content":"您确定修改WiFi设置吗？修改后，WiFi将会重启，10秒后网络恢复正常。",
		 "okBtnClick":function(layer,overlay){
		   popup.close(layer,overlay);
			 restartWifi();
		  }
		 });
	 }else{
	     popup.simpleBox({
		 "content":"您确定关闭WiFi吗？关闭它后您将只能使用有线网络。",
		 "okBtnClick":function(layer,overlay){
		   popup.close(layer,overlay);
			 restartWifi();
		  }
		 });
	 }
   }else{
     popup.simpleBox({
          content:'您未做任何修改，无需保存~',
          hideCancel:true,
          okBtnName:"我知道了",
          okBtnClick:function(layer,overlay){
            popup.close(layer,overlay);
        }
    });
   }
   function restartWifi(){
     var saveBtnAboutWifi=$('#saveBtnAboutWifi');
	 if (openflag == "false"){
	    formSaveBtnState.loading(saveBtnAboutWifi);   
	 }
	 var pwdref = "";
	 if(initWifiModeSet.pwd != userpwd){
		pwdref = '<p class="notice" style="color:#999;">注意：管理员密码未随WiFi密码改变。</p>';
	 }
	
     $.ajax({type: "GET",
         url: $("#wifiseturl").val(),
         cache: false,
         data: {status:openflag,name:username,pwd:userpwd,signalpath:channal,hidden:hidden},
         dataType: "json",
         timeout: 30000,
         success: function(data){
		   if (data && data['status']!="false"){
			   if (openflag == "true"){		 
				   var timer=null,delay=10000;
				   formSaveBtnState.loading(saveBtnAboutWifi,"已生效，正在重启（"+Math.ceil(delay/1000)+"）秒");
				   if(timer) clearInterval(timer);
				   timer=setInterval(function(){
					if(delay<=0){
						clearInterval(timer);
						formSaveBtnState.resetInit(saveBtnAboutWifi);
						enableGuestMode();
						var userssid = username;
						if(userssid.length > 12)
					    {
						    userssid = userssid.substr(0,12) + "...";			    
					    }
						 //弹窗设置成功提示弹窗
						popup.simpleBox({
						  content:'<div class="wifi-set-complete">'+
						  '<p class="info">WiFi名称和密码设置成功！名称为：<span class="wifi-name">'+userssid+'</span></p>'+
						  '<p class="notice">为安全起见，您的无线设备需要重新搜索本WiFi信号并连接，才能继续使用。</p>'+
						  pwdref + '</div>',
						  hideCancel:true,
						  okBtnName:"我知道了",
						  okBtnClick:function(layer,overlay){
							popup.close(layer,overlay);
						  }
						});
					}else{
						  delay-=1000;
						  saveBtnAboutWifi.next(".load-btn").html('<span class="loading"></span><span>已生效,正在重启('+Math.ceil(delay/1000)+')秒</span>');
					}
				  },1000);
			  }else{ 
				  disableGuestMode();
				  formSaveBtnState.resetInit(saveBtnAboutWifi);
				   //弹窗设置成功提示弹窗
				   popup.simpleBox({
					  content:'<div class="wifi-set-complete">'+'<p class="info">WiFi关闭成功！</p>'+'</div>',
					  hideCancel:true,
					  okBtnName:"我知道了",
					  okBtnClick:function(layer,overlay){
						  popup.close(layer,overlay);
					  }
				  });
			  }
			  initWifiModeSet.open=openflag;
			  initWifiModeSet.username=username;
			  initWifiModeSet.pwd=userpwd;
			  initWifiModeSet.channel=channal;
			  initWifiModeSet.hidden=hidden;
		  }else{
		      formSaveBtnState.resetInit(saveBtnAboutWifi);
		      popup.tip("保存失败！",{},"fail");
		  }
        },
        error: function(data){
		  if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}
          formSaveBtnState.resetInit(saveBtnAboutWifi);
		  if (connectiontype == "wifi" && openflag == "false"){
		      disableGuestMode();
			  formSaveBtnState.resetInit(saveBtnAboutWifi);
			   //弹窗设置成功提示弹窗
			   popup.simpleBox({
				  content:'<div class="wifi-set-complete">'+'<p class="info">WiFi关闭成功！</p>'+'</div>',
				  hideCancel:true,
				  okBtnName:"我知道了",
				  okBtnClick:function(layer,overlay){
					  popup.close(layer,overlay);
				  }
			  });
		  }else{
		      popup.tip("保存失败！",{},"fail");
		  } 
        }
     });
   }
  }
  //
  $.getJSON($("#wifigeturl").val(), function(data){
        var status = data['status'];
        if (status == "true")
        {
           $("#net2d4G").removeClass('select-close').addClass('select-open');
           initWifiModeSet.open="true";
		   enableGuestMode();
        } else {
           $("#net2d4G").removeClass('select-open').addClass('select-close');
           initWifiModeSet.open="false";
		   disableGuestMode();
        }
        initWifiModeSet.username=data['name'];
        initWifiModeSet.pwd=data['pwd'];
        $("#routerName1").val(data['name']);
        $("#routerPassword1").val(data['pwd']);

        var channal = data['signalpath'];
        initWifiModeSet.channel=channal;
        if (channal == 0)
        {
           $('#routerChanel1').html('自动<i class="icon-arrow1"></i>');
        }else
        {
           $('#routerChanel1').html(channal+'<i class="icon-arrow1"></i>');
        }
       
        var hidden = data['hidden'];
        initWifiModeSet.hidden=hidden;
        if (hidden == "false")
        {
           $('#hideNetForFind1').removeClass('checkboxed').addClass('checkbox');
          
        } else {
           $('#hideNetForFind1').removeClass('checkbox').addClass('checkboxed');
        }

        var strengthmode = data['strengthmode'];
        var wifiStrengthItems=$("#wifiStrengthList").find("li");
        wifiStrengthItems.removeClass("current");
        $("#wifiStrengthList").find("[data-val="+strengthmode+"]").addClass("current");
        if (strengthmode == "0")
        {
           $('#wifiStrengthtext').text("绿色模式");
           $('#strengthicon').removeClass('signal-default').removeClass('signal-strong').addClass('signal-weak');

        }else if (strengthmode == "2"){
           $('#wifiStrengthtext').text("穿墙模式");
           $('#strengthicon').removeClass('signal-default').removeClass('signal-weak').addClass('signal-strong');
        }else{
           $('#wifiStrengthtext').text("标准模式");
           $('#strengthicon').removeClass('signal-strong').removeClass('signal-weak').addClass('signal-default');
        }
        initWifiBaseSet.wifiStrength=strengthmode;
        var guidmode = data['guestMode'];
		isExistPublicnet = data['publicnetwork'];
        if (guidmode == "true")
        {
           $('#visitorChoice').removeClass('select-close').addClass('select-open');
		       $('#guestreference').html("已开启，客人可以通过\"" + data['guestSSID'] + "\"WiFi专线上网，无需密码");
		        initWifiBaseSet.startGuest="true";
        } else {
           $('#visitorChoice').removeClass('select-open').addClass('select-close');
		       $('#guestreference').html("开启后，可以为客人提供专属WiFi上网，不必透露WiFi密码");
           initWifiBaseSet.startGuest="false";
        }
  });
   
});
