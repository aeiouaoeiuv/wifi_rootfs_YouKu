$(document.body).ready(function(){
	
	 $('#p2pAppItems').selectNode(function(li){
  	$.getJSON($("#setaccuploadurl").val(),
             {uploadmode:li.attr("data-val")},
             function(data){ var status = data['code']; });
	});
	
  var speed=300,
  ease='swing',
  centerLeft=103,
  centerTop=96,
  featuresPanel=$('#routerFeaturesPanel');
  var connectstatus = $('#connectflag').val();
  var isExistPublicnet = true;
  var dashboardclickenable = true;
  var lighttime="23:00-08:00";
  
  function disableGuestMode(){
      $("#wifiStrengthdisable").show();
	  $("#guestdisable").show(); 
	  $("#wifiStrengthList").hide();
	  $("#guestenable").hide();
  }
  
  function enableGuestMode(){
      $("#wifiStrengthdisable").hide();
	  $("#guestdisable").hide();
	  $("#wifiStrengthList").show();
	  $("#guestenable").show();
  }
  
  $.ajaxSetup({
　　　//请求失败遇到异常触发
　　　error: function (data) { 
        if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}
		dashboardclickenable = true;
      }
　});
  
  function selectWifiIcon(status)
  {
      var wifiHasClass='wf-green wf-default wf-strong wf-close';
      var wifiStateBtn=$('#wifiBtn');
	  wifiStateBtn.removeClass(wifiHasClass);
	  wifiStateBtn.addClass(status);
  };
    var lightStatus=$("#lightStatus");
  //router dashboard
  $.getJSON($("#dashboardurl").val(), function(data){
        var wifisignal = data['wifiSignal'];
        var wifiHasClass='wf-green wf-default wf-strong wf-close';
        var wifiStateBtn=$('#wifiBtn');
        var visitorBtn=$('#visitorBtn');
        var lightStateBtn=$('#lightBtn');
        wifiStateBtn.removeClass(wifiHasClass);
        if (wifisignal == '1')
        {
            enableGuestMode();
			$("#WifiMode").removeClass('select-close').addClass('select-open');
            var wifimode = data['signalIntensity'];
            if (wifimode == "0")
            {    
                $("#wifigreenIcon").show();
                $("#wifibaseIcon").hide();
                $("#wifistrongIcon").hide();
                wifiStateBtn.addClass("wf-green");
            }else if (wifimode == "1"){
                $("#wifigreenIcon").hide();
                $("#wifibaseIcon").show();
                $("#wifistrongIcon").hide();
                wifiStateBtn.addClass("wf-default");
            }else{
                $("#wifigreenIcon").hide();
                $("#wifibaseIcon").hide();
                $("#wifistrongIcon").show();
                wifiStateBtn.addClass("wf-strong");
            }
			
			var guestMode = data['guessMode'];
			if (guestMode == 'true')
			{
				visitorBtn.removeClass('user-close').addClass('user-open');
				$("#guidMode").removeClass('select-close').addClass('select-open');
			}else{
				visitorBtn.removeClass('user-open').addClass('user-close');
				$("#guidMode").removeClass('select-open').addClass('select-close');
			}

        }else{
		    disableGuestMode();
            wifiStateBtn.addClass("wf-close");
            $("#WifiMode").removeClass('select-open').addClass('select-close');
			visitorBtn.removeClass('user-open').addClass('user-close');
        }
        
		$("#dev_count").html(data['deviceCount']);
        isExistPublicnet = data['publicnetwork'];
        var ledmode = data['lightMode'];
		var lightsetForm = $("#lightsetForm");
		
		lighttime=data['lightTime'];
        if (ledmode == '1'){
            lightStateBtn.removeClass('light-open').addClass('light-close');
            $("#LEDBase").removeClass('current');
            $("#LEDNight").addClass('current');
			lightStatus.html(lighttime + "路由宝指示灯关闭"); 
        }else{
            lightStateBtn.removeClass('light-close').addClass('light-open');
            $("#LEDBase").addClass('current');
            $("#LEDNight").removeClass('current');
            lightStatus.html("路由宝指示灯全天开启");
        }
  });
  
  function getCreditsInfo(){
	$("#creditreference").html("正准备赚取优金币，请稍候");
	$("#credits_today").html("0");
    $("#credits_lastday").html("0");
    $("#total_credits").html("0");
    $("#credits_est").html("今日预计还能再收获0个优金币");
	$("#bindUserName").html('');
	$("#binddisconnect").hide();
	$("#binduserinfo").show(); 
	var pid = $('#routerpid').val();
	
	$.ajax({type: "GET",
	 url: "http://pcdnapi.youku.com/pcdn/credit/summary?callback=?",
	 cache: false,
	 data: {pid:pid},
	 dataType: "json",
	 timeout: 10000,
	 success: function(data){
		 var retcode = data['code'];
		 if(retcode == "0" || retcode == "1"){
			 $("#binddisconnect").hide();
			 $("#binduserinfo").show(); 
			 if (data["data"]['total_credits'] != "0"){
				 $("#creditreference").html("路由宝正在赚取优金币");
				 $("#credits_today").html(data["data"]['credits_today']);
				 $("#credits_lastday").html(data["data"]['credits_lastday']);
				 $("#total_credits").html(data["data"]['total_credits']);
				 var est = Number(data["data"]['credits_est'])-Number(data["data"]['credits_today']);
				 $("#credits_est").html("今日预计还能再收获" + String(est) + "个优金币");
			 }
			 
			 var username = $("#youkuuser").html();
			 $("#bindUserName").html('');
			 $("#getyougold").show(); 
			 $("#manageyougold").hide();
			 if ($.trim(username) != "") {
				 if(username != "绑定优酷账号"){
					
					if(username.length > 6)
					{
						username = username.substr(0,6) + "...";			    
					}
					$("#bindUserName").html('已绑定帐号：<span>' + username + '</span><span class="pos-move">以上优金币已放入该账户</span>');
					$("#manageyougold").show(); 
					$("#getyougold").hide();
				 }else{
					$("#bindUserName").html('未绑定优酷账号，以上优金币还没有领取');
					$("#getyougold").show(); 
					$("#manageyougold").hide();
				 }	
			}	 
            getaccuploadmode();			
		 }else if(retcode == "11"){
		    $("#creditreference").html("正准备赚取优金币，请稍候");
			$("#binddisconnect").hide();
	        $("#binduserinfo").show(); 
		 }else{ 
			 $("#discon_ref").html("优金币数据获取失败");
			 $("#discon_detail").html("请检查网络连接是否正常或重新刷新页面");
			 $("#binduserinfo").hide();
			 $("#binddisconnect").show();	
             connectstatus = "0";		 
		 }
	   },
	   error: function(data){
		  if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}
		  $("#discon_ref").html("优金币数据获取失败");
		  $("#discon_detail").html("请检查网络连接是否正常或重新刷新页面");
		  $("#binduserinfo").hide();
		  $("#binddisconnect").show();	
          connectstatus = "0";		  
	   }
   });
  }
  
  function getaccuploadmode(){
      $.getJSON($("#getaccmodeurl").val(), 
	 function(data){
         var uploadmode = data['uploadmode'];
         var p2puploadmode=$("#p2puploadmode");
         var liAll=$("#p2pAppItems").find("li");
         var currentClass="current";
         liAll.removeClass(currentClass);
         if( uploadmode == "3" ){
              p2puploadmode.html('激进<i class="icon-arrow1"></i>');
              liAll.eq(2).addClass(currentClass);
         }else if( uploadmode == "2" ){
              p2puploadmode.html('平衡<i class="icon-arrow1"></i>');
              liAll.eq(1).addClass(currentClass);
         }else{
              p2puploadmode.html('保守<i class="icon-arrow1"></i>');
              liAll.eq(0).addClass(currentClass);
         }      	
     });
  }
  
  if(connectstatus == "0"){
    $("#discon_ref").html("已断开外网，暂时无法继续赚优金币");
    $("#discon_detail").html("请通过连网设置连接外网");
    $("#binduserinfo").hide();
	$("#binddisconnect").show();
	$("#netConnect").hide();
    $("#netUnConnect").show();
    $("#wanset").show();
  }else{
    $("#netConnect").show();
    $("#netUnConnect").hide();
    $("#wanset").hide();
	$("#binddisconnect").hide();
	$("#binduserinfo").show();
	getCreditsInfo();
  };
  
  //打开面板
  $('#manageBtns').find('.btn').on('click',function(){
    var that=$(this);
    that.animate({"left":centerLeft+"px","top":centerTop+"px"},speed,ease,function(){
      featuresPanel.animate({"opacity":0},speed,ease,function(){
          $(this).hide();
          $('#'+that.attr('data-panel')).show().css('opacity',1);
      });
    });
  });
  //关闭面板
  $('span.close-btn').on('click',function(){
    var that=$(this),
    resetBtn=$('#'+that.attr('data-resetBtn')),
    pos=that.attr('data-pos'),
    arrPos=pos.split('|'),
    closePanel=$('#'+that.attr('data-panel'));
    closePanel.animate({"opacity":0},speed,ease,function(){
      $(this).hide();
      featuresPanel.show().css('opacity',1);
      resetBtn.animate({'left':arrPos[0]+'px','top':arrPos[1]+'px'},speed,ease);
    });
  });
  //wifi模式hover效果
  $("#wifiManagePanel").find("li").on("mouseenter",function(){
    $(this).addClass("hover");
  }).on("mouseleave",function(){
    $(this).removeClass("hover");
  });
  
  //切换按钮
  $('#WifiMode').on('click',function(){
    if(dashboardclickenable){
	    dashboardclickenable = false;
		var _this=$(this);
		if(_this.hasClass('select-open')){
		  _this.removeClass('select-open').addClass('select-close');
		  selectWifiIcon("wf-close");
		  disableGuestMode();
		  $.getJSON($("#setwifiurl").val(),
				 {wifistatus:"0",
				  txpstatus:"none"},
				 function(data){ var status = data['status']; popup.tip("保存成功！");dashboardclickenable = true;});
		}else if(_this.hasClass('select-close')){
			_this.removeClass('select-close').addClass('select-open');
			enableGuestMode();
			$.getJSON($("#setwifiurl").val(),
			{wifistatus:"1",
			 txpstatus:"none"},
			function(data){ 
			    popup.tip("保存成功！");
				dashboardclickenable = true;
				var status = data['status']; 
				if( status && status == "true"){
					var wifimode = data['signalIntensity'];
					if (wifimode == "0")
					{    
						selectWifiIcon("wf-green");
					}else if (wifimode == "1"){
						selectWifiIcon("wf-default");
					}else{
						selectWifiIcon("wf-strong");
					}			
				}
			});
		}
    }	
  });

  $('#guidMode').on('click',function(){
    if(dashboardclickenable){
	    dashboardclickenable = false;
		var _this=$(this);
		var visitorBtn=$('#visitorBtn');
		if(_this.hasClass('select-open')){
		  _this.removeClass('select-open').addClass('select-close');
		  visitorBtn.removeClass('user-open').addClass('user-close');
		  $.getJSON($("#guestmodeurl").val(),
				 {guessMode:"0"},
				 function(data){ var status = data['status']; popup.tip("保存成功！"); dashboardclickenable = true;});
		}else if(_this.hasClass('select-close')){
		  _this.removeClass('select-close').addClass('select-open');
		  visitorBtn.removeClass('user-close').addClass('user-open');
		  $.getJSON($("#guestmodeurl").val(),
				 {guessMode:"1"},
				 function(data){ var status = data['status']; popup.tip("保存成功！"); dashboardclickenable = true;});
		}
	}
  });

  $("#wifigreenMode").on('click',function(){
    if(dashboardclickenable){
	    dashboardclickenable = false;
		$("#wifigreenIcon").show();
		$("#wifibaseIcon").hide();
		$("#wifistrongIcon").hide();
		$.getJSON($("#setwifiurl").val(),
				 {wifistatus:"none",
				  txpstatus:"0"},
				 function(data){ 
				    popup.tip("保存成功！");
					dashboardclickenable = true;
					var status = data['status']; 
					if($('#WifiMode').hasClass('select-close')){
						selectWifiIcon("wf-close");
					}else{
						selectWifiIcon("wf-green");
					} 
				});
	}
  });  

  $("#wifibaseMode").on('click',function(){
    if(dashboardclickenable){
	    dashboardclickenable = false;
		$("#wifigreenIcon").hide();
		$("#wifibaseIcon").show();
		$("#wifistrongIcon").hide();
		$.getJSON($("#setwifiurl").val(),
				 {wifistatus:"none",
				  txpstatus:"1"},
				 function(data){ 
				    popup.tip("保存成功！");
					dashboardclickenable = true;
					var status = data['status']; 
					if($('#WifiMode').hasClass('select-close')){
						selectWifiIcon("wf-close");
					}else{
						selectWifiIcon("wf-default");
					}
				 });
	}
  });  

  $("#wifistrongMode").on('click',function(){
    if(dashboardclickenable){
	    dashboardclickenable = false;
		$("#wifigreenIcon").hide();
		$("#wifibaseIcon").hide();
		$("#wifistrongIcon").show();
		$.getJSON($("#setwifiurl").val(),
				 {wifistatus:"none",
				  txpstatus:"2"},
				 function(data){
				    popup.tip("保存成功！");
					dashboardclickenable = true;
					var status = data['status']; 
					if($('#WifiMode').hasClass('select-close')){
						selectWifiIcon("wf-close");
					}else{
						selectWifiIcon("wf-strong");
					} 
				 });
	}
  });    

  //面板灯开启和关闭
  var lightModes=$('#modeLtItems>span');
  lightModes.on('click',function(){
     if(dashboardclickenable){
	     dashboardclickenable = false;
		 lightModes.removeClass('current');
		  $(this).addClass('current');
		  var lightmode = "0";
		  var lightStateBtn=$('#lightBtn');
		  if ($(this).attr("id") == "LEDNight")
		  {
			lightmode = "1";
			lightStateBtn.removeClass('light-open').addClass('light-close'); 
		    lightStatus.html(lighttime + "路由宝指示灯关闭"); 
		  }else{
			lightmode = "0";
			lightStatus.html("路由宝指示灯全天开启");
			lightStateBtn.removeClass('light-close').addClass('light-open');
		  }
		  dashboardclickenable = true;
		  $.getJSON($("#setledurl").val(),
			 {"lightMode":lightmode,
			  "lightTime":lighttime},
			 function(data){ var status = data['status']; popup.tip("保存成功！");dashboardclickenable = true;});
	}
  });
  
  function getdevrate(){
      $.getJSON($("#getdevrateurl").val(), function(data){
            $("#dev_count").html(data['deviceCount']);
            var constatus = data['toWeb'];
			var arr = data['runTime'].split(',');
            var run_time = '';
            if(arr[0] != '0')
                run_time += arr[0] + '天';
            if(arr[0] != '0' || arr[1] != '0')
                run_time += arr[1] + '小时';
            run_time += arr[2] + '分钟';
            $("#run_time").html(run_time);
            if (constatus == '1')
            {
                $("#netConnect").show();
                $("#netUnConnect").hide();
			    $("#binddisconnect").hide();
				$("#binduserinfo").show();
				$("#wanset").hide();
				$("#dspeed").html('<span class="icon-down"></span>' + data['dspeed'] + 'KB/s');
                $("#uspeed").html('<span class="icon-upload"></span>' + data['uspeed'] + 'KB/s'); 
                if (connectstatus == "0"){ 
	                getCreditsInfo();
				}		
                connectstatus = "1";				
            }else{ 
			    $("#discon_ref").html("已断开外网，暂时无法继续赚优金币");
		        $("#discon_detail").html("请通过连网设置连接外网");
				$("#netConnect").hide();
				$("#binduserinfo").hide();
				$("#netUnConnect").show();
				$("#wanset").show(); 
				$("#binddisconnect").show();
				connectstatus = "0";
			}
			
			var username = $("#youkuuser").html();
			 if(username != "绑定优酷账号"){
				
				if(username.length > 6)
				{
					username = username.substr(0,6) + "...";			    
				}
				$("#bindUserName").html('已绑定帐号：<span>' + username + '</span><span class="pos-move">以上优金币已放入该账户</span>');
				$("#manageyougold").show(); 
				$("#getyougold").hide();
			 }else{
				$("#bindUserName").html('未绑定优酷账号，以上优金币还没有领取');
				$("#getyougold").show(); 
				$("#manageyougold").hide();
			 }		 	 
      });
  }
  
  getdevrate();
  var timer=null;
  timer=setInterval(function(){getdevrate();},5000);
  
  function checkupdate(){
    $.getJSON($("#chkupgradeurl").val(), function(data){
	        var hasupdate = data["hasupdate"];
	        if (hasupdate == "1"){
	        	$("#ver-now").html(data["version"]);
	        	$("#update-size").html(data["size"]);
	        	var ref = data["updateref"];
	        	if (ref != ""){
	        		 $("#updatereference").html('<li>' + ref + '</li>');
	        	}
	        	$("#updatePopUp").show(); 								
	        }       
	  });
  }
  
  var uptimer=null;
  var upgradeflag = false;
  var errorflag=0;
  
  $('#atOnceUpate').on('click',function(){
    $("#updatePopUp").hide();
  	$.getJSON($("#startupgradeurl").val(), function(data){
	       if (data['code'] == "true"){
			 popup.upGrade(8,20000);
			 upgradeflag = false;
			 errorflag = 0;
			 uptimer=setInterval(function(){getprocess();},500);
	       }
	  });
  });
  
  function getprocess(){
  	$.getJSON($("#getupgradestatusurl").val(), function(data){ 
  		   var persent = data['persent']; 
  		   if (persent != "-1" && persent != "-2"){
  		   	 if (persent == "100"){
					clearInterval(uptimer);
					uptimer=null;
					if(!upgradeflag){
					    upgradeflag = true;
						setTimeout(function(){cycleChackState(5000);},300000);
					}
  		   	 }
  		   }else{
		     clearInterval(uptimer);
  		   	 uptimer=null;
			 $("#upGradeProgress").hide();
			 $("#upGradeProgress").remove();
			 if(persent == "-1" && errorflag == 0){
				errorflag++;
			    popup.simpleBox({
		             "content":"升级包下载失败，请稍后重试！",
					 hideCancel:true,
		             "okBtnClick":function(layer,overlay){ popup.close(layer,overlay);}
		        });
			 }else if(persent == "-2" && errorflag == 0){
				errorflag++;
				popup.simpleBox({
		             "content":"升级包升级失败，请稍后重试！",
					 hideCancel:true,
		             "okBtnClick":function(layer,overlay){ popup.close(layer,overlay);}
		        });
			 }
		   }
	  });
  }
  
  $('#noUpdate').on('click',function(){
    $("#updatePopUp").hide();
  	$.getJSON($("#setnextupgradeurl").val(), function(data){
	       //;
	  });
  });
  
  $('#updateclose').on('click',function(){
    $("#updatePopUp").hide();
  });
  
  var checkupdateflag = $("#checkupdate").val();
  if(checkupdateflag == "true"){
    window.setTimeout(function(){checkupdate()}, 10000);
  }
});
