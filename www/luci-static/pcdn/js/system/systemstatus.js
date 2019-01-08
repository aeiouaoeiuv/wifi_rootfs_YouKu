$(document.body).ready(function(){
   
   $.ajaxSetup({
　　　  //请求失败遇到异常触发
　　　  error: function (data) { if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}}
　  });

  $.getJSON($("#getsysbaseurl").val(), function(data){
      var arr = data['runtime'].split(',');
	  var totalDays=$("#uptime_day"),
	  totalHours=$("#uptime_hour"),
	  totalMinutes=$("#uptime_minute"),
	  totalSeconds=$("#uptime_second");
	  totalDays.html(arr[0]);
      totalHours.html(parseInt(arr[1])<10?"0"+parseInt(arr[1]):arr[1]);
      totalMinutes.html(parseInt(arr[2])<10?"0"+parseInt(arr[2]):arr[2]);
      totalSeconds.html(parseInt(arr[3])<10?"0"+parseInt(arr[3]):arr[3]);
      $("#systemversion").html(data['sysversion']);
      $("#routemac").html(data['localMac']);
      $("#wanaddr").html(data['WanIP']);
      $("#wangateway").html(data['WanGateway']);
      $("#langateway").html(data['LanGateway']);
	  function runTotalTime(){ 
	   var days=parseInt(totalDays.text());
	   var hours=parseInt(totalHours.text());
	   var minutes=parseInt(totalMinutes.text());
	   var seconds=parseInt(totalSeconds.text());
	   seconds+=1;
	   if(seconds==60){
		 seconds="00";
		 minutes+=1;
	   }
	   if(minutes==60){
		minutes="00";
		hours+=1;
	   }
	   if(hours==24){
		hours="00";
		days+=1;
	   }
	  if(parseInt(hours)<10){hours="0"+parseInt(hours);}
	  if(parseInt(minutes)<10){minutes="0"+parseInt(minutes);}
	  if(parseInt(seconds)<10){seconds="0"+parseInt(seconds);}
	   totalDays.text(days);
	   totalHours.text(hours);
	   totalMinutes.text(minutes);
	   totalSeconds.text(seconds);
	  }
	  setInterval(runTotalTime,1000);        
  });
  
  $.getJSON($("#getwifibaseurl").val(), function(data){
  	    var status = data['status'];
        if (status == "true")
        {
           $("#wifi24_open").html("开启");
        } else {
           $("#wifi24_open").html("关闭");
        }
        $("#wifi24_ssid").html(data['name']);
        var guestmode = data['guestMode'];
        if (guestmode == "true")
        {
           $("#guestmode").html("开启");
        } else {
           $("#guestmode").html("关闭");
        }         
  });
  
  //router dev rate
  $.getJSON($("#getdevrateurl").val(), function(data){
     $("#devnum").html(data['deviceCount']);      
  });
});
