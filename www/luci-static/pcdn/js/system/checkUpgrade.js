$(document.body).ready(function(){
  //$('#upgradeChange').toggleNode('select-open','select-close');
  $('#checkUpGardeTab').tab({
    "tabBtn":"[data-target]",
	"tabPanel":".tab-panel"
  });
  
  $.ajaxSetup({
　　　  //请求失败遇到异常触发
　　　  error: function (data) { if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}}
　  });
  
  //切换按钮
  $('#upgradeChange').on('click',function(){
    var _this=$(this);
    if(_this.hasClass('select-open')){
      _this.removeClass('select-open').addClass('select-close');

      $.getJSON($("#setupgrademodeurl").val(),
             {autoupgrade:"0"},
             function(data){ var status = data['status']; });
    }else if(_this.hasClass('select-close')){
      _this.removeClass('select-close').addClass('select-open');
      $.getJSON($("#setupgrademodeurl").val(),
             {autoupgrade:"1"},
             function(data){ var status = data['status']; });
    }
  });  
  
  function checkupdate(){
	  $("#checkIng").show();
	  $("#currentVer").hide(); 
      $("#checkResult").hide();
	  $.getJSON($("#chkupgradeurl").val(), function(data){
	        var hasupdate = data["hasupdate"];
	        if (hasupdate == "1"){
	        	$("#ver-now").html(data["version"]);
	        	$("#update-size").html(data["size"]);
	        	var ref = data["updateref"];
	        	if (ref != ""){
	        		 $("#updatereference").html('<li>' + ref + '</li>');
	        	}
	        	$("#currentVer").show(); 
                $("#checkResult").hide();				
	        	
	        }else{
			    $("#checkref").html("<span class='icon-right3'></span>不需要升级！您的系统已经是最新版！")
	        	$("#checkResult").show(); 
                $("#currentVer").hide();				
	        }
	        $("#checkIng").hide();       
	  });
  }
  
  var timer=null;
  var upgradeflag = false;
  var progressupnum = 0;
  checkupdate();
  
  $('#resetCheck').on('click',function(){
    checkupdate();
  });
  
  $('#atOnceUpate').on('click',function(){
  	$.getJSON($("#startupgradeurl").val(), function(data){
	       if (data['code'] == "true"){
			 $("#currentVer").hide();
			 $("#upgraProcess").show();
			 $("#updateprogress").css("width", 1);
			 upgradeflag = false;
			 progressupnum = 0;
			 $("#updatestate").html("正在下载升级包...");
	       	 timer=setInterval(function(){getprocess();},500);
	       }    
	  });
  });
  
  function getprocess(){
  	$.getJSON($("#getupgradestatusurl").val(), function(data){ 
  		   var persent = data['persent']; 
  		   if (persent != "-1" && persent != "-2"){
  		   	 $("#updateprogress").css("width", Number(persent)*5 );
			 progressupnum++;
  		   	 if (parseInt(persent) >= 99 || progressupnum > 600){
					$("#updateprogress").css("width", 494);
					clearInterval(timer);
					timer=null;
					if(!upgradeflag){
					    upgradeflag = true;
						popup.upGrade(8,20000);
						$("#upgraProcess").hide();
						setTimeout(function(){cycleChackState(5000);},300000);
					}
  		   	 }
  		   }else{
		     clearInterval(timer);
  		   	 timer=null;
			 if(persent == "-1"){
			     $("#checkref").html("<span class='icon-right3'></span>下载失败，请重新检测升级版本！")
			 }else{
				 $("#checkref").html("<span class='icon-right3'></span>更新失败，请稍后重新检测升级版本！") 
			 }
			 $("#upGradeProgress").hide();
			 $("#currentVer").hide(); 
             $("#checkResult").show();
		     $("#checkIng").hide();
			 $("#upgraProcess").hide();
		   }
	  });
  }
  
  //上传文件
  $.fn.ajaxUpload = function(options){
	var iframeContents;

	var form = $(this);
	form.attr("action", options.url);
	form.attr("method", "post");
	form.attr("enctype", "multipart/form-data");
	form.attr("encoding", "multipart/form-data");
	form.attr("target", "iframeUpload");
	form.submit();

	$(document.getElementById("iframeUpload"))
		.load(function () {
			iframeContents = document.getElementById("iframeUpload").contentWindow.document.body.innerHTML;
			var rsp = iframeContents.match(/^\{.*?\}/);
			rsp = $.parseJSON(rsp[0]);
			options.success(rsp);
		})
		.error(function(){
			options.error();
		});
	return false;
  };

  //点击按钮上传
  $('#image').change(function(){
	var image = $('#image');
	var err = $('#errtip');
	if (image.val() == '') {
		err.html('您未选择文件，请选择升级包文件。').show();
		return false;
	}
	var val = image.val();
	var ext = val.substring(val.lastIndexOf('.') + 1);
	ext = $.trim(ext);
	var validExt = ext == 'bin' || ext == 'BIN';
	if (!validExt) {
		err.html('升级包文件格式错误，请选择正确的升级包。').show();
		return false;
	}
	
	var  browserCfg = {};
    var ua = window.navigator.userAgent;
    if (ua.indexOf("MSIE")>=1){
       browserCfg.ie = true;
    }else if(ua.indexOf("Firefox")>=1){
       browserCfg.firefox = true;
    }else if(ua.indexOf("Chrome")>=1){
       browserCfg.chrome = true;
    }
	
	var obj_file = document.getElementById('image');
	var filesize = 0;
    if(browserCfg.firefox || browserCfg.chrome ){
      filesize = obj_file.files[0].size;
    }else if(browserCfg.ie){
      var obj_img = document.getElementById('tmpimg');
      obj_img.src=obj_file.value;
      filesize = obj_img.fileSize;
    }
	
	if(filesize > 12*1024*1024){
	    err.html('升级包错误，请选择正确的升级包。').show();
		return false;
	}
	
	err.hide();
	var options = {
		type: 'post',
		dataType:"json",
		url: $("#uploadimageurl").val(),
		uploadProgress:function(event, position, total, percentComplete){
		    $("#uploadprogress").css("width", percentComplete*5);
		},
		success: function(rsp) {
			if (rsp.code == 0) {
			    $("#uploadprogress").css("width", 494);
				$("#uploadstatus").html("上传升级包完成");
				$("#deleteuploadfile").show();
				$("#upgradeFormBtn").show();
			}else{
				$("#fileselectpanel").show();
	            $("#uploadingpanel").hide();
				err.html('上传升级包出错，请重试。').show();
				err.show();
			}
		},
		error: function(data) {
		    if (data && data.status == 403){ window.location.href="http://wifi.youku.com";}
		    $("#fileselectpanel").show();
	        $("#uploadingpanel").hide();
			err.html('系统错误，可能您上传的文件不正确，请重试。').show();
			err.show();
		}
	};
	$("#uploadfilename").html(val.substring(val.lastIndexOf('\\') + 1));
	$("#fileselectpanel").hide();
	$("#uploadingpanel").show();
	$("#upgradeFormBtn").hide();
	$("#uploadstatus").html("正在上传升级包...");
	$("#deleteuploadfile").hide();
	$("#uploadprogress").css("width", 5);
	$('#uploadForm').ajaxSubmit(options);
	image.val('');
	return false;
  });
  
  //点击手动升级按钮
  $('#upgradeFormBtn').on('click',function(){
	$("#uploadingpanel").hide();
	$.getJSON($("#upgradeimageurl").val(),function(data){
	   var errMsg=null;
       if(!data || !data.code){
	       popup.upGrade(8,20000);
	       setTimeout(function(){cycleChackState(5000);},300000);
	   }else{
		   if(data.code=="-1"){
			errMsg="升级包没有通过验证，请选择正确的升级包";
		   }else if(data.code=="-2"){
			errMsg="升级包上传失败，请重新上传";
		   }else{
			 popup.upGrade(8,20000);
			 setTimeout(function(){cycleChackState(5000);},300000);
		   }
	   }
       if(errMsg){
         $("#progressVal").stop();
         $("#upGradeProgress").hide();
          popup.errorTip(errMsg,{
            okBtnName:"重新上传",
            okBtnClick:function(layer,overlay){
              popup.close(layer,overlay);
              $("#fileselectpanel").show();
              $("#uploadingpanel").hide();
            }
          });
       }
     });
  });
  
  //点击删除固件
  $('#deleteuploadfile').on('click',function(){
  	$.getJSON($("#deleteimageurl").val(), function(data){
	     $('#image').val("");
		 $('#errtip').hide();
     	 $("#fileselectpanel").show();
		 $("#uploadingpanel").hide();  
	  });
  });
  
  //footer
  $.getJSON($("#footerurl").val(), function(data){
        $("#sysversion").html(data['sysversion']);
        $("#versionNow").html(data['sysversion']);
		$("#versionNow2").html(data['sysversion']);
        $("#MacAddr").html(data['MacAddr']);
        $("#wanIP").html(data['wanIP']);
        $("#routerQQ").html(data['routerQQ']);
        $("#routerWX").html(data['routerWX']);
        $("#routerHotline").html(data['routerHotline']);
        $("#youkuuser").html(data['binduser']);
        $("#appurl").attr("href", data['appurl']);
        $("#bbsurl").attr("href", data['bbsurl']);
  });
});