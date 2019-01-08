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
  centerTop=96;
  
  $.getJSON($("#getwaninfo").val(), function(data){
        var proto = data['proto'];
        if (proto == "static")
        {
           
        }else if (proto == "pppoe")
        {

        }else{

        }
  });
   
});
