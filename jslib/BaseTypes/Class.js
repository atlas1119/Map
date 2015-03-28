/*
Copyright (c) 2012-2013, shaojun wang
Atlas JavaScript library for canvas maps. 
V0.0
*/

Atlas.Class = function () { };
/*
* 参照OpenLayers的写法
*/
Atlas.Class.extend = function (props) {

    // extended class with the new prototype
    var NewClass = function () {
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }
    };

    // instantiate class without calling constructor
    var F = function () { };
    F.prototype = this.prototype;

    var proto = new F();
    proto.constructor = NewClass;

    NewClass.prototype = proto;

    //inherit parent's statics
    for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype') {
            NewClass[i] = this[i];
        }
    }

    // mix static properties into the class
    if (props.statics) {
        Atlas.Util.extend(NewClass, props.statics);
        delete props.statics;
    }

    // mix includes into the prototype
    if (props.includes) {
        Atlas.Util.extend.apply(null, [proto].concat(props.includes));
        delete props.includes;
    }

    // merge options
    if (props.options && proto.options) {
        props.options = Atlas.Util.extend({}, proto.options, props.options);
    }

    // mix given properties into the prototype
    Atlas.Util.extend(proto, props);

    return NewClass;
};


// 在原型中添加属性
Atlas.Class.include = function (props) {
    Atlas.Util.extend(this.prototype, props);
};

//合并options
Atlas.Class.mergeOptions = function (options) {
    Atlas.Util.extend(this.prototype.options, options);
};