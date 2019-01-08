var prefix=(function(){
   var style= document.createElement('div').style,
   vendors='webkitT,MozT,msT,OT'.split(','),
   cssAttr,
   prefix;
   for(var i=0;i<vendors.length;i++){
    cssAttr=vendors[i]+'ransform';
    if(cssAttr in style){
      return vendors[i].substr(0, vendors[i].length - 1);
    }
   }
   return false;
   })();
$(document.body).ready(function(){
  var speed=300,
  ease='swing',
  centerLeft=110,
  centerTop=96,
  featuresPanel=$('#routerFeaturesPanel');
  
  $('#saveBtnAboutWifi>span').on('click',function(){
  
    $.getJSON($("#guestmodeurl").val(),
             {guessMode:"1",
              status:"true",
              name:"youku_router",
              pwd:"123456",
              signalpath:"7",
              visable:"true"},
             function(data){ var status = data['status']; });
  });

  $.getJSON($("#wifigeturl").val(), function(data){
        var status = data['status'];
        if (status == "true")
        {
           $("#net2d4G").removeClass('select-close').addClass('select-open');
        } else {
           $("#net2d4G").removeClass('select-open').addClass('select-close');
        }
        $("#routerName1").val(data['name']);
        $("#routerPassword1").val(data['pwd']);

        var channal = data['signalpath'];
        var showssid = data['visable'];
        var guestmode = data['guessMode'];
  });
   
  //footer
  $.getJSON($("#footerurl").val(), function(data){
        $("#sysversion").html(data['sysversion']);
        $("#MacAddr").html(data['MacAddr']);
        $("#wanIP").html(data['wanIP']);
        $("#routerQQ").html(data['routerQQ']);
        $("#routerWX").html(data['routerWX']);
        $("#routerHotline").html(data['routerHotline']);
  });
});
