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

    indexAt(haystack = '', needle = '', pos = 0) {
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

    combine(haystack = '', first = '', second = '', pos = 0) {
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

    allCombine(haystack = '', first = '', second = '') {
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

    inBetween(haystack = '', first = '', second = '', pos = 0) {
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

    allInBetween(haystack = '', first = '', second = '') {
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

    trimMonthArray() {
        let months = [];
        for (let i = 0; i < this.months.length; i++) {
            months.push(this.months[i].slice(0, 3));
        }
        return months;
    }

    jsStyleName(name = '') {
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

    cssStyleName(name = '') {
        let newName = '';
        for (let i = 0; i < name.length; i++) {
            if (this.isCapital(name[i])) newName += '-';
            newName += name[i].toLowerCase();
        }

        return newName;
    }

    textToCamelCased(text = '') {
        let value = '';
        for (let i in text) {
            if (text[i] == ' ') continue;
            else if (i == 0) value += text[i].toLowerCase();
            else if (this.isset(text[i - 1]) && text[i - 1] == ' ') value += text[i].toUpperCase();
            else value += text[i];
        }
        return value;
    }

    camelCasedToText(camelCase = '') {
        let value = '';
        for (let i in camelCase) {
            if (i != 0 && this.isCapital(camelCase[i])) value += ` ${camelCase[i].toLowerCase()}`;
            else value += camelCase[i];
        }
        return value;
    }

    emptyObject(obj) {
        return JSON.stringify(obj) = JSON.stringify({});
    }

    random(params = { limit: 1, range: 1 }) {
        let random;
        if (this.emptyObject(params)) {
            random = Math.random() * 2 - 1;
        }
        else if (this.isset(params.limit)) {
            random = Math.random() * params.limit;
        }
        else if (this.isset(params.range)) {

        }
        return random;
    }

    range(end = 1, start = 1) {
        let value = [];
        for (let i = start || 0; i < end; i++) {
            value.push(i);
        }

        return value;
    }

    generateRandom(length = 5) {
        var string = this.capitals + this.smalls + this.digits;
        var alphanumeric = '';
        for (var i = 0; i < length; i++) {
            alphanumeric += string[Math.floor(Math.random() * string.length)];
        }
        return alphanumeric;
    }

    generateKey(length = 5) {
        let key = Date.now().toString(length) + Math.random().toString(length).slice(2);//generate the key
        return key;
    }

    edittedUrl(params) {
        var url = this.urlSplitter(params.url);
        url.vars[params.toAdd] = params.addValue.toLowerCase();
        return this.urlMerger(url, params.toAdd);
    }

    addCommaToMoney(money = '') {
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

    isCapital(value = '') {
        if (value.length == 1) {
            return this.capitals.includes(value);
        }
    }

    capitalize(value = '') {
        if (!this.isCapital(value[0])) {
            value = value.split('');
            value[0] = this.capitals[this.smalls.indexOf(value[0])];
            return this.stringReplace(value.toString(), ',', '');
        }
        return value;
    }

    flip(haystack = '') {
        var flipped = (Array.isArray(haystack)) ? [] : '';
        for (var i = haystack.length - 1; i >= 0; i--) {
            if (Array.isArray(haystack)) {
                flipped.push(haystack[i])
            }
            else {
                flipped += haystack[i];
            }
        }

        return flipped;
    }

    isSmall(value = '') {
        if (value.length == 1) {
            return this.smalls.includes(value);
        }
    }

    isSymbol(value = '') {
        if (value.length == 1) {
            return this.symbols.includes(value);
        }
    }

    isName(value = '') {
        for (var x in value) {
            if (this.isDigit(value[x])) {
                return false;
            }
        }
        return true;
    }

    isNumber(value = '') {
        for (var x in value) {
            if (!this.isDigit(value[x])) {
                return false;
            }
        }
        return value;
    }

    isPasswordValid(value = '') {
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

    isSubString(haystack = '', value = '') {
        if (haystack.indexOf(value) != -1) return true;
        return false;
    }

    isDigit(value = '') {
        value = new String(value)
        if (value.length == 1) {
            return this.digits.includes(value);
        }
        return false;
    }

    isEmail(value = '') {
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

    objectLength(object = {}) {
        return Object.keys(object).length;
    }

    isSpaceString(value = '') {
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

    hasString(haystack = '', needle = '') {
        for (var x in haystack) {
            if (needle == haystack[x]) {
                return true;
            }
        }
        return false;
    }

    trem(needle = '') {
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

    stringReplace(word = '', from = '', to = '') {
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

    converToRealPath(path = '') {
        if (path[path.length - 1] != '/') {
            path += '/';
        }
        return path;
    }

    isSpacialCharacter(char = '') {
        var specialcharacters = "'\\/:?*<>|!.";
        for (var i = 0; i < specialcharacters.length; i++) {
            if (specialcharacters[i] == char) {
                return true;
            }
        }
        return false;
    }

    countChar(haystack = '', needle = '') {
        var j = 0;
        for (var i = 0; i < haystack.length; i++) {
            if (haystack[i] == needle) {
                j++;
            }
        }
        return j;
    }

    occurancesOf(haystack = '', needle = '') {
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

    isfunction(variable) {
        return (typeof variable === 'function');
    }

    isnull(variable) {
        return variable == null;
    }

    notNull(variable) {
        return this.isset(variable) && !this.isnull(variable);
    }

    async runParallel(functions = [], callBack = () => { }) {
        var results = {};
        for (var f in functions) {
            results[f] = await functions[f];
        }
        callBack(results);
    }

    isMobile() {
        return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    }

    urlMerger(splitUrl = '', lastQuery = '') {
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

    urlSplitter(location = '') {
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

    getUrlVars(location = '') {
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
}