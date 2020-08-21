
let ArrayLibrary = require('./Array');
let Func = require('./../classes/Func');
let func = new Func();

module.exports = function MathsLibrary() {
    let self = {};
    self.array = ArrayLibrary();

    self.placeUnit = (num, value, count) => {
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

    self.round = (params) => {
        params.dir = params.dir || 'round';
        params.to = params.to || 1;

        let value = Math[params.dir](params.num / params.to) * params.to;
        return value;
    }

    self.variance = (data) => {
        let mean = self.mean(data);
        let variance = 0;
        for (let i = 0; i < data.length; i++) {
            variance += (data[i] - mean) ** 2;
        }
        return variance / data.length;
    }

    self.standardDeviation = (data) => {
        let variance = self.variance(data);
        let std = Math.sqrt(variance);
        return std;
    }

    self.range = (data) => {
        let min = Math.min(...data);
        let max = Math.max(...data);

        let range = max - min;
        return range;
    }

    self.mean = (data) => {
        let sum = self.sum(data);

        let mean = sum / data.length;
        return mean;
    }

    self.median = (data) => {
        let length = data.length;
        let median;
        if (length % 2 == 0) {
            median = (data[(length / 2) - 1] + data[length / 2]) / 2;
        } else {
            median = data[Math.floor(length / 2)];
        }

        return median;
    }

    self.mode = (data) => {
        let record = {};
        for (let i = 0; i < data.length; i++) {
            if (record[data[i]] != undefined) record[data[i]]++;
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


    self.normalizeData = (data) => {
        data.sort((a, b) => { return a - b });
        var max = data[data.length - 1];
        var min = data[0];
        var normalized = [];
        for (var i = 0; i < data.length; i++) {
            normalized.push((data[i] - min) / (max - min));
        }
        return normalized;
    }

    self.minimuimSwaps = (arr, order) => {
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

    self.primeFactorize = (number) => {
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

    self.lcf = (numbers) => {
        if (!Array.isArray(numbers)) return [];
        var factors = [];
        var commonFactors = [];
        var value = 1;
        for (var number of numbers) {
            if (typeof number != "number") return [];
            factors.push(self.primeFactorize(number))
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

    self.stripInteger = (number) => {
        number = number.toString();
        number = (number.indexOf('.') == -1) ? number : number.slice(0, number.indexOf('.'));
        return number;
    }

    self.stripFraction = (number) => {
        number = number.toString();
        number = (number.indexOf('.') == -1) ? '0' : number.slice(number.indexOf('.') + 1);
        return number;
    }

    self.changeBase = (params) => {
        var list = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (params.number == undefined) return 'no_number';
        if (params.from == undefined && params.to == undefined) return { '10': params.number };
        if ((params.from || params.to) == 1) return 'base1 invalid';


        if (params.from == undefined) params.from = 10;
        if (params.to == undefined) params.to = 10;

        var symbol;
        var base10 = '';
        var baseTo = '';
        var baseToInteger = '';
        var baseToFraction = '';
        var integer = self.stripInteger(params.number)
        var integerValue = integer;

        var fraction = self.stripFraction(params.number);
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
            integerValue = self.stripInteger(integerValue / params.to);
        }
        var i = 4;
        while (i) {
            fractionValue = ('.' + fractionValue) * params.to;
            baseToFraction += list[self.stripInteger(fractionValue)];
            fractionValue = self.stripFraction(fractionValue);
            i--;
        }
        baseTo = func.flip(baseToInteger) + '.' + baseToFraction;
        return baseTo;
    }

    self.max = (array) => {
        var max = array[0];
        self.array.each(array, value => {
            if (max < value) max = value;
        });
        return max;
    }

    self.min = (array) => {
        var max = array[0];
        self.array.each(array, value => {
            if (max > value) max = value;
        });
        return max;
    }

    self.sum = (array) => {
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

    self.product = (array) => {
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

    self.add = (...arrays) => {
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

    self.sub = (...arrays) => {
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

    self.mul = (...arrays) => {
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

    self.divide = (...arrays) => {
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

    self.abs = (array) => {
        return self.array.each(array, value => {
            value = isNaN(value) == true ? 0 : value;
            return Math.abs(value);
        });
    }

    return self;
}