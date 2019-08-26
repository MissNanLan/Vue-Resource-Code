(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
        typeof define === 'function' && define.amd ? define(factory) :
            (global.Vue = factory());
})(this, function () {

    var warn = function (msg) {
        console.error("[Vue warn]" + msg)
    }

    var config = {
        // 自定义的策略
        optionMergeStrategies: {}

    }
    var starts = config.optionMergeStrategies;

    var uid = 0;

    starts.el = function (parent, child, vm, key) {
        if (!vm) { // 
            warn("选项" + key + "只能在实例中使用")
        }
        return defaultStrat(parent, child);

    }

    // 做判断
    function resolveConstructorOptions(Con) {
        var options = Con.options;
        // ...
        return options;
    }

    // 检测key 是否在makeup
    function makeMap(str, tolowerCase) {
        var map = {};
        var list = str.split(",");
        for (var i = 0; i < list.length; i++) {
            map[list[i]] = true;
        }
        return tolowerCase ? function (val) {
            return map[val.toLowerCase()];
        } : function (val) {
            return map[val];
        }
    }

    var hasOwnProperty = Object.prototype.hasOwnProperty;

    // 判断是不是存在传过来的属性
    function hasOwn(obj, key) {
        return hasOwnProperty.call(obj, key)
    }


    var isHTMLTag = makeMap(
        'html,body,base,head,link,meta,style,title,' +
        'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
        'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
        'a,b,abbr,bdi,bdo,br,cite,code,data,dfnem,i,kbd,mark,q,rp,rt,rtc,ruby,' +
        's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
        'embed,object,param,source,canvas,script,noscript,del,ins,' +
        'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
        'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
        'output,progress,select,textarea,' +
        'details,dialog,menu,menuitem,summary,' +
        'content,element,shadow,template,blockquote,iframe,tfoot'
    );

    // this map is intentionally selective, only covering SVG elements that may
    // contain child elements.
    var isSVG = makeMap(
        'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
        'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
        'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
        true
    );
    /**
         * Check if a tag is a built-in tag.
         */
    var isBuiltInTag = makeMap('slot,component', true);

    var isReServedTag = function (tag) {
        return isSVG(tag) || isHTMLTag(tag)
    }



    //  验证components name的合法性
    function validataComponentName(key) {
        // 1.不能使用vue的内置标签，slot、compontents
        // 2.不能使用html标签
        // 3.component必须是由字母或中横线组成，且字母开头
        if (!/^[a-zA-Z][\w-]*$/.test(key)) {
            warn("组件的名称必须是由字母或中横线组成，且必须是由字母开头")
        }
        if (isBuiltInTag(key) || isReServedTag(key)) {
            warn(
                'Do not use built-in or reserved HTML elements as component ' +
                'id: ' + key
            );
        }
    }

    // 检测components是否规范
    function checkComponents(options) {
        for (var key in options.components) {
            validataComponentName(key)
        }
    }

    // 规范检测与选项合并，一个或者多个对象合并并且生成一个新的对象
    function mergeOptions(parent, child, vm) {
        // parent这里指的是默认的参数
   
        checkComponents(child);
        var options = {};
        var key;
        for (key in parent) {
            mergeField(key);
        }
        for (key in child) {
            if (!hasOwn(parent, key)) {
                mergeField(key);
            }

        }
        // 默认策略
        function mergeField(key) {
         
            // 以默认为优先，以用户配置为覆盖
            var result = starts[key] || defaultStrat;
            options[key] = result(parent[key], child[key], vm, key);
        }
        console.log(options);
        return options;
    }



    function defaultStrat(parent, child) {
        child === undefined ? parent : child
    }

    function initMixin(Vue) {
        Vue.prototype._init = function (options) {
            var vm = this;
            vm._uid = uid++;


            // 传入的options对象合并
            mergeOptions(resolveConstructorOptions(vm.constructor), options, vm)
        }
    }

    function Vue(options) {
        // 安全机制
        if (!(this instanceof Vue)) {
            warn("Vue是一个构造函数，应该用new关键字调用")
        }
        this._init(options); // 初始化选项 1.规范 2.合并

    }


    initMixin(Vue); //  初始化选项:  1:规范 2:合并策略

    Vue.options = {
        components: {},
        directives: {},
        _base: Vue
    }
    return Vue;
})

