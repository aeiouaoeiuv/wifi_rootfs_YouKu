"use strict";
//验证规则方法集合
 var rulesMethods={
    //验证空值
    required:function(val){
      val=$.trim(val);
      return (val && val.length>0)?true:false;
    },
    //邮箱格式
    email:function(val){
     var reg=/^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/;
     return val && reg.test(val);  
    },
    //mac地址格式
    mac:function(val){
     var reg=/^[A-F\d]{2}(:)[A-F\d]{2}(:)[A-F\d]{2}(:)[A-F\d]{2}(:)[A-F\d]{2}(:)[A-F\d]{2}$/;
     return val && reg.test(val);
    },
    //ip地址格式
    ip:function(val){
	  val=$.trim(val);
	  if(val && val.length>0){
        var reg=/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
        return val && reg.test(val);
	  }else{
		return true;
	  }
   },
   //取值范围
   range:function(val,param){
    if(!$.isArray(param) || param.length<2) return true;
    if(isNaN(param[0]) || isNaN(param[1])) return true;
    if(parseFloat(val)>=parseFloat(param[0]) && parseFloat(val)<=parseFloat(param[1])){
      return true;
    }
    return false;
  },
  //非中文
  nocc:function(val){
    var reg=/([\u4E00-\u9FA5]|[\uFE30-\uFFA0])+/g;
    if(!val) return true;
    if(reg.test(val)){
      return false;
    }else{
      return true;
    }
  },
  //数字
  number:function(val){
    return val && /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(val);
  },
  //字符长度
  length:function(val,param){
    if(!$.isArray(param) || param.length<2) return true;
    if(isNaN(param[0]) || isNaN(param[1])) return true;
    if(typeof val!=="string") return false;
    if(val.length>=param[0] && val.length<=param[1]){
      return true;
    }
    return false;      
  },
  //正则表单式
  reg:function(val,param){
   if(!val || !param) return true;
   try {
     var regExp=$.isArray(param)?new RegExp(param[0],param[1] || ""):new RegExp(param);
     var results = regExp.exec(val);
     return (results != null);
   }catch(err){}
   return; 
  },
  //相同的值
  eqTo:function(val,selector){
   if(!selector || !($(selector).val())) return true;
    return (val == $(selector).val());
  },
  //最多的字符长度
  maxLength:function(val,param){
    return val && (val+"").length<=param; 
  },

  //子网掩码
  mask:function(val){
  var reg=/^(254|252|248|240|224|192|128|0)\.0\.0\.0|255\.(254|252|248|240|224|192|128|0)\.0\.0|255\.255\.(254|252|248|240|224|192|128|0)\.0|255\.255\.255\.(254|252|248|240|224|192|128|0)$/;
  return val && reg.test(val);  
  },
  
  //网关
  gate:function(val){
    var reg=/^192\.168\.215\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    if(val){
      return reg.test(val)===true?false:true;
    }
  },
 //wifi名称长度
 ssid:function(val,param){
   var length=((val+"").replace(/[^\x00-\xFF]/g,"***")).length;
   if(length<=param){
     return true;
   }
   return false;
 },
  //integer
  integer:function(val){
     var reg=/^\d+$/;
     return val && reg.test(val);
  }
 };
(function($,w){
  /**
   *为验证元素添加自定义验证规则
   *@param string name 规则的名字
   *@param function fn 规则验证函数
   *@return {{jQuery object}}
   **/
  $.fn.addRule=function(name,fn){
    this.each(function(){
    $.data(this,name,fn)
    });
    return this;
  };
    //默认的验证设置

  //表单验证类
  var validate=function(form,option){
    if(!(this instanceof validate)){
      return  new validate(form,option);
     }
    this.currentForm=form;
    this.settings=$.extend(true,{},validate.defaults,option);
    this.elementLists=null;
    this.init();
  };
  validate.defaults={
    debug:false,//表单提交调试
    errClass:"error",//input输入框验证出错的class
    focusClass:"focus",//input输入框获取焦点的class
    prevSubmitHandler:null,//表单验证开始执行的函数
    invalidHandler: null,//表单验证失败的执行函数
    submitHandler: null,//表单验证成功的执行函数
    ignore: ".ignore",//可以忽略的节点selector
    autoReset:false,//是否刷新form要验证的元素
    noignore:".noignore",//必须要验证的节点selector,
    errTipClass:"error-tip",
    initMsgClass:"gray33",//默认输入框初始化样式
    valiBreak:false,//是否每次只验证一个项
    submitBtn:".save-btn"
  };
  validate.prototype={
    init:function(){
     this.validatElementsList();
     this.valiInput();
      this.valiSelect();
     this.vailForm();
    },
    validateor:function(element){
     var eleObj=$(element);
     var val=this.elementValue(element);
      // <input type="text" data-rules="required|email|range=2,3|reg=(\w)+,gi" data-errors="用户名不能为空|格式必须是邮箱|范围在2-3之间|不符合正则表达式">
      var dataRules=eleObj.attr("data-rules");
      var dataErrors=eleObj.attr("data-errors");
      if(!dataRules) return true;
      var rules=dataRules.split("|");
      for(var i=0;i<rules.length;i++){
        var invali,ruleKey=rules[i],fnKey,param,fn;
        var regs=/^([a-zA-Z_-]+)\s*=\s*(\S+)$/;
        var matches=ruleKey.match(regs);
        //检测下是不是range=1,2这种格式
        if(matches){
          fnKey=matches[1];
          param=matches[2].indexOf(",")>=0?matches[2].split(","):matches[2];
        }else{
          param='';
          fnKey=ruleKey; 
        }
        if($.isFunction(rulesMethods[fnKey])){
          invali=rulesMethods[fnKey].call(element,val,param);
        }else{
           var fn=$.data(element,ruleKey);
           invali=$.isFunction(fn) && fn.call(element,element);
        }
        if(!invali){
           eleObj.addClass(this.settings.errClass).removeClass(this.settings.focusClass);
           this.errorNotify(element,invali,eleObj.attr("data-"+fnKey+"-error")|| "验证错误，请定义对应的错误提示！");
           return false;
        }else{
          eleObj.removeClass(this.settings.errClass).removeClass(this.settings.focusClass);
          this.errorNotify(element,invali);
        }
      }//for循环
      return true;
    },
    //获取需要验证的元素
    validatElementsList:function(){
     this.elementLists=this.currentForm.find("input,select,textarea")
				.not(":submit,:reset,:button,[disabled]")
				.not(this.settings.ignore)
				.add(this.settings.noignore);
    },
    //管理错误提示
    errorNotify:function(element,invali,errMsg){
      var eleObj=$(element);
      var errTip=null;
      //如果使用共有一个错误提示容器
      var errContainer=$("#"+this.settings.errTipId);
      if(errContainer.length>0){
         !invali?errContainer.css("visibility","visible").html(errMsg):errContainer.css("visibility","hidden").html(errMsg);
      }else{
          var parent=eleObj.parent();
         //默认情况下错误提示会插入到输入框父级的后面
          errTip=parent.next("."+this.settings.errTipClass);
          if(errTip.length==0 && !invali){
           errTip=$('<div class="'+this.settings.errTipClass+'">'+errMsg+'</div>').insertAfter(parent);
          }else{
           !invali?errTip.html(errMsg).show():errTip.hide();
          }
      }
    },
    //获取输入框 radio checkbox 选中的真实值
    elementValue:function(element){
      var eleObj=$(element);
      var type= eleObj.attr("type"),
      val =eleObj.hasClass(this.settings.initMsgClass)?'':eleObj.val();
      if(type ==="radio" || type === "checkbox"){
        return $('input[name="' +eleObj.attr('name') + '"]:checked').val();
      }
     if (typeof val === "string"){
         return val.replace(/\r/g, "");
      }
      return val;
    },
    //验证input输入框。比如说是text password等,不包含radio checkbox select等非输入框
    valiInput:function(){
     var that=this;
     //失去焦点/键盘抬起
     this.currentForm
     .delegate(":text, [type='password'], [type='file'], select, textarea, " +
				"[type='number'], [type='search'] ,[type='tel'], [type='url'], " +
				"[type='email'],[type='range'],[type='color']",this.settings.keyupEvent?"blur keyup":"blur",function(){
                  var _this=$(this);
                  _this.removeClass(that.settings.focusClass);
                  if(_this.attr("data-msg") && !(_this.val())){
                     _this.val(_this.attr("data-msg")).addClass(that.settings.initMsgClass);
                   }
                   if(_this.attr("type").toLowerCase()=="password" && !(_this.val())){
                      var pwHolder=_this.parent().prev(".pw-holder");
                      pwHolder.length>0 && pwHolder.show();
                   }
                  //that.validateor(this);
                });
      //获取焦点
      this.currentForm
     .delegate(":text, [type='password'], [type='file'], select, textarea, " +
				"[type='number'], [type='search'] ,[type='tel'], [type='url'], " +
				"[type='email'],[type='range'],[type='color']","focus",function(){
                   var _this=$(this);
                   if(_this.hasClass(that.settings.initMsgClass)){
                     _this.val('');
                   }
                  if(_this.attr("type").toLowerCase()=="password"){
                    var pwHolder=_this.parent().prev(".pw-holder");
                     pwHolder.length>0 && pwHolder.hide();
                  }
                   _this.removeClass(that.settings.errClass).removeClass(that.settings.initMsgClass)
                   .addClass(that.settings.focusClass);
                   that.errorNotify(this,true);
                });
      //点击密码place-holder
      this.currentForm.delegate(".pw-holder","click",function(e){
          var _this=$(this),input=_this.next().find("input");
           if(input.length==0){
            input=_this.parent().find("input");
          }
          input[0].focus();
          e.stopPropagation();
      });
    },
    //验证radio check select以及class是noingore的元素
    valiSelect:function(){
     var that=this;
      this.currentForm
      .delegate("[type='radio'], [type='checkbox'],[data-trigger='click']","click",function(e){
        that.validateor(this);
        //e.stopPropagation();
      }).delegate("select","change",function(e){
        that.validateor(this); 
      });
    },
    //提交验证表单
    vailForm:function(){
      var that=this,form=this.currentForm;
      var submitBtn=this.settings.submitBtn?this.settings.submitBtn:":submit";
      form.delegate(submitBtn,"click",function(e){
        that.settings.debug && e.preventDefault();
        if(that.settings.autoReset) {that.validatElementsList();}
        var inValil=true;
        that.elementLists.each(function(){
         var vali=that.validateor(this);
         if(vali!=true){
           inValil=false;
           if(that.settings.valiBreak) return false;
         }
       });
       if(inValil===true){
         if($.isFunction(that.settings.submitHandler)){
            that.settings.submitHandler.call(form,$(submitBtn));
            e.preventDefault();
         }
       }else{
         $.isFunction(that.settings.invalidHandler) && that.settings.invalidHandler.call(form,form);
         e.preventDefault();
       }
       e.stopPropagation();
     });
    }
  };
  w.validate=validate;
})(window.jQuery,window);