let ArrayLibrary = require('./../functions/Array');
module.exports =function ObjectLibrary() {
    let self = {};
    self.arrayLibrary = ArrayLibrary();

    self.extractFromJsonArray = (meta, source) => {
        let keys = Object.keys(meta);
        let values = Object.keys(meta).map(key => {
            return meta[key];
        });
        let eSource = [];
        if (source != undefined) {
            for (let obj of source) {
                let object = {};
                eSource.push(object);

                for (let i in keys) {
                    if (self.arrayLibrary.contains(Object.keys(obj), values[i])) {
                        object[keys[i]] = obj[values[i]];
                    }
                }
            }
            return eSource;
        }
    }

    self.find = (obj, callback) => {
        for (let i in obj) {
            if (callback(obj[i]) == true) {
                return obj[i];
            }
        }
    }

    self.findAll = (obj, callback) => {
        let values = {};
        for (let i in obj) {
            if (callback(obj[i]) == true)
                values[i] = obj[i];
        }

        return values;
    }

    self.makeIterable = (obj) => {
        obj[Symbol.iterator] = function* () {
            let properties = Object.keys(obj);
            for (let p of properties) {
                yield this[p];
            }
        }
        return obj;
    }

    self.max = (obj) => {
        let objValues = Object.values(obj);
        let max = Math.max(...objValues);
        let maxPosition = objValues.indexOf(max);
        let key, value;
        Object.keys(obj).map((k, pos) => {
            if (pos == maxPosition) {
                key = k;
                value = obj[k];
            }
        })
        return { key, value };
    }

    self.min = (obj) => {
        let objValues = Object.values(obj);
        let min = Math.min(...objValues);
        let minPosition = objValues.indexOf(min);
        let key, value;
        Object.keys(obj).map((k, pos) => {
            if (pos == minPosition) {
                key = k;
                value = obj[k];
            }
        })
        return { key, value };
    }

    self.onChanged = (obj, callback) => {
        const handler = {
            get(target, property, receiver) {
                try {
                    return new Proxy(target[property], handler);
                } catch (err) {
                    return Reflect.get(target, property, receiver);
                }
            },
            defineProperty(target, property, descriptor) {
                callback(target, property);
                return Reflect.defineProperty(target, property, descriptor);
            },
            deleteProperty(target, property) {
                callback(target, property);
                return Reflect.deleteProperty(target, property);
            }
        };

        return new Proxy(obj, handler);
    }

    self.toNamedArray = (obj) => {
        var arr = [];
        Object.keys(obj).map((key) => {
            arr[key] = obj[key];
        });
        return arr;
    }

    self.toArray = (obj) => {
        var arr = [];
        Object.keys(obj).map((key) => {
            arr.push(obj[key]);
        });
        return arr;
    }

    self.valueOfObjectArray = (objArray, name) => {
        var arr = [];
        for (let i = 0; i < objArray.length; i++) {
            arr.push(objArray[i][name]);
        }
        return arr;
    }

    self.keysOfObjectArray = (objArray) => {
        var arr = [];
        for (let i = 0; i < objArray.length; i++) {
            arr = arr.concat(Object.keys(objArray[i]));
        }
        return self.arrayLibrary.toSet(arr);
    }

    self.objectOfObjectArray = (objArray, id, name) => {
        var obj = {};
        for (let i = 0; i < objArray.length; i++) {
            obj[objArray[i][id]] = objArray[i][name];
        }
        return obj;
    }

    self.copy = (from, to) => {
        Object.keys(from).map(key => {
            to[key] = from[key];
        });
    }

    self.forEach = (object, callback) => {
        for (let key in object) {
            callback(object[key], key);
        }
    }

    self.each = function (object, callback) {
        let newObject = {};
        for (let key in object) {
            newObject[key] = callback(object[key], key);
        }
        return newObject;
    }

    self.getObjectArrayKeys = (array) => {
        let keys = [];
        for (let object of array) {
            for (let i of Object.keys(object)) {
                if (!keys.includes(i)) {
                    keys.push(i);
                }
            }
        }

        return keys;
    }

    self.checkMatch = (data, sample) => {
        let flag;
        for (let name in sample) {
            flag = JSON.stringify(sample[name]) == JSON.stringify(data[name]);//convert to json and compare
            if (!flag) break;
        }

        return flag;
    }

    self.getMatched = (data, sample) => {
        let matched = [], flag = true;
        for (let i in data) {
            flag = self.checkMatch(data[i], sample);//check each object
            if (!flag) continue;
            matched.push(data[i]);
        }

        return matched
    }

    return self;
}