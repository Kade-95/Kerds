let Func = require('./Func');
let Database = require('./Database');

let func = new Func();

module.exports = class Sessions {
    constructor(key) {
        this.key = key;
        this.time;
        this.active = false;
    }

    set(item) {        
        for(let i in item){
            this[i] = item[i];
        }        
    }

    unset(item) {
        for (var i of item) delete this[i];
    }
}