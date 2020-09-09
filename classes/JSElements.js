global.Dom = require('jsdom').JSDOM;
global.window = new Dom(`...`).window;
global.document = window.document;
global.Element = window.Element;
global.NodeList = window.NodeList;
global.HTMLCollection = window.HTMLCollection;
global.Node = window.Node;
global.HTMLElement = window.HTMLElement;
global.location = window.location;

let Period = require('./Period');

module.exports = class JSElements extends Period {
    constructor() {
        super();
    }

    loadCss(href = '') {
        document.head.makeElement({ element: 'link', attributes: { rel: 'stylesheet', type: 'text/css', href } });
    }

    jsonForm(form) {
        let json = {};
        let perform = (element) => {
            let children = element.children;
            for (let i = 0; i < children.length; i++) {
                perform(children[i]);
            }
            if (element.hasAttribute('name')) {
                if (element.type == 'file') {
                    if (element.hasAttribute('multiple')) {
                        json[element.getAttribute('name')] = element.files;
                    }
                    else {
                        json[element.getAttribute('name')] = element.files[0];
                    }
                }
                else {
                    json[element.getAttribute('name')] = element.value;
                }
            }
        }

        perform(form);
        return json;
    }

    jsonElement(_element_) {
        let element = _element_.nodeName.toLowerCase();
        let attributes = _element_.getAttributes();
        attributes.style = _element_.css();
        let children = [];
        for (let i = 0; i < _element_.children.length; i++) {
            children.push(_element_.children[i].toJson());
        }
        return { element, attributes, children }
    }

    createFromObject(object = {}, singleParent) {
        let created, name;
        if (object.element instanceof Element) {
            created = object.element;
            name = created.nodeName;
        }
        else {
            name = object.element.toLowerCase();
            created = document.createElement(object.element);//generate the element
        }

        if (this.isset(object.attributes)) {//set the attributes
            for (var attr in object.attributes) {
                if (attr == 'style') {//set the styles
                    created.css(object.attributes[attr]);
                }
                else created.setAttribute(attr, object.attributes[attr]);
            }
        }

        if (this.isset(object.text)) {
            created.textContent = object.text;//set the innerText
        }

        if (this.isset(object.html)) {
            created.innerHTML = object.html;//set the innerHTML
        }

        if (this.isset(object.value)) {
            created.value = object.value;//set the value
        }

        if (name.includes('-')) {
            created = this.createFromHTML(created.outerHTML);
        }

        if (this.isset(singleParent)) {
            singleParent.attachElement(created, object.attachment);
        }

        if (this.isset(object.children)) {
            created.makeElement(object.children);
        }

        if (this.isset(object.options) && Array.isArray(object.options)) {//add options if isset           
            for (var i of object.options) {
                let option = created.makeElement({ element: 'option', value: i, text: i, attachment: 'append' });
                if (this.isset(object.selected) && object.selected == i) {
                    option.setAttribute('selected', true);
                }
                if (i.toString().toLowerCase() == 'null') {
                    option.setAttribute('disabled', true);
                }
            }
        }

        if (this.isset(created.dataset.icon)) {
            created.addClasses(created.dataset.icon);
        }

        return created;
    }

    createFromHTML(htmlString = '', singleParent) {
        let parser = new DOMParser();
        let html = parser.parseFromString(htmlString, 'text/html');

        let created = html.body.firstChild;

        if (htmlString.indexOf('html') == 1) {
            created = html;
        }
        else if (htmlString.indexOf('body') == 1) {
            created = html.body;
        }

        if (this.isset(singleParent)) singleParent.attachElement(created, singleParent.attachment);
        return created;
    }

    createPerceptorElement(object, singleParent) {
        let created = this[object.perceptorElement](object.params);
        if (this.isset(singleParent)) {
            singleParent.attachElement(created, object.attachment);
        }
        return created;
    }

    getElement(singleParam = { element: '', attributes: {} }, singleParent) {
        var element;
        //if params is a HTML String
        if (typeof singleParam == 'string') {
            element = this.createFromHTML(singleParam, singleParent);
        }
        else if (singleParam instanceof Element) {
            element = singleParam;
            if (this.isset(singleParent)) singleParent.attachElement(element, singleParam.attachment);
        }
        //if params is object
        else if (typeof singleParam == 'object') {
            if (singleParam.perceptorElement) {
                element = this.createPerceptorElement(singleParam, singleParent);
            }
            else {
                element = this.createFromObject(singleParam, singleParent);
            }
        }

        if (!this.isset(element.setKey)) element.setKey();

        if (this.isset(singleParam.list)) {
            let list = element.makeElement({ element: 'datalist', options: singleParam.list });
            element.setAttribute('list', element.dataset.domKey);
            list.setAttribute('id', element.dataset.domKey);
        }

        if (this.isset(singleParam.state)) {
            let owner = element.getParents(singleParam.state.owner, singleParam.state.value);
            if (!this.isnull(owner)) {
                owner.addState({ name: singleParam.state.name, state: element });
                element.dataset.stateStatus = 'set';
            } else {
                element.dataset.stateStatus = 'pending';
            }
        }

        return element;
    };

    createElement(params = { element: '', attributes: {} }, parent) {
        if (Array.isArray(params)) {
            let elements = [];
            for (let param of params) {
                elements.push(this.getElement(param, parent));
            }
            return elements;
        } else {
            let element = this.getElement(params, parent);
            return element;
        }
    }

    validateFormTextarea(element) {
        if (element.value == '') {
            return false;
        }
        return true;
    }

    validateFormInput(element) {
        var type = element.getAttribute('type');
        var value = element.value;

        if (this.isnull(type)) {
            return !this.isSpaceString(value);
        }

        type = type.toLowerCase();
        if (type == 'file') {
            return value != '';
        }
        else if (type == 'text') {
            return !this.isSpaceString(value);
        }
        else if (type == 'date') {
            if (this.hasString(element.className, 'future')) {
                return this.isDate(value);
            } else {
                return this.isDateValid(value);
            }
        }
        else if (type == 'email') {
            return this.isEmail(value);
        }
        else if (type == 'number') {
            return this.isNumber(value);
        }
        else if (type == 'password') {
            return this.isPasswordValid(value);
        }
        else {
            return !this.isSpaceString(value);
        }
    }

    validateFormSelect(element) {
        if (element.value == 0 || element.value.toLowerCase() == 'null') {
            return false;
        }

        return true;
    }

    validateForm(form, options) {
        options = options || {};
        options.nodeNames = options.nodeNames || 'INPUT, SELECT, TEXTAREA';
        let flag = true,
            nodeName,
            elementName,
            elements = form.findAll(options.nodeNames);

        let validateMe = me => {
            let value;
            if (nodeName == 'INPUT') {
                value = this.validateFormInput(me);
            }
            else if (nodeName == 'SELECT') {
                value = this.validateFormSelect(me);
            }
            else if (nodeName == 'TEXTAREA') {
                value = this.validateFormTextarea(me);
            }
            else {
                value = this.validateOtherElements(me);
            }

            return value;
        }

        for (let i = 0; i < elements.length; i++) {
            nodeName = elements[i].nodeName;
            elementName = elements[i].getAttribute('name');

            if (elements[i].getAttribute('ignore') == 'true') {
                continue;
            }

            if (this.isset(options.names)) {
                if (options.names.includes(elementName)) {
                    flag = validateMe(elements[i]);
                }
                else {
                    continue;
                }
            }
            else {
                flag = validateMe(elements[i]);
            }

            if (!flag) {
                break;
            }
        }

        return { flag, elementName };
    }

    validateOtherElements(element) {
        let value = false;
        if (this.isset(element.value) && element.value != '') value = true;
        return value;
    }

    ValidateFormImages(form) {
        return (type == 'file' && !self.isImageValid(value));
    }

    isImageValid(input) {
        var ext = input.substring(input.lastIndexOf('.') + 1).toLowerCase();
        if (ext == "png" || ext == "gif" || ext == "jpeg" || ext == "jpg") {
            return true;
        } else {
            return false;
        }
    }

    imageToJson(file, callBack = () => { }) {
        let fileReader = new FileReader();
        let myfile = {};
        fileReader.onload = (event) => {
            myfile.src = event.target.result;
            callBack(myfile);
        };

        myfile.size = file.size;
        myfile.type = file.type;
        fileReader.readAsDataURL(file);
    }
}