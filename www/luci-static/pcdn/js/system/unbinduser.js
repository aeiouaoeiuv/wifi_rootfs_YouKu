$(document.body).ready(function(){
  $.ajaxSetup({
　　　  //请求失败遇到异常触发
　　　  error: function (data) { if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}}
　  });
  
  //get
  $.getJSON($("#getSNoneurl").val(), function(data){
     var retcode = data['code'];
     if(retcode == "0"){
         var ykUserName=data['userAccount'];
         if(!ykUserName){
           $("#youkuAccount").val("优酷账号").addClass("gray33");
         }else{
           $("#youkuAccount").val(ykUserName).removeClass("gray33");
         }
         $("#YKAccountName").html(data['username']);
         $("#userName").html(data['username']);
     }
  });
  
  //解除绑定部分
  $('#removeBindAccount').on('click',function(){
    popup.showId("popUnbindAccount");
   });
   validate($("#popUnbindAccount").find("form"),{
     submitBtn:".normal-btn",
     errTipId:"accountBindErr",//id
     valiBreak:true,//每次只验证一个
     submitHandler:function(){
       unbindYKAccount();
  }});
  
 function unbindYKAccount(){
	popup.close($("#popUnbindAccount"),$("#YKRouterOverLayId"),"hide");
	var unBindAccountBtn=$("#removeBindAccount");
	formSaveBtnState.loading(unBindAccountBtn);
	
	$.getJSON($("#unbinduserurl").val(),
	{username:$("#youkuAccount").val(),password:$("#YKAccountPass").val()},
	function(metadata){
		var retcode = metadata['code']; 
		formSaveBtnState.resetInit(unBindAccountBtn);
		if(retcode == "0"){
			popup.tip("解绑成功！",{
				"endFn":function(){
					location.href = $("#resetbindurl").val();
				}
			});
		}else{
			popup.errorTip(metadata.errmsg || '');
		}
	});
  }
});
