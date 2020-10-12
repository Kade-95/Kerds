import { Func } from './../classes/Func.js';
const func = new Func();

function Piece(params) {
    let self = createPiece(params);

    self.toJson = function () {
        let element = self.nodeName.toLowerCase();
        let attributes = self.getAttributes();
        attributes.style = self.css();
        let children = [];
        for (let i = 0; i < self.children.length; i++) {
            children.push(self.children[i].toJson());
        }
        return { element, attributes, children }
    }

    self.setOptions = function (options, params) {
        params = params || {};
        if (func.isset(params.flag)) {
            self.innerHTML = '';
        }

        for (let i = 0; i < options.length; i++) {
            let text = options[i].text || options[i];
            let value = options[i].value || options[i];

            let option = self.makeElement({ element: 'option', attributes: { value }, text });

            if (value.toString().toLowerCase() == 'null') {
                option.setAttribute('disabled', true);
            }

            if (func.isset(params.selected) && value == params.selected) {
                option.setAttribute('selected', true);
            }
        }
    };

    self.commonAncestor = function (elementA, elementB) {
        for (let ancestorA of elementA.parents()) {
            for (let ancestorB of elementB.parents()) {
                if (ancestorA == ancestorB) return ancestorA;
            }
        }

        return null;
    }

    self.onAdded = function (callback) {
        self.addEventListener('DOMNodeInsertedIntoDocument', event => {
            callback();
        });
    }
    //Store the states of an element here
    self.states = {};

    //self is a temporary storage for elements attributes
    self.temp = {};

    //self listens and handles for multiple bubbled events
    self.manyBubbledEvents = function (events, callback) {
        events = events.split(',');
        for (let event of events) {
            self.bubbledEvent(event.trim(), callback);
        }
    }

    //self listens and handles for multiple bubbled events that did not bubble
    self.manyNotBubbledEvents = function (events, callback) {
        events = events.split(',');
        for (let event of events) {
            self.notBubbledEvent(event.trim(), callback);
        }
    }

    //self handles all events that are bubbled within an element and it's children
    self.bubbledEvent = function (event, callback) {
        //Listen for self event on the entire document
        document.addEventListener(event, event => {
            //if the event bubbles up the element fire the callback
            if (event.target == self || self.isAncestor(event.target)) {
                callback(event);
            }
        });
    }

    //self handles all events that are not bubbled within an element and it's children
    self.notBubbledEvent = function (event, callback) {
        document.addEventListener(event, event => {
            if (!(event.target == self || self.isAncestor(event.target))) {
                callback(event);
            }
        });
    }

    //Listen to multiple events at time with a single callback function
    self.addMultipleEventListener = function (events, callback) {
        events = events.split(',');
        for (let event of events) {
            self.addEventListener(event.trim(), e => {
                callback(e);
            });
        }
    }

    //perform actions on mouseenter and mouseleave
    self.hover = function (params) {

        let css = [];
        let cssValues;

        self.addMultipleEventListener('mouseenter', event => {
            cssValues = self.css();//store the current css values
            if (func.isset(params.css)) {//if action is to change the styling
                css = func.array.each(Object.keys(params.css), value => {//store the new css style names to remove later
                    return func.cssStyleName(value);
                });
                self.css(params.css);//set the css styles
            }
            if (func.isfunction(params.do)) {// if action is to perform do
                params.do(event);
            }
        });

        self.addMultipleEventListener('mouseleave', event => {
            if (func.isset(params.css)) {//if action was to change the styling
                self.cssRemove(css);//remove the new styling
                self.css(cssValues);//set the old ones
            }
        });
    };

    //a shorter name for querySelector
    self.find = function (name, position) {
        let element = null;
        if (func.isset(position)) {//get the all the elements found and return the one at self particular position
            self.querySelectorAll(name).forEach((e, p) => {
                if (position == p) element = e;
            });
        }
        else {
            element = self.querySelector(name);
        }
        return element;
    };

    //a shorter name for querySelectorAll
    self.findAll = function (name, options) {
        return self.querySelectorAll(name);
    }

    //perform an extended querySelection on self element
    self.search = function (name, options, position = 0) {
        let element = null;
        let foundElements = [];//all the elements meeting the requirements

        if (func.isset(options)) {//if the options to check is set
            let allElements = self.querySelectorAll(name);//get all the possible elements

            //loop through them and check if the match the options
            for (let i = 0; i < allElements.length; i++) {
                element = allElements[i];

                //check for the attributes
                if (func.isset(options.attributes)) {
                    for (let attr in options.attributes) {
                        // check all the attributes one after the other
                        if (element.getAttribute(attr) != options.attributes[attr]) {
                            element = null;
                            continue;
                        }
                    }
                    //if self element is no long valid skip it
                    if (func.isnull(element)) continue;
                }

                //check for the ID
                if (func.isset(options.id) && options.id != element.id) {
                    element = null;
                    continue;
                }

                //check for the class
                if (func.isset(options.class) && !element.classList.contains(options.class)) {
                    element = null;
                    continue;
                }

                //check for the classes
                if (func.isset(options.classes) && !element.hasClasses(options.classes)) {
                    element = null;
                    continue;
                }

                //check for the nodename
                if (func.isset(options.nodeName) && element.nodeName.toLowerCase() != options.nodeName) {
                    element = null;
                    continue;
                }

                //check if to return for a particular position
                if (position <= 0) return element;
                foundElements.push(element);
            }
            //get the element at the specified position
            if (foundElements.length && func.isset(foundElements[position])) {
                element = foundElements[position];
            }
            else {
                element = null;
            }
        }
        else {
            element = self.find(name);
        }

        return element;
    };

    //perform search for all the elements that meet a requirement
    self.searchAll = function (name, options) {
        if (func.isset(options)) {
            let allElements = self.querySelectorAll(name);
            let elements = [];
            for (let i = 0; i < allElements.length; i++) {
                let element = allElements[i];
                if (func.isset(options.attributes)) {
                    for (let attr in options.attributes) {
                        if (element.getAttribute(attr) != options.attributes[attr]) {
                            element = null;
                            continue;
                        }
                    }
                }

                if (func.isset(options.id) && options.id != element.id) {
                    element = null;
                    continue;
                }

                if (func.isset(options.class) && !element.classList.contains(options.class)) {
                    element = null;
                    continue;
                }

                if (func.isset(options.classes) && !element.hasClasses(options.classes)) {
                    element = null;
                    continue;
                }

                if (func.isset(options.nodeName) && element.nodeName.toLowerCase() != options.nodeName) {
                    element = null;
                    continue;
                }

                if (!func.isnull(element)) {
                    elements.push(element);
                }
            }
            return elements;
        }
        return self.querySelectorAll(name);
    }

    //look for multiple single elements at a time
    self.fetch = function (names, options) {
        let elements = {};
        for (let name of names) {
            elements[name] = self.find(name, options);
        }

        return elements;
    }

    //look for multiple nodelists at a time
    self.fetchAll = function (names, options) {
        let elements = {};
        for (let name of names) {
            elements[name] = self.findAll(name, options);
        }

        return elements;
    }

    //Get the nodes between two child elements
    self.nodesBetween = function (elementA, elementB) {
        let inBetweenNodes = [];
        for (let child of Array.from(self.children)) {//get all the children
            //check if the two elements are children of self element
            if (child == elementA || child == elementB || child.isAncestor(elementA) || child.isAncestor(elementB)) {
                inBetweenNodes.push(child);
            }
        }

        return inBetweenNodes;
    }

    //Get if element is child of an element
    self.isAncestor = function (child) {
        let parents = child.parents();//Get all the parents of child
        return parents.includes(self);
    };

    //Get all the parents of an element until document
    self.parents = function (params) {
        let parents = [];
        let currentParent = self.parentNode;
        while (currentParent != null) {
            parents.push(currentParent);
            currentParent = currentParent.parentNode;
        }

        return parents;
    };

    self.customParents = function () {
        let parents = self.parents();
        let customParents = [];
        for (let i = 0; i < parents.length; i++) {
            if (parents[i].nodeName.includes('-')) {
                customParents.push(parents[i]);
            }
        }
        return customParents;
    }

    //Remove a state from an element
    self.removeState = function (params) {
        let state = self.getState(params);//get the state (element)
        if (func.isset(state) && func.isset(params.force)) {//if state exists and should be deleted
            if (func.isset(state.dataset.domKey)) {
                delete func.virtual[state.dataset.domKey];//delete the element from virtual dom
            }
            state.remove();//remove the element from dom
        }
        self.removeAttribute(`data-${params.name}`);//remove the state from element
    }

    //Get an element's state 
    self.getState = function (params) {
        let state = null;
        let stateName;

        //get the state name
        if (typeof params == 'string') {
            stateName = params;
        }
        else if (func.isset(self.dataset[`${params.name}`])) {
            stateName = params.name;
        }

        if (func.isset(stateName)) {//get the state
            state = func.virtual[self.dataset[stateName]];
            // let state = func.objectToArray(self.states[stateName]).pop();
        }

        return state;
    };

    //add a state to an element
    self.addState = function (params) {
        //make sure the state has a domkey
        if (!func.isset(params.state.dataset.domKey)) {
            params.state.setKey();
        }

        //add the state to the elements dataset
        self.dataset[params.name] = params.state.dataset.domKey;
        self.states[params.name] = {}//initialize the state
        return self;
    };

    //set the state of an element
    self.setState = function (params) {
        let state = self.getState(params);
        let found = self.states[params.name][JSON.stringify(params)];

        // if (func.isset(found)) {
        //     state.innerHTML = found.innerHTML;
        //     state.setAttributes(found.getAttributes());
        // }
        // else {
        //     state.setAttributes(params.attributes);
        //     if (func.isset(params.children)) {//add the children if set
        //         state.makeElement(params.children);
        //     }
        //     if (func.isset(params.render)) {//add the children if set
        //         state.render(params.render);
        //     }
        //     if (func.isset(params.text)) state.textContent = params.text;//set the innerText
        //     if (func.isset(params.value)) state.value = params.value;//set the value
        //     if (func.isset(params.options)) {//add options if isset
        //         for (var i of params.options) {
        //             state.makeElement({ element: 'option', value: i, text: i, attachment: 'append' });
        //         }
        //     }

        //     self.states[params.name][JSON.stringify(params)] = state.cloneNode(true);
        // }

        state.setAttributes(params.attributes);
        if (func.isset(params.children)) {//add the children if set
            state.makeElement(params.children);
        }
        if (func.isset(params.render)) {//add the children if set
            state.render(params.render);
        }
        if (func.isset(params.text)) state.textContent = params.text;//set the innerText
        if (func.isset(params.html)) state.innerHTML = params.html;//set the innerText
        if (func.isset(params.value)) state.value = params.value;//set the value
        if (func.isset(params.options)) {//add options if isset
            for (var i of params.options) {
                state.makeElement({ element: 'option', value: i, text: i, attachment: 'append' });
            }
        }

        self.states[params.name][JSON.stringify(params)] = state.cloneNode(true);

        return state;
    };

    //async version of setstate
    self.setKeyAsync = async function (params) {
        return await self.setKey(params);
    };

    //set element's dom key for the virtual dom
    self.setKey = function () {
        let key = Date.now().toString(36) + Math.random().toString(36).slice(2);//generate the key
        if (!func.isset(self.dataset.domKey)) {//does self element have a key
            self.dataset.domKey = key;
        } else {
            key = self.dataset.domKey;
        }
        func.virtual[key] = self;//add it to the virtual dom
        return key;
    };

    //drop down a child
    self.dropDown = function (element) {
        let parentContent = self.cloneNode(true);
        self.innerHTML = '';
        self.append(parentContent);
        parentContent.css({ boxShadow: '1px 1px 1px 1px #aaaaaa' });
        self.css({ boxShadow: '0.5px 0.5px 0.5px 0.5px #cccccc' });

        let dropContainer = self.makeElement({
            element: 'div', attributes: { class: 'drop-down' }
        });
        dropContainer.append(element);

        self.removeDropDown = () => {
            dropContainer.remove();
            parentContent.css({ boxShadow: 'unset' });
            self.innerHTML = parentContent.innerHTML;
        }

        return self;
    };

    //stop monitoring self element for changes
    self.stopMonitor = function () {
        if (self.observe) self.observer.disconnect();//disconnect observer
        return self;
    }

    //Check if an attribute has changed in self element
    self.onAttributeChange = function (attribute, callback) {
        self.addEventListener('attributesChanged', event => {
            if (event.detail.attributeName == attribute) {
                callback(event);
            }
        });
    }

    // monitor self element for changes
    self.monitor = function (config = { attributes: true, childList: true, subtree: true }) {
        self.observer = new MutationObserver((mutationList, observer) => {
            if (mutationList.length) self.dispatchEvent(new CustomEvent('mutated'));//fire mutated event for it
            for (let mutation of mutationList) {
                if (mutation.type == 'childList') {//if the change was a child fire childlistchanged event
                    self.dispatchEvent(new CustomEvent('childListchanged', { detail: mutation }));
                }
                else if (mutation.type == 'attributes') {//if the change was a child fire childlistchanged event
                    self.dispatchEvent(new CustomEvent('attributesChanged', { detail: mutation }));
                }
                else if (mutation.type == 'characterData') {//if the change was a child fire childlistchanged event
                    self.dispatchEvent(new CustomEvent('characterDataChanged', { detail: mutation }));
                }
            }
        });

        self.observer.observe(self, config);
        return self;
    }

    self['checkChanges'] = function (callback) {
        self.monitor();
        self.addEventListener('mutated', event => {
            callback(event);
        });
    };

    // check when the value of an element is changed
    self.onChanged = function (callBack) {
        let value = self.getAttribute('value');
        let updateMe = (event) => {
            // if element is input element
            if (event.target.nodeName == 'INPUT') {
                if (event.target.type == 'date') {// if the type is date, check if the date is valid then update the attribute
                    if (self.isDate(self.value)) self.setAttribute('value', self.value);
                }
                else if (event.target.type == 'time') {// if the type is time, check if the time is valid then update the attribute
                    if (self.isTimeValid(self.value)) self.setAttribute('value', self.value);
                }
                else if (event.target.type == 'file') {
                    let fileName = event.target.value;
                    let file = event.target.files[0];
                    if (file.type.indexOf('image') == 0) {
                        func.imageToJson(file, callBack);
                    }
                }
                else {
                    self.setAttribute('value', self.value);//update the attribute
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
                self.setAttribute('value', self.value);
            }
            else if (event.target.nodeName == 'SELECT-ELEMENT') {
                self.setAttribute('value', self.value);
            }
            else {
                self.value = self.textContent;
            }

            if (func.isset(callBack) && event.target.type != 'file') {
                callBack(self.value, event);//fire the callback function
            }
        };

        // if change is caused by keyboard
        self.addEventListener('keyup', (event) => {
            updateMe(event);
        });

        // if change is caused programatically
        self.addEventListener('change', (event) => {
            updateMe(event);
        });
    };

    //render the contents of an element
    self.render = function (params, except) {
        if (func.isset(except)) self.removeChildren(except);//remove the contents of the element with exceptions
        else self.removeChildren();
        self.makeElement(params);//append the new contents of the element
    }

    //Get all the styles for the ID, the classes and the element
    self.getAllCssProperties = function () {
        let styleSheets = Array.from(document.styleSheets),//get all the css styles files and rules
            cssRules,
            id = self.id,
            nodeName = self.nodeName,
            classList = Array.from(self.classList),
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
        properties['style'] = self.css();
        return properties;
    }

    //Get the values of property 
    self.getCssProperties = function (property) {
        let allProperties = self.getAllCssProperties();
        let properties = {};
        for (let name in allProperties) {
            properties[name] = {};
            for (let p in allProperties[name]) {
                if (property == p) properties[name][p] = allProperties[name][p];
            }
        }

        return properties;
    }

    // Check if self element has self property
    self.hasCssProperty = function (property) {
        var properties = self.getCssProperties(property); //get elements css properties
        for (var i in properties) {//loop through json object
            if (func.isset(properties[i]) && properties[i] != '') {
                return true;// if property is found return true
            }
        }
        return false;
    }

    //Get the most relavant value for the property
    self.cssPropertyValue = function (property) {
        //check for the value of a property of an element
        var properties = self.getCssProperties(property),
            id = self.id,
            classList = Array.from(self.classList);

        if (func.isset(properties['style']) && properties['style'] != '') return properties['style'];//check if style rule has the propert and return it's value
        if (func.isset(id) && func.isset(properties[`#${id}`]) && properties[`#${id}`] != '') return properties[`#${id}`];//check if element id rule has the propert and return it's value
        for (var i of classList) {//check if any class rule has the propert and return it's value
            if (func.isset(properties[`.${i}`]) && properties[`.${i}`] != '') return properties[`.${i}`];
        }
        //check if node rule has the propert and return it's value
        if (func.isset(properties[self.nodeName]) && properties[self.nodeName] != '') return properties[self.nodeName];
        return '';
    }

    // Get and Set the css values
    self.css = function (params) {
        // set css style of element using json
        if (func.isset(params)) {
            Object.keys(params).map((key) => {
                self.style[key] = params[key];
            });
        }

        return func.extractCSS(self);
    }

    // Remove a css property
    self.cssRemove = function (elements) {
        //remove a group of properties from elements style
        if (Array.isArray(elements)) {
            for (var i of elements) {
                self.style.removeProperty(i);
            }
        }
        else {
            self.style.removeProperty(elements);
        }
        return self.css();
    }

    // Toggle a child element
    self.toggleChild = function (child) {
        //Add child if element does not have a child else remove the child form the element
        var name, _classes, id, found = false;
        console.log(child);

        self.children.forEach(node => {
            name = node.nodeName;
            _classes = node.classList;
            id = node.id;
            if (name == child.nodeName && id == child.id && _classes.toString() == child.classList.toString()) {
                node.remove();
                found = true;
            }
        });
        if (!found) self.append(child);
    }

    self.clearClasses = function (except) {
        except = except.split(',');
        for (let j in except) {
            except[j] = except[j].trim();
        }
        for (let i of self.classList) {
            if (func.isset(except) && except.includes(i)) continue;
            self.classList.remove(i);
        }
    };

    self.removeClasses = function (classes) {
        classes = classes.split(',');
        for (let i of classes) {
            i = i.trim();
            if (i != '') {
                self.classList.remove(i);
            }
        }
    };

    self.addClasses = function (classes) {
        classes = classes.split(',');
        for (let i of classes) {
            i = i.trim();
            if (i != '') {
                self.classList.add(i);
            }
        }
    };

    self.toggleClasses = function (classes) {
        classes = classes.split(',');
        for (let i of classes) {
            i = i.trim();
            if (i != '') {
                self.classList.toggle(i);
            }
        }
    };

    // Remove a class from element classlist
    self.removeClass = function (_class) {
        self.classList.remove(_class);
        return self;
    }

    // Check if element classlist contains a group of classes
    self.hasClasses = function (classList) {
        for (let mClass of classList) {
            if (!self.classList.contains(mClass)) return false;
        }
        return true;
    }

    // add a class to element classlist
    self.addClass = function (_class) {
        self.classList.add(_class);
        return self;
    }

    // toggle a class in element classlist
    self.toggleClass = function (_class) {
        // (self.classList.contains(_class)) ? self.classList.remove(_class) : self.classList.add(_class);
        self.classList.toggle(_class);
        return self;
    }

    //Get the position of element in dom
    self.position = function (params) {
        if (func.isset(params)) {
            Object.keys(params).map(key => {
                params[key] = (new String(params[key]).slice(params[key].length - 2) == 'px') ? params[key] : `${params[key]}px`;
            });
            self.css(params);
        }
        let position = self.getBoundingClientRect();

        return position;
    }

    self.inView = function (parentIdentifier) {
        let parent = self.getParents(parentIdentifier);
        let top = self.position().top;
        let flag = false;

        if (!func.isnull(parent)) {
            flag = top >= 0 && top <= parent.clientHeight;
        }
        return flag;
    }

    //Check if a class exists in element's classlist
    self.hasClass = function (_class) {
        return self.classList.contains(_class);
    }

    // Set a list of properties for an element
    self.setProperties = function (properties) {
        for (let i in properties) {
            self[i] = properties[i];
        }
    };

    // Set a list of attributes for an element
    self.setAttributes = function (attributes) {
        for (let i in attributes) {
            if (i == 'style') {
                self.css(attributes[i]);
            }
            else {
                self.setAttribute(i, attributes[i]);
            }
        }
    };

    // Get the values of a list of attributes
    self.getAttributes = function (names) {
        if (!func.isset(names)) names = self.getAttributeNames();
        let attributes = {};

        for (let name of names) {
            attributes[name] = self.getAttribute(name);
        }
        return attributes;
    }

    //Create and attatch an element in an element
    self.makeElement = function (params) {
        self.setKeyAsync();

        let element = createPiece(params, self);
        return element;
    }

    // Get an elements ancestor with a specific attribute
    self.getParents = function (name, value) {
        var attribute = name.slice(0, 1);
        var parent = self.parentNode;
        if (attribute == '.') {
            while (parent) {
                if (func.isset(parent.classList) && parent.classList.contains(name.slice(1))) {
                    break;
                }
                parent = parent.parentNode;
            }
        }
        else if (attribute == '#') {
            while (parent) {
                if (func.isset(parent.id) && parent.id == name.slice(1)) {
                    break;
                }
                parent = parent.parentNode;
            }
        }
        else {
            while (parent) {
                if (func.isset(parent.nodeName) && parent.nodeName.toLowerCase() == name.toLowerCase()) {
                    break;
                }
                else if (func.isset(parent.hasAttribute) && parent.hasAttribute(name)) {
                    if (func.isset(value) && parent.getAttribute(name) == value) {
                        break;
                    }
                    else break;
                }
                parent = parent.parentNode;
            }
        }
        return parent;
    }

    self.fadeIn = function (params) {
        var opacity = new Number(0);
        self.style.opacity = opacity;
        var duration = (!func.isset(params) || !func.isset(params.duration)) ? 100 : params.duration;

        if (self.style.display == 'none') self.style.display = 'inline-block';
        if (self.style.visibility == 'hidden') self.style.visibility = 'visible';

        var fading = setInterval(() => {
            opacity++;
            if (opacity == 10) {
                if (func.isset(params) && func.isset(params.finish)) params.finish(self);
                clearInterval(fading);
            };
            self.style.opacity = opacity / 10;
        }, duration);
    }

    self.fadeOut = function (params) {
        var opacity = new Number(10);
        var duration = (!func.isset(params) || !func.isset(params.duration)) ? 100 : params.duration;

        var fading = setInterval(() => {
            opacity--;

            if (opacity == 0) {
                self.style.display = 'none';
                self.style.visibility = 'hidden';
                if (func.isset(params) && func.isset(params.finish)) params.finish(self);
                clearInterval(fading);
            };
            self.style.opacity = opacity / 10;
        }, duration);
    }

    self.fadeToggle = function (params) {
        if (self.style.display == 'none' || self.style.visibility == 'hidden') {
            self.fadeIn(params)
        }
        else {
            console.log(self.style.display)
            self.fadeOut(params);
        }
    }

    // Toggle the display of an element
    self.toggle = function (params) {
        if (self.style.display == 'none' || self.style.visibility == 'hidden') self.show();
        else self.hide();
    }

    //Hide an element in dom
    self.hide = function (params) {
        // if (func.isset(self.style.display)) self.temp.display = self.style.display;
        // if (func.isset(self.style.visibility)) self.temp.visibility = self.style.visibility;

        self.style.display = 'none';
        // self.style.visibility = 'hidden';
        return self;
    }

    //Show an element in dom
    self.show = function (params) {
        // if (self.style.display == 'none') {
        //     // if (func.isset(self.temp.display)) {
        //     //     self.css({ display: self.temp.display });
        //     // }
        //     // else self.cssRemove(['display']);
        // }
        self.cssRemove(['display']);
        return self;
    }

    //Remove all the children of an element with exceptions of some
    self.removeChildren = function (params) {
        let exceptions = [];
        params = params || {};
        params.except = params.except || [];
        let except = params.except;
        for (let i = 0; i < except.length; i++) {
            let all = self.findAll(except[i]);
            for (let j = 0; j < all.length; j++) {
                if (!exceptions.includes(all[j])) exceptions.push(all[j]);
            }
        }

        self.children.forEach(node => {
            if (!exceptions.includes(node)) node.remove();
        });

        return self;
    }

    //Delete an element from the dom and virtual dom
    self.delete = function () {
        if (func.isset(self.dataset.domKey)) {
            delete func.virtual[self.dataset.domKey];
        }
        self.remove();
    }

    //Delete an elements child from the dom and the virtual dom
    self.deleteChild = function (child) {
        child.delete();
        return self;
    }

    // Toggle a list of children of an element
    self.toggleChildren = function (params) {
        Array.from(self.children).forEach(node => {
            if (func.isset(params)) {
                if (!((func.isset(params.name) && params.name == node.nodeName) || func.isset(params.class) && func.hasArrayElement(Array.from(node.classList), params.class.split(' ')) || (func.isset(params.id) && params.id == node.id))) {
                    node.toggle();
                }
            } else {
                node.toggle();
            }
        });
    }

    // Attatch an element to another element [append or prepend]
    self.attachElement = function (element, attachment = 'append') {
        self[attachment](element);
    }

    self.pressed = function (callback) {
        let startTime = 0, endTime = 0;
        self.addMultipleEventListener('mousedown, touchstart', event => {
            startTime = event.timeStamp;
        });

        self.addMultipleEventListener('mouseup, touchend', event => {
            endTime = event.timeStamp;
            event.duration = endTime - startTime;

            callback(event);
        });
    }

    if (func.isset(params.children)) {
        self.makeElement(params.children);
    }

    return self;
}

function pieceFromHTML(htmlString) {
    let parser = new DOMParser();
    let html = parser.parseFromString(htmlString, 'text/html');

    let created = html.body.firstChild;

    if (htmlString.indexOf('html') == 1) {
        created = html;
    }
    else if (htmlString.indexOf('body') == 1) {
        created = html.body;
    }

    return
}

function pieceFromObject(params) {
    return document.createElement(params.element);
}

function createPiece(params, parent) {
    let piece;
    if (params instanceof Element) {
        piece = params;
    }
    else if (typeof params == 'string') {
        piece = pieceFromHTML(params);
    }
    else if (typeof params == 'object') {
        piece = pieceFromObject(params);
    }

    if (func.isset(parent) && parent instanceof Element) {
        Piece(parent);
        params.attachElement(piece, parent.attachElement);
    }

    return piece;
}


export { Piece };