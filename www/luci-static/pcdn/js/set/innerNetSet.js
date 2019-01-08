$(document.body).ready(function(){
    $.ajaxSetup({
　　　  //请求失败遇到异常触发
　　　  error: function (data) { if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}}
　  });
    var innerNetBaseSet={};
    

    //获取ip地址和子网掩码
	$.getJSON($("#lanInfo").val(), function(data){
		$('#netWork').attr('value', data.ipaddr);
		$('#subNetMask').attr('value', data.netmask);
    innerNetBaseSet.ipaddr=data.ipaddr;
    innerNetBaseSet.netmask=data.netmask;
		if(data.dhcp_switch == '0')                                             
			$('#DHCPChange').attr('class', 'select-open');
		else                                                                   
			$('#DHCPChange').attr('class', 'select-close');
		$('#rangeFrom1').attr('value', data.dhcp_start_ip);
		$('#rangeTo1').attr('value', data.dhcp_stop_ip);
		$('#ipSection').html(data.dhcp_pre_ip);
	});
    //tab效果切换
    $('#innerNetSetTab').tab({
    "tabBtn":"[data-target]",
	   "tabPanel":".tab-panel",
	   "index":0
   });
   //验证内网基本设置表单
   validate($("#innerNetBaseSetForm"),{
     submitHandler:function(){
        var ipaddr = $('#netWork').val();                                         
        var netmask = $('#subNetMask').val();
        var submitBtn=$("#saveNetWork");
        if(innerNetBaseSet.ipaddr!=ipaddr || innerNetBaseSet.netmask!=netmask){
           popup.simpleBox({
            title:"重启路由器",
            content:"修改子网掩码和网关需要重启路由器，您确定现在要重启吗？",
            okBtnClick:function(layer,overlay){
            formSaveBtnState.loading(submitBtn);
            $.getJSON( $("#setLanUrl").val(),{ipaddr:ipaddr, netmask:netmask},function(data){
              formSaveBtnState.resetInit(submitBtn);
               popup.close(layer);
              popup.reConnect(5000,"修改子网掩码和网关需要重启路由器，正在重启中...");
              innerNetBaseSet.ipaddr=ipaddr;
              innerNetBaseSet.netmask=netmask;
            });
          }
          });
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
     }
   });
   $("#rangeTo1").addRule("size",function(){
     if(parseInt($(this).val())>parseInt($("#rangeFrom1").val())){
       return true;
     }
     return false;
   });
   $('#DHCPChange').toggleNode('select-open','select-close');  
   //验证DHCP填写表单
   validate($("#DHCPSetForm"),{
      errTipId:"DHCPErr",
      valiBreak:true,//每次只验证一个,
      submitHandler:function(){
        popup.simpleBox({
          title:"重启路由器",
          content:"修改DHCP需要重启路由器，您确定现在要重启吗？",
          okBtnClick:function(layer,overlay){
             submitDHCPSet(layer);
          }
        });
      }
   });
   function submitDHCPSet(layer){
     var submitBtn=$("#saveDHCPSet");
     formSaveBtnState.loading(submitBtn);
     var dhcp_switch = $('#DHCPChange').attr('class');                      
     var dhcp_pre_ip = $('#ipSection').html();                                 
     var dhcp_start_ip = $('#rangeFrom1').val();                               
     var dhcp_stop_ip = $('#rangeTo1').val();     
	 $.getJSON( $("#setDhcpUrl").val(), {
		 sw:dhcp_switch, pre_ip:dhcp_pre_ip, start_ip:dhcp_start_ip, stop_ip:dhcp_stop_ip 
	 }, function(data){
          formSaveBtnState.resetInit(submitBtn);
           popup.close(layer);
          popup.reConnect(5000,"修改DHCP需要重启路由器，正在重启中...");
      } );     
   }
	
   var currentDevListData=$("#currentDevListData"),//设别列表
   currentDevBindedData=$("#currentDevBindedData");//当前mac地址设备列表
  //刷新当前连接的设备和已绑定MAC地址的设备数据
   var refreshDevListBtn=$("#refreshDevListBtn");
   var refreshLoading=$("#refreshLoading");
   refreshDevListBtn.on("click",function(){
    refreshDevListBtn.hide();
    refreshLoading.show();
    getDevData();
  });
  //获取连接设备的数据
  function getDevData(){
    var macBindDevListData={},macBindDevListData={};
    $.getJSON($("#conDeviceList").val(),{},function(data){
      currentDevListData.data=data.devicelist;
      macBindDevListData.data=data.binded_devices;
      loadCurrentDevData(currentDevListData);
      loadMacBindDevData(macBindDevListData);
    });  
  }
  //加载连接设备列表
  function loadCurrentDevData(data){
    if($.isEmptyObject(data.data)) data.data=false;
    var tmpl=document.getElementById('devListTemplate').innerHTML;
    var doTtmpl = doT.template(tmpl)(data);
    currentDevListData.html(doTtmpl);
  }
  //加载已绑定的设备列表
  function loadMacBindDevData(data){
    if($.isEmptyObject(data.data)) data.data=false;
     data.unbind=true;
    var tmpl=document.getElementById('devBindMacListTemplate').innerHTML;
    var doTtmpl = doT.template(tmpl)(data);
    currentDevBindedData.html(doTtmpl);
    refreshDevListBtn.show();
    refreshLoading.hide();
  }
  getDevData();
  //手动绑定mac地址
  $('#addMacDev').on('click',function(){
    popup.showId("popMacAdd");
 });
  validate($("#popMacAdd").find("form"),{
       submitBtn:".ok",
       submitHandler:function(){
         addUnbindMacItem(); 
       }
  });
 //绑定
 var bindRequestUrl=$("#bindUrl").val();
 currentDevListData.delegate(".bind-btn1","click",function(){
    bindDevItem($(this));
 });
 function bindDevItem(eleObj){
  var dataId=eleObj.attr("data-id");
   currentDevBindedData.find(".no-data").hide();
   var tr=eleObj.html("解绑").parents("tr").clone();
   tr.find("td:eq(2)").remove();
   tr.appendTo(currentDevBindedData.find("tbody"));
   eleObj.parent().html('<div data-id="'+dataId+'"><span class="icon-right2"></span>已绑定</div>');
   var vals=eleObj.attr("data-query").split("|||");
   $.getJSON(bindRequestUrl,{ 
	  name:vals[0], ip:vals[1], mac:vals[2]
	 },function(data){});
 }
 //添加一个解绑定设备
 function addUnbindMacItem(){
   var devAddBindIp=$("#devAddBindIp");
   var devAddBindMac=$("#devAddBindMac");
   var trStr='<tr>';
   trStr+='<td><div class="td-con"><img src="/luci-static/resources/../pcdn/images/devIcon/unknown.png">'+(devAddBindMac.val()).toUpperCase()+'</div></td>';
   trStr+='<td><div class="td-con"><p>'+devAddBindIp.val()+'</p><p>'+(devAddBindMac.val()).toUpperCase()+'</p></div></td>';
   trStr+='<td>'+
    '<div class="td-con">'+
    '<span class="blue-btn bind-btn1" data-query="none|||'+devAddBindMac.val()+'|||'+devAddBindIp.val()+'" data-id="'+devAddBindMac.val()+'">解绑</span>'+
    '</div>'+ 
    '</td>';
   trStr+="</tr>";
   $(trStr).appendTo(currentDevBindedData.find("tbody"));
   popup.close($("#popMacAdd"),$("#YKRouterOverLayId"),"hide");
   currentDevBindedData.find(".no-data").hide();  
   $.getJSON(bindRequestUrl,{name:"none", ip:devAddBindIp.val(), mac:devAddBindMac.val()},function(data){});
 };
 //解除绑定
 var unBindRequestUrl=$("#unbindUrl").val();
 currentDevBindedData.delegate(".bind-btn1","click",function(){
   unBindDevItem($(this));
 });
 function changeDevTr(eleObj){
  var dataId=eleObj.attr("data-id");
   eleObj.html("绑定");
   var bindItems= currentDevListData.find('[data-id="'+dataId+'"]');
   var tr=eleObj.parents("tr");
   if(bindItems.length==0){
      tr.remove();
   }else{
      tr.remove();
      bindItems.parent().html('<span class="blue-btn bind-btn1" data-query="'+eleObj.attr("data-query")+'" data-id="'+dataId+'">绑定</span>');
   } 
 }
 function unBindDevItem(eleObj){
   changeDevTr(eleObj);
   var vals=eleObj.attr("data-query").split("|||");
   $.getJSON(unBindRequestUrl,{mac:vals[2]}); 
 }
 //确定要解除全部绑定提示
  $('#allUnBindMac').on('click',function(){
	   popup.simpleBox({
       title:"解除绑定",
	     content:"您确定解除全部MAC地址绑定吗？",
       okBtnClick:function(layer,overlay){
       popup.close(layer,overlay);
       currentDevBindedData.find(".no-data").hide();    
       var macVal=[];
       currentDevBindedData.find(".bind-btn1").each(function(){
          changeDevTr($(this));
          macVal.push($(this).attr("data-id"));
       });
       if(macVal.length>0){
         unbindAll(macVal.join("|||"));
        }
     }
	});
  }); 
  //全部解除mac绑定    
   function unbindAll(macVals){
     $.getJSON($("#allunBindMacUrl").val(),{"all":macVals},function(data){});
   }                                                       
});