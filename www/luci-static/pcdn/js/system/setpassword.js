$(document.body).ready(function(){
  $.ajaxSetup({
　　　  //请求失败遇到异常触发
　　　  error: function (data) { if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}}
　  });
  
  var passMananger=$("#passMananger");
   //修改密码表单验证
   validate(passMananger,{
     submitHandler:function(){
        updateAdminPass();
     }   
   });
   //修改密码异步
   function updateAdminPass(){
     var submitBtn=$("#savePassword");
      formSaveBtnState.loading(submitBtn);
      $.getJSON($("#setpwdurl").val(),
             {oldpwd:$("#oldPwd").val(),
              newpwd1:$("#newPwd").val(),
              newpwd2:$("#newAgainPwd").val()},
              function(data){ var code = data['code']; 
               formSaveBtnState.resetInit(submitBtn);
               if (code == "0"){
				  //弹窗设置成功提示弹窗
					popup.simpleBox({
					  content:'<div class="pwd-set-complete">'+
					  '<p class="info">管理员密码设置成功！</p>'+
					  '<p class="notice" style="color:#999;">注意：WiFi密码未随管理员密码改变。</p></div>',
					  hideCancel:true,
					  okBtnName:"我知道了",
					  okBtnClick:function(layer,overlay){
						popup.close(layer,overlay);
						location.href=$("#logouturl").val();
					  }
					});
             }else{
                  popup.errorTip(data.errmsg || '');
             }
     });
   }
});
