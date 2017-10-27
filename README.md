// 基本設定<br>
width: 'auto',                                // 下拉框的宽度，number 或 'auto'<br>
maxHeight: null,                              // 下拉框的宽度最大高度，number<br>
selectType: 'single',                         // 单项、多选，multiple、single<br>
singleClose: true,							  // selectType为single时，是否选中一个后就关闭下拉框<br>
wrapperClass:'search-wrapper',                // 下拉框class<br>
inputWrapperClass:'search-box',               // 搜索外框的class<br>
tagsClass:'search-tags',                      // 选中框的class<br>
direction:'down',                             // 下拉显示方向，'down' or 'up'<br>
selectInitData:null,                          // 初始化选中的数组，如[{"id":123,"title","名字"}]<br>
selectedName:'searchName[]',                  // 选中项的name<br>
selectedType:'id',                            // 选中项的传值方式，id or title or json<br>
recommend:true,                               // 是否展示推荐，bool<br>
recommendShow:false,                          // 展示推荐是否每次都要重新加载，bool<br>
maxItems: false,                              // 展示推荐列表最大的行数number，false<br>
searchTips: '支持中文/简拼输入',               // 搜索提示语<br>
resultTips:'若需缩小范围，请输入更多信息',      // 搜索结果提示语<br>
// data<br>
recommenddata:[],                             // 推荐请求的数据array, ajax, function<br>
recommendParams: {},                          // 推荐请求的ajax参数，function, string, object<br>
recommendAjaxType: 'GET',                     // 推荐请求的ajax类型，string 'GET' or 'POST'<br>
data: [],                                     // 搜索请求的数据，array, ajax的url, function<br>
ajaxDataType: 'json',                         // 请求的ajax数据类型，string 'json' or 'xml'<br>
ajaxParams: {},                               // 搜索请求的ajax参数，function, string, object<br>
ajaxTimeout: 500,                             // 请求延迟时间number<br>
ajaxType: 'GET',                              // 搜索请求的ajax类型string 'GET' or 'POST'<br>
ajaxAsync: true,                              // 请求的ajax，异步或同步，bool<br>
// callback<br>
createTagsItemHandler: null,                  // 创建搜索列表项时的回调函数,配合tagsListStyle为customize时使用<br>
beforeLoadRecommendDataHandler:null,          // 展示推荐装载数据之前的回调函数<br>
createRecommendItemHandler: null,             // 创建推荐列表项时的回调函数,配合recommendlistStyle为customize时使用<br>
matchRecommendHandler: null,            	  // 匹配推荐数据项的回调函数<br>
beforeLoadDataHandler: null,                  // 每次输入之后装载数据之前的回调函数<br>
matchHandler: null,            				  // 匹配数据项的回调函数<br>
createItemHandler: null,                      // 创建搜索列表项时的回调函数,配合listStyle为customize时使用<br>
afterSelectedHandler: null,                   // 列表项被选择之后的回调函数<br>
//style<br>
tagsListStyle:'normal', //选中项的展示样式，'normal','customize(这个需与createTagsItemHandler一同使用）'<br>
recommendlistStyle:'normal', //推荐列表的展示样式，'normal','customize(这个需与createRecommendItemHandler一同使用）'<br>
listStyle: 'normal', //搜索列表的展示样式，'normal', 'customize(这个需与createItemHandler一同使用）'<br>
<br>
// debug<br>
onerror: null                                 // 出错调试function<br>
