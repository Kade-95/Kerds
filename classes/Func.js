module.exports = class Func {

    constructor() {
        this.capitals = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        this.smalls = "abcdefghijklmnopqrstuvwxyz";
        this.digits = "1234567890";
        this.symbols = ",./?'!@#$%^&*()-_+=`~\\| ";
        this.months = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        this.days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        this.genders = ['Male', 'Female', 'Do not disclose'];
        this.maritals = ['Married', 'Single', 'Divorced', 'Widowed'];
        this.religions = ['Christainity', 'Islam', 'Judaism', 'Paganism', 'Budism'];
        this.userTypes = ['student', 'staff', 'admin', 'ceo'];
        this.staffRequests = ['leave', 'allowance'];
        this.studentsRequests = ['absence', 'academic'];
        this.subjectList = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Agriculture', 'Literature', 'History'].sort();
        this.subjectLevels = ['General', 'Senior', 'Science', 'Arts', 'Junior'];
        this.fontStyles = ['Arial', 'Times New Roman', 'Helvetica', 'Times', 'Courier New', 'Verdana', 'Courier', 'Arial Narrow', 'Candara', 'Geneva', 'Calibri', 'Optima', 'Cambria', 'Garamond', 'Perpetua', 'Monaco', 'Didot', 'Brush Script MT', 'Lucida Bright', 'Copperplate', 'Serif', 'San-Serif', 'Georgia', 'Segoe UI'];
        this.pixelSizes = ['0px', '1px', '2px', '3px', '4px', '5px', '6px', '7px', '8px', '9px', '10px', '20px', '30px', '40px', '50px', '60px', '70px', '80px', '90px', '100px', 'None', 'Unset', 'auto', '-webkit-fill-available'];
        this.colors = ['Red', 'Green', 'Blue', 'Yellow', 'Black', 'White', 'Purple', 'Violet', 'Indigo', 'Orange', 'Transparent', 'None', 'Unset'];
        this.boldness = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 'lighter', 'bold', 'bolder', 'normal', 'unset'];
        this.borderTypes = ['Solid', 'Dotted', 'Double', 'Groove', 'Dashed', 'Inset', 'None', 'Unset', 'Outset', 'Rigged', 'Inherit', 'Initial'];
        this.shadows = ['2px 2px 5px 2px red', '2px 2px 5px green', '2px 2px yellow', '2px black', 'None', 'Unset'];
        this.borders = ['1px solid black', '2px dotted green', '3px dashed yellow', '1px double red', 'None', 'Unset'];
        this.alignment = ['Left', 'Justified', 'Right', 'Center'];
        this.array = {};
        this.object = {};
        this.math = {};
        this.analyze = {};
        this.arrayLibrary();
        this.mathsLibrary();
        this.objectLibrary();
        this.analysisLibrary();
    }

    extractSource(source) {
        let value = this.inBetween(source, '$#&{', '}&#$');
        try {
            value = JSON.parse(value);
        } catch (error) {
            value = {};
        }
        return value;
    }

    indexAt(haystack, needle, pos) {
        pos = pos || 0;
        if (haystack.indexOf(needle) == -1) {
            return -1;
        }

        haystack = haystack.split(needle);
        if (pos >= haystack.length) {
            return -1;
        }

        let index = 0;
        for (let i = 0; i < haystack.length; i++) {
            if (i <= pos) {
                index += haystack[i].length;
            }
        }
        index += needle.length * pos;

        return index;
    }

    combine(haystack, first, second, pos) {
        pos = pos || 0;//initialize position if not set
        let at1 = pos,
            at2 = first === second ? pos + 1 : pos; //check if it is the same and change position
        let start = this.indexAt(haystack, first, at1);//get the start
        let end = this.indexAt(haystack, second, at2);//get the end

        if (start == -1 || start + first.length >= haystack.length || end == -1) {//null if one is not found
            return -1;
        }

        return haystack.slice(start, end + second.length);
    }

    allCombine(haystack, first, second) {
        let pos = 0;
        let all = [];
        let found;
        while (found != -1) {
            found = this.combine(haystack, first, second, pos);
            pos++;
            if (found != -1) {
                all.push(found);
            }
        }

        return all;
    }

    inBetween(haystack, first, second, pos) {
        pos = pos || 0;//initialize position if not set
        let at1 = pos,
            at2 = first === second ? pos + 1 : pos; //check if it is the same and change position
        let start = this.indexAt(haystack, first, at1);//get the start
        let end = this.indexAt(haystack, second, at2);//get the end

        if (start == -1 || start + first.length >= haystack.length || end == -1) {//-1 if one is not found or inbetween
            return -1;
        }

        return haystack.slice(start + first.length, end);
    }

    allInBetween(haystack, first, second) {
        let pos = 0;
        let all = [];
        let found;
        while (found != -1) {
            found = this.inBetween(haystack, first, second, pos);
            pos++;
            if (found != -1) {
                all.push(found);
            }
        }

        return all;
    }

    extractCSS(element) {
        let css = element.style.cssText,
            style = {},
            key,
            value;

        if (css != '') {
            css = css.split('; ');
            let pair;
            for (let i of css) {
                pair = this.trem(i);
                key = this.jsStyleName(pair.split(':')[0]);
                value = this.stringReplace(pair.split(':').pop(), ';', '');
                if (key != '') {
                    style[key] = this.trem(value);
                }
            }
        }

        return style;
    }

    extractFromJsonArray(meta, source) {
        let keys = Object.keys(meta);
        let values = Object.keys(meta).map(key => {
            return meta[key];
        });
        let eSource = [];
        if (this.isset(source)) {
            for (let obj of source) {
                let object = {};
                eSource.push(object);

                for (let i in keys) {
                    if (this.array.contains(Object.keys(obj), values[i])) {
                        object[keys[i]] = obj[values[i]];
                    }
                }
            }
            return eSource;
        }
    }

    trimMonthArray() {
        let months = [];
        for (let i = 0; i < this.months.length; i++) {
            months.push(this.months[i].slice(0, 3));
        }
        return months;
    }

    jsStyleName(name) {
        let newName = '';
        for (let i = 0; i < name.length; i++) {
            if (name[i] == '-') {
                i++;
                newName += name[i].toUpperCase();
            }
            else newName += name[i].toLowerCase();
        }
        return newName;
    }

    cssStyleName(name) {
        let newName = '';
        for (let i = 0; i < name.length; i++) {
            if (this.isCapital(name[i])) newName += '-';
            newName += name[i].toLowerCase();
        }

        return newName;
    }

    textToCamelCased(text) {
        let value = '';
        for (let i in text) {
            if (text[i] == ' ') continue;
            else if (i == 0) value += text[i].toLowerCase();
            else if (this.isset(text[i - 1]) && text[i - 1] == ' ') value += text[i].toUpperCase();
            else value += text[i];
        }
        return value;
    }

    camelCasedToText(camelCase) {
        let value = '';
        for (let i in camelCase) {
            if (i != 0 && this.isCapital(camelCase[i])) value += ` ${camelCase[i].toLowerCase()}`;
            else value += camelCase[i];
        }
        return value;
    }

    arrayLibrary() {

        this.array.combine = (haystack, first, second, pos) => {
            pos = pos || 0;//initialize position if not set
            let at1 = pos,
                at2 = first === second ? pos + 1 : pos; //check if it is the same and change position
            let start = this.array.indexAt(haystack, first, at1);//get the start
            let end = this.array.indexAt(haystack, second, at2) + 1;//get the end

            if (start == -1 || end == 0) {//null if one is not found
                return null;
            }

            return haystack.slice(start, end);
        }

        this.array.inBetween = (haystack, first, second, pos) => {
            pos = pos || 0;//initialize position if not set
            let at1 = pos,
                at2 = first === second ? pos + 1 : pos; //check if it is the same and change position
            let start = this.array.indexAt(haystack, first, at1) + 1;//get the start
            let end = this.array.indexAt(haystack, second, at2);//get the end

            if (start == 0 || end == -1) {//null if one is not found
                return null;
            }

            return haystack.slice(start, end);
        }

        this.array.contains = (haystack, needle) => {
            let flag = false;//set flag to false
            for (let i = 0; i < haystack.length; i++) {
                if (haystack[i] == needle) {//if found flag is true and breakout
                    flag = true;
                    break;
                }
            }
            return flag;
        }

        this.array.indexAt = (haystack, needle, pos) => {
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

        this.array.find = (haystack, callback) => {
            for (let i = 0; i < haystack.length; i++) {
                if (callback(haystack[i]) == true) {
                    return haystack[i];
                }
            }
        }

        this.array.findAll = (haystack, callback) => {
            let values = [];
            for (let i = 0; i < haystack.length; i++) {
                if (callback(haystack[i]) == true)
                    values.push(haystack[i]);
            }

            return values;
        }

        this.array.getObject = (haystack, key, value) => {
            let found;
            for (let object of haystack) {
                if (object[key] == value) found = object;
            }
            return found;
        }

        this.array.getAll = (haystack, needle) => {
            let found = [];
            for (let key = 0; key < haystack.length; key++) {
                if (haystack[key] == needle) found.push(key);
            }
            return found;
        }

        this.array.removeAll = (haystack, needle) => {
            var isArray = Array.isArray(haystack);
            var value = (isArray) ? [] : '';
            for (var i of haystack) {
                if (i == needle) continue;
                (isArray) ? value.push(i) : value += i;
            }
            return value;
        }

        this.array.pushArray = (haystack, needle, insert) => {
            var position = this.array.arrayIndex(haystack, needle);
            var tmp = [];
            for (var i = 0; i < haystack.length; i++) {
                tmp.push(haystack[i]);
                if (i == position) {
                    tmp.push(insert);
                }
            }
            return tmp;
        }

        this.array.arrayIndex = (haystack, needle) => {
            for (var x in haystack) {
                if (JSON.stringify(haystack[x]) == JSON.stringify(needle)) {
                    return x;
                }
            }
            return false;
        }

        this.array.hasArray = (haystack, needle) => {
            haystack = JSON.stringify(haystack);
            needle = JSON.stringify(needle);

            return (haystack.indexOf(needle) >= 0) ? true : false;
        }

        this.array.toObject = (arr, key) => {
            let obj = {};
            for (let a of arr) {
                obj[a[key]] = a;
                delete obj[a[key]][key];
            }
            return obj;
        }

        this.array.reshape = (params) => {
            // Pending
        }

        this.array.randomPick = (array) => {
            return array[Math.floor(Math.random() * array.length)];
        };

        this.array.removeEmpty = (array) => {
            var newArray = [];
            array.forEach(value => {
                if (Array.isArray(value) && value.length > 0) {
                    return this.array.removeEmpty(value);
                }
                else {
                    if (value != undefined && value != null && value != 0 && value != '') newArray.push(value);
                }
            });
            return newArray;
        }

        this.array.each = (array, callback) => {
            let newArray = [];
            for (let i = 0; i < array.length; i++) {
                newArray.push(callback(array[i], i));
            }
            return newArray;
        }

        this.array.hasArrayElement = (haystack, needle) => {
            for (var i of needle) {
                if (haystack.indexOf(i) != -1) return true;
            }
            return false;
        }

        this.array.toSet = (haystack) => {
            var single = [];
            for (var x in haystack) {
                if (!this.array.contains(single, haystack[x])) {
                    single.push(haystack[x]);
                }
            }
            return single;
        }

        this.array.popIndex = (array, index) => {
            let newArray = [];
            for (let i = 0; i < array.length; i++) {
                if (i == index) continue;
                newArray.push(array[i]);
            }
            return newArray;
        }
    }

    mathsLibrary() {
        this.math.placeUnit = (num, value, count) => {
            num = Math.floor(num).toString();
            value = value || num[0];
            count = count || 0;

            let pos = -1;
            for (let i = 0; i < num.length; i++) {
                if (num[i] == value) {
                    if (count == 0) {
                        pos = i;
                    }
                    count--;
                }
            }


            if (pos != -1) pos = 10 ** (num.length - pos - 1);
            return pos;
        }

        this.math.round = (params) => {
            params.dir = params.dir || 'round';
            params.to = params.to || 1;

            let value = Math[params.dir](params.num / params.to) * params.to;
            return value;
        }

        this.math.variance = (data) => {
            let mean = this.math.mean(data);
            let variance = 0;
            for (let i = 0; i < data.length; i++) {
                variance += (data[i] - mean) ** 2;
            }
            return variance / data.length;
        }

        this.math.standardDeviation = (data) => {
            let variance = this.math.variance(data);
            let std = Math.sqrt(variance);
            return std;
        }

        this.math.range = (data) => {
            let min = Math.min(...data);
            let max = Math.max(...data);

            let range = max - min;
            return range;
        }

        this.math.mean = (data) => {
            let sum = this.math.sum(data);

            let mean = sum / data.length;
            return mean;
        }

        this.math.median = (data) => {
            let length = data.length;
            let median;
            if (length % 2 == 0) {
                median = (data[(length / 2) - 1] + data[length / 2]) / 2;
            } else {
                median = data[Math.floor(length / 2)];
            }

            return median;
        }

        this.math.mode = (data) => {
            let record = {};
            for (let i = 0; i < data.length; i++) {
                if (this.isset(record[data[i]])) record[data[i]]++;
                else record[data[i]] = i;
            }

            let max = Math.max(...Object.value(record));
            let mode;
            for (let i in record) {
                if (record[i] == max) {
                    mode = i;
                    break;
                }
            }

            return mode;
        }

        this.math.lcm = (numbers) => {
            if (!Array.isArray(numbers)) return [];
            var factors;
            var multiples = {};
            var value = 1;
            for (var number of numbers) {
                if (typeof number != "number") return [];
                var f = [];
                factors = this.math.primeFactorize(number);
                for (var factor of factors) {
                    if (f.indexOf(factor) == -1) {
                        // has this factor been checkeed for this number before
                        f.push(factor);
                        if (!this.isset(multiples[factor])) {
                            multiples[factor] = this.countChar(factors, factor);
                        } else {
                            multiples[factor] = (multiples[factor] > this.countChar(factors, factor)) ? multiples[factor] : this.countChar(factors, factor);
                        }
                    }
                }
            }
            Object.keys(multiples).map((key) => {
                value = value * (key ** multiples[key]);
            });

            return value;
        }

        this.math.normalizeData = (data) => {
            data.sort((a, b) => { return a - b });
            var max = data[data.length - 1];
            var min = data[0];
            var normalized = [];
            for (var i = 0; i < data.length; i++) {
                normalized.push((data[i] - min) / (max - min));
            }
            return normalized;
        }

        this.math.minimuimSwaps = (arr, order) => {
            var swap = 0;
            var checked = [];
            var counter = 0;
            var final = [...arr].sort((a, b) => { return a - b });
            if (order == -1) final = final.reverse();

            for (var i = 0; i < arr.length; i++) {
                var element = arr[i];
                if (i == element || checked[i]) continue;

                counter = 0;

                if (arr[0] == 0) element = i;

                while (!checked[i]) {
                    checked[i] = true;
                    i = final.indexOf(element);
                    element = arr[i];
                    counter++;
                }
                if (counter != 0) {
                    swap += counter - 1;
                }
            }
            return swap;
        }

        this.math.primeFactorize = (number) => {
            if (typeof number != "number") return [];
            number = Math.abs(parseInt(number));
            if (number == 1 || number == 0) return []//1 and 0 has no primes
            var divider = 2;
            var dividend;
            var factors = [];
            while (number != 1) {
                dividend = number / divider;
                if (dividend.toString().indexOf('.') != -1) {
                    divider++
                    continue;
                }
                number = dividend;
                factors.push(divider);
            }
            return factors;
        }

        this.math.lcf = (numbers) => {
            if (!Array.isArray(numbers)) return [];
            var factors = [];
            var commonFactors = [];
            var value = 1;
            for (var number of numbers) {
                if (typeof number != "number") return [];
                factors.push(this.math.primeFactorize(number))
            }

            main:
            for (var factor of factors[0]) {
                if (commonFactors.indexOf(factor) == -1) {
                    for (var i of factors) {
                        if (i.indexOf(factor) == -1) continue main;
                    }
                    commonFactors.push(factor);
                    value *= factor;
                }
            }
            return value;
        }

        this.math.hcf = (numbers) => {
            if (!Array.isArray(numbers)) return [];
            var factors = [];
            var commonFactors = {};
            var value = 1;
            for (var number of numbers) {
                if (typeof number != "number") return [];
                factors.push(this.math.primeFactorize(number))
            }

            for (var factor of factors[0]) {
                if (!this.isset(commonFactors[factor])) {
                    commonFactors[factor] = this.countChar(factors[0], factor);
                    for (var i of factors) {
                        commonFactors[factor] = (commonFactors[factor] < this.countChar(i, factor)) ? commonFactors[factor] : this.countChar(i, factor);
                    }
                }
            }
            Object.keys(commonFactors).map((key) => {
                value = value * (key ** commonFactors[key]);
            });

            return value;
        }

        this.math.stripInteger = (number) => {
            number = number.toString();
            number = (number.indexOf('.') == -1) ? number : number.slice(0, number.indexOf('.'));
            return number;
        }

        this.math.stripFraction = (number) => {
            number = number.toString();
            number = (number.indexOf('.') == -1) ? '0' : number.slice(number.indexOf('.') + 1);
            return number;
        }

        this.math.changeBase = (params) => {
            var list = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            if (!this.isset(params.number)) return 'no_number';
            if (!this.isset(params.from) && !this.isset(params.to)) return { '10': params.number };
            if ((params.from || params.to) == 1) return 'base1 invalid';


            if (!this.isset(params.from)) params.from = 10;
            if (!this.isset(params.to)) params.to = 10;

            var symbol;
            var base10 = '';
            var baseTo = '';
            var baseToInteger = '';
            var baseToFraction = '';
            var integer = this.stripInteger(params.number)
            var integerValue = integer;

            var fraction = this.stripFraction(params.number);
            var fractionValue = fraction;
            for (var n of params.number) {
                symbol = list.indexOf(n);
                if (symbol >= params.from && n != '.') return 'invalid';
            }

            if (params.from != 10) {
                //convert to base10
                integerValue = 0;
                fractionValue = 0;
                for (var n in integer) {
                    symbol = list.indexOf(integer[n]);
                    integerValue = (symbol / 1 + integerValue);
                    if (n != integer.length - 1) integerValue *= params.from;
                }

                for (var n in fraction) {
                    symbol = list.indexOf(fraction[n]);
                    fractionValue = (symbol / 1 + fractionValue);
                    if (n != fraction.length - 1) fractionValue *= params.from;
                }
            }

            base10 = integerValue + fractionValue / (params.from ** fraction.length);

            if (params.to == 10) return base10;
            while (integerValue / 1) {
                baseToInteger += list[integerValue % params.to];
                integerValue = this.stripInteger(integerValue / params.to);
            }
            var i = 4;
            while (i) {
                fractionValue = ('.' + fractionValue) * params.to;
                baseToFraction += list[this.stripInteger(fractionValue)];
                fractionValue = this.stripFraction(fractionValue);
                i--;
            }
            baseTo = this.flip(baseToInteger) + '.' + baseToFraction;
            return baseTo;
        }

        this.math.max = (array) => {
            var max = array[0];
            this.array.each(array, value => {
                if (max < value) max = value;
            });
            return max;
        }

        this.math.min = (array) => {
            var max = array[0];
            this.array.each(array, value => {
                if (max > value) max = value;
            });
            return max;
        }

        this.math.sum = (array) => {
            //for finding the sum of one layer array
            let sum = 0;
            for (let i = 0; i < array.length; i++) {
                if (isNaN(Math.floor(array[i]))) {
                    sum = false;
                    break;
                }
                sum += array[i] / 1;
            }

            return sum;
        }

        this.math.product = (array) => {
            //for finding the sum of one layer array
            let product = 1;
            for (let i = 0; i < array.length; i++) {
                if (isNaN(Math.floor(array[i]))) {
                    product = false;
                    break;
                }
                product *= array[i];
            }

            return product;
        }

        this.math.add = (...arrays) => {
            let newArray = [];
            arrays[0].forEach((value, position) => {
                arrays.forEach((array, location) => {
                    if (location != 0) {
                        let element = Array.isArray(array) ? array[position] : array;
                        value += isNaN(element) == true ? 0 : element;
                    }
                })
                newArray.push(value);
            });
            return newArray;
        }

        this.math.sub = (...arrays) => {
            let newArray = [];
            arrays[0].forEach((value, position) => {
                arrays.forEach((array, location) => {
                    if (location != 0) {
                        let element = Array.isArray(array) ? array[position] : array;
                        value -= isNaN(element) == true ? 0 : element;
                    }
                })
                newArray.push(value);
            });
            return newArray;
        }

        this.math.mul = (...arrays) => {
            let newArray = [];
            arrays[0].forEach((value, position) => {
                arrays.forEach((array, location) => {
                    if (location != 0) {
                        let element = Array.isArray(array) ? array[position] : array;
                        value *= isNaN(element) == true ? 0 : element;
                    }
                })
                newArray.push(value);
            });
            return newArray;
        }

        this.math.divide = (...arrays) => {
            let newArray = [];
            arrays[0].forEach((value, position) => {
                arrays.forEach((array, location) => {
                    if (location != 0) {
                        let element = Array.isArray(array) ? array[position] : array;
                        value /= isNaN(element) == true ? 0 : element;
                    }
                })
                newArray.push(value);
            });
            return newArray;
        }

        this.math.abs = (array) => {
            return this.array.each(array, value => {
                value = isNaN(value) == true ? 0 : value;
                return Math.abs(value);
            });
        }
    }

    objectLibrary() {
        this.object.makeIterable = (obj) => {
            obj[Symbol.iterator] = function* () {
                let properties = Object.keys(obj);
                for (let p of properties) {
                    yield this[p];
                }
            }
            return obj;
        }
        this.object.max = (obj) => {
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

        this.object.min = (obj) => {
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

        this.object.onChanged = (obj, callback) => {
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

        this.object.toNamedArray = (obj) => {
            var arr = [];
            Object.keys(obj).map((key) => {
                arr[key] = obj[key];
            });
            return arr;
        }

        this.object.toArray = (obj) => {
            var arr = [];
            Object.keys(obj).map((key) => {
                arr.push(obj[key]);
            });
            return arr;
        }

        this.object.valueOfObjectArray = (objArray, name) => {
            var arr = [];
            for (let i = 0; i < objArray.length; i++) {
                arr.push(objArray[i][name]);
            }
            return arr;
        }

        this.object.keysOfObjectArray = (objArray) => {
            var arr = [];
            for (let i = 0; i < objArray.length; i++) {
                arr = arr.concat(Object.keys(objArray[i]));
            }
            return this.array.toSet(arr);
        }

        this.object.objectOfObjectArray = (objArray, id, name) => {
            var obj = {};
            for (let i = 0; i < objArray.length; i++) {
                obj[objArray[i][id]] = objArray[i][name];
            }
            return obj;
        }

        this.object.copy = (from, to) => {
            Object.keys(from).map(key => {
                to[key] = from[key];
            });
        }

        this.object.forEach = (object, callback) => {
            for (let key in object) {
                callback(object[key], key);
            }
        }

        this.object.each = function (object, callback) {
            let newObject = {};
            for (let key in object) {
                newObject[key] = callback(object[key], key);
            }
            return newObject;
        }

        this.object.getObjectArrayKeys = (array) => {
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
    }

    analysisLibrary() {
        this.analyze.entropy = (data) => {
            let entropy = 0;//initialize entropy
            let values = Object.values(data);//get the values of the object variable
            let sum = this.math.sum(values);//get the sum of the Values
            for (let value of values) {
                entropy -= value / sum * Math.log2(value / sum); //use the formular on each item
            }
            return entropy;
        }

        this.analyze.informationGain = (targetNode, variableData) => {
            let arrangeData = (list) => {//arrange the list into an object of counts
                let data = {};
                for (let item of list) {
                    data[item] = data[item] || 0;
                    data[item]++;
                }

                return data;
            };

            let targetData = arrangeData(targetNode);

            let targetEntropy = this.analyze.entropy(targetData);//get the entropy of the target node
            let sumOfInformation = 0;//initialize sum of information gain

            let variableValues = Object.values(variableData);//get the values of this variable
            let variableLength = 0;

            for (let i = 0; i < variableValues.length; i++) {//get the length of the variable by the adding the values
                variableLength += variableValues[i].length;
                variableValues[i] = arrangeData(variableValues[i]);
            }

            for (let v of variableValues) {//get the entropy of each and multiply by the probability
                sumOfInformation += (this.math.sum(Object.values(v)) / variableLength) * this.analyze.entropy(v);
            }

            let informationGain = targetEntropy - sumOfInformation;
            return informationGain;
        }

        this.analyze.highestInformationGainNode = (data, nodes) => {
            let gainedInformation = {};

            for (let i in nodes) {
                gainedInformation[i] = this.analyze.informationGain(data, nodes[i]);
            }

            return this.object.max(gainedInformation);
        }

        this.analyze.quartileRange = (data) => {

            let middle = (_dt) => {//get the middle position of a list of numbers
                let middle;
                if ((_dt.length) % 2 == 0) {//if the list count is not even
                    middle = [Math.ceil(_dt.length / 2) - 1, Math.ceil(_dt.length / 2)];//get the two in the middle
                }
                else {
                    middle = [Math.ceil(_dt.length / 2) - 1];
                }

                return middle;
            }

            let getMiddle = (_dt) => {// get the items in the middle of a list
                let [middle1, middle2] = middle(_dt);
                let middles = [];
                middles.push(_dt[middle1]);
                if (this.isset(middle2)) middles.push(_dt[middle2]);

                return middles;
            }

            let halfs = (_dt) => {//divide a list into two equal halfs
                let [middle1, middle2] = middle(_dt);
                if (!this.isset(middle2)) middle2 = middle1;
                let half1 = _dt.slice(0, middle1);
                let half2 = _dt.slice(middle2 + 1);
                return [half1, half2];
            }

            let layers = halfs(data);//get the halfs of the list
            let [layer1, layer2] = halfs(layers[0]);//divide each half into halfs
            let [layer3, layer4] = halfs(layers[1]);

            let middle1 = getMiddle(layers[0]);//get the middle of the first layers
            let middle3 = getMiddle(layers[1]);

            let q1 = this.math.median(middle1);//get the median of the first and last layers
            let q3 = this.math.median(middle3);

            return q3 - q1;//find the range
        }

        this.analyze.normalizeData = (data) => {
            data.sort((a, b) => { return a - b });
            var max = data[data.length - 1];
            var min = data[0];
            var normalized = [];
            for (var i = 0; i < data.length; i++) {
                normalized.push((data[i] - min) / (max - min));
            }
            return normalized;
        }
    }

    random(params) {
        let random;
        if (!this.isset(params)) {
            random = Math.random() * 2 - 1;
        }
        else if (this.isset(params.limit)) {
            random = Math.random() * params.limit;
        }
        else if (this.isset(params.range)) {

        }
        return random;
    }

    range(end, start) {
        let value = [];
        for (let i = start || 0; i < end; i++) {
            value.push(i);
        }

        return value;
    }

    generateRandom(length) {
        var string = this.capitals + this.smalls + this.digits;
        var alphanumeric = '';
        for (var i = 0; i < length; i++) {
            alphanumeric += string[Math.floor(Math.random() * string.length)];
        }
        return alphanumeric;
    }

    edittedUrl(params) {
        var url = this.urlSplitter(params.url);
        url.vars[params.toAdd] = params.addValue.toLowerCase();
        return this.urlMerger(url, params.toAdd);
    }

    addCommaToMoney(money) {
        var inverse = '';
        for (var i = money.length - 1; i >= 0; i--) {
            inverse += money[i];
        }
        money = "";
        for (var i = 0; i < inverse.length; i++) {
            let position = (i + 1) % 3;
            money += inverse[i];
            if (position == 0) {
                if (i != inverse.length - 1) {
                    money += ',';
                }
            }
        }
        inverse = '';
        for (var i = money.length - 1; i >= 0; i--) {
            inverse += money[i];
        }
        return inverse;
    }

    isCapital(value) {
        if (value.length == 1) {
            return this.array.contains(this.capitals, value);
        }
    }

    capitalize(value) {
        if (!this.isCapital(value[0])) {
            value = value.split('');
            value[0] = this.capitals[this.smalls.indexOf(value[0])];
            return this.stringReplace(value.toString(), ',', '');
        }
        return value;
    }

    flip(haystack) {
        var flipped = (Array.isArray(haystack)) ? [] : '';
        for (var i = haystack.length - 1; i >= 0; i--) (Array.isArray(haystack)) ? flipped.push(haystack[i]) : flipped += haystack[i];

        return flipped;
    }

    isSmall(value) {
        if (value.length == 1) {
            return this.array.contains(this.smalls, value);
        }
    }

    isSymbol(value) {
        if (value.length == 1) {
            return this.array.contains(this.symbols, value);
        }
    }

    isName(value) {
        for (var x in value) {
            if (this.isDigit(value[x])) {
                return false;
            }
        }
        return true;
    }

    isNumber(value) {
        for (var x in value) {
            if (!this.isDigit(value[x])) {
                return false;
            }
        }
        return value;
    }

    isPasswordValid(value) {
        var len = value.length;
        if (len > 7) {
            for (var a in value) {
                if (this.isCapital(value[a])) {
                    for (var b in value) {
                        if (this.isSmall(value[b])) {
                            for (var c in value) {
                                if (this.isDigit(value[c])) {
                                    for (var d in value) {
                                        if (this.isSymbol(value[d])) {
                                            return true;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return false;
    }

    isSubString(haystack, value) {
        if (haystack.indexOf(value) != -1) return true;
        return false;
    }

    isDigit(value) {
        value = new String(value)
        if (value.length == 1) {
            return this.array.contains(this.digits, value);
        }
        return false;
    }

    isEmail(value) {
        var email_parts = value.split('@');
        if (email_parts.length != 2) {
            return false;
        } else {
            if (this.isSpaceString(email_parts[0])) {
                return false;
            }
            var dot_parts = email_parts[1].split('.');
            if (dot_parts.length != 2) {
                return false;
            } else {
                if (this.isSpaceString(dot_parts[0])) {
                    return false;
                }
                if (this.isSpaceString(dot_parts[1])) {
                    return false;
                }
            }
        }
        return true;
    }

    objectLength(object) {
        return Object.keys(object).length;
    }

    isSpaceString(value) {
        if (value == '') {
            return true;
        } else {
            for (var x in value) {
                if (value[x] != ' ') {
                    return false;
                }
            }
        }
        return true;
    }

    hasString(haystack, needle) {
        for (var x in haystack) {
            if (needle == haystack[x]) {
                return true;
            }
        }
        return false;
    }

    trem(needle) {
        //remove the prepended spaces
        if (needle[0] == ' ') {
            var new_needle = '';
            for (var i = 0; i < needle.length; i++) {
                if (i != 0) {
                    new_needle += needle[i];
                }
            }
            needle = this.trem(new_needle);
        }

        //remove the appended spaces
        if (needle[needle.length - 1] == ' ') {
            var new_needle = '';
            for (var i = 0; i < needle.length; i++) {
                if (i != needle.length - 1) {
                    new_needle += needle[i];
                }
            }
            needle = this.trem(new_needle);
        }
        return needle;
    }

    stringReplace(word, from, to) {
        var value = '';
        for (let i = 0; i < word.length; i++) {
            if (word[i] == from) {
                value += to;
            }
            else {
                value += word[i];
            }
        }
        return value;
    }

    converToRealPath(path) {
        if (path[path.length - 1] != '/') {
            path += '/';
        }
        return path;
    }

    isSpacialCharacter(char) {
        var specialcharacters = "'\\/:?*<>|!.";
        for (var i = 0; i < specialcharacters.length; i++) {
            if (specialcharacters[i] == char) {
                return true;
            }
        }
        return false;
    }

    countChar(haystack, needle) {
        var j = 0;
        for (var i = 0; i < haystack.length; i++) {
            if (haystack[i] == needle) {
                j++;
            }
        }
        return j;
    }

    occurancesOf(haystack, needle) {
        let occurances = [];
        for (let i = 0; i < haystack.length; i++) {
            if (haystack[i] === needle) {
                occurances.push(i);
            }
        }

        return occurances;
    }

    isset(variable) {
        return (typeof variable !== 'undefined');
    }

    isnull(variable) {
        return variable == null;
    }

    notNull(variable) {
        return this.isset(variable) && !this.isnull(variable);
    }

    async runParallel(functions, callBack) {
        var results = {};
        for (var f in functions) {
            results[f] = await functions[f];
        }
        callBack(results);
    }

    isMobile() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }

    urlMerger(splitUrl, lastQuery) {
        var hostType = (this.isset(splitUrl.hostType)) ? splitUrl.hostType : 'http';
        var hostName = (this.isset(splitUrl.hostName)) ? splitUrl.hostName : '';
        var port = (this.isset(splitUrl.host)) ? splitUrl.port : '';
        var pathName = (this.isset(splitUrl.pathName)) ? splitUrl.pathName : '';
        var queries = '?';
        var keepMapping = true;
        (this.isset(splitUrl.vars)) ?
            Object.keys(splitUrl.vars).map(key => {
                if (keepMapping) queries += key + '=' + splitUrl.vars[key] + '&';
                if (key == lastQuery) keepMapping = false;
            }) : '';
        var location = hostType + '::/' + hostName + ':' + port + '/' + pathName + queries;
        location = (location.lastIndexOf('&') == location.length - 1) ? location.slice(0, location.length - 1) : location;
        location = (location.lastIndexOf('=') == location.length - 1) ? location.slice(0, location.length - 1) : location;
        return location;
    }

    urlSplitter(location) {
        if (this.isset(location)) {
            location = location.toString();
            var httpType = (location.indexOf('://') === -1) ? null : location.split('://')[0];
            var fullPath = location.split('://').pop(0);
            var host = fullPath.split('/')[0];
            var hostName = host.split(':')[0];
            var port = host.split(':').pop(0);
            var path = '/' + fullPath.split('/').pop(0);
            var pathName = path.split('?')[0];
            var queries = (path.indexOf('?') === -1) ? null : path.split('?').pop(0);

            var vars = {};
            if (queries != null) {
                var query = queries.split('&');
                for (var x in query) {
                    var parts = query[x].split('=');
                    if (parts[1]) {
                        vars[this.stringReplace(parts[0], '-', ' ')] = this.stringReplace(parts[1], '-', ' ');
                    } else {
                        vars[this.stringReplace(parts[0], '-', ' ')] = '';
                    }
                }
            }
            var httphost = httpType + '://' + host;
            return { location: location, httpType: httpType, fullPath: fullPath, host: host, httphost: httphost, hostName: hostName, port: port, path: path, pathName: pathName, queries: queries, vars: vars };
        }
    }

    getUrlVars(location) {
        location = location.toString();
        var queries = (location.indexOf('?') === -1) ? null : location.split('?').pop(0);
        var vars = {};

        if (queries != null) {
            var query = queries.split('&');
            for (var x in query) {
                var parts = query[x].split('=');
                if (parts[1]) {
                    vars[this.stringReplace(parts[0], '-', ' ')] = this.stringReplace(parts[1], '-', ' ');
                } else {
                    vars[this.stringReplace(parts[0], '-', ' ')] = '';
                }
            }
        }
        return vars;
    }

    extract(arr = '', start, end) {
        var userIndex = typeof start === 'number',
            i,
            j;
        if (userIndex) {
            i = start;
            if (end) {
                j = arr.indexOf(end, i)
                return (j === -1) ? ['', -1] : [(i === j) ? '' : arr.slice(i, j), j + end.length];
            } else return arr.slice(i)
        } else {
            i = arr.indexOf(start)
            if (i !== -1) {
                i += start.length;
                if (end) {
                    j = arr.indexOf(end, i);
                    return (j !== -1) ? arr.slice(i, j) : ['', -1];
                } else return arr.slice(i)
            }
            return [];
        }
    }

    parseForm(boundary, data) {
        var form = {},
            delimeter = Buffer.from('\r\n--' + boundary),
            body = this.extract(data, '--' + boundary + '\r\n'),
            CR = Buffer.from('\r\n\r\n'),
            i = 0,
            head,
            name,
            filename,
            value,
            obj,
            type;
        if (body) {
            while (i !== -1) {
                [head, i] = this.extract(body, i, CR);
                name = this.extract(head, '; name="', '"').toString();
                filename = this.extract(head, '; filename="', '"').toString();
                type = this.extract(head.toString(), 'Content-Type: ');
                [value, i] = this.extract(body, i, delimeter);
                if (name) {
                    obj = { filename: filename, type: type, value: value };
                    if (form.hasOwnProperty(name)) {//avoid duplicates
                        if (Array.isArray(form[name])) {
                            form[name].push(obj);
                        } else {
                            form[name] = [form[name], obj];
                        }
                    } else {
                        form[name] = obj;
                    }
                }
                if (body[i] === 45 && body[i + 1] === 45) break;// '--'
                if (body[i] === 13 && body[i + 1] === 10) {
                    i += 2; // \r\n
                } else {
                    //error
                }
            }
        }
        return form;
    }

    readFileAsync(filename) {
        return new Promise(function (resolve, reject) {
            fs.readFile(filename, function (err, data) {
                if (err)
                    reject(err);
                else
                    resolve(data);
            });
        });
    }

    getIp(req) {
        var ip = req.headers['x-forworded-for'];
        if (ip) {
            ip = ip.split(',')[0];
        } else {
            ip = req.connection.remoteAddress;
        }
        return ip;
    }

    getEnvironment() {
        return typeof global == 'undefined' ? true : false;
    }
}