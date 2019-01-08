$(function(){
 $('#isPostAgree').toggleNode('checkbox','checkboxed',function(eleObj){
	 var quickConfigBtn=$("#quickConfigBtn");
	 var disableConfigBtn=$("#disableConfigBtn");
    if(eleObj.is(".checkboxed")){
	   quickConfigBtn.show();
	   disableConfigBtn.hide();
	}else{
		quickConfigBtn.hide();
	   disableConfigBtn.show();
	 }	 
 });
 var aPanelStatus=$("#aPanelStatus");
  $('#openOrCloseAgreePanel').on('click',function(){
     aPanelStatus.removeClass("a-close").addClass("a-open");
     popup.showId("agreementPanel",{
     "closeBtn":".close"  
    });
 });
  $("#agreementPanel").delegate('.close', 'click', function(event) {
      aPanelStatus.removeClass("a-open").addClass("a-close");
  });  
 //footer
  $.getJSON($("#footerurl").val(), function(data){
        $("#sysversion").html(data['sysversion']);
        $("#routerQQ").html(data['routerQQ']);
        $("#routerWX").html(data['routerWX']);
        $("#routerHotline").html(data['routerHotline']);
  });
});