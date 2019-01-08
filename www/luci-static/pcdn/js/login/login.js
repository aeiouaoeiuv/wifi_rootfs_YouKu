/*登陆相关*/
$(document.body).ready(function(){
  var fieldCon=$('div.field-con');
  var itemInputs=fieldCon.find("input");
  itemInputs.on("focus",function(){
   var _this=$(this),
   parent= $(this).parents(".field-con"),
   val=_this.val();
   parent.addClass('focus');
  }).on('blur',function(){
    var _this=$(this),
    val=_this.val();
    _this.parents(".field-con").removeClass('focus');
  });
  $("#adminBtn").click(function(){
    var logform = $("#loginForm");    
    var logType = $("#loginType");
    var adminPwd=$("#admin_pwd_txt");
    if(!(adminPwd.val())){
      var errTip=$("#forAdminPwd");
      errTip.css("visibility","visible");
      errTip.find("span:eq(1)").html("密码不能为空！");
    }else{  
     logType.attr('value', 0);
     logform.submit();
    }
    return false;  	
  });
  
  $("#snBtn").click(function(){
    var logform = $("#loginForm");    
    var sn_pass = $("#sn_pwd_txt");
    if(!(sn_pass.val())){
      var errTip=$("#forAdminSN");
      errTip.css("visibility","visible");
      errTip.find("span:eq(1)").html("SN不能为空！");
    }else{  
     var pass = $("#admin_pwd_txt");
     $(pass).attr('value', $(sn_pass).val());
     var logType = $("#loginType");  
     logType.attr('value', 1);
     logform.submit();  
    }
    return false;	
  });
  
  $.ajaxSetup({
　　　//请求失败遇到异常触发
　　　error: function (data) { if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}}
　});
  
  $('#goLoginSnPanel').on('click',function(){
    $('#formPanels').animate({'margin-left':'-338px'},200);
  });
  $('#goBackLoginPanel').on('click',function(){
    $('#formPanels').animate({'margin-left':0},200);
  });
});
