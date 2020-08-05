let Template = require('./Template');

module.exports = class Components extends Template {
    constructor() {
        super();
        this.makeCustomElements();
    }

    createTab(params) {
        var tabTitle = this.createElement({ element: 'ul', attributes: { class: 'tab' } });
        params.view.append(tabTitle);

        for (var i of params.titles) {
            tabTitle.append(
                this.createElement({ element: 'li', attributes: { class: 'tab-title' }, text: i })
            )
        }

        tabTitle.findAll('li').forEach(node => {
            node.addEventListener('click', event => {
                var url = this.urlSplitter(fullUrl);
                url.vars.tab = node.textContent.toLowerCase();
                router.render({ url: '?' + this.urlSplitter(this.urlMerger(url, 'tab')).queries });
            })
        })
    }

    cell(params) {
        //set the cell-data id
        var id = this.stringReplace(params.name, ' ', '-') + '-cell';

        //create the cell label
        var label = this.createElement({ element: 'label', attributes: { class: 'cell-label' }, text: params.name });

        //cell attributes
        params.attributes = (this.isset(params.attributes)) ? params.attributes : {};

        //cell data attributes
        params.dataAttributes = (this.isset(params.dataAttributes)) ? params.dataAttributes : {};
        params.dataAttributes.id = id;

        let components;

        //set the properties of cell data
        if (params.element == 'select') {//check if cell data is in select element
            components = {
                element: params.element, attributes: params.dataAttributes, children: [
                    { element: 'option', attributes: { disabled: '', selected: '' }, text: `Select ${params.name}`, value: '' }//set the default option
                ]
            };
        }
        else {
            components = { element: params.element, attributes: params.dataAttributes, text: params.value };
        }

        if (this.isset(params.value)) components.attributes.value = params.value;
        // if (this.isset(params.options)) components.options = params.options;

        let data;
        if (params.element instanceof Element) {
            data = params.element;
        }
        else {
            data = this.createElement(components);//create the cell-data
        }

        data.classList.add('cell-data');

        if (this.isset(params.value)) data.value = params.value;

        //create cell element
        let cell = this.createElement({ element: 'div', attributes: params.attributes, children: [label, data] });
        cell.classList.add('cell');

        if (this.isset(params.text)) data.textContent = params.text;

        if (this.isset(params.html)) data.innerHTML = params.html;


        if (this.isset(params.list)) {
            cell.makeElement({
                element: 'datalist', attributes: { id: `${id}-list` }, options: params.list.sort()
            });

            data.setAttribute('list', `${id}-list`);
        }

        let edit;
        if (this.isset(params.edit)) {
            edit = cell.makeElement({
                element: 'i', attributes: {
                    class: `small btn ${params.edit} fas fa-pen`, style: { cursor: 'pointer', backgroundColor: 'white', width: '1em', height: 'auto', position: 'absolute', top: '0px', right: '0px' }
                }
            });
            cell.css({ position: 'relative' });
        }
        return cell;
    }

    dataCell(params) {
        let cell = this.cell(params);

        data.onfocus = focused => {
            var previousValue = data.value;
            data.onblur = blurred => {
                var currentValue = data.value;
                if (currentValue != previousValue) {
                    if (this.isset(params.update) && data.value != '') {
                        params.update['new'] = {};
                        params.update['new'][this.stringReplace(params.name, ' ', '')] = data.value;
                        if (this.isset(params.update.check)) {
                            params.update.check[params.name] = data.value;
                            queryHandler.db('checkThen', params.update).then(result => {
                                if (result == 'found') {
                                    this.message({ text: `${params.name} already exists`, temp: '' });
                                }
                                else {
                                    this.message({ text: params.update.work + ' Successful', temp: '' });
                                }
                            }).catch(err => {
                                this.message({ text: params.update.work + ' Unsuccessful' });
                            });
                        } else {
                            queryHandler.db('update', params.update).then(result => {
                                this.message({ text: 'Update Successful', temp: '' });
                            }).catch(err => {
                                this.message({ text: 'Update Unsuccessful' });
                            });
                        }
                    }
                }
            }
        }
    }

    message(params) {
        var me = this.createElement({
            element: 'span', attributes: { class: 'alert' }, children: [
                this.isset(params.link) ?
                    this.createElement({ element: 'a', text: params.text, attributes: { class: 'text', href: params.link } })
                    :
                    this.createElement({ element: 'a', text: params.text, attributes: { class: 'text' } }),
                ,
                this.createElement({ element: 'span', attributes: { class: 'close' } })
            ]
        });

        if (this.isset(params.temp)) {
            var time = setTimeout(() => {
                me.remove();
                clearTimeout(time);
            }, (params.temp != '') ? params.time * 1000 : 5000);
        }

        me.find('.close').addEventListener('click', event => {
            me.remove();
        });

        body.find('#notification-block').append(me);
    }

    createTable(params) {
        //create the table element
        let table = this.createElement(
            { element: 'table', attributes: params.attributes }
        );
        
        table.classList.add('table');//add table to the class

        let tableHead = table.makeElement({//create the table-head
            element: 'thead', children: [
                { element: 'tr' }
            ]
        });

        let tableBody = table.makeElement({//create the table-body
            element: 'tbody'
        });

        let tableHeadRow = tableHead.querySelector('tr');//create the table-head-row

        let headers = [];//the headers
        for (let content of params.contents) {
            
            let tableBodyRow = tableBody.makeElement({//create a table-body-row
                element: 'tr', attributes: { class: params.rowClass }
            });

            for (let key in content) {
                if (headers.indexOf(key) == -1) {//check if key has been added to the headers
                    headers.push(key);
                    let tableHeadCell = tableHeadRow.makeElement({//create table-head-cell
                        element: 'th', text: key, attributes: { 'data-name': 'table-data-' + key }
                    });
                }

                let tableBodyRowData = tableBodyRow.makeElement({//create table-body-cell
                    element: 'td', html: content[key], attributes: { 'data-name': 'table-data-' + key }
                });
            }
        }

        let tableContainer = this.createElement({
            element: 'div', attributes: { class: 'table-container' }, children: [
                {
                    element: 'span', attributes: { class: 'table-titleandsearch' }, children: [

                    ]
                },
                table
            ]
        });
        let count = 0;

        if (this.isset(params.title)) {
            tableContainer.find('.table-titleandsearch').makeElement({ element: 'h5', attributes: { class: 'table-title' }, text: params.title });
            count++;
        }

        if (this.isset(params.search)) {
            tableContainer.find('.table-titleandsearch').makeElement({ element: 'input', attributes: { class: 'table-search', placeHolder: 'Search table...' } });
            count++;
        }

        if (this.isset(params.sort)) {
            tableContainer.find('.table-titleandsearch').makeElement({ element: 'select', attributes: { class: 'table-sorter' }, options: params.sort });
            count++;
        }

        tableContainer.find('.table-titleandsearch').css({ gridTemplateColumns: `repeat(${count}, 1fr)` });

        return tableContainer;
    }

    getTableData(table) {
        let header = table.querySelector('thead');
        let body = table.querySelector('tbody');

        let data = [];
        let heads = [];
        if (!this.isnull(header)) {
            for (let head of header.querySelectorAll('th')) {
                heads.push(head.textContent);
            }
        }

        let rows = body.querySelectorAll('tr');

        for (let row of rows) {
            let line = {};
            data.push(line);
            row = row.querySelectorAll('td');
            for (let i in row) {
                if (!isNaN(i)) {
                    line[heads[i] || i] = row[i].textContent;
                }
            }
        }

        return data;
    }

    sortTable(table, by, direction) {
        let data = this.getTableData(table);

        data.sort((a, b) => {
            a = a[by];
            b = b[by];

            if (this.isNumber(a) && this.isNumber(b)) {
                a = a / 1;
                b = b / 1;
            }

            if (direction > -1) {
                return a > b ? 1 : -1;
            }
            else {
                return a > b ? -1 : 1;
            }
        });
        return data;
    }

    createForm(params) {
        let form = this.createElement({
            element: params.element || 'form', attributes: params.attributes, children: [
                { element: 'h3', attributes: { class: 'form-title' }, text: params.title },
                { element: 'section', attributes: { class: 'form-contents', style: { gridTemplateColumns: `repeat(${params.columns}, 1fr)` } } },
                { element: 'section', attributes: { class: 'form-buttons' } },
            ]
        });

        if (this.isset(params.parent)) params.parent.append(form);
        let note;
        let formContents = form.find('.form-contents');

        for (let key in params.contents) {
            note = (this.isset(params.contents[key].note)) ? `(${params.contents[key].note})` : '';
            let lableText = params.contents[key].label || this.camelCasedToText(key).toLowerCase();
            let block = formContents.makeElement({
                element: 'div', attributes: { class: 'form-single-content' }, children: [
                    { element: 'label', html: lableText, attributes: { class: 'form-label', for: key.toLowerCase() } }
                ]
            });

            let data = block.makeElement(params.contents[key]);
            data.classList.add('form-data');
            if (this.isset(params.contents[key].note)) block.makeElement({ element: 'span', text: params.contents[key].note, attributes: { class: 'form-note' } });

            if (this.isset(params.required) && params.required.includes(key)) {
                data.required = true;
            }
        }

        for (let key in params.buttons) {
            form.find('.form-buttons').makeElement(params.buttons[key]);
        }

        form.makeElement({ element: 'span', attributes: { class: 'form-error' }, state: { name: 'error', owner: `#${form.id}` } });

        return form;
    }

    popUp(content, container) {
        let popUp = this.createElement({
            element: 'div', attributes: { class: 'pop-up', style: { position: 'fixed', top: 0, left: 0, bottom: 0, right: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'grid', width: '100vw', height: '100vh', justifyContent: 'center', alignItems: 'center', zIndex: 1000 } }, children: [
                {
                    element: 'div', attributes: { id: 'pop-up-window', style: { backgroundColor: 'white', display: 'grid', gridGap: '1em', justifyContent: 'center', alignItems: 'start', width: '50vw', height: '50vh', gridTemplateColumns: '1fr', gridTemplateRows: 'max-content 1fr', overflow: 'hidden' } }, children: [
                        {
                            element: 'div', attributes: { id: 'pop-up-menu', style: { backgroundColor: 'black', color: 'white', display: 'grid', gridGap: '.5em', gridTemplateColumns: 'repeat(2, min-content)', width: 'inherit', justifyContent: 'flex-end', alignItems: 'center' } }, children: [
                                { element: 'i', attributes: { id: 'toggle-window', class: 'fas fa-expand-alt', style: { color: 'white', height: '20px', width: '20px', padding: '1em' } } },
                                { element: 'i', attributes: { id: 'close-window', class: 'fas fa-times', style: { color: 'white', height: '20px', width: '20px', padding: '1em' } } }
                            ]
                        },
                        {
                            element: 'div', attributes: { id: 'pop-up-content', style: { display: 'grid', overflow: 'auto', justifyContent: 'center', height: '100%', width: '100%' } }, children: [
                                content
                            ]
                        }
                    ]
                }
            ]
        });

        popUp.find('#toggle-window').addEventListener('click', event => {
            popUp.find('#toggle-window').classList.toggle('fa-expand-alt');
            popUp.find('#toggle-window').classList.toggle('fa-compress-alt');

            if (popUp.find('#toggle-window').classList.contains('fa-expand-alt')) {
                popUp.find('#pop-up-window').css({ height: '50vh', width: '50vw' });
            }
            else {
                popUp.find('#pop-up-window').css({ height: '100vh', width: '100vw' });
            }
        });

        popUp.find('#close-window').addEventListener('click', event => {
            popUp.remove();
        });
        container = container || document.body;

        container.append(popUp);
        return popUp;
    }

    makeCustomElements() {
        let self = this;
        if (typeof util == 'undefined') {

            class Cell extends HTMLElement {

                constructor(params) {
                    super();
                    self.object.copy(this.getAttributes(), this);
                    let dataType = this.datatype || 'input';
                    this.shadow = this.attachShadow({ mode: 'open' });
                    this.dom = self.createElement({
                        element: 'span', children: [
                            {
                                element: 'label', text: this.name, attributes: {
                                    style: {
                                        textTransform: 'uppercase',
                                        backgroundColor: 'transparent',
                                        color: 'white',
                                        padding: '0.3em',
                                        textAlign: 'center',
                                        fontWeight: '400'
                                    }
                                }
                            },
                            {
                                element: dataType, attributes: {
                                    style: {
                                        backgroundColor: 'white',
                                        color: 'black',
                                        textAlign: 'center',
                                        border: 'none',
                                        outline: 'none',
                                        width: 'unset',
                                        padding: '0.3em',
                                        fontWeight: '400'
                                    }
                                }
                            }
                        ], attributes: { style: { display: 'grid', gridTemplateColumns: 'max-content 1fr', width: '100%' } }
                    });
                    this.label = this.dom.find('label');
                    this.data = this.dom.find('input');
                    this.shadow.append(this.dom);
                }

                connectedCallback() {
                    this.data.onChanged(value => {
                        this.value = value;
                    });
                    this.hover({
                        css: { boxShadow: '1px 1px lightgray, -1px -1px lightgray', border: 'none', transitionDuration: '.2s' }
                    });

                    if (!(this.hasCssProperty('background') || this.hasCssProperty('background-color'))) {
                        this.css({ backgroundColor: 'black' });
                    }
                }
            }

            class Table extends HTMLElement {
                constructor(params) {
                    super();
                    self.object.copy(this.getAttributes(), this);
                    this.shadow = this.attachShadow({ mode: 'open' });
                    this.dom = self.createElement({
                        element: 'table', attributes: { style: { borderCollapse: 'collapse', width: 'inherit', overflow: 'scroll', textAlign: 'center', fontWeight: '300', fontSize: '1em' } }, children: [
                            {
                                element: 'thead', attributes: {}, children: [
                                    { element: 'tr' }
                                ]
                            },
                            {
                                element: 'tbody'
                            }
                        ],
                    });

                    this.thead = this.dom.find('thead');
                    this.tbody = this.dom.find('tbody');

                    let tableHeadRow = this.thead.find('tr');

                    this.headers = [];

                    if (self.isset(this.contents)) {
                        this.contents = JSON.parse(this.contents);
                        for (let content of this.contents) {
                            let tableBodyRow = this.tbody.makeElement({
                                element: 'tr', attributes: {
                                    class: this.rowClass
                                }
                            });

                            for (let key in content) {
                                if (!this.headers.includes(key)) {
                                    this.headers.push(key);
                                    let tableHeadCell = tableHeadRow.makeElement({
                                        element: 'th', text: key, attributes: { 'data-name': `${this.name}-${key}` }
                                    });
                                }

                                let tableBodyRowData = tableBodyRow.makeElement({
                                    element: 'td', text: content[key], attributes: {
                                        'data-name': `${this.name}-${key}`,
                                    }
                                });
                            }
                        }
                    }

                    this.shadow.append(this.dom);

                }

                connectedCallback() {
                    let rows = this.tbody.findAll('tr');

                    this.dom.findAll('tr').forEach(tr => {
                        tr.css({ borderCollapse: 'inherit', transform: 'scale(1)', overflow: 'hidden', textTransform: 'uppercase' });
                    });

                    this.thead.findAll('tr').forEach(tr => {
                        tr.css({ backgroundColor: 'black', color: 'white', textTransform: 'capitalize' });
                        tr.findAll('th').forEach(th => {
                            th.css({ padding: '.5em .1em' });
                        });
                    });

                    rows.forEach(tr => {
                        tr.css({ position: 'relative', cursor: 'pointer', transitionDuration: '.4s', transform: 'scale(1)', overflow: 'hidden' });

                        let position = rows.indexOf(tr);
                        if (position % 2) {
                            tr.css({ backgroundColor: 'lightgray' });
                        }
                        else {
                            tr.css({ backgroundColor: 'white' });
                        }

                        tr.hover({ css: { backgroundColor: 'black', color: 'white' } });
                    });
                }
            }

            class Select extends HTMLElement {
                constructor() {
                    super();
                    self.object.copy(this.getAttributes(), this);
                    this.shadow = this.attachShadow({ mode: 'open' });
                    this.dom = self.createElement({
                        element: 'div', attributes: { style: { display: 'grid', maxHeight: '250px', height: 'max-content', gridTemplateRows: 'max-content 1fr' } }, children: [
                            {
                                element: 'span', attributes: {
                                    name: 'control', style: {
                                        display: 'grid', gridTemplateColumns: '1fr max-content', padding: '.5em', alignItems: 'centers'
                                    }
                                }, children: [
                                    { element: 'input', attributes: { name: 'value', style: { border: 'none', outline: 'none' } } },
                                    {
                                        element: 'span', attributes: {
                                            name: 'toggle',
                                            style: {
                                                borderLeft: '2px solid black',
                                                borderTop: '2px solid black',
                                                transform: 'rotate(225deg)',
                                                width: '.5em',
                                                height: '.5em',
                                                margin: '.3em',
                                                cursor: 'pointer'
                                            }
                                        }
                                    },
                                ]
                            },
                            {
                                element: 'span', attributes: { name: 'content', style: { display: 'block', placeItems: 'flex-start', overflow: 'auto' } }
                            }
                        ]
                    });

                    this.contentsView = this.dom.search('span', { attributes: { name: 'content' } });

                    this.control = this.dom.search('span', { attributes: { name: 'control' } });

                    this.toggle = this.control.find('span');

                    // let contents = this.

                    if (self.isset(this.contents)) {
                        this.contents = JSON.parse(this.contents);
                        if (Array.isArray(this.contents)) {//Turn contents to object if its array
                            let contents = this.contents;
                            this.contents = {};
                            for (let i of contents) {
                                this.contents[i] = i;
                            }
                        }

                        for (let i in this.contents) {
                            let option = this.contentsView.makeElement({ element: 'span', attributes: { name: 'option', value: i, style: { display: 'flex', placeItems: 'center', padding: '.5em', cursor: 'pointer' } } });
                            option.innerHTML = this.contents[i];
                            option.value = i;
                        }
                    }
                    this.shadow.append(this.dom);

                    this.value = this.value || '';
                }

                connectedCallback() {
                    this.options = this.dom.searchAll('span', { attributes: { name: 'option' } });
                    this.activeOptions = this.options;

                    this.css({ overflow: 'hidden', padding: 'unset' });

                    self.array.each(this.options, (option) => {
                        option.hover({ css: { boxShadow: '1px 1px #aaa, -1px -1px #aaa' } });
                    });

                    let currentInput, currentOption = -1, activeOption;
                    this.input = this.dom.find('input');
                    let text = [];
                    if (this.value != '') {
                        let values = this.value.split(',');
                        for (let value of values) {
                            text.push(this.contents[value]);
                        }
                    }
                    this.input.value = text;

                    this.input.onChanged((value, event) => {
                        this.update(value);
                        this.noUpdate = false;

                        if (event.key == 'Enter') {
                            let value = this.input.value.trim();
                            if (value.length != value.lastIndexOf(',') + 1) {
                                value += ',';
                            }
                            this.input.value = value;
                        }

                        this.navigate = event.key == 'ArrowDown' || event.key == 'ArrowUp';

                        if (this.navigate) {
                            this.noUpdate = true;
                            if (event.key == 'ArrowDown') {
                                if (currentOption + 1 != this.activeOptions.length) {
                                    currentOption++;
                                }
                            }
                            else if (event.key == 'ArrowUp') {
                                if (currentOption > 0) {
                                    currentOption--;
                                }
                            }

                            activeOption = this.activeOptions[currentOption];

                            this.activeOptions.forEach(option => {
                                if (option == activeOption) {
                                    option.css({ border: '1px dashed blue' });
                                } else {
                                    option.cssRemove(['border']);
                                }
                            });
                            return;
                        }
                        else {
                            currentOption = -1;
                        }

                        if (event.key == 'Escape') {
                            this.deactivate();
                            return;
                        }

                        this.activeOptions = [];

                        currentInput = this.input.value.slice(this.input.value.lastIndexOf(',') + 1).trim().toLowerCase();
                        if (Object.values(this.contents).includes(currentInput)) currentInput = '';

                        self.array.each(this.options, (option) => {
                            option.cssRemove(['border']);
                            if (option.getAttribute('value').toLowerCase().includes(currentInput) || currentInput == '') {
                                if (currentOption == '') currentOption = this.options.indexOf(option) - 1;
                                option.css({ display: 'flex' });
                                this.activeOptions.push(option);
                            }
                            else {
                                option.css({ display: 'none' });
                            }
                        });
                    });

                    this.toggle.action = 'deactivate';
                    this.deactivate();

                    this.dom.addEventListener('click', event => {
                        let target = event.target;
                        if (target.getAttribute('name') != 'option') target.getParents('option');

                        if (!self.isnull(target) && target.getAttribute('name') == 'option') {
                            let value = this.prepareValue(target.value)
                            this.input.value = value;
                            this.input.dispatchEvent(new CustomEvent('change'));
                        }
                    });

                    this.control.addEventListener('click', event => {
                        if (event.target == this.toggle) {
                            this[this.toggle.action]();
                        }
                        else {
                            this.activate();
                        }
                    });
                }

                prepareValue(key) {
                    let value = this.contents[key];
                    if (self.isset(this.multiple) && this.multiple != 'false') {
                        if (this.multiple != 'single') {
                            if (this.input.value != '') {
                                value = this.input.value + `, ${value}`;
                            }
                        }
                        else {
                            if (this.input.value.includes(`, ${value}`)) {
                                value = this.input.value.replace(`, ${value}`, '');
                            }
                            else if (this.input.value.includes(`${value}, `)) {
                                value = this.input.value.replace(`${value}, `, '');
                            }
                            else if (this.input.value.includes(value)) {
                                value = this.input.value.replace(value, '');
                            }
                            else {
                                if (this.input.value != '') {
                                    if (this.input.value.trim().length == this.input.value.trim().lastIndexOf(',') + 1) {
                                        value = this.input.value + ` ${value}`;
                                    }
                                    else {
                                        value = this.input.value + `, ${value}`;
                                    }
                                }
                            }
                        }
                    }

                    return value;
                }

                update(value) {
                    value = value.split(',');

                    let keys = Object.keys(this.contents);;
                    let values = Object.values(this.contents);

                    let currentKeys = [];
                    for (let i = 0; i < value.length; i++) {
                        let trimmed = value[i].trim();
                        if (self.isset(keys[values.indexOf(trimmed)])) {
                            currentKeys.push(keys[values.indexOf(trimmed)]);
                        }
                        else if (trimmed != '') {
                            currentKeys.push(trimmed);
                        }

                        if (this.external != 'true' && !values.includes(trimmed)) {
                            value = self.array.popIndex(value, i);
                        }
                    }

                    value = value.join(',');
                    currentKeys = currentKeys.join(',');

                    if (this.keepValue == 'true') {
                        this.value = value;
                        this.setAttribute('value', value);
                    }
                    else {
                        this.value = currentKeys;
                        this.setAttribute('value', currentKeys);
                    }

                    this.dispatchEvent(new Event('change'));

                    if (!self.isset(this.multiple)) {
                        this.deactivate();
                    }
                    this.input.focus();
                }

                deactivate() {
                    if (this.toggle.action == 'deactivate') {
                        this.control.css({ borderBottom: 'none' });
                        this.toggle.css({ transform: 'rotate(225deg)', });
                        this.contentsView.css({ display: 'none' });
                        this.toggle.action = 'activate';
                        this.dom.css({ height: 'unset' });
                    }
                }

                activate() {
                    if (this.toggle.action == 'activate') {
                        this.control.css({ borderBottom: '1px solid black' });
                        this.toggle.css({ transform: 'rotate(45deg)' });
                        this.contentsView.css({ display: 'block' });
                        this.toggle.action = 'deactivate';
                        this.dom.css({ height: '200px' });
                    }
                }

                attributeChangedCallback() {

                }
            }

            class Choose extends HTMLElement {
                constructor() {
                    super();

                    self.object.copy(this.getAttributes(), this);
                    this.attachShadow({ mode: 'open' });

                    this.dom = self.createElement({
                        element: 'div', attributes: { name: 'dom' }, children: [
                            {
                                element: 'span', attributes: {
                                    style: {
                                        display: 'grid', gridTemplateColumns: '1fr max-content', padding: '.5em', borderBottom: '1px solid black'
                                    }
                                }, children: [
                                    { element: 'a', attributes: { style: { textAlign: 'left', padding: '.2em' } }, text: this.title },
                                    {
                                        element: 'button', attributes: {
                                            style: {
                                                padding: '.5em', backgroundColor: 'black', color: 'white', border: '1px solid black', cursor: 'pointer'
                                            }
                                        }, text: 'Close', state: { name: 'close', owner: 'name', value: 'dom' }
                                    }
                                ]
                            },
                            {
                                element: 'span', attributes: {
                                    style: {
                                        display: 'flex', place: 'center', padding: '1em'
                                    }
                                }, state: { name: 'choices', owner: 'name', value: 'dom' }
                            }
                        ]
                    });

                    this.choicesView = this.dom.getState({ name: 'choices' });
                    if (self.isset(this.choices)) {
                        this.choices = this.choices.split(',');
                        for (let choice of this.choices) {
                            this.choicesView.makeElement({
                                element: 'button', attributes: { name: 'choice', title: choice, style: { margin: '1em', backgroundColor: 'white', cursor: 'pointer', border: '1px solid black' } }, text: choice
                            });
                        }
                    }

                    this.shadowRoot.append(this.dom);
                }

                connectedCallback() {
                    this.css({ border: '1px solid black', width: 'max-content' });

                    this.dom.addEventListener('click', event => {
                        if (event.target == this.dom.getState({ name: 'close' })) {
                            this.dispatchEvent(new CustomEvent('picked'));
                            this.remove();
                        }
                        else if (event.target.getAttribute('name') == 'choice') {
                            this.picked = event.target.textContent;
                            this.dispatchEvent(new CustomEvent('picked'));
                            this.remove();
                        }
                    });
                }
            }

            class Form extends HTMLElement {
                constructor() {
                    super();
                    self.object.copy(this.getAttributes(), this);
                    this.attachShadow({ mode: 'open' });

                    this.columns = this.columns || 1;

                    this.dom = self.createElement({
                        element: 'form', attributes: { name: 'dom', style: { display: 'grid', gridGap: '.5em' } }
                        , children: [
                            { element: 'span', attributes: { class: 'form-title', style: { display: 'flex', placeContent: 'center', padding: '.5em', color: 'white', backgroundColor: 'black' } }, text: this.title || '', state: { name: 'title', owner: 'name', value: 'dom' } },
                            { element: 'section', attributes: { style: { display: 'grid', gridTemplateColumns: `repeat(${this.columns}, 1fr)` } }, state: { name: 'contents', owner: 'name', value: 'dom' } },
                            { element: 'section', attributes: { style: { display: 'flex', placeContent: 'center', margin: '.5em 0em' } }, state: { name: 'buttons', owner: 'name', value: 'dom' } },
                            { element: 'span', attributes: { style: { placeItems: 'center', padding: '.5em', color: 'white', backgroundColor: 'green', display: 'none' } }, state: { name: 'error', owner: 'name', value: 'dom' } }
                        ]
                    });

                    this.formTitle = this.dom.getState('title');
                    this.formContents = this.dom.getState('contents');
                    this.formButtons = this.dom.getState('buttons');
                    this.formError = this.dom.getState('error');

                    if (self.isset(this.contents)) {
                        this.contents = JSON.parse(this.contents);
                        for (let key in this.contents) {
                            let note = (self.isset(this.contents[key].note)) ? `(${this.contents[key].note})` : '';
                            let block = this.formContents.makeElement({
                                element: 'div', attributes: { name: 'formSingleContent', style: { display: 'grid', padding: '.5em' } }, children: [
                                    { element: 'label', text: self.camelCasedToText(key).toLowerCase(), attributes: { name: 'formLabel', for: key.toLowerCase(), style: { color: '#666666', textTransform: 'capitalize', textAlign: 'justify' } } }
                                ]
                            });

                            let data = block.makeElement(this.contents[key]);
                            data.css({
                                border: '1px solid #666666', borderRadius: '10px', padding: '.3em .1em',
                                textAlign: 'justify', minWidth: 'unset', minHeight: '50px'
                            });
                            if (self.isset(this.contents[key].note)) block.makeElement({ element: 'span', text: this.contents[key].note, attributes: { name: 'formNote' } });
                        }
                    }

                    if (self.isset(this.buttons)) {
                        this.buttons = JSON.parse(this.buttons);
                        for (let key in this.buttons) {
                            let button = this.formButtons.makeElement(this.buttons[key]);
                            button.css({ padding: '1em', textTransform: 'uppercase', border: '1px solid black', color: 'black', backgroundColor: 'white', cursor: 'pointer' });
                        }
                    }

                    this.shadowRoot.append(this.dom);
                }

                connectedCallback() {
                    this.dom.getState({ name: 'submit' }).addEventListener('click', event => {
                        event.preventDefault();
                        this.dom.setState({ name: 'error', text: '', attributes: { style: { background: 'green', display: 'none' } } });

                        if (!self.validateForm(this.dom, ['select-element', 'input'])) {
                            this.dom.setState({ name: 'error', text: 'Form is not filled correctly', attributes: { style: { background: 'red', display: 'flex' } } });
                            return;
                        }

                        this.dispatchEvent(new CustomEvent('submit'));
                    });
                }

                submit() {
                    // let submitButton =
                }
            }

            class Pattern extends HTMLElement {
                constructor() {
                    super();
                    self.object.copy(this.getAttributes(), this);
                    this.attachShadow({ mode: 'open' });

                    this.dom = self.createElement({ element: 'div', attributes: { style: 'grid' } });

                    this.rows = this.rows || 4;
                    this.colors = (this.colors || 'black,white').split(',');
                    this.columns = this.columns || 8;

                    for (let i = 0; i < this.rows; i++) {
                        let row = this.dom.makeElement({
                            element: 'span', attributes: { style: { display: 'grid', gridTemplateColumns: `repeat(${this.columns}, 1fr)` } }
                        });

                        for (let j = 0; j < this.columns; j++) {
                            row.makeElement({ element: 'span', attributes: { style: { width: '100%', height: this.blockheight, backgroundColor: this.colors[(i + j) % this.colors.length] } } })
                        }
                    }

                    this.shadowRoot.append(this.dom);
                }

                connectedCallback() {
                    this.css({ position: 'absolute', zIndex: '-1', top: '0', left: '0', bottom: '0', right: '0' });
                    this.parentNode.css({ position: 'relative' });
                }
            }

            customElements.define('cell-element', Cell);
            customElements.define('table-element', Table);
            customElements.define('select-element', Select);
            customElements.define('choose-element', Choose);
            customElements.define('form-element', Form);
            customElements.define('pattern-element', Pattern);

        }
    }

    choose(params) {
        let chooseWindow = this.createElement({
            element: 'span', attributes: { class: 'crater-choose' }, children: [
                { element: 'p', attributes: { class: 'crater-choose-note' }, text: params.note },
                { element: 'span', attributes: { class: 'crater-choose-control' } },
                { element: 'button', attributes: { id: 'crater-choose-close', class: 'btn' }, text: 'Close' }
            ]
        });

        let chooseControl = chooseWindow.querySelector('.crater-choose-control');

        chooseWindow.querySelector('#crater-choose-close').addEventListener('click', event => {
            chooseWindow.remove();
        });

        for (let option of params.options) {
            chooseControl.makeElement({
                element: 'button', attributes: { class: 'btn choose-option' }, text: option
            });
        }

        return {
            display: chooseWindow, choice: new Promise((resolve, reject) => {
                chooseControl.addEventListener('click', event => {
                    if (event.target.classList.contains('choose-option')) {
                        resolve(event.target.textContent);
                        chooseWindow.remove();
                    }
                });
            })
        };
    }

    textEditor(params) {
        params = params || {};
        params.id = params.id || 'text-editor';
        let textEditor = this.createElement({
            element: 'div', attributes: {
                id: params.id
            }, children: [
                {
                    element: 'style', text: `

                    div#crater-text-editor{
                        margin: 0 auto;
                        display: grid;
                        width: ${params.width || 'max-content'};
                        height: max-content;
                        border: 2px solid rgb(40, 110, 89);
                        border-radius: 8px 8px 0px 0px;
                        background-color: white;
                    }
                    
                    div#crater-rich-text-area{
                        height: 100%;
                        width: 100%;
                    }

                    div#crater-the-ribbon{
                        border-bottom: none;
                        width: 100%;
                        padding: .5em 0;
                        display: grid;
                        grid-template-rows: max-content max-content;
                        background-color: rgb(40, 110, 89);
                        color: white;
                        text-align: left;
                    }

                    iframe#crater-the-WYSIWYG{
                        height: 100%;
                        width: 100%;
                    }

                    div#crater-the-ribbon button{
                        color: white;
                        border: none;
                        outline: none;
                        background-color: transparent;
                        cursor: pointer;
                        padding: .3em;
                        margin: .5em;
                    }

                    div#crater-the-ribbon button:hover{
                        background-color: rgb(20, 90, 70);
                        transition: all 0.3s linear 0s;
                    }

                    div#crater-the-ribbon input,  div#crater-the-ribbon select{
                        margin: .5em;
                    }

                    div#crater-the-ribbon input[type="color"]{
                        border: none;
                        outline: none;
                        background-color: transparent;
                    }
                `},
                {
                    element: 'div', attributes: {
                        id: 'crater-the-ribbon'
                    }, children: [
                        {
                            element: 'span', children: [
                                { element: 'button', attributes: { id: 'undoButton', title: 'Undo' }, text: '&larr;' },
                                { element: 'button', attributes: { id: 'redoButton', title: 'Redo' }, text: '&rarr;' },
                                { element: 'select', attributes: { id: 'fontChanger' }, options: this.fontStyles },
                                { element: 'select', attributes: { id: 'fontSizeChanger' }, options: this.range(1, 20) },
                                { element: 'button', attributes: { id: 'orderedListButton', title: 'Numbered List' }, text: '(i)' },
                                { element: 'button', attributes: { id: 'unorderedListButton', title: 'Bulletted List' }, text: '&bull;' },
                                { element: 'button', attributes: { id: 'linkButton', title: 'Create Link' }, text: 'Link' },
                                { element: 'button', attributes: { id: 'unLinkButton', title: 'Remove Link' }, text: 'Unlink' }
                            ]
                        },
                        {
                            element: 'span', children: [
                                { element: 'button', attributes: { id: 'boldButton', title: 'Bold' }, children: [{ element: 'b', text: 'B' }] },
                                { element: 'button', attributes: { id: 'italicButton', title: 'Italic' }, children: [{ element: 'em', text: 'I' }] },
                                { element: 'button', attributes: { id: 'underlineButton', title: 'Underline' }, children: [{ element: 'u', text: 'U' }] },
                                { element: 'button', attributes: { id: 'supButton', title: 'Superscript' }, children: [{ element: 'sup', text: '2' }] },
                                { element: 'button', attributes: { id: 'subButton', title: 'Subscript' }, children: [{ element: 'sub', text: '2' }] },
                                { element: 'button', attributes: { id: 'strikeButton', title: 'Strikethrough' }, children: [{ element: 's', text: 'abc' }] },
                                { element: 'input', attributes: { type: 'color', id: 'fontColorButton', title: 'Change Font Color', value: '#000000' } },
                                { element: 'input', attributes: { type: 'color', id: 'highlightButton', title: 'Hightlight Text', value: '#ffffff' } },
                                { element: 'input', attributes: { type: 'color', id: 'backgroundButton', title: 'Change Background', value: '#ffffff' } },
                                { element: 'button', attributes: { id: 'alignLeftButton', title: 'Align Left' }, children: [{ element: 'a', text: 'L' }] },
                                { element: 'button', attributes: { id: 'alignCenterButton', title: 'Align Center' }, children: [{ element: 'a', text: 'C' }] },
                                { element: 'button', attributes: { id: 'alignJustifyButton', title: 'Align Justify' }, children: [{ element: 'a', text: 'J' }] },
                                { element: 'button', attributes: { id: 'alignRightButton', title: 'Align Right' }, children: [{ element: 'a', text: 'R' }] }
                            ]
                        }
                    ]
                },
                {
                    element: 'div', attributes: {
                        id: 'crater-rich-text-area'
                    }, children: [
                        {
                            element: 'iframe', attributes: {
                                id: 'crater-the-WYSIWYG', frameBorder: 0, name: 'theWYSIWYG'
                            }
                        }
                    ]
                }
            ]
        });

        let fonts = textEditor.findAll('select#font-changer > option');
        fonts.forEach(font => {
            font.css({ fontFamily: font.value });
        });

        textEditor.find('#unorderedListButton').innerHTML = '&bull;';
        textEditor.find('#redoButton').innerHTML = '&rarr;';
        textEditor.find('#undoButton').innerHTML = '&larr;';

        let self = this;
        let editorWindow = textEditor.find('#crater-the-WYSIWYG');
        editorWindow.onAdded(() => {
            let editor = editorWindow.contentWindow.document;

            editor.body.innerHTML = '';
            if (self.isset(params.content)) {
                editor.body.innerHTML = params.content.innerHTML;
            }

            editor.designMode = 'on';

            textEditor.find('#boldButton').addEventListener('click', () => {
                editor.execCommand('Bold', false, null);
            }, false);

            textEditor.find('#italicButton').addEventListener('click', () => {
                editor.execCommand('Italic', false, null);
            }, false);

            textEditor.find('#underlineButton').addEventListener('click', () => {
                editor.execCommand('Underline', false, null);
            }, false);

            textEditor.find('#supButton').addEventListener('click', () => {
                editor.execCommand('Superscript', false, null);
            }, false);

            textEditor.find('#subButton').addEventListener('click', () => {
                editor.execCommand('Subscript', false, null);
            }, false);

            textEditor.find('#strikeButton').addEventListener('click', () => {
                editor.execCommand('Strikethrough', false, null);
            }, false);

            textEditor.find('#orderedListButton').addEventListener('click', () => {
                editor.execCommand('InsertOrderedList', false, `newOL${self.random()}`);
            }, false);

            textEditor.find('#unorderedListButton').addEventListener('click', () => {
                editor.execCommand('InsertUnorderedList', false, `newUL${self.random()}`);
            }, false);

            textEditor.find('#fontColorButton').onChanged(value => {
                editor.execCommand('ForeColor', false, value);
            });

            textEditor.find('#highlightButton').onChanged(value => {
                editor.execCommand('BackColor', false, value);
            });

            textEditor.find('#backgroundButton').onChanged(value => {
                editor.body.style.background = value;
            });

            textEditor.find('#fontChanger').onChanged(value => {
                editor.execCommand('FontName', false, value);
            });

            textEditor.find('#fontSizeChanger').onChanged(value => {
                editor.execCommand('FontSize', false, value);
            });

            textEditor.find('#linkButton').addEventListener('click', () => {
                let url = prompt('Enter a URL', 'http://');

                if (self.isnull(url)) return;
                editor.execCommand('CreateLink', false, url);
            }, false);

            textEditor.find('#unLinkButton').addEventListener('click', () => {
                editor.execCommand('UnLink', false, null);
            }, false);

            textEditor.find('#undoButton').addEventListener('click', () => {
                editor.execCommand('Undo', false, null);
            }, false);

            textEditor.find('#redoButton').addEventListener('click', () => {
                editor.execCommand('redo', false, null);
            }, false);

            textEditor.find('#alignLeftButton').addEventListener('click', () => {
                editor.execCommand('justifyLeft', false, null);
            });

            textEditor.find('#alignCenterButton').addEventListener('click', () => {
                editor.execCommand('justifyCenter', false, null);
            });

            textEditor.find('#alignJustifyButton').addEventListener('click', () => {
                editor.execCommand('justifyFull', false, null);
            });

            textEditor.find('#alignRightButton').addEventListener('click', () => {
                editor.execCommand('justifyRight', false, null);
            });
        }, false);

        return textEditor;
    }
}