let JSElements = require('./JSElements');

module.exports = class Template extends JSElements {
    constructor() {
        super();
        this.virtual = {};

        this.elementLibrary();
        this.nodeListLibrary();
        this.htmlCollectionLibrary();
        this.nodeLibrary();
    }

    elementLibrary() {
        //Framework with jsdom
        let self = this;

        Element.prototype.toJson = function () {
            let element = this.nodeName.toLowerCase();
            let attributes = this.getAttributes();
            attributes.style = this.css();
            let children = [];
            for (let i = 0; i < this.children.length; i++) {
                children.push(this.children[i].toJson());
            }
            return { element, attributes, children }
        }

        Element.prototype.setOptions = function (options = [], params = { selected: '' }) {
            params = params || {};
            if (self.isset(params.flag)) {
                this.innerHTML = '';
            }

            for (let i = 0; i < options.length; i++) {
                let text = options[i].text || options[i];
                let value = options[i].value || options[i];

                let option = this.makeElement({ element: 'option', attributes: { value }, text });

                if (value.toString().toLowerCase() == 'null') {
                    option.setAttribute('disabled', true);
                }

                if (self.isset(params.selected) && value == params.selected) {
                    option.setAttribute('selected', true);
                }
            }
        };

        Element.prototype.commonAncestor = function (elementA = new Element(), elementB = new Element()) {
            for (let ancestorA of elementA.parents()) {
                for (let ancestorB of elementB.parents()) {
                    if (ancestorA == ancestorB) return ancestorA;
                }
            }

            return null;
        }

        Element.prototype.onAdded = function (callback = () => { }) {
            this.addEventListener('DOMNodeInsertedIntoDocument', event => {
                callback();
            });
        }
        //Store the states of an element here
        Element.prototype.states = {};

        //This is a temporary storage for elements attributes
        Element.prototype.temp = {};

        //This listens and handles for multiple bubbled events
        Element.prototype.manyBubbledEvents = function (events, callback = () => { }) {
            events = events.split(',');
            for (let event of events) {
                this.bubbledEvent(event.trim(), callback);
            }
        }

        //This listens and handles for multiple bubbled events that did not bubble
        Element.prototype.manyNotBubbledEvents = function (events, callback = () => { }) {
            events = events.split(',');
            for (let event of events) {
                this.notBubbledEvent(event.trim(), callback);
            }
        }

        //This handles all events that are bubbled within an element and it's children
        Element.prototype.bubbledEvent = function (event, callback = () => { }) {
            //Listen for this event on the entire document
            document.addEventListener(event, event => {
                //if the event bubbles up the element fire the callback
                if (event.target == this || this.isAncestor(event.target)) {
                    callback(event);
                }
            });
        }

        //This handles all events that are not bubbled within an element and it's children
        Element.prototype.notBubbledEvent = function (event, callback = () => { }) {
            document.addEventListener(event, event => {
                if (!(event.target == this || this.isAncestor(event.target))) {
                    callback(event);
                }
            });
        }

        //Listen to multiple events at time with a single callback function
        Element.prototype.addMultipleEventListener = function (events, callback = () => { }) {
            events = events.split(',');
            for (let event of events) {
                this.addEventListener(event.trim(), e => {
                    callback(e);
                });
            }
        }

        //perform actions on mouseenter and mouseleave
        Element.prototype.hover = function (params = { css: {}, do: () => { } }) {

            let css = [];
            let cssValues;

            this.addMultipleEventListener('mouseenter', event => {
                cssValues = this.css();//store the current css values
                if (self.isset(params.css)) {//if action is to change the styling
                    css = self.array.each(Object.keys(params.css), value => {//store the new css style names to remove later
                        return self.cssStyleName(value);
                    });
                    this.css(params.css);//set the css styles
                }
                if (self.isfunction(params.do)) {// if action is to perform do
                    params.do(event);
                }
            });

            this.addMultipleEventListener('mouseleave', event => {
                if (self.isset(params.css)) {//if action was to change the styling
                    this.cssRemove(css);//remove the new styling
                    this.css(cssValues);//set the old ones
                }
            });
        };

        //a shorter name for querySelector
        Element.prototype.find = function (name = '', position = 0) {
            let element = null;
            if (self.isset(position)) {//get the all the elements found and return the one at this particular position
                this.querySelectorAll(name).forEach((e, p) => {
                    if (position == p) element = e;
                });
            }
            else {
                element = this.querySelector(name);
            }
            return element;
        };

        //a shorter name for querySelectorAll
        Element.prototype.findAll = function (name = '') {
            return this.querySelectorAll(name);
        }

        //perform an extended querySelection on this element
        Element.prototype.search = function (name = '', options = { attributes: {}, id: '', nodeName: '', class: '', classes: '' }, position = 0) {
            let element = null;
            let foundElements = [];//all the elements meeting the requirements

            if (self.isset(options)) {//if the options to check is set
                let allElements = this.querySelectorAll(name);//get all the possible elements

                //loop through them and check if the match the options
                for (let i = 0; i < allElements.length; i++) {
                    element = allElements[i];

                    //check for the attributes
                    if (self.isset(options.attributes)) {
                        for (let attr in options.attributes) {
                            // check all the attributes one after the other
                            if (element.getAttribute(attr) != options.attributes[attr]) {
                                element = null;
                                continue;
                            }
                        }
                        //if this element is no long valid skip it
                        if (self.isnull(element)) continue;
                    }

                    //check for the ID
                    if (self.isset(options.id) && options.id != element.id) {
                        element = null;
                        continue;
                    }

                    //check for the class
                    if (self.isset(options.class) && !element.classList.contains(options.class)) {
                        element = null;
                        continue;
                    }

                    //check for the classes
                    if (self.isset(options.classes) && !element.hasClasses(options.classes)) {
                        element = null;
                        continue;
                    }

                    //check for the nodename
                    if (self.isset(options.nodeName) && element.nodeName.toLowerCase() != options.nodeName) {
                        element = null;
                        continue;
                    }

                    //check if to return for a particular position
                    if (position <= 0) return element;
                    foundElements.push(element);
                }
                //get the element at the specified position
                if (foundElements.length && self.isset(foundElements[position])) {
                    element = foundElements[position];
                }
                else {
                    element = null;
                }
            }
            else {
                element = this.find(name);
            }

            return element;
        };

        //perform search for all the elements that meet a requirement
        Element.prototype.searchAll = function (name = '', options = { attributes: {}, id: '', nodeName: '', class: '', classes: '' }) {
            if (self.isset(options)) {
                let allElements = this.querySelectorAll(name);
                let elements = [];
                for (let i = 0; i < allElements.length; i++) {
                    let element = allElements[i];
                    if (self.isset(options.attributes)) {
                        for (let attr in options.attributes) {
                            if (element.getAttribute(attr) != options.attributes[attr]) {
                                element = null;
                                continue;
                            }
                        }
                    }

                    if (self.isset(options.id) && options.id != element.id) {
                        element = null;
                        continue;
                    }

                    if (self.isset(options.class) && !element.classList.contains(options.class)) {
                        element = null;
                        continue;
                    }

                    if (self.isset(options.classes) && !element.hasClasses(options.classes)) {
                        element = null;
                        continue;
                    }

                    if (self.isset(options.nodeName) && element.nodeName.toLowerCase() != options.nodeName) {
                        element = null;
                        continue;
                    }

                    if (!self.isnull(element)) {
                        elements.push(element);
                    }
                }
                return elements;
            }
            return this.querySelectorAll(name);
        }

        //look for multiple single elements at a time
        Element.prototype.fetch = function (names = [], position = 0) {
            let elements = {};
            for (let name of names) {
                elements[name] = this.find(name, position);
            }

            return elements;
        }

        //look for multiple nodelists at a time
        Element.prototype.fetchAll = function (names = []) {
            let elements = {};
            for (let name of names) {
                elements[name] = this.findAll(name);
            }

            return elements;
        }

        //Get the nodes between two child elements
        Element.prototype.nodesBetween = function (elementA = new Element(), elementB = new Element()) {
            let inBetweenNodes = [];
            for (let child of Array.from(this.children)) {//get all the children
                //check if the two elements are children of this element
                if (child == elementA || child == elementB || child.isAncestor(elementA) || child.isAncestor(elementB)) {
                    inBetweenNodes.push(child);
                }
            }

            return inBetweenNodes;
        }

        //Get if element is child of an element
        Element.prototype.isAncestor = function (child = new Element()) {
            let parents = child.parents();//Get all the parents of child
            return parents.includes(this);
        };

        //Get all the parents of an element until document
        Element.prototype.parents = function () {
            let parents = [];
            let currentParent = this.parentNode;
            while (currentParent != null) {
                parents.push(currentParent);
                currentParent = currentParent.parentNode;
            }

            return parents;
        };

        Element.prototype.customParents = function () {
            let parents = this.parents();
            let customParents = [];
            for (let i = 0; i < parents.length; i++) {
                if (parents[i].nodeName.includes('-')) {
                    customParents.push(parents[i]);
                }
            }
            return customParents;
        }

        //Remove a state from an element
        Element.prototype.removeState = function (params = { name: '' }) {
            let state = this.getState(params);//get the state (element)
            if (self.isset(state) && self.isset(params.force)) {//if state exists and should be deleted
                if (self.isset(state.dataset.domKey)) {
                    delete self.virtual[state.dataset.domKey];//delete the element from virtual dom
                }
                state.remove();//remove the element from dom
            }
            this.removeAttribute(`data-${params.name}`);//remove the state from element
        }

        //Get an element's state 
        Element.prototype.getState = function (params = { name: '' }) {
            let state = null;
            let stateName;

            //get the state name
            if (typeof params == 'string') {
                stateName = params;
            }
            else if (self.isset(this.dataset[`${params.name}`])) {
                stateName = params.name;
            }

            if (self.isset(stateName)) {//get the state
                state = self.virtual[this.dataset[stateName]];
                // let state = self.objectToArray(this.states[stateName]).pop();
            }

            return state;
        };

        //add a state to an element
        Element.prototype.addState = function (params = { name: '', state: new Element() }) {
            //make sure the state has a domkey
            if (!self.isset(params.state.dataset.domKey)) {
                params.state.setKey();
            }

            //add the state to the elements dataset
            this.dataset[params.name] = params.state.dataset.domKey;
            this.states[params.name] = {}//initialize the state
            return this;
        };

        //set the state of an element
        Element.prototype.setState = function (params = { name: '', attributes: {}, render: {}, children: [], text: '', html: '', value: '', options: [] }) {
            let state = this.getState(params);

            // let found = this.states[params.name][JSON.stringify(params)];
            // if (self.isset(found)) {
            //     state.innerHTML = found.innerHTML;
            //     state.setAttributes(found.getAttributes());
            // }
            // else {
            //     state.setAttributes(params.attributes);
            //     if (self.isset(params.children)) {//add the children if set
            //         state.makeElement(params.children);
            //     }
            //     if (self.isset(params.render)) {//add the children if set
            //         state.render(params.render);
            //     }
            //     if (self.isset(params.text)) state.textContent = params.text;//set the innerText
            //     if (self.isset(params.value)) state.value = params.value;//set the value
            //     if (self.isset(params.options)) {//add options if isset
            //         for (var i of params.options) {
            //             state.makeElement({ element: 'option', value: i, text: i, attachment: 'append' });
            //         }
            //     }

            //     this.states[params.name][JSON.stringify(params)] = state.cloneNode(true);
            // }

            state.setAttributes(params.attributes);
            if (self.isset(params.children)) {//add the children if set
                state.makeElement(params.children);
            }
            if (self.isset(params.render)) {//add the children if set
                state.render(params.render);
            }
            if (self.isset(params.text)) state.textContent = params.text;//set the innerText
            if (self.isset(params.html)) state.innerHTML = params.html;//set the innerText
            if (self.isset(params.value)) state.value = params.value;//set the value
            if (self.isset(params.options)) {//add options if isset
                for (var i of params.options) {
                    state.makeElement({ element: 'option', value: i, text: i, attachment: 'append' });
                }
            }

            this.states[params.name][JSON.stringify(params)] = state.cloneNode(true);

            return state;
        };

        //async version of setstate
        Element.prototype.setKeyAsync = async function () {
            return await this.setKey();
        };

        //set element's dom key for the virtual dom
        Element.prototype.setKey = function () {
            let key = Date.now().toString(36) + Math.random().toString(36).slice(2);//generate the key
            if (!self.isset(this.dataset.domKey)) {//does this element have a key
                this.dataset.domKey = key;
            } else {
                key = this.dataset.domKey;
            }
            self.virtual[key] = this;//add it to the virtual dom
            return key;
        };

        //drop down a child
        Element.prototype.dropDown = function (element = new Element()) {
            let parentContent = this.cloneNode(true);
            this.innerHTML = '';
            this.append(parentContent);
            parentContent.css({ boxShadow: '1px 1px 1px 1px #aaaaaa' });
            this.css({ boxShadow: '0.5px 0.5px 0.5px 0.5px #cccccc' });

            let dropContainer = this.makeElement({
                element: 'div', attributes: { class: 'drop-down' }
            });
            dropContainer.append(element);

            this.removeDropDown = () => {
                dropContainer.remove();
                parentContent.css({ boxShadow: 'unset' });
                this.innerHTML = parentContent.innerHTML;
            }

            return this;
        };

        //stop monitoring this element for changes
        Element.prototype.stopMonitor = function () {
            if (this.observe) this.observer.disconnect();//disconnect observer
            return this;
        }

        //Check if an attribute has changed in this element
        Element.prototype.onAttributeChange = function (attribute = '', callback = () => { }) {
            this.addEventListener('attributesChanged', event => {
                if (event.detail.attributeName == attribute) {
                    callback(event);
                }
            });
        }

        // monitor this element for changes
        Element.prototype.monitor = function (config = { attributes: true, childList: true, subtree: true }) {
            this.observer = new MutationObserver((mutationList, observer) => {
                if (mutationList.length) this.dispatchEvent(new CustomEvent('mutated'));//fire mutated event for it
                for (let mutation of mutationList) {
                    if (mutation.type == 'childList') {//if the change was a child fire childlistchanged event
                        this.dispatchEvent(new CustomEvent('childListchanged', { detail: mutation }));
                    }
                    else if (mutation.type == 'attributes') {//if the change was a child fire childlistchanged event
                        this.dispatchEvent(new CustomEvent('attributesChanged', { detail: mutation }));
                    }
                    else if (mutation.type == 'characterData') {//if the change was a child fire childlistchanged event
                        this.dispatchEvent(new CustomEvent('characterDataChanged', { detail: mutation }));
                    }
                }
            });

            this.observer.observe(this, config);
            return this;
        }

        Element.prototype['checkChanges'] = function (callback = () => { }) {
            this.monitor();
            this.addEventListener('mutated', event => {
                callback(event);
            });
        };

        // check when the value of an element is changed
        Element.prototype.onChanged = function (callBack = () => { }) {
            let value = this.getAttribute('value');
            let updateMe = (event) => {
                // if element is input element
                if (event.target.nodeName == 'INPUT') {
                    if (event.target.type == 'date') {// if the type is date, check if the date is valid then update the attribute
                        if (this.isDate(this.value)) this.setAttribute('value', this.value);
                    }
                    else if (event.target.type == 'time') {// if the type is time, check if the time is valid then update the attribute
                        if (this.isTimeValid(this.value)) this.setAttribute('value', this.value);
                    }
                    else if (event.target.type == 'file') {
                        let fileName = event.target.value;
                        let file = event.target.files[0];
                        if (file.type.indexOf('image') == 0) {
                            self.imageToJson(file, callBack);
                        }
                    }
                    else {
                        this.setAttribute('value', this.value);//update the attribute
                    }
                }
                else if (event.target.nodeName == 'SELECT') {// if the element is select
                    for (let i = 0; i < event.target.options.length; i++) {//update the selected option using the selected index
                        if (i == event.target.selectedIndex) {
                            event.target.options[i].setAttribute('selected', true);
                        } else {
                            event.target.options[i].removeAttribute('selected');
                        }
                    }
                }
                else if (event.target.nodeName == 'DATA-ELEMENT') {
                    this.setAttribute('value', this.value);
                }
                else if (event.target.nodeName == 'SELECT-ELEMENT') {
                    this.setAttribute('value', this.value);
                }
                else {
                    this.value = this.textContent;
                }

                if (self.isset(callBack) && event.target.type != 'file') {
                    callBack(this.value, event);//fire the callback function
                }
            };

            // if change is caused by keyboard
            this.addEventListener('keyup', (event) => {
                updateMe(event);
            });

            // if change is caused programatically
            this.addEventListener('change', (event) => {
                updateMe(event);
            });
        };

        //render the contents of an element
        Element.prototype.render = function (params = { element: '', attributes: {} }, except) {
            if (self.isset(except)) this.removeChildren(except);//remove the contents of the element with exceptions
            else this.removeChildren();
            this.makeElement(params);//append the new contents of the element
        }

        //Get all the styles for the ID, the classes and the element
        Element.prototype.getAllCssProperties = function () {
            let styleSheets = Array.from(document.styleSheets),//get all the css styles files and rules
                cssRules,
                id = this.id,
                nodeName = this.nodeName,
                classList = Array.from(this.classList),
                properties = {},
                selectorText;

            for (var i in classList) classList[i] = `.${classList[i]}`;//turn each class to css class format [.class]

            for (var i = 0; i < styleSheets.length; i++) {//loop through all the css rules in document/app
                cssRules = styleSheets[i].cssRules;
                for (var j = 0; j < cssRules.length; j++) {
                    selectorText = cssRules[j].selectorText; //for each selector text check if element has it as a css property
                    if (selectorText == `#${id}` || selectorText == nodeName || classList.indexOf(selectorText) != -1) {
                        properties[selectorText] = {};
                        let style = cssRules[j].style;
                        for (let n in style) {
                            if (style[n] !== '') [
                                properties[selectorText][n] = style[n]
                            ]
                        }
                    }
                }
            }

            //if element has property add it to css property
            properties['style'] = this.css();
            return properties;
        }

        //Get the values of property 
        Element.prototype.getCssProperties = function (property = '') {
            let allProperties = this.getAllCssProperties();
            let properties = {};
            for (let name in allProperties) {
                properties[name] = {};
                for (let p in allProperties[name]) {
                    if (property == p) properties[name][p] = allProperties[name][p];
                }
            }

            return properties;
        }

        // Check if this element has this property
        Element.prototype.hasCssProperty = function (property = '') {
            var properties = this.getCssProperties(property); //get elements css properties
            for (var i in properties) {//loop through json object
                if (self.isset(properties[i]) && properties[i] != '') {
                    return true;// if property is found return true
                }
            }
            return false;
        }

        //Get the most relavant value for the property
        Element.prototype.cssPropertyValue = function (property = '') {
            //check for the value of a property of an element
            var properties = this.getCssProperties(property),
                id = this.id,
                classList = Array.from(this.classList);

            if (self.isset(properties['style']) && properties['style'] != '') return properties['style'];//check if style rule has the propert and return it's value
            if (self.isset(id) && self.isset(properties[`#${id}`]) && properties[`#${id}`] != '') return properties[`#${id}`];//check if element id rule has the propert and return it's value
            for (var i of classList) {//check if any class rule has the propert and return it's value
                if (self.isset(properties[`.${i}`]) && properties[`.${i}`] != '') return properties[`.${i}`];
            }
            //check if node rule has the propert and return it's value
            if (self.isset(properties[this.nodeName]) && properties[this.nodeName] != '') return properties[this.nodeName];
            return '';
        }

        // Get and Set the css values
        Element.prototype.css = function (styles = {}) {
            // set css style of element using json
            if (self.isset(styles)) {
                Object.keys(styles).map((key) => {
                    this.style[key] = styles[key];
                });
            }

            return self.extractCSS(this);
        }

        // Remove a css property
        Element.prototype.cssRemove = function (styles = []) {
            //remove a group of properties from elements style
            if (Array.isArray(styles)) {
                for (var i of styles) {
                    this.style.removeProperty(i);
                }
            }
            else {
                this.style.removeProperty(styles);
            }
            return this.css();
        }

        // Toggle a child element
        Element.prototype.toggleChild = function (child) {
            //Add child if element does not have a child else remove the child form the element
            var name, _classes, id, found = false;
            console.log(child);

            this.children.forEach(node => {
                name = node.nodeName;
                _classes = node.classList;
                id = node.id;
                if (name == child.nodeName && id == child.id && _classes.toString() == child.classList.toString()) {
                    node.remove();
                    found = true;
                }
            });
            if (!found) this.append(child);
        }

        //remove all classes except some
        Element.prototype.clearClasses = function (except = '') {
            except = except.split(',');
            for (let j in except) {
                except[j] = except[j].trim();
            }
            for (let i of this.classList) {
                if (self.isset(except) && except.includes(i)) continue;
                this.classList.remove(i);
            }
        };

        //remove classes
        Element.prototype.removeClasses = function (classes = '') {
            classes = classes.split(',');
            for (let i of classes) {
                i = i.trim();
                if (i != '') {
                    this.classList.remove(i);
                }
            }
        };

        //add classes
        Element.prototype.addClasses = function (classes = '') {
            classes = classes.split(',');
            for (let i of classes) {
                i = i.trim();
                if (i != '') {
                    this.classList.add(i);
                }
            }
        };

        //toggle classes
        Element.prototype.toggleClasses = function (classes = '') {
            classes = classes.split(',');
            for (let i of classes) {
                i = i.trim();
                if (i != '') {
                    this.classList.toggle(i);
                }
            }
        };

        // Remove a class from element classlist
        Element.prototype.removeClass = function (_class = '') {
            this.classList.remove(_class);
            return this;
        }

        // Check if element classlist contains a group of classes
        Element.prototype.hasClasses = function (classList = []) {
            for (let mClass of classList) {
                if (!this.classList.contains(mClass)) return false;
            }
            return true;
        }

        // add a class to element classlist
        Element.prototype.addClass = function (_class = '') {
            this.classList.add(_class);
            return this;
        }

        // toggle a class in element classlist
        Element.prototype.toggleClass = function (_class = '') {
            // (this.classList.contains(_class)) ? this.classList.remove(_class) : this.classList.add(_class);
            this.classList.toggle(_class);
            return this;
        }

        //Get the position of element in dom
        Element.prototype.position = function (params = {}) {
            if (self.isset(params)) {
                Object.keys(params).map(key => {
                    params[key] = (new String(params[key]).slice(params[key].length - 2) == 'px') ? params[key] : `${params[key]}px`;
                });
                this.css(params);
            }
            let position = this.getBoundingClientRect();

            return position;
        }

        //check if element is within container
        Element.prototype.inView = function (parentIdentifier = '') {
            let parent = this.getParents(parentIdentifier);
            let top = this.position().top;
            let flag = false;

            if (!self.isnull(parent)) {
                flag = top >= 0 && top <= parent.clientHeight;
            }
            return flag;
        }

        //Check if a class exists in element's classlist
        Element.prototype.hasClass = function (_class = '') {
            return this.classList.contains(_class);
        }

        // Set a list of properties for an element
        Element.prototype.setProperties = function (properties = {}) {
            for (let i in properties) {
                this[i] = properties[i];
            }
        };

        // Set a list of attributes for an element
        Element.prototype.setAttributes = function (attributes = {}) {
            for (let i in attributes) {
                if (i == 'style') {
                    this.css(attributes[i]);
                }
                else {
                    this.setAttribute(i, attributes[i]);
                }
            }
        };

        // Get the values of a list of attributes
        Element.prototype.getAttributes = function (names = []) {
            if (!self.isset(names)) names = this.getAttributeNames();
            let attributes = {};

            for (let name of names) {
                attributes[name] = this.getAttribute(name);
            }
            return attributes;
        }

        //Create and attatch an element in an element
        Element.prototype.makeElement = function (params = { element: '', attributes: {} }) {
            this.setKeyAsync();

            let element = self.createElement(params, this);
            return element;
        }

        // Get an elements ancestor with a specific attribute
        Element.prototype.getParents = function (name = '', value = '') {
            var attribute = name.slice(0, 1);
            var parent = this.parentNode;
            if (attribute == '.') {
                while (parent) {
                    if (self.isset(parent.classList) && parent.classList.contains(name.slice(1))) {
                        break;
                    }
                    parent = parent.parentNode;
                }
            }
            else if (attribute == '#') {
                while (parent) {
                    if (self.isset(parent.id) && parent.id == name.slice(1)) {
                        break;
                    }
                    parent = parent.parentNode;
                }
            }
            else {
                while (parent) {
                    if (self.isset(parent.nodeName) && parent.nodeName.toLowerCase() == name.toLowerCase()) {
                        break;
                    }
                    else if (self.isset(parent.hasAttribute) && parent.hasAttribute(name)) {
                        if (self.isset(value) && parent.getAttribute(name) == value) {
                            break;
                        }
                        else break;
                    }
                    parent = parent.parentNode;
                }
            }
            return parent;
        }

        // Toggle the display of an element
        Element.prototype.toggle = function () {
            if (this.style.display == 'none' || this.style.visibility == 'hidden') this.show();
            else this.hide();
        }

        //Hide an element in dom
        Element.prototype.hide = function () {
            // if (self.isset(this.style.display)) this.temp.display = this.style.display;
            // if (self.isset(this.style.visibility)) this.temp.visibility = this.style.visibility;

            this.style.display = 'none';
            // this.style.visibility = 'hidden';
            return this;
        }

        //Show an element in dom
        Element.prototype.show = function () {
            // if (this.style.display == 'none') {
            //     // if (self.isset(this.temp.display)) {
            //     //     this.css({ display: this.temp.display });
            //     // }
            //     // else this.cssRemove(['display']);
            // }
            this.cssRemove(['display']);
            return this;
        }

        //Remove all the children of an element with exceptions of some
        Element.prototype.removeChildren = function (params = { except: [] }) {
            let exceptions = [];
            params = params || {};
            params.except = params.except || [];
            let except = params.except;
            for (let i = 0; i < except.length; i++) {
                let all = this.findAll(except[i]);
                for (let j = 0; j < all.length; j++) {
                    if (!exceptions.includes(all[j])) exceptions.push(all[j]);
                }
            }

            this.children.forEach(node => {
                if (!exceptions.includes(node)) node.remove();
            });

            return this;
        }

        //Delete an element from the dom and virtual dom
        Element.prototype.delete = function () {
            if (self.isset(this.dataset.domKey)) {
                delete self.virtual[this.dataset.domKey];
            }
            this.remove();
        }

        //Delete an elements child from the dom and the virtual dom
        Element.prototype.deleteChild = function (child) {
            child.delete();
            return this;
        }

        // Toggle a list of children of an element
        Element.prototype.toggleChildren = function (params = { name: '', class: '', id: '' }) {
            Array.from(this.children).forEach(node => {
                if (!((self.isset(params.name) && params.name == node.nodeName) || self.isset(params.class) && self.hasArrayElement(Array.from(node.classList), params.class.split(' ')) || (self.isset(params.id) && params.id == node.id))) {
                    node.toggle();

                } else {
                    node.toggle();
                }
            });
        }

        // Attatch an element to another element [append or prepend]
        Element.prototype.attachElement = function (element, attachment = 'append') {
            this[attachment](element);
        }

        Element.prototype.pressed = function (callback = () => { }) {
            let startTime = 0, endTime = 0;
            this.addMultipleEventListener('mousedown, touchstart', event => {
                startTime = event.timeStamp;
            });

            this.addMultipleEventListener('mouseup, touchend', event => {
                endTime = event.timeStamp;
                event.duration = endTime - startTime;

                callback(event);
            });
        }
    }

    htmlCollectionLibrary() {
        let self = this;

        HTMLCollection.prototype.popIndex = function (position = 0) {
            let collection = self.createElement({ element: 'sample' }).children;

            let list = Array.from(this);

            for (let i = 0; i < list.length; i++) {
                if (i == position) continue;
                collection[i] = this.item(i);
                console.log(collection);

            }

            return collection;
        }

        HTMLCollection.prototype.forEach = function (callback = () => { }) {
            let list = Array.from(this);
            for (let i = 0; i < list.length; i++) {
                callback(list[i], i)
            }
        };

        HTMLCollection.prototype.each = function (callback = () => { }) {
            let list = Array.from(this);
            for (let i = 0; i < list.length; i++) {
                callback(list[i], i)
            }
        }


        HTMLCollection.prototype['indexOf'] = function (element) {
            let list = Array.from(this);
            for (let i in list) {
                if (list == element) return i;
            }
            return -1;
        };

        HTMLCollection.prototype['includes'] = function (element) {
            return this.indexOf(element) != -1;
        };

        HTMLCollection.prototype['nodesBetween'] = function (elementA, elementB) {
            let inBetweenNodes = [];
            let list = Array.from(this);

            for (let aParent of list) {
                if (aParent == elementA || aParent == elementB || aParent.isAncestor(elementA) || aParent.isAncestor(elementB)) {
                    inBetweenNodes.push(aParent);
                }
            }

            return inBetweenNodes;
        };
    }

    nodeLibrary() {
        let self = this;

        Node.prototype.states = {};
    }

    nodeListLibrary() {
        let self = this;

        NodeList.prototype['each'] = function (callback = () => { }) {
            for (let i = 0; i < this.length; i++) {
                callback(this[i], i)
            }
        }

        NodeList.prototype['indexOf'] = function (element) {
            for (let i in this) {
                if (this[i] == element) return i;
            }
            return -1;
        };

        NodeList.prototype['includes'] = function (element) {
            return this.indexOf(element) != -1;
        };

        NodeList.prototype['nodesBetween'] = function (elementA, elementB) {
            let inBetweenNodes = [];
            for (let aParent of this) {
                if (aParent == elementA || aParent == elementB || aParent.isAncestor(elementA) || aParent.isAncestor(elementB)) {
                    inBetweenNodes.push(aParent);
                }
            }

            return inBetweenNodes;
        };
    }
}