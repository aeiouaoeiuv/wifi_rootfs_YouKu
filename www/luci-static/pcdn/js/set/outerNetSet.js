var g_wan_info;
jQuery(document.body).ready(function(){
     var pppoeStateNotice=$("#pppoeStateNotice");
     var saveSetConnMode=$("#saveSetConnMode");
     var pppoeConnStatus=["正在连接互联网…","已连接互联网（宽带拨号）","未连接互联网，点击\"保存\"按钮重新连接"];
     var pppoeTimer=null;
     var pppoeRequestAjax=null;
     var pppoeConnDelay=1000;
     var disConnectBtn=$("#disConnectBtn");
     var currentPPPOEState=null;
	 var disableSelectConnType=$("#disableSelectConnType");
	 var pppoetimeoutflag=0;
	 var contipflag=false;

	$.ajaxSetup({
　　　  //请求失败遇到异常触发
　　　  error: function (data) { if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}}
　  });

	var user_waiting = false;

     //开始不断获取pppoe的状态和结束拨号
     function startWatchPPPOE(){
      clearInterval(pppoeTimer);
      pppoeTimer=setInterval(function(){watchWideBandState();},pppoeConnDelay);
     }
     function stopWatchPPPOE(){
      clearInterval(pppoeTimer);
      pppoeTimer=null;
      pppoeRequestAjax && pppoeRequestAjax.abort(); 　
      formSaveBtnState.resetInit(saveSetConnMode);
     }
      //宽带类型选择
     $('#connModeItems').selectNode(function(eleObj){
	    var wideBand=$('#wideBand'),
	    staticIP=$('#staticIP'),
	    toPanelId=eleObj.attr('data-to');
        disConnectBtn.hide();
		pppoeStateNotice.html("");
	    if(toPanelId=='wideBand'){
	      wideBand.show();
	      staticIP.hide();
          formSaveBtnState.resetInit(saveSetConnMode);
	    }else if(toPanelId=='staticIP'){
	      staticIP.show();
	      wideBand.hide();
	    }else{
	      staticIP.hide();
	      wideBand.hide();
	    }
	  });
    //断开拨号
    disConnectBtn.on("click",function(){
      disableSelectConnType.hide();
      $(this).hide();
      user_waiting = false;
      stopWatchPPPOE();
	  disConnectBtn.hide();
      $.getJSON($("#pppoeStopUrl").val(),{},function(){
        if(currentPPPOEState==2){
		   contipflag=false;
           startWatchPPPOE();
		   pppoetimeoutflag=0;
        }else {
         pppoeStateNotice.html(pppoeConnStatus[2]);
        } 
      });
    });

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
         formSaveBtnState.loading(saveSetConnMode,"拨号中");
		 disConnectBtn.hide();
		 pppoetimeoutflag++;
		 if(pppoetimeoutflag >15){
			stopWatchPPPOE();
			disableSelectConnType.hide();
			pppoeStateNotice.html("拨号超时，请重新连接");
			popup.simpleBox({
			  content:'拨号超时，请重新连接！',
			  hideCancel:true,
			  okBtnName:"确定",
			  okBtnClick:function(layer,overlay){popup.close(layer,overlay);}
			});
		 }
        }else if(data.status=="2"){
         disableSelectConnType.hide();
         pppoeStateNotice.html(pppoeConnStatus[1]);
         disConnectBtn.show();
         currentPPPOEState=2;
		 pppoetimeoutflag=0;
		 stopWatchPPPOE();
		 if(contipflag){
		     popup.tip("设置成功！");
			 contipflag=false;
		 }
        }else if(data.status=="3"){
         disableSelectConnType.hide();
         pppoeStateNotice.html("返回码:"+data.errcode+"&nbsp;&nbsp;&nbsp;描述:"+data.errmsg);
		 popup.simpleBox({
          content:'账号或密码错误，拨号失败！',
          hideCancel:true,
          okBtnName:"确定",
          okBtnClick:function(layer,overlay){
            popup.close(layer,overlay);
			}
		});
		 disConnectBtn.hide();
		 stopWatchPPPOE();
        }else if(data.status=="4"){
	        if( user_waiting == false )
		      {
                 disableSelectConnType.hide();
		         pppoeStateNotice.html(pppoeConnStatus[2]);
		         disConnectBtn.hide();
				 stopWatchPPPOE(); 
		      }
		    else
		      {//用户等待中
                disableSelectConnType.show();
		      	pppoeStateNotice.html(pppoeConnStatus[0]);
         		formSaveBtnState.loading(saveSetConnMode,"拨号中");
				disConnectBtn.hide();
				pppoetimeoutflag++;
				 if(pppoetimeoutflag >15){
					stopWatchPPPOE();
					disableSelectConnType.hide();
					pppoeStateNotice.html("拨号超时，请重新连接");
					popup.simpleBox({
					  content:'拨号超时，请重新连接！',
					  hideCancel:true,
					  okBtnName:"确定",
					  okBtnClick:function(layer,overlay){popup.close(layer,overlay);}
					});
				 }
		      }
        }   
      });  
    }
   //初始化联网方式
   $.getJSON($("#wanInfo").val(), function(data){ 
       g_wan_info = data;
       var wideBand=$('#wideBand'),
       modeSelect=$('#connModeItems'),
       currentVal=modeSelect.find('.current-val'),
	   staticIP=$('#staticIP');
	   modeSelect.find('li').removeClass('current');
	   
	   if(data.username && data.username != ""){
	     $('#netUser').attr('value', data.username);
		 $('#netUser').removeClass("gray33");
	     $('#netPass').parent().prev(".pw-holder").hide();
	     $('#netPass').attr('value', data.password);
	   }
	   $('#ipaddr').attr('value', data.ipaddr);
	   $('#netCKMask').attr('value', data.netmask);
	   $('#netGateWay').attr('value', data.gateway);
	   
       if(data.proto=='pppoe'){
	      wideBand.show();
	      staticIP.hide();
          var pppoePass=$('#netPass');
          pppoePass.parent().prev(".pw-holder").hide();
	      currentVal.text('宽带拨号');
	      modeSelect.find('[data-to="wideBand"]').addClass('current');
		  contipflag=false;
          startWatchPPPOE();
		  pppoetimeoutflag=0;
	    }else if(data.proto=='static'){
	      staticIP.show();
	      wideBand.hide();
	      currentVal.text('静态IP');
	      modeSelect.find('[data-to="staticIP"]').addClass('current');
		  pppoeStateNotice.html("已连接互联网（静态IP）");
	    }else{
	      staticIP.hide();
	      wideBand.hide();
	      currentVal.text('动态IP');
	      modeSelect.find('[data-to="dynamicIP"]').addClass('current');
		  pppoeStateNotice.html("已连接互联网（动态IP）");
	    }
		
		if($("#connectflag").val() == "0"){
			pppoeStateNotice.html(pppoeConnStatus[2]);
		}
	    $("#curRouterMac").text(data.localmac);
	    $("#curMac").text(data.remotemac);
		$('#WancurMac').text($("#curRouterMac").text());
		});
    //联网方式表单验证
     validate($("#choiceConnType"),{
       ignore:":hidden .comn-input",
       autoReset:true,
       submitHandler:function(){
         submitConnType();
     }
     });

     function restart_net_service(conType, requestObj) {
         var apply_xhr = new XHR();
         apply_xhr.get($("#saveConUrl").val(), requestObj,
             function () {

                 var checkfinish = function () {
                     apply_xhr.get($("#saveStatus").val(), null,
                         function (x) {
                             if (x.responseText == 'finish') {
                                 if (conType == "pppoe") {
                                     user_waiting = true;
									 contipflag=true;
                                     startWatchPPPOE();
									 pppoetimeoutflag=0;
                                 }
                                 else {
                                     formSaveBtnState.resetInit(saveSetConnMode);
									 var reftip = "已连接互联网（动态IP）";
									 if(conType == "static"){
										 reftip = "已连接互联网（静态IP）";
									 }
									 pppoeStateNotice.html(reftip);
                                     popup.tip("保存成功！");
                                 }
                             } else {
                                 window.setTimeout(checkfinish, 1000);
                             }
                         }
                      );
                 };
                 checkfinish();
             }
         );
     }
  //提交联网方式设置
  function submitConnType(){
      var currentLi = $('#connModeItems').find('li.current');
      var requestObj = {};
     if(currentLi.attr("data-to")=="wideBand"){
      formSaveBtnState.loading(saveSetConnMode,"拨号中");
      disableSelectConnType.show();
       requestObj.proto = "pppoe";
       requestObj.username = $("#netUser").val();
       requestObj.password = $("#netPass").val();
     }else if(currentLi.attr("data-to")=="dynamicIP"){
        formSaveBtnState.loading(saveSetConnMode,"保存");
        requestObj.proto = 'dhcp';
     }else if(currentLi.attr("data-to")=="staticIP"){
        formSaveBtnState.loading(saveSetConnMode,"保存");
        requestObj.proto = 'static';
        requestObj.ipaddr = $("#ipaddr").val();
        requestObj.netmask = $("#netCKMask").val();
        requestObj.gateway = $("#netGateWay").val();
     }
	 
	 var maccurrentLi=$("#WanMacAddress").find(".current");
     if(maccurrentLi.attr("data-to")=="cloneMac"){
        requestObj.mac=$("#WancurMac").text();
     }else if(maccurrentLi.attr("data-to")=="inputMac"){
        requestObj.mac=$("#WaninputMacVal").val();
     }else if(maccurrentLi.attr("data-to")=="noCloneMac"){
	    requestObj.mac="notclone";
	 }else {
    	requestObj.mac="default";
     }
	 
	if(requestObj.proto != null)
        restart_net_service(requestObj.proto, requestObj);
  }
    
  $('#MacAddress').selectNode(function(eleObj){
    var toPanelId=eleObj.attr('data-to');
    var changePanels=$('div[data-aboutmac]');
    //alert(toPanelId);
    changePanels.hide();
    //恢复出厂mac地址
    if(toPanelId=='resetDefaultMac'){
    }else if(toPanelId=='cloneMac'){
    	//克隆MAC地址
    }else if(toPanelId=='inputMac'){
     //手动输入mac地址	
    }
    $('#'+toPanelId).show();
  });
  
  $('#WanMacAddress').selectNode(function(eleObj){
    var toPanelId=eleObj.attr('data-to');
    var changePanels=$('div[data-aboutmac]');
    changePanels.hide();
    //恢复出厂mac地址
    if(toPanelId=='resetDefaultMac'){
	    $('#WancloneMac').hide();
	    $('#WaninputMac').hide();
    }else if(toPanelId=='cloneMac'){
    	//克隆MAC地址
		$('#WancurMac').text($("#curMac").text());	
		$('#WancurMacLabel').html("设备MAC地址");	
        $('#WancloneMac').show();		
		$('#WaninputMac').hide();
    }else if(toPanelId=='inputMac'){
     //手动输入mac地址
	 $('#WancloneMac').hide();	
     $('#WaninputMac').val("");	 
	 $('#WaninputMac').show();
    }else if(toPanelId=='noCloneMac'){
     //不克隆mac地址
	 $('#WancurMac').text($("#curRouterMac").text());
	 $('#WancurMacLabel').html("当前MAC地址");
	 $('#WancloneMac').show();
	 $('#WaninputMac').hide();
    }
    $('#'+toPanelId).show();
  });
    
 
  //验证mac地址表单
  validate($("#macSetForm"),{
    ignore:":hidden .comn-input",
    autoReset:true,
    submitHandler:function(){
     submitMacSet();
    }
  });
  //提交Mac 地址设置
  function submitMacSet(){
    var currentLi=$("#MacAddress").find(".current");
    var obj={};
    var submitBtn=$("#saveMacAddress");
    formSaveBtnState.loading(submitBtn);
    //if(currentLi.attr("data-to")=="resetDefaultMac"){
    //}
    if(currentLi.attr("data-to")=="cloneMac"){
        obj.mac=$("#curMac").html();
    }else if(currentLi.attr("data-to")=="inputMac"){
        obj.mac=$("#inputMacVal").val();
    }else{
    		obj.mac="default";
    }
    $.getJSON( $("#saveMacUrl").val(),obj,function(data){
       formSaveBtnState.resetInit(submitBtn);
       popup.tip("保存成功！");
    });
  }
});
