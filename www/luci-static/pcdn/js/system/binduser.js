$(document.body).ready(function(){
  
    $.ajaxSetup({
　　　  //请求失败遇到异常触发
　　　  error: function (data) { if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}}
　  });
  
  //get
  $.getJSON($("#getcreditsurl").val(), function(data){
     var retcode = data['code'];
     if(retcode != "-1"){
         	$("#losennum").html(data['total_credits']);      	        	
     }
  });
  
  //验证绑定账号表单
  validate($('#accountInForm'),{
     errTipId:"bindAccountErrTip",//id
     valiBreak:true,//每次只验证一个
    	submitHandler:function(form){
          bindYKAccount();
    	}
  });
  
  function bindYKAccount(){
    var saveBindAccountBtn=$("#saveBtn");
    formSaveBtnState.loading(saveBindAccountBtn);
	
	$.getJSON($("#binduserurl").val(),
	 {username:$("#userName").val(),
	  password:$("#userPassword").val()},
	function(metadata){ 
		var retcode = metadata['code']; 
		formSaveBtnState.resetInit(saveBindAccountBtn);
		if(retcode == "0"){
		   popup.tip("绑定成功！"); 
			location.href = $("#resetbindurl").val();   	
		}else{
			popup.errorTip(metadata.errmsg || '');
		}
	});  
  }
  
});
