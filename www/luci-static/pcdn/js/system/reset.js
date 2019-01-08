$(document.body).ready(function(){

  $.ajaxSetup({
　　　  //请求失败遇到异常触发
　　　  error: function (data) { if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}}
　  }); 

  $('#resetBtn').on('click',function(){
        popup.simpleBox({
         "title":"恢复出厂设置",
         "content":"<p>您确定要恢复出厂设置吗？请谨慎操作。</p><p>清除路由宝的所有设置信息，恢复到出厂状态，但会保留绑定的优酷账号。</p>",
         "okBtnClick":function(layer,overlay){
            $.getJSON($("#reseturl").val(),
             function(data){ var status = data['code'];
              popup.close(layer);
              popup.reConnect(5000,"恢复出厂设置生效，等待设备重启...");
            });
         }
      });
  });
  
});
