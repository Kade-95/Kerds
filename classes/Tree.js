module.exports = class Tree {
    #children = [];
    #parent = null;
    #root = null;
    #attributes = {};

    constructor(items, parent, root) {
        if (Array.isArray(items)) {
            this.push(...items);
        }

        if (parent != undefined && parent.constructor == Tree) {
            this.#parent = parent;
        }

        if (root != undefined && root.constructor == Tree) {
            this.#root = root;
        }
    }

    get height() {
        let height = 1, branchHeights = [];
        for (let branch of this.#children) {
            if (branch instanceof Tree) {
                branchHeights.push(branch.height);
            }
        }
        if (branchHeights.length > 0) {
            height += Math.max(...branchHeights);
        }
        return height;
    }

    get length() {
        return this.#children.length;
    }

    set length(size) {
        let newChildren = [];
        for (let i = 0; i < size; i++) {
            newChildren.push(this.#children[i]);
        }
        this.#children = newChildren;
    }

    get parentTree() {
        return this.#parent;
    }

    get rootTree() {
        return this.#root;
    }

    get values() {
        return Array.from(this.#children);
    }

    createItems(items) {
        let root = (this.#parent != null) ? this.#root : this;
        for (let i = 0; i < items.length; i++) {
            if (Array.isArray(items[i])) {
                items[i] = new Tree(items[i], this, root);
            }
        }
        return items;
    }

    copyWithin(target, start = 0, end = 1) {
        return this.#children.copyWithin(target, start, end)
    }

    concat(tree) {
        let newTree = new Tree(this.values, this.#parent, this.#root);
        if (tree.constructor == Tree) {
            newTree.push(...tree.values);
        }
        else if (Array.isArray(tree)) {
            newTree.push(...tree);
        }
        else {
            newTree.push(tree);
        }
        return newTree;
    }

    combine(first, second, position) {//used to get what is between two items at a particular occurrance in an Array and the items combined
        position = position || 0;//initialize position if not set
        let at1 = position,
            at2 = first === second ? position + 1 : position; //check if it is the same and change position
        let start = this.indexAt(first, at1);//get the start
        let end = this.indexAt(second, at2) + 1;//get the end

        if (start == -1 || end == 0) {//null if one is not found
            return null;
        }

        return this.slice(start, end);
    }

    entries() {
        return this.values.entries();
    }

    empty() {
        this.#children.length = 0;
    }

    every(callback = (value, index) => { }) {
        if (typeof callback == 'function') {
            let values = this.values;
            for (let i in values) {
                this.#children[i] = callback(values[i], i);
            }
        }
    }

    find(callback = (value, index) => { }) {
        let value, found = false;
        if (typeof callback == 'function') {
            let values = this.values;

            for (let i in values) {
                if (callback(values[i], i)) {
                    value = this.#children[i];
                    found
                    break;
                }
            }
        }
        return value;
    }

    findLast(callback = (value, index) => { }) {
        let value;
        if (typeof callback == 'function') {
            let values = this.values.reverse();
            for (let i in values) {
                if (callback(values[i], i)) {
                    value = this.#children[i];
                    break;
                }
            }
        }
        return value;
    }

    findIndex(callback = (value, index) => { }) {
        let value;
        if (typeof callback == 'function') {
            let values = this.values;
            for (let i in values) {
                if (callback(values[i], i)) {
                    value = i;
                    break;
                }
            }
        }
        return value;
    }

    findLastIndex(callback = (value, index) => { }) {
        let value;
        if (typeof callback == 'function') {
            let values = this.values.reverse();
            for (let i in values) {
                if (callback(values[i], i)) {
                    value = i;
                    break;
                }
            }
        }
        return value;
    }

    findAll(callback = (value, index) => { }) {
        let newTree = new Tree();
        if (typeof callback == 'function') {
            let values = this.values;
            for (let i in values) {
                if (callback(values[i], i)) {
                    newTree.push(this.#children[i]);
                }
            }
        }
        return newTree;
    }

    findAllIndex(callback = (value, index) => { }) {
        let newArray = [];
        if (typeof callback == 'function') {
            let values = this.values;
            for (let i in values) {
                if (callback(values[i], i)) {
                    newArray.push(i);
                }
            }
        }
        return newArray;
    }

    forEach(callback = (value, index) => { }) {
        if (typeof callback == 'function') {
            let values = this.values;
            for (let i in values) {
                callback(values[i], i);
            }
        }
    }

    fill(item) {
        for (let i in this.#children) {
            if (this.#children[i].constructor == Tree) {
                this.#children[i].fill(item);
            }
            else {
                this.#children[i] = item;
            }
        }
    }

    filter(callback = (value, index) => { }) {
        let newTree = new Tree();
        if (typeof callback == 'function') {
            let values = this.values;
            for (let i in values) {
                if (callback(values[i], i)) {
                    newTree.push(this.#children[i])
                }
            }
        }
        return newTree;
    }

    flatMap(callback = (value, index) => { }) {
        let newTree = new Tree();
        if (typeof callback == 'function') {
            let values = this.flat();
            for (let i in values) {
                newTree.push(callback(values[i], i));
            }
        }
        return newTree;
    }

    flat() {
        let flattened = [];
        let values = this.values;
        for (let v of values) {
            if (v.constructor == Tree) {
                flattened.push(v.flat());
            }
            else {
                flattened.push(v);
            }
        }
        return flattened.flat();
    }

    flatTree() {
        return new Tree(this.flat());
    }

    getAttribute(name) {
        return this.#attributes[name];
    }

    getAttributes(attributes) {
        let found = [];
        for (let name of attributes) {
            found.push(this.#attributes[name]);
        }

        return found;
    }

    hasAttribute(name) {
        return this.#attributes != undefined;
    }

    includes(value) {
        return this.#children.includes(value);
    }

    indexOf(value) {
        return this.#children.indexOf(value);
    }

    isBranch() {
        return this.#parent != null;
    }

    inBetween(first, second, position) {//used to get what is between two items at a particular occurrance in an Array
        position = position || 0;//initialize position if not set
        let at1 = position,
            at2 = first === second ? position + 1 : position; //check if it is the same and change position

        let start = this.indexAt(first, at1) + 1;//get the start
        let end = this.indexAt(second, at2);//get the end

        if (start == 0 || end == -1) {//null if one is not found
            return null;
        }

        return this.slice(start, end);
    }

    indexAt(item, position = 0) {//used to get the index of an item at a particular occurrance
        position = position || 0;
        let count = -1;
        let values = this.values;
        for (let i = 0; i < values.length; i++) {
            if (values[i] == item) {
                count++;
                if (count == position) {
                    return i;
                }
            }
        }

        return -1;
    }

    join(at) {
        return this.toArray().join(at);
    }

    lastIndexOf(value) {
        return this.#children.lastIndexOf(value);
    }

    map(callback = (value, index) => { }) {
        let newTree = new Tree();
        if (typeof callback == 'function') {
            let values = this.values;
            for (let i in values) {
                newTree.push(callback(values[i], i));
            }
        }
        return newTree;
    }

    push(...items) {
        this.#children.push(...this.createItems(items));
    }

    pop() {
        return this.#children.pop();
    }

    reverse() {
        this.#children.reverse();
    }

    reduce(callback, reducer = 0) {
        return this.values.reduce(callback, reducer);
    }

    reduceRight(callback) {
        return this.values.reduceRight(callback);
    }

    removeAttribute(name) {
        delete this.#attributes[name];
    }

    removeAttributes(attributes) {
        for (let name of attributes) {
            delete this.#attributes[name];
        }
    }

    search(callback = (value, index) => { }, depth = 0) {
        let value;
        let path = [];//init path
        if (typeof callback == 'function') {
            let values = this.values;
            for (let i in values) {
                if (callback(values[i], i)) {//set path
                    value = values[i];
                    path.push(i);
                    break;
                }
            }
            if (typeof depth != 'number') depth = 0;
            if (path.length == 0 && depth > 0) {
                depth--;
                for (let i in values) {
                    if (values[i].constructor == Tree) {
                        let sub = values[i].search(callback, depth, path);
                        if (sub.path.length != 0) {
                            sub.path.unshift(i);
                            path = sub.path;
                            value = sub.value;
                            break;
                        }
                    }
                }
            }
        }
        return { path, value };
    }

    setAttribute(name, value) {
        if (typeof name == 'string') {
            this.#attributes[name] = value;
        }
    }

    setAttributes(attributes) {
        for (let name in attributes) {
            this.setAttribute(name, attributes[name]);
        }
    }

    shift() {
        return this.#children.shift();
    }

    slice(start, end) {
        let values = this.values;
        if (end == undefined) end = values.length;

        return values.slice(start, end);
    }

    sliceAsTree(start, end) {
        return new Tree(this.slice(start, end));
    }

    some(callback = (value, index) => { }) {
        if (typeof callback == 'function') {
            let values = this.flat();
            for (let i in values) {
                if (callback(values[i], i)) return true;
            }
        }
        return false;
    }

    sort(callback, depth = 0) {
        if (typeof callback !== 'function') {
            callback = (a, b) => a > b;
        }

        for (let i = 0; i < this.#children.length; i++) {
            for (let j = i + 1; j < this.#children.length; j++) {
                let temp;
                if (callback(this.#children[i], this.#children[j]) == true) {
                    temp = this.#children[i];
                    this.#children[i] = this.#children[j];
                    this.#children[j] = temp;
                }
            }
        }

        if (typeof depth != 'number') depth = 0;
        if (depth > 0) {
            depth--;
            for (let i in this.#children) {
                if (this.#children[i].constructor == Tree) {
                    this.#children[i].sort(callback, depth);
                }
            }
        }
    }

    splice(start, deleteCount, ...items) {
        if (deleteCount == undefined) deleteCount = this.#children.length - start;
        let newTree = new Tree(this.#children.splice(start, deleteCount, ...items));
        return newTree;
    }

    toArray() {
        let array = [];
        for (let item of this.#children) {
            if (item.constructor == Tree) {
                array.push(item.toArray());
            }
            else {
                array.push(item);
            }
        }

        return array;
    }

    toString() {
        return this.flat().toString();
    }

    toLocaleString() {
        return this.flat().toLocaleString();
    }

    trace(path = []) {
        path = Array.from(path);
        let i = path.shift();
        let found = false;
        let value;
        let child = this.values[i];

        if (child == undefined) {
            value = this;
            found = true;
        }
        else if (path.length == 0 && child != undefined) {
            value = child;
            found = true;
        }
        else if (child != undefined && child.constructor == Tree) {
            return child.trace(path);
        }


        return { found, value };
    }

    unshift(...items) {
        this.#children.unshift(...this.createItems(items));
    }

    static isTree(tree) {
        return tree.constructor == Tree;
    }

    static from(items) {
        let newTree = new Tree(items);
        return newTree;
    }
}
