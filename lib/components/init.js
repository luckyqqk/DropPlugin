/**
 * Created by wuqingkai on 17/4/1.
 */
var DropMgr = require("../DropMgr");

module.exports = function(app, opts) {
    DropMgr.init(app, opts);
    app.set('dropMgr', DropMgr, true);
    return DropMgr;
};

