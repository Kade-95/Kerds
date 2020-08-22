module.exports = class Sessions {
    constructor(key, params) {
        this.key = key;
        this.time;
        this.active = false;
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