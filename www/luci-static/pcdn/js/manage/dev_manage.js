$(document.body).ready(function(){
  
  $.ajaxSetup({
　　　//请求失败遇到异常触发
　　　error: function (data) { if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}}
　});

  //获取刷新当前的设备列表
  function refreshAllList(){
		$.getJSON($('#deviceList').val(),function(data){
		   var devicelist=data.devicelist;
		   if(devicelist && devicelist.length==0) return;
		  //连接的设备数目
		  $("#devConnNowNum").text(data.devicecount);
		  //下行速度
		  $("#netStateDownSpeed").text(parseFloat(data.down_rate).toFixed(2));
		  //上行速度
		  $("#netStateUpSpeed").text(parseFloat(data.up_rate).toFixed(2));
		  var i=0,l=devicelist.length;
		  var currentDevData={};
		  var blackListData={};
		  currentDevData.data=[];
		  blackListData.data=[];
		  for(i=0;i<l;i++){
			  var itemData=devicelist[i];
			  if(itemData["accept"]=="yes"){
			    itemData["up_rate"]=parseFloat(itemData["up_rate"]).toFixed(2);
			    itemData["down_rate"]=parseFloat(itemData["down_rate"]).toFixed(2);
             currentDevData.data.push(itemData);
			  }else{
			    blackListData.data.push(itemData);
			  }
			}
		   loadCurrentDevList(currentDevData);
		   loadDevBlackList(blackListData);
		});
	}
	refreshAllList();
   var devCurrentList=$("#devCurrentList");
   var blackListAboutDev=$("#blackListAboutDev");
   var allAllowConn=$('#allAllowConn'),noItemsDataAllow=$("#noItemsDataAllow");
   //渲染设备列表
   function loadCurrentDevList(data){
   	if(data.data && data.data.length==0) data.data=false;
     var tmpl=document.getElementById('currentDevListTemplate').innerHTML;
     var doTtmpl = doT.template(tmpl)(data);
     devCurrentList.html(doTtmpl);
   }
   //刷新数据
	var refreshDevListBtn=$("#refreshDevListBtn");
   var refreshLoading=$("#refreshLoading");
	refreshDevListBtn.on("click",function(){
      refreshDevListBtn.hide();
      refreshLoading.show();
      refreshAllList();
	});
   //渲染黑名单
   function loadDevBlackList(data){
       if(data.data && data.data.length==0) {
     	data.data=false;
     	allAllowConn.hide();
     	noItemsDataAllow.show();
       }
      var tmpl=document.getElementById('currentBlackListTemplate').innerHTML;
      var doTtmpl = doT.template(tmpl)(data);
      blackListAboutDev.html(doTtmpl);
      refreshDevListBtn.show();
      refreshLoading.hide();
   }
	
  //全部允许连接
  allAllowConn.on('click',function(){
	  popup.simpleBox({
	    	content:"您确定要允许黑名单中的全部设备连接路由器吗？确定后将清空黑名单。",
	    	okBtnClick:function(layer,overlay){
                popup.close(layer,overlay);
				var macVals=[];
	    		blackListAboutDev.find(".gray-btn2").each(function(){
                  var dataQuery=$(this).attr("data-query");
				  macVal=(dataQuery.split("|||"))[1];
				  macVals.push(macVal);
				  $(this).parents("tr").remove();
	    		});
				if(macVals.length>0){
				   allowAllDevConn(macVals.join("|||"));
				}
	    	}
	  });
  });
  function allowAllDevConn(macVals){
     $.getJSON($("#allowAllDevConn").val(),{
	   "all":macVals
	 },function(data){
	 	refreshAllList();
	 	allAllowConn.hide();
	 	noItemsDataAllow.hide();
	 });
  }
 
  //禁止连接
	$('#devCurrentList').delegate('.normal-btn','click',function(){
       var _this=$(this);
	   var vals= _this.attr("data-query");
		var arrayVal=vals.split("|||");
        var tr=_this.parents("tr");
        tr.find("td.move-del").remove();
        blackListAboutDev.find(".no-data").hide();
        tr.appendTo(blackListAboutDev.find("tbody"));
        var btn= tr.find(".normal-btn"),dataQuery=btn.attr("data-query");
        btn.parent().html('<span class="gray-btn2" data-query="'+dataQuery+'">允许连接</span>');
		$.getJSON( $("#forbidUrl").val(),{ name:arrayVal[0], mac:arrayVal[1], ip:arrayVal[2]},function(data){	
		});
		allAllowConn.show();
     	noItemsDataAllow.hide();
	});
	//允许连接
	$('#blackListAboutDev').delegate('.gray-btn2','click',function(){
	  allowDevConn($(this));
	});
	function allowDevConn(item){
     var vals= item.attr("data-query");
	  var arrayVal=vals.split("|||");
      item.parents("tr").remove();
      $.getJSON( $("#allowUrl").val(),{ mac:arrayVal[1]},function(data){});
      if($('#blackListAboutDev').find(".td-con").length==0){
          allAllowConn.hide();
          noItemsDataAllow.show();
      }
      refreshAllList();
	}
});
