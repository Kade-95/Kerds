let ArrayLibrary = require('./Array');
let MathsLibrary = require('./Math');
let ObjectLibrary = require('./Objects');
let Tree = require('../classes/Tree');


let arrayLibrary = ArrayLibrary();
let mathLibrary = MathsLibrary();
let objectLibrary = ObjectLibrary();

module.exports = function Compression() {
    const self = {};

    let t = new Tree();
    console.log(t.values);
    self.getFrequency = (data = []) => {//get the occurrance of symbols in a list
        const frequency = {};
        for (let d in data) {
            if (frequency[data[d]] == undefined) {
                frequency[data[d]] = 1;
            }
            else {
                frequency[data[d]]++;
            }
        }

        return frequency;
    }

    self.getProbabilities = (data = []) => {//get the probabilities of all symbols in a list
        let probs = self.getFrequency(data);

        for (let i in probs) {
            probs[i] = probs[i] / data.length;
        }
        return probs;
    }

    self.entropy = (data = []) => {//this shows the shortest possible average length of a lossless compression
        let sum = 0;
        let dataType = arrayLibrary.dataType(data);//get the datatype of the list
        let probabilities;
        if (dataType == 'number') {
            probabilities = data;
        }
        else if (dataType == 'string') {//get the symbols probabilities
            probabilities = Object.values(self.getProbabilities(data));
        }

        //Sum of (-p log base 2 of p)
        for (let prob of probabilities) {
            sum += (-prob * Math.log2(prob));
        }

        return sum;
    }

    self.isUDC = (data = []) => {//check if a list is uniquely decodable code
        let flag = true, noPrefix, keepRunning = true;

        let addSurfix = (str) => {
            //check if suffix is in list already then stop running
            if (data.includes(str)) {
                flag = false;
                keepRunning = false;
                return;
            }

            data.push(str);
        }

        let checkPrefix = (pos) => {//check for prefix
            noPrefix = true;
            for (let i = 0; i < data.length; i++) {
                if (i == pos) {
                    //skip the current position
                    continue;
                }
                else if (data[i] == data[pos]) {
                    //double found in the list
                    flag = false;
                    keepRunning = false;
                }
                else if (data[i].indexOf(data[pos]) == 0) {
                    //add suffix found to the list
                    addSurfix(data[i].replace(data[pos], ''));
                }

                //stop checking for prefix
                if (!keepRunning) break;
            }
        }

        while (keepRunning) {
            for (let i = 0; i < data.length; i++) {
                checkPrefix(i);
                if (keepRunning == false) break;//stop running
            }

            if (noPrefix == true) {
                //if no prefix is found stop it is UDC
                keepRunning = false;
            }
        }

        return flag;
    }

    self.sfAlgorithm = (data = []) => {
        let frequency = self.getFrequency(data);//get the frequecies of the symbols
        let sorted = objectLibrary.sort(frequency, { value: true });//sort the symbols based on frequecy of occurrance
        let codeWord = '';

        let tree = { path: '', size: mathLibrary.sum(Object.values(sorted)), value: JSON.parse(JSON.stringify(sorted)) };//set a copy of the sorted data as a tree
        let table = JSON.parse(JSON.stringify(sorted));//set the sorted as table

        for (let i in table) {
            table[i] = { frequency: table[i] };
        }

        let trySwitching = (node) => {//switch nodes if the left size is bigger than the right side
            if (node[0].size > node[1].size) {
                let temp = node[0];
                node[0] = node[1];
                node[1] = temp;

                temp = node[0].path;
                node[0].path = node[1].path
                node[1].path = temp;
            }
            return node;
        }

        let splitData = (comingNode) => {//split a tree
            let node = [{ path: comingNode.path + '0', size: 0, value: [] }, { path: comingNode.path + '1', size: 0, value: [] }];//into two almost equal length
            for (let i in comingNode.value) {
                if (node[0].size < node[1].size) {//split into 2 almost equal nodes
                    node[0].value[i] = comingNode.value[i];
                    node[0].size += comingNode.value[i];
                }
                else {
                    node[1].value[i] = comingNode.value[i];
                    node[1].size += comingNode.value[i];
                }
            }

            node = trySwitching(node);

            for (let i in node) {
                if (Object.values(node[i].value).length > 1) {//if it has more than 1 symbol it's a node then split it again
                    node[i].value = splitData(node[i]);
                }
                else {//it is a leaf, add it to the table and get the properties
                    let key = Object.keys(node[i].value)[0];
                    table[key].code = node[i].path;
                    table[key].length = node[i].path.length;
                    table[key].probability = node[i].size / data.length;
                    table[key].log = Math.log2(1 / table[key].probability);
                }
            }
            return node;
        }

        tree = splitData(tree);

        for (let d of data) {
            codeWord += table[d].code;
        }

        return { codeWord, table, data, tree };
    }

    self.huffmanCoding = (data = []) => {
        let frequency = self.getProbabilities(data);//get the frequecies of the symbols
        let sorted = objectLibrary.sort(frequency, { value: true });//sort the symbols based on frequecy of occurrance

        let tree = [];
        let table = {};

        for (let i in sorted) {//init the table and the tree
            table[i] = { probability: sorted[i], path: '', length: 0, prod: 0 };
            tree.push({ value: sorted[i], origins: i });
        }

        let dig = (coming = []) => {//run the algorithm loop until one node is remaining with value of '1'
            let length = coming.length;//size of list 
            let node = [];//init node
            if (length > 1) {// list has more than one node?
                let down = length - 1;//index of last two items in list
                let up = length - 2;
                let sum = coming[up].value + coming[down].value;
                let added = false;
                for (let i = 0; i < coming.length; i++) {
                    if (i == up || i == down) {//sum last 2 items and skip adding them
                        if (length == 2) {//if last 2 sum them and exist digging
                            let newLeaf = { value: sum, origins: [coming[up].origins, coming[down].origins] };
                            node.push(newLeaf);
                            break;
                        }
                        continue;
                    }
                    else if (coming[i].value <= sum && !added) {//add sum if it has not been added
                        let newLeaf = { value: sum, origins: [coming[up].origins, coming[down].origins] };
                        node.push(newLeaf);
                        added = true;
                    }

                    node.push(coming[i]);
                }

                if (length > 2) {
                    node = dig(node);
                }
            }

            return node;
        }

        tree = dig(tree);

        //get the path/codeword foreach symbol
        let nameItems = (origins, path) => {
            for (let i in origins) {
                if (Array.isArray(origins[i])) {
                    nameItems(origins[i], path + i)
                }
                else {
                    table[origins[i]].path = path + i;
                    table[origins[i]].length = path.length;
                    table[origins[i]].prod = path.length * table[origins[i]].probability;
                }
            }
        }

        nameItems(tree[0].origins, '');

        //calculate the avevage length of the codes
        let avgLength = mathLibrary.sum(objectLibrary.valueOfObjectArray(table, 'prod'));

        frequency = sorted = undefined;
        return { table, data, avgLength, tree };
    }

    self.encodeHuffman = (data, dictionary = []) => {
        let dictionaryLength = dictionary.length;
        let codeWord = '', nytCode, code;

        //get the e and r parameters
        let { e, r } = (() => {
            let ok = false;
            let e = 0, r;
            while (!ok) {
                e++;
                r = dictionaryLength - 2 ** e;
                ok = r < 2 ** e;
            }
            return { e, r };
        })();

        let fixedCode = (symbol) => {//get the fixed code
            let k = dictionary.indexOf(symbol) + 1;
            let code;
            if (k <= 2 * r) { // 1 <= k <= 2r
                code = (k - 1).toString(2);
                code = Array((e + 1) - code.length).fill(0).join('') + code; // e + 1 representation of k - 1
            }
            else if (k > 2 * r) {//k > 2r
                code = (k - r - 1).toString(2);
                code = Array((e) - code.length).fill(0).join('') + code;// e representation of k - r - 1
            }
            return code;
        }

        let updateCount = (t) => {//set the count of a node and switch if left is greater than right
            let count = t.getAttribute('count');
            count++;
            t.setAttributes({ count });
            let p = t.parentTree;
            if (p != null) {
                trySwitching(p);
                updateCount(p);
            }
        }

        let trySwitching = (node) => {//switch if left is greater than right
            if (node.values[0].getAttribute('count') > node.values[1].getAttribute('count')) {
                node.reverse();
            }
        };

        let tree = new Tree();
        tree.setAttribute('count', 0);
        let NYT = tree;

        let readSymbol = (symbol) => {
            let s = tree.search((v, i) => {//search and get symbol node if added already
                return v.getAttribute('id') == symbol;
            }, tree.height);

            let v = s.value;
            nytCode = tree.search((v, i) => {//get the nyt node
                return v.getAttribute('id') == 'nyt';
            }, tree.height).path.join('');

            if (v == undefined) {//has not been added
                NYT.removeAttribute('id');//remove the current NYT tag
                NYT.push([], []);//add the 2 nodes
                let temp = NYT.values[0];
                v = NYT.values[1];

                temp.setAttributes({ id: 'nyt', count: 0 });//set new nyt
                v.setAttributes({ id: symbol, count: 0 });
                NYT = temp;
                code = nytCode + fixedCode(symbol);//nyt + fixedCode
            }
            else {
                code = s.path.join('');//get path
            }

            codeWord += code;//concat the code

            updateCount(v);//update the count starting from this node to the root
        }

        for (let symbol of data) {
            readSymbol(symbol);
        }

        return { codeWord, tree, data };
    }

    self.decodeHuffman = (codeWord, dictionary = []) => {
        let dictionaryLength = dictionary.length;
        let data = '', nytCode, code, path = [];
        let tree = new Tree();
        tree.setAttributes({ count: 0, id: 'nyt' });
        let NYT = tree;
        let i;
        let { e, r } = (() => {
            let ok = false;
            let e = 0, r;
            while (!ok) {
                e++;
                r = dictionaryLength - 2 ** e;
                ok = r < 2 ** e;
            }
            return { e, r };
        })();

        let trySwitching = (node) => {//switch nodes if left side is greater than right side
            if (node.values[0].getAttribute('count') > node.values[1].getAttribute('count')) {
                node.reverse();
            }
        };

        let updateCount = (t) => {//update the size of the current node and it's next parent
            let count = t.getAttribute('count');
            count++;
            t.setAttributes({ count });
            let p = t.parentTree;
            if (p != null) {
                trySwitching(p);
                updateCount(p);
            }
        }

        let readSymbol = (symbol) => {
            let s = tree.search((v) => {
                return v.getAttribute('id') == symbol;//search and get symbol if exists already
            }, tree.height);

            let v = s.value;
            nytCode = tree.search((v, i) => {
                return v.getAttribute('id') == 'nyt';//get the NYT code
            }, tree.height).path.join('');

            if (v == undefined) {//new symbol? add it to the tree with new NYT
                NYT.removeAttribute('id');
                NYT.push([], []);
                let temp = NYT.values[0];
                v = NYT.values[1];

                temp.setAttributes({ id: 'nyt', count: 0 });
                v.setAttributes({ id: symbol, count: 0 });
                NYT = temp;
            }

            updateCount(v);
        }

        let interprete = (node) => {
            let code;
            if (node == NYT) {//is node NYT
                for (let j = 0; j < e; j++) {//read next 4 codes
                    path.push(codeWord[++i]);
                }
                let p = parseInt(path.join(''), 2);
                if (p < r) {//p is more than r, read 1 more
                    path.push(codeWord[++i]);
                    p = parseInt(path.join(''), 2);
                }
                else {
                    p += r;//add r to p
                }
                code = dictionary[p];//get symbol from dictionary
                readSymbol(code);//add this symbol to tree
            }
            else {
                code = node.getAttribute('id');//get the symbol from the tree
                readSymbol(code);//update the symbol
            }
            return code;
        }

        for (i = -1; i < codeWord.length; i++) {//start with empty NYT
            let code = codeWord[i];
            if (code != undefined) {//when not empty
                path.push(code);
            }
            let node = tree.trace(path).value;
            if (node.getAttribute('id') != undefined) {//is node labelled
                path = [item];
                data += interprete(node);//what is this node
                path = [];
            }
        }

        return { data, tree, codeWord };
    }

    self.golomb = (n, m) => {
        let q = Math.floor(n / m);//step 1
        let unary = Array(q).fill(1).join('') + '0';//unary of q

        let k = Math.ceil(Math.log2(m));
        let c = 2 ** k - m;
        let r = n % m;
        let rC = (() => {//r`
            let value = r.toString();
            if (r < c) {
                value = r.toString();
                value = Array((k - 1) - value.length).fill(0).join('') + value;//k-1 bits rep of r
            }
            else {
                value = (r + c).toString();
                value = Array(k - value.length).fill(0).join('') + value;//k bits rep of r+c
            }
            return value;
        })();

        let code = unary + rC;//concat unary and r'
        return code;
    }

    self.encodeArithmetic = (data, probabilities) => {
        let getX = (n) => {//f(x(n))= sum of x(1) .... x(n)
            let value = 0;
            for (let i in probabilities) {
                if (n == i) break;
                value = (value / 10 + probabilities[i] / 10) * 100 / 10;//handle the JS decimal problem
            }
            return value;
        }

        // l(0) = 0, u(0) = 0, fx(0) = 0
        let bounds = [{ l: 0, u: 1 }];

        let lowerN = (n) => {//lower limit of n l(n) = l(n-1) + (u(n-1) - l(n-1)) * f(x(n-1))
            let bound = bounds[n];
            let l = bound.l + ((bound.u - bound.l) * getX(data[n] - 1));
            return l;
        }

        let upperN = (n) => {//lower limit of n u(n) = l(n-1) + (u(n-1) - l(n-1)) * f(x(n))
            let bound = bounds[n];
            let u = bound.l + ((bound.u - bound.l) * getX(data[n]));
            return u;
        }

        for (let i = 0; i < data.length; i++) {
            bounds.push({ l: lowerN(i), u: upperN(i) });
        }

        let n = bounds.pop();
        return (n.l + n.u) / 2;
    }

    self.decodeArithmetic = (tag = 0, probabilities) => {
        let data = '';
        let getX = (n) => {//f(x(n))= sum of x(1) .... x(n)
            let value = 0;
            for (let i in probabilities) {
                if (n == i) break;
                value = (value / 10 + probabilities[i] / 10) * 100 / 10;//handle the JS decimal problem
            }
            return value;
        }

        // l(0) = 0, u(0) = 0, fx(0) = 0
        let bounds = [{ l: 0, u: 1 }];

        let lowerN = (n) => {//lower limit of n l(n) = l(n-1) + (u(n-1) - l(n-1)) * f(x(n-1))
            let bound = bounds[n];
            let l = bound.l + ((bound.u - bound.l) * getX(data[n] - 1));
            return l;
        }

        let upperN = (n) => {//lower limit of n u(n) = l(n-1) + (u(n-1) - l(n-1)) * f(x(n))
            let bound = bounds[n];
            let u = bound.l + ((bound.u - bound.l) * getX(data[n]));
            return u;
        }

        let count = 0, complete = false;

        while (!complete) {//run until all the codes are found
            let found = false, x = 1, n = {};

            while (!found) {// for each new code
                let l = lowerN(count, x);
                let u = upperN(count, x);

                complete = (l >= tag && tag <= u);
                if (complete) break;//if all is found stop running

                found = (l < tag && tag < u);//check if it sactisfies the conditions
                n = { l, u, x };
                x++;
            }
            if (complete) break;
            count++;

            bounds.push(n);//add code
            data += n.x;
        }
        return data;
    }

    self.encodeDiagram = (data = '', dictionary = {}) => {//daigram coding
        let i;
        let codeWord = '';
        let encode = () => {
            let first = data[i];//take two at a time
            let second = data[i + 1];
            let symbol = first + second;

            let code;
            if (dictionary[symbol] != undefined) {//is symbol in dictionary
                code = dictionary[symbol];
                i++;//set count to know it read two
            }
            else {
                code = dictionary[first];
            }

            return code;
        }

        for (i = 0; i < data.length; i++) {
            codeWord += encode();
        }

        return codeWord;
    }

    self.encodeLZ1 = (data = '', params = { windowSize: 0, searchSize: 0, lookAheadSize: 0 }) => {//LZ7//LZ1//Sliding window
        if (params.windowSize == undefined) params.windowSize = params.searchSize + params.lookAheadSize;//init the window, search and lookahead sizes
        if (params.searchSize == undefined) params.searchSize = params.windowSize - params.lookAheadSize;
        if (params.lookAheadSize == undefined) params.lookAheadSize = params.windowSize - params.searchSize;


        let i = 0, lookAheadStop, searchStop, lookAheadBuffer, searchBuffer;//init the buffers and locations

        let getTriplet = () => {
            let x = lookAheadBuffer[0];
            let picked = { o: 0, l: 0, c: x };//set the triplet <o, l, c(n)>

            if (searchBuffer.includes(x)) {
                let foundMatches = [];//storage for the matches
                for (let i in searchBuffer) {//find all the matches in search buffer
                    if (searchBuffer[i] == picked.c) {

                        let indexInData = +searchStop + +i,//this is the joint of the search and lookAhead buffers
                            indexInLookAhead = 0,
                            count = 0,
                            matching = true,
                            matched = [];
                        while (matching) {//keep getting the matches
                            matched.push(data[indexInData]);
                            count++;
                            matching = lookAheadBuffer[indexInLookAhead + count] === data[indexInData + count];
                        }
                        foundMatches.push({ o: searchBuffer.length - i, l: matched.length, c: lookAheadBuffer[matched.length] });//save matches
                    }
                }

                picked = foundMatches[0];
                for (let y of foundMatches) {//get the match with most size and closest to the lookAhead buffer
                    if (picked.l < y.l) {
                        picked = y;
                    }
                    else if (picked.l == y.l && picked.o > y.o) {
                        picked = y;
                    }
                }
            }

            i += picked.l;
            return picked;
        }

        let list = [];
        for (i = 0; i < data.length; i++) {
            searchStop = i - params.searchSize;
            if (searchStop < 0) searchStop = 0;
            lookAheadStop = i + params.lookAheadSize;
            searchBuffer = data.slice(searchStop, i).split('');
            lookAheadBuffer = data.slice(i, lookAheadStop).split('');
            list.push(getTriplet());
        }

        return list;
    }

    self.decodeLZ1 = (triplets = [{ o: 0, l: 0, c: '' }], params = { windowSize: 0, searchSize: 0, lookAheadSize: 0 }) => {
        let word = '';

        if (params.windowSize == undefined) params.windowSize = params.searchSize + params.lookAheadSize;//init the window, search and lookahead sizes
        if (params.searchSize == undefined) params.searchSize = params.windowSize - params.lookAheadSize;
        if (params.lookAheadSize == undefined) params.lookAheadSize = params.windowSize - params.searchSize;

        for (let t of triplets) {//decode each triplet
            for (let i = 0; i < t.l; i++) {
                word += (word[word.length - t.o]);
            }
            word += (t.c);
        }

        return word;
    }

    self.encodeLZ2 = (data = '') => {//LZ8//LZ2
        let duplets = [];//init duplet list
        let entries = [];//init dictionary
        let i, lastIndex;

        let getRange = (range) => {//get the symbols within the range
            let value = '';
            for (let r of range) {
                value += data[r];
            }
            return value;
        }

        let encode = (range) => {
            let e = getRange(range);//get the value of the range
            let index = entries.indexOf(e);

            let d = { i: lastIndex, c: e[e.length - 1] };//create duplet
            if (index == -1) {//current group of symbols is in not in the dictionary
                entries.push(e);
            }
            else {
                range.push(++i);
                lastIndex = index + 1;
                d = encode(range);
            }

            return d;
        }

        for (i = 0; i < data.length; i++) {
            lastIndex = 0;
            duplets.push(encode([i]));
        }

        return duplets;
    }

    self.decodeLZ2 = (duplets = [{ i: 0, c: '' }]) => {
        let entries = [];//init dictionary
        let c;

        for (let d of duplets) {//decode each duplet
            c = '';
            if (d.i != 0) {
                c = entries[d.i - 1];//get the code from the dictionary
            }
            c += d.c;
            entries.push(c);
        }

        return entries.join('');
    }

    self.encodeLZW = (data = '', initDictionary = []) => {
        let codeWord = [], lastIndex, i;
        let entries = Array.from(initDictionary);

        let getRange = (range) => {// get the values within the range
            let value = '';
            for (let r of range) {
                value += data[r];
            }
            return value;
        }

        let encode = (range) => {
            let e = getRange(range);
            let index = entries.indexOf(e);
            if (index == -1) {//is value not in dictionary?
                entries.push(e);//add it and set the counter to the last read symbol
                index = 0;
                i--;
            }
            else {
                i++;//set the counter to the next symbol and try encoding the range
                range.push(i);
                lastIndex = index += 1;//set the last read index, this is the code
                e = encode(range);
            }
            return lastIndex;
        }

        for (i = 0; i < data.length; i++) {
            lastIndex = 0;
            let code = encode([i]);
            if (code != undefined) {//code was created
                codeWord.push(code);
            }
        }

        return codeWord;
    }

    self.decodeLZW = (singleton = [], initDictionary = []) => {
        let word = '', codeWord = [], state, count = 0, rebuild = false, buildWith = '', i, start = 0;
        let entries = Array.from(initDictionary);

        let getCode = (range) => {//get the code within the range
            let value = '';
            count = 0;
            buildWith = '';
            for (let r of range) {
                if (word[r] == undefined) {//it is not complete
                    count++;
                    rebuild = true;//set to rebuild
                }
                else {
                    buildWith += word[r];//set to rebuild with incase of not complete
                }
                value += word[r];
            }
            return value;
        }

        let decode = (range = []) => {
            let e = getCode(range);
            let index = entries.indexOf(e);
            if (index == -1) {//is not in dictionary?
                entries.push(e);
                i--;//set the counter to the last symbol read
            }
            else {
                ++i;
                range.push(i);
                decode(range);//add next symbol and decode again
            }
            return e;
        }

        let build = (state) => {//build up the dictionary from the decoded values
            for (i = start; i < word.length; i++) {
                let e = decode([i]);
                if (entries.length == state) {//stop at the current decoding point
                    start = i + 1 - count;//set next starting point at the current stop
                    break;
                }
            }
        }

        for (let s of singleton) {
            let e = entries[s - 1];
            if (e == undefined) {
                build(s);//build the dictionary
                e = entries[s - 1];
            }

            codeWord.push(e);
            word = codeWord.join('');

            if (rebuild) {//rebuild the last entry in the dictionary 
                rebuild = false;
                for (let i = 0; i < count; i++) {//keep add items to the buildwith to the buildwith until it is complete
                    buildWith += buildWith[i];
                }
                codeWord.pop();//set last built and last decoded to the new build
                codeWord.push(buildWith);
                entries.pop();
                entries.push(buildWith);
                start += count;//set the next build starting point
            }
        }

        return word;
    }

    return self;
}