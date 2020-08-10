let Func = require('./Func.js');
let Database = require('./Database.js');

let func = new Func();

module.exports = class Sessions {
    constructor(key, params) {
        this.key = key;
        this.time;
        this.active = false;
        // this.db = new Database(params.server)
    }

    set(item) {
        for (let i in item) {
            this[i] = item[i];
        }
    }

    unset(item) {
        for (var i of item) delete this[i];
    }
}