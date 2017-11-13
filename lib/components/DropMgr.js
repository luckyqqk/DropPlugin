/**
 * Created by wuqingkai on 17/5/25.
 */
var pomelo = require('pomelo');
var util = require('util');
var path = require('path');
var logger = require('pomelo-logger').getLogger("pomelo");
module.exports = function(app, opts) {
    var dropMgr = new DropMgr(app, opts);
    app.set('dropMgr', dropMgr, true);
    return dropMgr;
};
// json 中的字段
var ALL_DROP    = 'allDrop';    // 全部掉落
var DROP_NUM    = 'dropNum';    // 掉落次数
var REPEAT      = 'repeat';     // 是否可以重复掉落
var IS_GROUP    = 'isGroup';    // 是否是掉落组集(二维掉落,先掉出掉落组,再掉落出物品)

var OUT         = 'out';        // 掉落产出
var OUT_ID      = 'outId';      // 产出id
var OUT_NUM     = 'outNum';     // 产出个数
var PERCENT     = 'percent';    // 权重

/**
 * 每条json均会转成一个DropObj对象
 * @param dropJ
 * @constructor
 */
var DropObj = function(dropJ) {
    this.allPercent = 0;
    this.outPercent = [];
    var self = this;
    dropJ[OUT].forEach((dropG)=>{
        var iPer        = {};
        iPer[OUT_ID]    = dropG[OUT_ID];
        iPer[OUT_NUM]   = dropG[OUT_NUM] || 1;
        iPer[PERCENT]   = self.allPercent;
        self.outPercent.push(iPer);
        self.allPercent += dropG[PERCENT];
    });
    self[DROP_NUM]  = dropJ[DROP_NUM];
    self[ALL_DROP]  = !!dropJ[ALL_DROP]     ? 1 : 0;
    self[REPEAT]    = !!dropJ[REPEAT]       ? 1 : 0;
    self[IS_GROUP]  = !!dropJ[IS_GROUP]     ? 1 : 0;
};

/**
 * 开服记录所有DropObj对象,提供接口掉落
 * @param app
 * @param opts
 * @constructor
 */
var DropMgr = function(app, opts) {
    this.name = 'DropMgr';
    this.app = app;
    this.dropJson = opts["dropJson"];
    this.dropObjMap = {};
};
var pro = DropMgr.prototype;
pro.start = function(cb) {
    var dropJson = require(path.join(this.app.getBase(), this.dropJson));
    var self = this;
    for (let key in dropJson) {
        var dropJ = dropJson[key];
        if (!dropJ[DROP_NUM] && !dropJ[ALL_DROP]) {
            logger.warn(`dropNum is undefined!key = ${key}`);
            continue;
        } else if (!dropJ[OUT]) {
            logger.warn(`out is undefined!key = ${key}`);
            continue;
        }
        self.dropObjMap[key] = new DropObj(dropJ);
    }
    //console.error(self.dropObjMap['140009']);
    //console.error(self.dropObjMap['10001']);
    //logger.debug(`${self.app.getServerId()} dropMgr startup`);
    cb();
    //console.error(self.drop('100005'));
    //console.error(self.drop('10001'));
};

/**
 * 根据掉落组ID,获得掉落
 * @param dropId
 * @returns {Array}
 */
pro.drop = function(dropId) {
    var dropObj = this.dropObjMap[dropId];
    var outs = getDrop(dropObj);
    if (!dropObj[IS_GROUP]) {
        return outs;
    }
    var self = this;
    var result = [];
    outs.forEach((dropJ)=>{
        result = result.concat(getDrop(self.dropObjMap[dropJ[OUT_ID]]));
    });
    return result;
};

/**
 * 根据dropObj获得对应掉落,不区分掉落组还是掉落组集.
 * @param dropObj
 * @returns {*}
 */
var getDrop = function(dropObj) {
    if (!dropObj) {
        return null;
    } else if (dropObj[ALL_DROP]) {
       return _getOuts(dropObj.outPercent);
    }
    var result = [];
    if(!dropObj[REPEAT]) {
        var dropObj = _cloneObj(dropObj);
        var arr = dropObj.outPercent, allPercent = dropObj.allPercent;
        var count = 0, length = arr.length;
        while (count++ < dropObj[DROP_NUM]) {
            var size = length - count;
            var rand = Math.floor(Math.random() * allPercent);
            for (let i = size; i >= 0; i--) {
                var currentPercent = arr[i][PERCENT];
                if (rand < currentPercent)
                    continue;
                result.push(_getOuts(arr[i]));
                if (i < size) {
                    var pct = arr[i + 1][PERCENT] - currentPercent;
                    for (let j = size; j > i; j--) {
                        arr[j][PERCENT] -= pct;
                    }
                    allPercent -= pct;
                } else {
                    allPercent = currentPercent;
                }
                arr.splice(i, 1);
                break;
            }
        }
        arr = null;
        dropObj = null;
    } else {
        for (let i = 0, count = dropObj[DROP_NUM]; i < count; i++) {
            var rand = Math.floor(Math.random() * dropObj.allPercent);
            for (let j = dropObj.outPercent.length - 1; j >= 0; j--) {
                if (rand < dropObj.outPercent[j][PERCENT])
                    continue;
                result.push(_getOuts(dropObj.outPercent[j]));
                break;
            }
        }
    }
    return result;
};

/**
 * 获得掉落组中的OUT_ID和OUT_NUM
 * @param   {Array} outPercent
 * @private
 */
var _getOuts = function(outPercent) {
    var _getOut = function(outPct) {
        var out = {};
        out[OUT_ID] = outPct[OUT_ID];
        out[OUT_NUM] = outPct[OUT_NUM];
        return out;
    };
    if (!Array.isArray(outPercent)) {
        return _getOut(outPercent);
    } else {
        var outs = [];
        outPercent.forEach((outPct)=>{
            outs.push(_getOut(outPct));
        });
        return outs;
    }
};

/**
 * 克隆对象
 * @param obj
 * @returns {*}
 * @private
 */
var _cloneObj = function(obj) {
    if (obj == null)
        return null;
    else if (typeof obj !== "object")
        return obj;     // 基本数值类型直接返回
    var res;
    if (Array.isArray(obj)) {
        res = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            res.push(_cloneObj(obj[i]));
        }
    } else {
        res = {};
        for (var j in obj) {
            res[j] = _cloneObj(obj[j]);
        }
    }
    return res;
};