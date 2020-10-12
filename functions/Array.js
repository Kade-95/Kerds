module.exports = function ArrayLibrary() {
    let self = {};

    self.combine = (haystack, first, second, pos) => {//used to get what is between two items at a particular occurrance in an Array and the items combined
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

    self.inBetween = (haystack, first, second, pos) => {//used to get what is between two items at a particular occurrance in an Array
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

    self.contains = (haystack, needle) => {//used to check if an Array has an item
        let flag = false;//set flag to false
        for (let i in haystack) {
            if (haystack[i] == needle) {//if found breakout
                return true;
            }
        }
        return flag;
    }

    self.indexAt = (haystack, needle, pos) => {//used to get the index of an item at a particular occurrance
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

    self.find = (haystack, callback) => {//used as a higher order function to get an items that match the conditions
        for (let i in haystack) {
            if (callback(haystack[i]) == true) {
                return haystack[i];
            }
        }
    }

    self.findAll = (haystack, callback) => {//used as a higher order function to get all the items that match the conditions
        let values = [];
        for (let i in haystack) {
            if (callback(haystack[i]) == true) {
                values.push(haystack[i]);
            }
        }

        return values;
    }

    self.getObject = (haystack, key, value) => {//used to get an Object with an Item in a JsonArray
        let object;
        for (let i in haystack) {
            if (haystack[i][key] == value) object = haystack[i];
        }
        return object;
    }

    self.getAllObjects = (haystack, key, value) => {//used to get all occurrances of an Object with an Item in a JsonArray
        let newArray = [];
        for (let i in haystack) {
            if (haystack[i][key] == value) {
                newArray.push(haystack[i]);
            }
        }
        return newArray;
    }

    self.getAll = (haystack, needle) => {//used to all occurrances of an item in an Array
        let newArray = [];
        for (let i in haystack) {
            if (haystack[i] == needle) newArray.push(i);
        }
        return newArray;
    }

    self.removeAll = (haystack, needle) => {//used to remove instances of an item
        let newArray = [];
        for (let i of haystack) {
            if (i != needle) {
                newArray.push(i);
            }
        }
        return newArray;
    }

    self.putAt = (haystack = [], value, key = 0) => {//used to push an item into an index in Array
        let newArray = [];//storage
        for (let i in haystack) {
            if (i == key) {//matched
                newArray[i] = value;//push in the value
                let next = Math.floor(key);//check if it's a number

                if (isNaN(next)) {
                    next = key + 1;
                }
                else {
                    next++;
                }
                newArray[next] = haystack[i];//add the previous value
            }
            else {
                newArray[i] = haystack[i];
            }
        }

        return newArray;
    }

    self.pushArray = (haystack = [], needle, insert) => {//used to push in an item before another existing item in an Array
        let position = self.arrayIndex(haystack, needle);//get the existing item position
        let newArray = self.putAt(haystack, insert, position);//push in new item
        return newArray;
    }

    self.arrayIndex = (haystack = [], needle = []) => {//used to get position of an item in an Array
        for (let i in haystack) {
            if (JSON.stringify(haystack[i]) == JSON.stringify(needle)) {
                return i;
            }
        }
        return -1;
    }

    self.hasArray = (haystack = [], needle = []) => {//used to check if an Array is a sub-Array to another Array
        haystack = JSON.stringify(haystack);
        needle = JSON.stringify(needle);

        return haystack.indexOf(needle) != -1;
    }

    self.toObject = (array = [], key) => {//used to turn an JsonArray to an Object literal
        let object = {};//storage
        for (let i in array) {
            object[array[i][key]] = array[i];//store the intended [key, value]
            delete object[array[i][key]][key];//remove the key in the value
        }
        return object;
    }

    self.reshape = (params) => {//used to change the shape of an Array
        // Pending
    }

    self.randomPick = (array) => {//used to pick a random item from an Array
        return array[Math.floor(Math.random() * array.length)];
    };

    self.removeEmpty = (array = []) => {//used to truncate an Array
        let newArray = [];//storage
        for (let i in array) {
            if (Array.isArray(array[i]) && array[i].length > 0) {//if array go deep
                newArray.push(self.removeEmpty(array[i]));
            }
            else if (array[i] != undefined && array[i] != null && array[i] != 0 && array[i] != '') {//skip [undefined, null, 0, '']
                newArray.push(array[i]);
            }
        }
        return newArray;
    }

    self.each = (array = [], callback = () => { }) => {//used as a higher order Array function
        let newArray = [];//storage
        for (let i in array) {
            newArray.push(callback(array[i], i));//make changes to the item and store it.
        }
        return newArray;
    }

    self.hasArrayElement = (haystack = [], needle = []) => {//used to check if two arrays has an item in common
        let flag = false;
        for (let i in needle) {
            if (haystack.indexOf(needle[i]) != -1) {
                return true;
            }
        }
        return flag;
    }

    self.toSet = (haystack = []) => {//used to turn an Array into a set(Make sure there a no duplicates)
        let single = [];//storage
        for (let i in haystack) {//skip if already stored
            if (single.indexOf(haystack[i]) == -1) {
                single.push(haystack[i]);
            }
        }
        return single;
    }

    self.popIndex = (array = [], index) => {//used to remove an item at a position in an Array
        let newArray = [];//storage Array
        for (let i in array) {
            if (i != index) {//skip the position
                newArray.push(array[i]);
            }
        }
        return newArray;
    }

    self.dataType = (array = []) => {//used to get the datatypes inside an Array
        let type = typeof array[0];//get the indext type
        for (let i in array) {
            if (typeof array[i] != type) {//if two types do not match return mixed
                return 'mixed';
            }
        }
        return type;
    }

    return self;
}