/**
 * Created by wuqingkai on 17/5/25.
 */
var pomelo = require('pomelo');
var util = require('util');
var logger = require('pomelo-logger').getLogger('DropMgr', __filename);
var dropJson = require('../json/drop');
var dropGroupJson = require('../json/dropGroup');

var DROP_NUM    = 'dropNum';
var ALL_DROP    = 'allDrop';
var ITEMS       = 'items';
var PERCENT     = 'percent';
var ITEM_ID     = 'itemId';
var ITEM_NUM    = 'itemNum';
var DROP_IDS    = 'dropIds';
var DROP_ID     = 'dropId';
var NO_REPEAT   = 'noRepeat';

var DropObj = function(dropJ, isGroup) {
    this.allPercent = 0;
    this.itemPercent = [];
    var self = this, arr = [], key = null;
    if (!isGroup) {
        arr = dropJ[ITEMS];
        key = ITEM_ID;
    } else {
        arr = dropJ[DROP_IDS];
        key = DROP_ID;
    }
    arr.forEach((dropG)=>{
        var iPer = {};
        iPer[key] = dropG[key];
        if (!!dropG[ITEM_NUM]) {
            iPer[ITEM_NUM] = dropG[ITEM_NUM];
        }
        iPer[PERCENT] = self.allPercent;
        self.itemPercent.push(iPer);
        self.allPercent += dropG[PERCENT];
    });
    self[DROP_NUM] = dropJ[DROP_NUM];
    self[ALL_DROP] = !!dropJ[ALL_DROP] ? 1 : 0;
    self[NO_REPEAT] = !!dropJ[NO_REPEAT] ? 1 : 0;
};

var DropMgr = function() {
    this.dropObjMap = {};
    this.dropGroupMap = {};
};
var pro = DropMgr.prototype;

/**
 * 初始化
 */
pro.init = function() {
    var self = this;
    for (let key in dropJson) {
        var dropJ = dropJson[key];
        if (!dropJ[DROP_NUM] && !dropJ[ALL_DROP]) {
            logger.warn(`dropNum is undefined!key = ${key}`);
            continue;
        } else if (!dropJ[ITEMS]) {
            logger.warn(`items is undefined!key = ${key}`);
            continue;
        }
        self.dropObjMap[key] = new DropObj(dropJ);
    }
    //console.error(self.dropObjMap['s100002']);
    for (let key in dropGroupJson) {
        var dropGroup = dropGroupJson[key];
        if (!dropGroup[DROP_NUM] && !dropGroup[ALL_DROP]) {
            logger.warn(`dropNum is undefined!key = ${key}`);
            continue;
        } else if (!dropGroup[DROP_IDS]) {
            logger.warn(`dropIds is undefined!key = ${key}`);
            continue;
        }
        self.dropGroupMap[key] = new DropObj(dropGroup, true);
    }
    //console.error(self.dropGroupMap['s100003']);
};

/**
 * 根据掉落组ID,获得掉落
 * @param dropId
 * @returns {*}
 */
pro.drop = function(dropId) {
    return getDrop(this.dropObjMap[dropId]);
};

/**
 * 根据掉落组集ID,获得掉落
 * @param groupId
 * @returns {*}
 */
pro.groupDrop = function(groupId) {
    var groupResult = getDrop(this.dropGroupMap[groupId]);
    if (!groupResult)
        return null;
    var self = this;
    var result = [];
    groupResult.forEach((dropJ)=>{
        result = result.concat(getDrop(self.dropObjMap[dropJ[DROP_ID]]));
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
       return _getItems(dropObj.itemPercent);
    }
    var result = [];
    if(dropObj[NO_REPEAT]) {
        var dropObj = _cloneObj(dropObj);
        var arr = dropObj.itemPercent, allPercent = dropObj.allPercent;
        var count = 0, length = arr.length;
        while (count++ < dropObj[DROP_NUM]) {
            var size = length - count;
            var rand = Math.floor(Math.random() * allPercent);
            for (let i = size; i >= 0; i--) {
                var currentPercent = arr[i][PERCENT];
                if (rand < currentPercent)
                    continue;
                result.push(_getItems(arr[i]));
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
            for (let j = dropObj.itemPercent.length - 1; j >= 0; j--) {
                if (rand < dropObj.itemPercent[j][PERCENT])
                    continue;
                result.push(_getItems(dropObj.itemPercent[j]));
                break;
            }
        }
    }
    return result;
};

/**
 * 获得掉落组中的ITEM_ID和ITEM_NUM或者掉落组集中的DROP_ID
 * @param itemPercent
 * @returns {Array}
 * @private
 */
var _getItems = function(itemPercent) {
    var _getItem = function(itmPct) {
        var item = {};
        if (!!itmPct[ITEM_ID]) {
            item[ITEM_ID] = itmPct[ITEM_ID];
            item[ITEM_NUM] = itmPct[ITEM_NUM];
        } else {
            item[DROP_ID] = itmPct[DROP_ID];
        }
        return item;
    };
    if (!util.isArray(itemPercent)) {
        return _getItem(itemPercent);
    } else {
        var items = [];
        itemPercent.forEach((itmPct)=>{
           items.push(_getItem(itmPct));
        });
        return items;
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
    if (util.isArray(obj)) {
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

module.exports = new DropMgr();