/*!
	@Name：搜索选中
	@version：1.0.0
	@Author：zhongdexian
    @Website：https://github.com/xian107/autosearch
	@Time：2017-10-18
*/
;(function($) {
'use strict';
$.fn.autoSearch = function(option) {
	return this.each(function() {
        if(this.controller){
            this.controller.methods(option);
        }else {
            if($.isPlainObject(option)){
                this.controller = new AutoSearch(this, option);
            }
        }
	});
}; // 插件结束
function AutoSearch(auto_input,option) {
	this._setOption(option); //选项初始化
	this._setElem(auto_input); //生成HTML元素
	this._setStyle();  //设置宽高
	this._setSelected(); //初始化生成选中项的html
	this._setupInputView(auto_input); //注册input事件
	this._someEvent(); //注册事件
}
$.extend(AutoSearch.prototype,{
	_setOption: function(option) {
		this.option = this._setOption1st(option);
		this.cache = this._setOption2nd();
	},
	_setOption1st: function(option) {
		return $.extend({
			// 基本設定
            width: 'auto',                                // 下拉框的宽度，number 或 'auto'
            maxHeight: null,                              // 下拉框的宽度最大高度，number
            tagShow : "tags",                              // 选中值展示方式，tags，values
            selectType: 'single',                         // 单项、多选，multiple、single
            singleClose: true,							  // selectType为single时，是否选中一个后就关闭下拉框
            wrapperClass:'search-wrapper',                // 下拉框class
            inputWrapperClass:'search-box',               // 搜索外框的class
            tagsClass:'search-tags',                      // 选中框的class
            search_delete:'j_search_del',                 // 关闭选中项class
            direction:'down',                             // 下拉显示方向，'down' or 'up',
            data_attributes_id:"id",                      // 输出数据的格式
            data_attributes_title:"title",                // 输出数据的格式
            selectInitData:null,                          // 初始化选中的数组，如[{"id":123,"title","名字"}]
            selectedName:'searchName[]',                  // 选中项的name
            selectedType:'id',                            // 选中项的传值方式，id or title or json
            recommend:true,                               // 是否展示推荐，bool
            recommendShow:false,                          // 展示推荐是否每次都要重新加载，bool
            maxItems: false,                              // 展示推荐列表最大的行数number，false
            searchTips: '支持中文/简拼输入',               // 搜索提示语
            resultTips:'若需缩小范围，请输入更多信息',      // 搜索结果提示语
            // data
            recommenddata:[],                             // 推荐请求的数据array, ajax, function
            recommendParams: {},                          // 推荐请求的ajax参数，function, string, object
            recommendAjaxType: 'GET',                     // 推荐请求的ajax类型，string 'GET' or 'POST'
            data: [],                                     // 搜索请求的数据，array, ajax的url, function
            ajaxDataType: 'json',                         // 请求的ajax数据类型，string 'json' or 'xml'
            ajaxParams: {},                               // 搜索请求的ajax参数，function, string, object
            ajaxTimeout: 500,                             // 请求延迟时间number
            ajaxType: 'GET',                              // 搜索请求的ajax类型string 'GET' or 'POST'
            ajaxAsync: true,                              // 请求的ajax，异步或同步，bool
            // callback
            createTagsItemHandler: null,                  // 创建搜索列表项时的回调函数,配合tagsListStyle为customize时使用
            createOtherItemHandler: null,                  // 创建搜索列表项时的回调函数,配合tagsListStyle为other时使用
            beforeLoadRecommendDataHandler:null,          // 展示推荐装载数据之前的回调函数
            createRecommendItemHandler: null,             // 创建推荐列表项时的回调函数,配合recommendlistStyle为customize时使用
            matchRecommendHandler: null,            	  // 匹配推荐数据项的回调函数
            beforeLoadDataHandler: null,                  // 每次输入之后装载数据之前的回调函数
            matchHandler: null,            				  // 匹配数据项的回调函数
            createItemHandler: null,                      // 创建搜索列表项时的回调函数,配合listStyle为customize时使用
            afterSelectedHandler: null,                   // 列表项被选择之后的回调函数
            //style
            tagsListStyle:'normal', //选中项的展示样式，'normal','values','customize'(这个需与createTagsItemHandler一同使用）','other'(这个需与createOtherItemHandler一同使用),
            recommendlistStyle:'normal', //推荐列表的展示样式，'normal','customize(这个需与createRecommendItemHandler一同使用）'
            listStyle: 'normal', //搜索列表的展示样式，'normal', 'customize(这个需与createItemHandler一同使用）'

            // debug
            onerror: null                                 // 出错调试function
		}, option);
	},
	_setOption2nd: function() {	
        if(this.option.tagShow == "values" && (this.option.tagsListStyle != "normal" || this.option.tagsListStyle != "customize")){
            this.option.tagsListStyle = "values";
        }
		var cache = {};
		//临时存储选中的data
		cache.cacheDate = JSON.parse(JSON.stringify(this.option.selectInitData)) || [];
		//是否已经加载完了推荐列表
		cache.isLoad = false;
		return cache;
	},
	_setElem: function(auto_input) {
		var self = this;
		//1. 生成搜索框元素
		var elem = {};
		elem.auto_input = $(auto_input)
		.attr('autocomplete', 'off')
		.wrap('<div>'); // 搜索外框
		elem.inputWrapper = elem.auto_input.parent().addClass(self.option.inputWrapperClass);
		//2. 生成下拉框元素
		elem.wrapper   = $('<div class="'+ this.option.wrapperClass +'" />').appendTo('body');
		elem.container = $('<div class="search-container" />').appendTo(elem.wrapper);
		elem.tips      = $('<div class="search-tips"><i class="search-close"></i></div>').appendTo(elem.container);
		elem.tips_tit  = $('<span class="search-tips-tit">'+ this.option.searchTips +'</span>').appendTo(elem.tips);
		elem.result    = $('<ul class="search-result" />').appendTo(elem.container);
		elem.content   = $('<div class="search-content" />').appendTo(elem.container);
		this.elem = elem;
	},
	_setStyle : function(){
		var self = this;
		if(self.option.maxHeight > 0){
            self.elem.container.css('max-height', self.option.maxHeight+"px");
        }           
        // 计算并设定补全列表的宽度
        var width="";
        if(typeof (self.option.width) === 'string' && self.option.width.toLowerCase() === 'auto'){
            width = self.elem.inputWrapper.outerWidth() - 2;
        } else if(typeof(self.option.width) === 'number'){
            width =  self.option.width;
        } else {
            throw '遇到未知的width参数！';
        }
        self.elem.wrapper.css("width", width+'px');
	},
	_setSelected: function(){
		var self = this;
		var initData = self.cache.cacheDate;			
		if($.isArray(initData) && initData.length != 0){
			switch(self.option.selectType){
				case "single" :					
					initData.length = 1;
					self._setTagsElem(initData[0]);
					break;
				case "multiple" :
					for(var i=0;i<initData.length;i++){
						self._setTagsElem(initData[i]);
					}
					break;
			}
		}
	},
	_setTagsElem: function(data){
        var html = "",self = this;
        switch(self.option.tagsListStyle){
            case 'normal':              
                html += '<span class="'+ self.option.tagsClass +'" data-id="'+ data[self.option.data_attributes_id] +'" data-title="'+ data[self.option.data_attributes_title] +'">'+ data[self.option.data_attributes_title] +'<i class="search-del '+ self.option.search_delete +'"></i><input type="hidden" name="'+ self.option.selectedName +'" value="';
                switch(self.option.selectedType){
                    case "id":
                        html += data[self.option.data_attributes_id];
                        break;
                    case "title":
                        html += data[self.option.data_attributes_title];
                        break;
                    case "json":
                        html += "{\'" + [self.option.data_attributes_id] + "\':\'"+ data[self.option.data_attributes_id] +"\',\'" + [self.option.data_attributes_title] + "\':\'"+ data[self.option.data_attributes_title] +"\'}";
                        break;
                }
                html += '"></span>';
                self.elem.auto_input.before(html);
                break;
            case 'customize':
                html += self.option.createTagsItemHandler(data,self.cache.cacheDate);
                self.elem.auto_input.before(html);
            case 'values':
                if(self.option.selectType == "single"){
                    self.elem.auto_input.val(data[self.option.data_attributes_title]);
                }else if(self.option.selectType == "multiple"){
                    var title = self.elem.auto_input.val() + "," + data[self.option.data_attributes_title];
                    self.elem.auto_input.val(title);
                }
            case 'other':
                self.option.createOtherItemHandler(data,self.cache.cacheDate);                         
            case 'default':
                break;                       
        };
        
	},
	_someEvent: function(){
		var self = this;
		//删除选中项
		self.elem.inputWrapper.on("click.searchDel","." + self.option.search_delete, function(e){
			e.stopPropagation();
			self._delTagsElem(this);
			return false;
		});
		//点击推荐项
		self.elem.content.on('click.recommendList','.'+self.option.recommendlistStyle, function(e){
			e.stopPropagation();
			self._clickFun(this);
            return false;
        });
		//点击搜索结果项
        self.elem.result.on('click.searchList','.'+self.option.listStyle, function(e){
        	e.stopPropagation();
        	self._clickFun(this);
            return false;
        });      
        //点击下拉框口头部的x,关闭下拉窗口
        self.elem.tips.on('click.searchClose','.search-close', function(e){
        	e.stopPropagation();
        	self._emptySearchView();
        });     
		$(window).resize(function(){
            self._locateSearch();
        });
	},
	_clickFun : function(that){
		var $this = $(that);
		var self = this;
		var data = {};
		if(!$this.hasClass("cur")){
        	switch(self.option.selectType){
				case "single" :	
                    if(self.option.tagShow === "tags"){
					   $this.addClass('cur').siblings().removeClass("cur");
                       self._singleDelete();
                    } 			
					if(self.option.singleClose){
						self._emptySearchView();
					}
					break;
				case "multiple" :
                    if(self.option.tagShow === "tags"){
    					$this.addClass('cur');
                    }
					break;
			}
			data[self.option.data_attributes_id] = $this.attr("data-id");
			data[self.option.data_attributes_title] = $this.attr("data-title");
        	self._select(data);
		}
	},
	_select: function(data){
        this.cache.cacheDate.push(data);
		this._setTagsElem(data);

		// 计算绝对位置
        this._locateSearch();
		//callback
		if ($.isFunction(this.option.afterSelectedHandler)) {
            try{
                this.option.afterSelectedHandler(data);
            } catch(e) {
                this._error('调用afterSelectedHandler错误:'+e);
                return;
            }
        }
	},
	_singleDelete:function(){
		var self = this;
		self.elem.inputWrapper.find("." + self.option.search_delete).each(function(){
			self._delTagsElem(this);
		});			
	},
	_delTagsElem: function(self){
		var $this = $(self),
			$parent = $this.parents("." + this.option.tagsClass),	
			data_title = $parent.data("title");	
		$parent.remove();
		this.elem.container.find("[data-title='"+ data_title +"']").removeClass("cur");
		this._delselectedData(data_title);
	},
	_delselectedData: function(title){
		switch(this.option.selectType){
			case "single" :
				this.cache.cacheDate = [];
				break;
			case "multiple" :
				for(var i=0; i<this.cache.cacheDate.length;i++){
					if(this.cache.cacheDate[i][this.option.data_attributes_title]==title){
						this.cache.cacheDate.splice(i,1);
						break;
					}
				}
				break;
		}		
	},
	_setupInputView: function(auto_input){
		var self = this,timeout;
		var $input = self.elem.auto_input;
		if (!(auto_input.tagName === 'INPUT' && auto_input.type === 'text')) return;
		$input.on("click._click",function(event){
			//多选时，点击input输入框不关闭下拉搜索列表
			if(self.elem.result.children().length>0){
				return false;
			}
			//是否展示推荐
			if (self.option.recommend === false) return;
			self._loadRecommend();		
        })
        .on("keydown._keydown",function(event){     	
            switch(event.keyCode){
                case 38: // up
                    self._move.apply(self, ['up']);
                    break;
                case 40: // down
                    self._move.apply(self, ['down']);
                    break;
                case 13: // enter
                    var $box = self.elem.result.find(".selected");
                    if($box.length>0){
                    	self._clickFun($box);		
                    }                    
                    break;
            }
        })
		.on("keyup._keyup",function(event){
            switch(event.keyCode){
                case 13: // enter
                case 16: // shift
                case 17: // ctrl
                case 37: // left
                case 38: // up
                case 39: // right
                case 40: // down
                    break;
                case 27: // esc
                    self._emptySearchView();
                    break;
                default:
                if(timeout){
		            clearTimeout(timeout);
		        }
                timeout = setTimeout(function(){           
                   self._keyupData.call(self);
                }, self.option.ajaxTimeout);                  
            }
        })
        .on("blur._blur" , function(){    	
            //关闭下拉窗口
        	$(document).off('click.searchwrapper').on('click.searchwrapper', function(){
        		var isWrapperVisible = self.elem.wrapper.is(':visible');
        		if(isWrapperVisible){	 
		        	if (!self.elem.wrapper.is(event.target) && !self.elem.inputWrapper.is(event.target) && (self.elem.wrapper.has(event.target).length === 0) && (self.elem.inputWrapper.has(event.target).length === 0)){
						self._emptySearchView();
		        	}
	        	}     
	        });
        });       
	},
	_loadRecommend : function(){
		var self = this;
		//展示推荐是否每次都要重新加载
		if(!self.option.recommendShow && self.cache.isLoad){
			self._emptySearchView();
			self._showCommonView();
			return false;
		}
		//加载展示推荐
        self.cache.isLoad = self._recommendData();
	},
	_recommendData: function(){
		var self = this,
        	loadDataFlag = true;
        if ($.isFunction(self.option.beforeLoadRecommendDataHandler)) {
            try{
                loadDataFlag = self.option.beforeLoadRecommendDataHandler();
            } catch(e) {
                self._error('调用beforeLoadRecommendDataHandler错误:'+e);
                return;
            }
        }
        if(loadDataFlag){
        	self._getData(self.option.recommenddata,self._recommendElem,1);
        }
       	return true;
	},
	_keyupData: function(){
		var self = this,
		    value = self.elem.auto_input.val(),
        	loadDataFlag = true;
        if ($.isFunction(self.option.beforeLoadDataHandler)) {
            try{
                loadDataFlag = self.option.beforeLoadDataHandler(value);
            } catch(e) {
                self._error('调用beforeLoadDataHandler错误:'+e);
                return;
            }
        }
        if(loadDataFlag){
        	self._getData(self.option.data,self._keyupElem,2);
        }
	},
	_getData:function(data,callback,value){
		var self = this;
		var keyword = self.elem.auto_input.val();
		if ($.isArray(data)) {
            if(self.option.recommenddata.length == 0){
                self.option.recommend = false;
            }
			if(data.length == 0){
				self._error('data不能为空数组！');
				return false;
			}
            callback.call(self,data);
        } else if ($.isFunction(data)) {
            try{
                callback.apply(self,[data.apply(self,[keyword]),keyword]);
            } catch(e) {
                self._error('调用data错误:'+e);
                return;
            }
        } else if (typeof(self.option.data) === 'string') {
            try{
                self._ajaxSend(data,callback,value);
            } catch(e) {
                self._error('Ajax错误:'+e);
                return;
            }
        } else {
            self._error('遇到未知的data参数！');
            return;
        }
	},
	_ajaxSend: function(url,callback,value){
		var self = this,ajaxParams,keyword = encodeURIComponent(self.elem.auto_input.val());
		switch(value){
			case 1: 
                if ($.isPlainObject(self.option.recommendParams)) {
	            	ajaxParams = $.extend({}, self.option.recommendParams);
	        	} else if ($.isFunction(self.option.recommendParams)) {
		            ajaxParams = $.extend({}, self.option.recommendParams.apply(this));
		        } else if (typeof(self.option.recommendParams) === 'string') {
		            ajaxParams = self.option.recommendParams;
		        } 
            break;
            case 2: 
                if ($.isPlainObject(self.option.ajaxParams)) {
	            	ajaxParams = $.extend({}, {'keyword': keyword}, self.option.ajaxParams);
	        	} else if ($.isFunction(self.option.ajaxParams)) {
		            ajaxParams = $.extend({}, {'keyword': keyword}, self.option.ajaxParams.apply(this, [keyword]));
		        } else if (typeof(self.option.ajaxParams) === 'string') {
		            ajaxParams = "keyword=" + keyword + "&" + self.option.ajaxParams;
		        }     
            break;
        }
    	$.ajax({
     		type: value == 1 ? self.option.recommendAjaxType : self.option.ajaxType,
     		url:url,
     		data: ajaxParams,
     		dataType:self.option.ajaxDataType,
     		async: self.option.ajaxAsync,
     		success:function(data){
     			try{
     				if($.isArray(data)){
						callback.call(self,data);
         			}else if($.isArray(data.msg)){
						callback.call(self,data.msg);
         			}else{
         				self._error('输出数据格式data应该为数组或data.msg为数组');
         			}       				
                } catch(e) {
                    self._error('输出data错误:'+e);
                    return;
                }    						
     		}
     	}); 
	},		
	_recommendElem: function(data) {		
		var self = this,html="";
		if ($.isFunction(self.option.matchRecommendHandler)) {
            try{
                data = self.option.matchRecommendHandler(data);
            } catch(e) {
                self._error('调用matchRecommendHandler错误:'+e);
                return;
            }
        }
        if($.isArray(data)){
            if(data.length == 0){
                html += '<a href="javascript:;" class="search-empty">找不到相关的内容！</a>'
            }else{
                if(self.option.maxItems && data.length > self.option.maxItems){
                    data.length = self.option.maxItems;
                }
                switch(self.option.recommendlistStyle){
                    case 'normal':
                        for(var i=0;i<data.length;i++){  
                            html += '<a href="javascript:;" data-id="'+ data[i][self.option.data_attributes_id] +'" data-title="'+ data[i][self.option.data_attributes_title] +'" class="search-title">'+ data[i][self.option.data_attributes_title] +'</a>';
                        }
                        break;
                    case 'customize':
                        html += self.option.createRecommendItemHandler(data);
                    case 'default':
                        break;                       
                }
            }
        }else{
            self._error('调用的data格式不是数组');
            return false;
        }           
        self.elem.content.html(html);
        //列表加class
		self.elem.content.children().addClass(self.option.recommendlistStyle);
        self._emptySearchView();
        self._showCommonView();
	},
	_keyupElem: function(data) {
		var self = this,html="";
		var value = self.elem.auto_input.val();
		if ($.isFunction(self.option.matchHandler)) {
            try{
                var data = self.option.matchHandler(data,value);
            } catch(e) {
                self._error('调用matchHandler错误:'+e);
                return;
            }
        }
        if($.isArray(data)){
            if(data.length == 0){
                html += '<li class="search-empty">找不到相关的内容！</li>'
            }else{
                switch(self.option.listStyle){
                    case 'normal':
                        for(var i=0;i<data.length;i++){
                            html += '<li data-id="'+ data[i][self.option.data_attributes_id] +'" data-title="'+ data[i][self.option.data_attributes_title] +'">'+ data[i][self.option.data_attributes_title] +'</li>';
                        }
                        break;
                    case 'customize':
                        html += self.option.createItemHandler(data);
                    case 'default':
                        break;                         
                }
            }
        }else{
            self._error('调用的data格式不是数组');
            return false;
        }
        self.elem.result.html(html);
        //列表加class
		self.elem.result.children().addClass(self.option.listStyle);
        self.elem.result.show();
		self.elem.content.hide();
		self.elem.tips_tit.html(self.option.resultTips); 
        self._showCommonView();
	},
	_showCommonView:function(){
		var self = this;	
		//选中的项加Class
        if(self.option.tagShow === "tags"){
            var initData = self.cache.cacheDate;   
            for(var i=0;i<initData.length;i++){
                self.elem.container.find("[data-title='"+ initData[i][self.option.data_attributes_title] +"']").addClass("cur");
    		};
        }
		// 计算绝对位置
        self._locateSearch();
        self.elem.wrapper.show();
	},
	_locateSearch : function(){
        if(this.option.direction === 'down'){
            var top = this.elem.inputWrapper.offset().top + this.elem.inputWrapper.outerHeight();
        } else if(this.option.direction === 'up'){
            var top = this.elem.inputWrapper.offset().top - this.elem.wrapper.outerHeight();
        } else {
            throw '遇到未知的direction参数！';
        }
        var left = this.elem.inputWrapper.offset().left;
        this.elem.wrapper.css("top", top+"px").css("left", left+"px");
    },
    _move : function(dir){
    	var $box = this.elem.result;
    	var $children =	$box.children();
        var $selected = $box.find('.selected');
        var $container = this.elem.container;
        if ($selected.length){
            var nextSelected = dir === 'up' ? $selected.prev() : $selected.next();
        }else{
            var nextSelected = dir === 'up' ? $children.last() : $children.first();
        }	      
        if(nextSelected.length){
            $children.removeClass('selected');
            nextSelected.addClass("selected");
            var itemHeight = nextSelected.outerHeight();
            var itemTop = nextSelected.position().top;
            if(itemHeight + itemTop > $container.height()){
                $container.scrollTop($container.scrollTop() + itemTop + itemHeight - $container.height());
            }
            else if(itemTop < 0){
                $container.scrollTop($container.scrollTop() + itemTop);
            }
        }
    },
    _emptySearchView: function(){
		this.elem.result.empty().hide();
    	this.elem.wrapper.hide();
    	this.elem.content.show();
    	this.elem.tips_tit.html(this.option.searchTips);
        if(this.option.tagShow == "tags"){
            this.elem.auto_input.val("");
        } 	
	},
	_error: function(msg){
        if($.isFunction(this.option.onerror)){
            this.option.onerror(msg);
        }
    },
    /* ------- 以下共有可调用方法 ------------- */
    methods : function(option){
    	if ($.isPlainObject(option)) {
    		//可重置data等，ajax参数
            this.option = $.extend({}, this.option, option);
        } else if(typeof(option) === 'string'){
            switch(option){
                case 'destroy':
                    this.destroy();
                    break;
                case 'close':
                    this.close();
                    break;
                case 'openRecommend':
                    this.openRecommend();
                    break;
                case 'openSearch':
                    this.openSearch();
                    break;
                default:
                    this._error('未知的AutoSearch参数！');
                    return;
            }
        } else {
            this._error('未知的AutoSearch参数类型！');
            return;
        }
    },
    //关闭窗口
    close : function(){
    	this._emptySearchView();
    },
    //销毁
    destroy : function(){
    	this.elem.wrapper.remove();
        this.elem.auto_input.off("keyup._keyup").off("keydown._keydown").off("click._click").off("click.searchDel").off("click.searchwrapper");
        delete this.cache;
        delete this.elem.auto_input.get(0).controller;
    },
    //打开推荐列表
    openRecommend : function(){
    	this._loadRecommend();
    },
    //打开搜索列表
    openSearch : function(){
        this._keyupData();
    }
});
})(jQuery);