module.exports = function ArrayLibrary() {
    let self = {};

    self.combine = (haystack, first, second, pos) => {
        pos = pos || 0;//initialize position if not set
        let at1 = pos,
            at2 = first === second ? pos + 1 : pos; //check if it is the same and change position
        let start = self.indexAt(haystack, first, at1);//get the start
        let end = self.indexAt(haystack, second, at2) + 1;//get the end

        if (start == -1 || end == 0) {//null if one is not found
            return null;
        }

        return haystack.slice(start, end);
    }

    self.inBetween = (haystack, first, second, pos) => {
        pos = pos || 0;//initialize position if not set
        let at1 = pos,
            at2 = first === second ? pos + 1 : pos; //check if it is the same and change position
        let start = self.indexAt(haystack, first, at1) + 1;//get the start
        let end = self.indexAt(haystack, second, at2);//get the end

        if (start == 0 || end == -1) {//null if one is not found
            return null;
        }

        return haystack.slice(start, end);
    }

    self.contains = (haystack, needle) => {
        let flag = false;//set flag to false
        for (let i = 0; i < haystack.length; i++) {
            if (haystack[i] == needle) {//if found flag is true and breakout
                flag = true;
                break;
            }
        }
        return flag;
    }

    self.indexAt = (haystack, needle, pos) => {
        pos = pos || 0;
        let count = -1;
        for (let i = 0; i < haystack.length; i++) {
            if (haystack[i] == needle) {
                count++;

                if (count == pos) {
                    return i;
                }
            }
        }

        return -1;
    }

    self.find = (haystack, callback) => {
        for (let i in haystack) {
            if (callback(haystack[i]) == true) {
                return haystack[i];
            }
        }
    }

    self.findAll = (haystack, callback) => {
        let values = [];
        for (let i in haystack) {
            if (callback(haystack[i]) == true) {
                values.push(haystack[i]);
            }
        }

        return values;
    }

    self.getObject = (haystack, key, value) => {
        let found;
        for (let object of haystack) {
            if (object[key] == value) found = object;
        }
        return found;
    }

    self.getAll = (haystack, needle) => {
        let found = [];
        for (let key = 0; key < haystack.length; key++) {
            if (haystack[key] == needle) found.push(key);
        }
        return found;
    }

    self.removeAll = (haystack, needle) => {
        var isArray = Array.isArray(haystack);
        var value = (isArray) ? [] : '';
        for (var i of haystack) {
            if (i == needle) continue;
            (isArray) ? value.push(i) : value += i;
        }
        return value;
    }

    self.pushArray = (haystack, needle, insert) => {
        var position = self.arrayIndex(haystack, needle);
        var tmp = [];
        for (var i = 0; i < haystack.length; i++) {
            tmp.push(haystack[i]);
            if (i == position) {
                tmp.push(insert);
            }
        }
        return tmp;
    }

    self.arrayIndex = (haystack, needle) => {
        for (var x in haystack) {
            if (JSON.stringify(haystack[x]) == JSON.stringify(needle)) {
                return x;
            }
        }
        return false;
    }

    self.hasArray = (haystack, needle) => {
        haystack = JSON.stringify(haystack);
        needle = JSON.stringify(needle);

        return (haystack.indexOf(needle) >= 0) ? true : false;
    }

    self.toObject = (arr, key) => {
        let obj = {};
        for (let a of arr) {
            obj[a[key]] = a;
            delete obj[a[key]][key];
        }
        return obj;
    }

    self.reshape = (params) => {
        // Pending
    }

    self.randomPick = (array) => {
        return array[Math.floor(Math.random() * array.length)];
    };

    self.removeEmpty = (array) => {
        var newArray = [];
        array.forEach(value => {
            if (Array.isArray(value) && value.length > 0) {
                return self.removeEmpty(value);
            }
            else {
                if (value != undefined && value != null && value != 0 && value != '') newArray.push(value);
            }
        });
        return newArray;
    }

    self.each = (array, callback) => {
        let newArray = [];
        for (let i = 0; i < array.length; i++) {
            newArray.push(callback(array[i], i));
        }
        return newArray;
    }

    self.hasArrayElement = (haystack, needle) => {
        for (var i of needle) {
            if (haystack.indexOf(i) != -1) return true;
        }
        return false;
    }

    self.toSet = (haystack) => {
        var single = [];
        for (var x in haystack) {
            if (!self.contains(single, haystack[x])) {
                single.push(haystack[x]);
            }
        }
        return single;
    }

    self.popIndex = (array, index) => {
        let newArray = [];
        for (let i = 0; i < array.length; i++) {
            if (i == index) continue;
            newArray.push(array[i]);
        }
        return newArray;
    }

    return self;
}