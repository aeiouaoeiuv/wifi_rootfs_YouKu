$(document.body).ready(function(){
	$.ajaxSetup({
　　　  //请求失败遇到异常触发
　　　  error: function (data) { if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}}
　  });
	
	$('#restartRouterBtn').on('click',function(){
       popup.simpleBox({
        content:"您确定要重启路由器吗？重启时，将断开网络连接。",
        okBtnClick:function(layer,overlay){
          $.getJSON($("#restarturl").val(),
           function(data){ var status = data['code'];
            popup.close(layer);
            popup.reConnect(5000,"<span class='loading'></span>重启路由器操作生效，等待设备重启(180s)...");
            var duration=180;
            var timer=null;
            timer=setInterval(function(){
             if(duration==0){
              clearInterval(timer);
             }else{
               duration-=1;
               $(".waiting").html("<span class='loading'></span>重启路由器操作生效，等待设备重启("+duration+"s)...");
             } 
            },1000);
          });
        }
      });
  });
});
