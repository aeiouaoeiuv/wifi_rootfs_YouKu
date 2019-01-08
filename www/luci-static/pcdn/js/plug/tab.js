(function($){
  $.fn.tab=function(option){
    var defaults={
	  "tabBtn":"[data-target]",
	  "BtnCurrentClass":"current",
	  "tabPanel":"[tab-panel]",
	  "relate":"data-target",
	  "index":0, //默认选中的tab项目
	  "callback":false
	};
	var o=$.extend(defaults,option);
	var _this=$(this);
	var tCurrent=o.BtnCurrentClass;
	var tabBtn=_this.find(o.tabBtn);
	var tabPanel=_this.find(o.tabPanel);
	var index=o.index;
	if(index!=0){
	 tabBtn.removeClass(tCurrent);
	 tabPanel.hide();
	 $(tabBtn.eq(index)).addClass(tCurrent);
	 $(tabPanel.eq(index)).show();
	}
	tabBtn.on('click',function(){
     tabBtn.removeClass(tCurrent);
	 tabPanel.hide();
	 $(this).addClass('current');
	  var target=$(this).attr(o.relate);
	  $('#'+target).show();
	  if($.isFunction(o.callback)){
	     o.callback();
	  }
	}); 
  };
})(window.jQuery);