let Template = require('./Template');

module.exports = class Components extends Template {
    constructor() {
        super();
    }

    createTab(params = { titles: [] }) {
        var tabTitle = this.createElement({ element: 'ul', attributes: { class: 'tab' } });
        params.view.append(tabTitle);

        for (var i of params.titles) {
            tabTitle.append(
                this.createElement({ element: 'li', attributes: { class: 'tab-title' }, text: i })
            )
        }

        tabTitle.findAll('li').forEach(node => {
            node.addEventListener('click', event => {
                var url = this.urlSplitter(location.href);
                url.vars.tab = node.textContent.toLowerCase();
                router.render({ url: '?' + this.urlSplitter(this.urlMerger(url, 'tab')).queries });
            })
        })
    }

    cell(params = { element: 'input', attributes: {}, name: '', dataAttributes: {}, value: '', text: '', html: '', edit: '' }) {
        //set the cell-data id
        var id = this.stringReplace(params.name, ' ', '-') + '-cell';

        //create the cell label
        var label = this.createElement({ element: 'label', attributes: { class: 'cell-label' }, text: params.name });

        //cell attributes
        params.attributes = (this.isset(params.attributes)) ? params.attributes : {};

        //cell data attributes
        params.dataAttributes = (this.isset(params.dataAttributes)) ? params.dataAttributes : {};
        params.dataAttributes.id = id;

        var components;

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
        if (this.isset(params.options)) components.options = params.options;

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
                    class: `${params.edit}`, 'data-icon': 'fas, fa-pen', style: { cursor: 'pointer', backgroundColor: 'var(--primary-color)', width: '1em', height: 'auto', position: 'absolute', top: '0px', right: '0px', padding: '.15em' }
                }
            });
            cell.css({ position: 'relative' });
        }
        return cell;
    }

    message(params = { link: '', text: '', temp: 0 }) {
        var me = this.createElement({
            element: 'span', attributes: { class: 'alert' }, children: [
                this.createElement({ element: 'a', text: params.text, attributes: { class: 'text', href: params.link } }),
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

    createTable(params = { title: '', contents: {}, projection: {}, rename: {}, sort: false, search: false, filter: [] }) {
        //create the table element   
        let headers = [],//the headers
            columns = {},
            columnCount = 0,
            i,
            table = this.createElement(
                { element: 'div', attributes: params.attributes }
            );//create the table 

        table.classList.add('kerdx-table');//add table to the class

        for (let content of params.contents) {//loop through the json array
            i = params.contents.indexOf(content);//get the position of the row
            for (let name in content) {//loop through the row
                if (headers.indexOf(name) == -1) {//add to headers
                    headers.push(name);
                    columns[name] = table.makeElement({
                        element: 'column', attributes: { class: 'kerdx-table-column', 'data-name': name }, children: [
                            {
                                element: 'span', attributes: { class: 'kerdx-table-column-title', 'data-name': name }, children: [
                                    { element: 'p', attributes: { class: 'kerdx-table-column-title-text' }, text: name }
                                ]
                            },
                            { element: 'div', attributes: { class: 'kerdx-table-column-contents' } }
                        ]
                    });

                    if (this.isset(params.sort)) {//make sortable if needed
                        columns[name].find('.kerdx-table-column-title').makeElement({ element: 'i', attributes: { class: 'kerdx-table-column-title-sort', 'data-icon': 'fas, fa-arrow-down' } });
                    }
                }
            }
        }

        params.projection = params.projection || {};

        let hide = Object.values(params.projection).includes(1);


        for (let name of headers) {//loop through the headers and add the contents 
            for (let content of params.contents) {
                i = params.contents.indexOf(content);
                columns[name].find('.kerdx-table-column-contents').makeElement({ element: 'span', attributes: { class: 'kerdx-table-column-cell', 'data-name': name, 'data-value': content[name] || '', 'data-row': i }, html: content[name] || '' });
            }

            if (params.projection[name] == -1 || (hide && !this.isset(params.projection[name]))) {
                columns[name].css({ display: 'none' });
                continue;
            }

            columnCount++;//count the column length
        }

        table.css({ gridTemplateColumns: `repeat(${columnCount}, 1fr)` });

        let tableContainer = this.createElement({//create table container and title
            element: 'div', attributes: { class: 'kerdx-table-container' }, children: [
                {
                    element: 'span', attributes: { class: 'kerdx-table-titleandsearch' }
                },
                table
            ]
        });

        let titleCount = 0;

        if (this.isset(params.title)) {// create the title text if needed
            tableContainer.find('.kerdx-table-titleandsearch').makeElement({ element: 'h5', attributes: { class: 'kerdx-table-title' }, text: params.title });
            titleCount++;
        }

        if (this.isset(params.sort)) {// set the data for sorting
            table.dataset.sort = true;
        }

        if (this.isset(params.search)) {// create the search area
            tableContainer.find('.kerdx-table-titleandsearch').makeElement({ element: 'input', attributes: { class: 'kerdx-table-search', placeHolder: 'Search table...' } });
            titleCount++;
        }

        if (this.isset(params.filter)) {//create the filter area
            tableContainer.find('.kerdx-table-titleandsearch').makeElement({ element: 'select', attributes: { class: 'kerdx-table-filter' }, options: params.filter });
            titleCount++;
        }

        if (params.contents.length == 0) {// Notify if table is empty
            table.textContent = 'Empty Table';
        }

        tableContainer.makeElement({// arrange the table title
            element: 'style', text: `
            @media(min-width: 700px) {
                .kerdx-table-titleandsearch {
                  grid-template-columns: repeat(${titleCount}, 1fr);
                }
              }
        `});

        return tableContainer;
    }

    getTableData(table) {
        let data = [];
        let cells = table.findAll('.kerdx-table-column-cell');

        for (let i = 0; i < cells.length; i++) {
            let { name, value, row } = cells[i].dataset;
            data[row] = data[row] || {};
            data[row][name] = value;
        }

        return data;
    }

    sortTable(table, by = '', direction = 1) {
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

    listenTable(params = { table: {}, options: [] }, callbacks = { click: () => { }, filter: () => { } }) {
        params.options = params.options || [];
        callbacks = callbacks || [];
        let table = params.table.find('.kerdx-table');

        let options = this.createElement({
            element: 'span', attributes: { class: 'kerdx-table-options' }
        });

        let list = {
            view: 'fas fa-eye',
            delete: 'fas fa-trash',
            edit: 'fas fa-pen',
            revert: 'fas fa-history'
        }

        let optionClass;
        for (let option of params.options) {
            optionClass = list[option] || `fas fa-${option}`;
            let anOption = options.makeElement({
                element: 'i', attributes: { class: optionClass + ' kerdx-table-option', id: 'kerdx-table-option-' + option }
            });
        }

        let tableTitles = table.findAll('.kerdx-table-column-title');
        let tableColumns = table.findAll('.kerdx-table-column');
        let rows = [];
        let firstColumn = tableColumns[0];
        let firstVisibleColumn;

        if (this.isnull(firstColumn)) {
            return;
        }

        for (let i = 0; i < tableColumns.length; i++) {
            if (tableColumns[i].css().display != 'none') {
                firstVisibleColumn = tableColumns[i];
                break;
            }
        }

        let firstCells = firstColumn.findAll('.kerdx-table-column-cell');
        let firstVisibleCells = firstVisibleColumn.findAll('.kerdx-table-column-cell');

        let tableRow;

        for (let i = 0; i < firstCells.length; i++) {
            rows.push(firstCells[i].dataset.row);
        }

        if (params.table.find('.kerdx-table').dataset.sort == 'true') {
            for (let i = 0; i < tableTitles.length; i++) {
                tableTitles[i].addEventListener('mouseenter', event => {
                    tableTitles[i].find('.kerdx-table-column-title-sort').css({ display: 'unset' });
                });

                tableTitles[i].addEventListener('mouseleave', event => {
                    tableTitles[i].find('.kerdx-table-column-title-sort').css({ display: 'none' });
                });

                tableTitles[i].find('.kerdx-table-column-title-sort').addEventListener('click', event => {
                    let direction;
                    tableTitles[i].find('.kerdx-table-column-title-sort').toggleClasses('fas, fa-arrow-up');
                    tableTitles[i].find('.kerdx-table-column-title-sort').toggleClasses('fas, fa-arrow-down');
                    if (tableTitles[i].find('.kerdx-table-column-title-sort').dataset.direction == 'up') {
                        tableTitles[i].find('.kerdx-table-column-title-sort').dataset.direction = 'down';
                        direction = 1;
                    }
                    else {
                        tableTitles[i].find('.kerdx-table-column-title-sort').dataset.direction = 'up';
                        direction = -1;
                    }

                    let text = tableTitles[i].find('.kerdx-table-column-title-text').textContent;

                    let data = this.sortTable(params.table.find('.kerdx-table'), text, direction);
                    let newTable = this.createTable({ contents: data });

                    let newTableColumns = newTable.findAll('.kerdx-table-column');
                    for (let j = 0; j < newTableColumns.length; j++) {
                        tableColumns[j].find('.kerdx-table-column-contents').innerHTML = newTableColumns[j].find('.kerdx-table-column-contents').innerHTML;
                    }

                    tableColumns = table.findAll('.kerdx-table-column');
                    filter();
                });
            }
        }

        if (!this.isnull(params.table.find('.kerdx-table-search'))) {
            params.table.find('.kerdx-table-search').onChanged(value => {
                filter();
            });
        }

        if (!this.isnull(params.table.find('.kerdx-table-filter'))) {
            params.table.find('.kerdx-table-filter').onChanged(value => {
                filter();
            });
        }

        let searchValue, filterValue;

        let filter = () => {
            if (!this.isnull(params.table.find('.kerdx-table-search'))) {
                searchValue = params.table.find('.kerdx-table-search').value;
            }

            if (!this.isnull(params.table.find('.kerdx-table-filter'))) {
                filterValue = params.table.find('.kerdx-table-filter').value;
            }

            for (let i = 0; i < rows.length; i++) {
                let hide = false;
                tableRow = table.findAll(`.kerdx-table-column-cell[data-row="${i}"]`);

                for (let j = 0; j < tableRow.length; j++) {
                    tableRow[j].cssRemove(['display']);
                }

                if (this.isset(filterValue) && hide == false && this.isset(callbacks.filter)) {
                    hide = callbacks.filter(filterValue, tableRow);
                }

                if (this.isset(searchValue) && hide == false) {
                    hide = true;
                    for (let j = 0; j < tableRow.length; j++) {
                        if (tableRow[j].textContent.toLowerCase().includes(searchValue.toLowerCase())) {
                            hide = false;
                            break;
                        }
                    }
                }

                if (hide) {
                    for (let j = 0; j < tableRow.length; j++) {
                        tableRow[j].css({ display: 'none' });
                    }
                }
            }
        }

        if (this.isset(callbacks.click)) {
            table.addMultipleEventListener('mousedown, touchstart', event => {
                let target = event.target;
                if (target.classList.contains('kerdx-table-option')) {
                    if (this.isset(callbacks.click)) {
                        callbacks.click(event);
                    }
                }
                else if (target.classList.contains('kerdx-table-column-cell') || !this.isnull(target.getParents('.kerdx-table-column-cell'))) {
                    if (!target.classList.contains('kerdx-table-column-cell')) {
                        target = target.getParents('.kerdx-table-column-cell');
                    }
                    let position = target.dataset.row;

                    options.remove();
                    firstVisibleCells[position].css({ position: 'relative' });
                    firstVisibleCells[position].append(options);

                    if (params.table.classList.contains('kerdx-selectable')) {
                        let row = table.findAll(`.kerdx-table-column-cell[data-row="${position}"]`);
                        for (let i = 0; i < row.length; i++) {
                            row[i].classList.toggle('kerdx-table-selected-row');
                        }
                        options.remove();

                        if (!target.classList.contains('kerdx-table-selected-row')) {
                            if (firstColumn.findAll('.kerdx-table-selected-row').length == 0) {
                                params.table.classList.remove('kerdx-selectable');
                            }
                        }
                    }
                }
            });

            table.pressed(event => {
                let target = event.target;
                if (event.duration > 300) {
                    if (target.classList.contains('kerdx-table-column-cell') || !this.isnull(target.getParents('.kerdx-table-column-cell'))) {
                        if (!target.classList.contains('kerdx-table-column-cell')) {
                            target = target.getParents('.kerdx-table-column-cell');
                        }
                        let position = target.dataset.row;

                        if (firstColumn.findAll('.kerdx-table-selected-row').length == 0 && !params.table.classList.contains('kerdx-selectable')) {
                            params.table.classList.add('kerdx-selectable');
                            let row = table.findAll(`.kerdx-table-column-cell[data-row="${position}"]`);
                            for (let i = 0; i < row.length; i++) {
                                row[i].classList.add('kerdx-table-selected-row');
                            }
                            options.remove();
                        }
                    }
                }
            });
        }
    }

    createForm(params = { element: '', title: '', columns: 1, contents: {}, required: [], buttons: {} }) {
        let form = this.createElement({
            element: params.element || 'form', attributes: params.attributes, children: [
                { element: 'h3', attributes: { class: 'kerdx-form-title' }, text: params.title },
                { element: 'section', attributes: { class: 'kerdx-form-contents', style: { gridTemplateColumns: `repeat(${params.columns}, 1fr)` } } },
                { element: 'section', attributes: { class: 'kerdx-form-buttons' } },
            ]
        });

        form.classList.add('kerdx-form');

        if (this.isset(params.parent)) params.parent.append(form);
        let note;
        let formContents = form.find('.kerdx-form-contents');

        for (let key in params.contents) {
            note = (this.isset(params.contents[key].note)) ? `(${params.contents[key].note})` : '';
            let lableText = params.contents[key].label || this.camelCasedToText(key).toLowerCase();
            let block = formContents.makeElement({
                element: 'div', attributes: { class: 'kerdx-form-single-content' }, children: [
                    { element: 'label', html: lableText, attributes: { class: 'kerdx-form-label', for: key.toLowerCase() } }
                ]
            });

            let data = block.makeElement(params.contents[key]);
            data.classList.add('kerdx-form-data');
            if (this.isset(params.contents[key].note)) block.makeElement({ element: 'span', text: params.contents[key].note, attributes: { class: 'kerdx-form-note' } });

            if (this.isset(params.required) && params.required.includes(key)) {
                data.required = true;
            }
        }

        for (let key in params.buttons) {
            form.find('.kerdx-form-buttons').makeElement(params.buttons[key]);
        }

        form.makeElement({ element: 'span', attributes: { class: 'kerdx-form-error' }, state: { name: 'error', owner: `#${form.id}` } });

        return form;
    }

    picker(params = { title: '', contents: [] }, callback = (event) => { }) {
        let picker = this.createElement({
            element: 'div', attributes: { class: 'kerdx-picker' }, children: [
                { element: 'h3', attributes: { class: 'kerdx-picker-title' }, text: params.title || '' },
                { element: 'div', attributes: { class: 'kerdx-picker-contents' } }
            ]
        });

        for (let content of params.contents) {
            picker.find('.kerdx-picker-contents').makeElement({ element: 'span', attributes: { class: 'kerdx-picker-single', 'data-name': content }, text: content });
        }

        picker.addEventListener('dblclick', event => {
            if (event.target.classList.contains('kerdx-picker-single')) {
                callback(event.target.dataset.name);
            }
        });

        return picker;
    }

    popUp(content, params = { title: '', attributes: {} }) {
        let container = params.container || document.body;
        let title = params.title || '';

        params.attributes = params.attributes || {};
        params.attributes.style = params.attributes.style || {};
        params.attributes.style.width = params.attributes.style.width || '50vw';
        params.attributes.style.height = params.attributes.style.height || '50vh';

        let popUp = this.createElement({
            element: 'div', attributes: { class: 'kerdx-pop-up' }, children: [
                {
                    element: 'div', attributes: { id: 'pop-up-window', class: 'kerdx-pop-up-window' }, children: [
                        {
                            element: 'div', attributes: { id: 'pop-up-menu', class: 'kerdx-pop-up-menu' }, children: [
                                { element: 'p', attributes: { id: '', style: { color: 'inherit', padding: '1em' } }, text: title },
                                { element: 'i', attributes: { id: 'toggle-window', class: 'kerdx-pop-up-control fas fa-expand-alt' } },
                                { element: 'i', attributes: { id: 'close-window', class: 'kerdx-pop-up-control fas fa-times' } }
                            ]
                        },
                        {
                            element: 'div', attributes: { id: 'pop-up-content', class: 'kerdx-pop-up-content' }, children: [
                                content
                            ]
                        }
                    ]
                }
            ]
        });

        popUp.find('#pop-up-window').setAttributes(params.attributes);

        popUp.find('#toggle-window').addEventListener('click', event => {
            popUp.find('#toggle-window').classList.toggle('fa-expand-alt');
            popUp.find('#toggle-window').classList.toggle('fa-compress-alt');

            if (popUp.find('#toggle-window').classList.contains('fa-expand-alt')) {
                popUp.find('#pop-up-window').css({ height: params.attributes.style.height, width: params.attributes.style.width });
            }
            else {
                popUp.find('#pop-up-window').css({ height: 'var(--fill-parent)', width: 'var(--fill-parent)' });
            }
        });

        popUp.find('#close-window').addEventListener('click', event => {
            popUp.remove();
        });

        container.append(popUp);
        return popUp;
    }

    createSelect(params = { value: '', contents: {}, multiple: false }) {
        let selected = [],
            allowNavigate = false,
            scrollPosition = -1,
            active;

        //create the element
        let select = this.createElement({
            element: 'div', attributes: params.attributes, children: [
                {
                    element: 'span', attributes: { class: 'kerdx-select-control', }, children: [
                        { element: 'input', attributes: { class: 'kerdx-select-input', value: params.value || '', ignore: true } },
                        {
                            element: 'span', attributes: { class: 'kerdx-select-toggle' }
                        }
                    ]
                },
                { element: 'input', attributes: { class: 'kerdx-select-search', placeHolder: 'Search me...', ignore: true } },
                {
                    element: 'span', attributes: { class: 'kerdx-select-contents' }
                }
            ]
        });
        select.classList.add('kerdx-select');
        let setValue = select.getAttribute('value');
        select.value = [];
        if (!this.isnull(setValue)) {
            select.value = this.array.findAll(setValue.split(','), v => {
                return v.trim() != '';
            });//remove all empty strings
        }

        select.dataset.active = 'false';
        //get the contents
        let contents = select.find('.kerdx-select-contents');
        let input = select.find('.kerdx-select-input');
        let search = select.find('.kerdx-select-search');
        let toggle = select.find('.kerdx-select-toggle');
        params.contents = params.contents || {};
        //populate the element contents
        if (Array.isArray(params.contents)) {//Turn contents to object if its array
            let items = params.contents;
            params.contents = {};
            for (let i = 0; i < items.length; i++) {
                params.contents[items[i]] = items[i];
            }
        }

        for (let i in params.contents) {
            let option = contents.makeElement({ element: 'span', attributes: { class: 'kerdx-select-option', value: i } });
            option.innerHTML = params.contents[i];
            option.value = i;
        }

        for (let v of select.value) {
            input.value += params.contents[v];
            input.dispatchEvent(new CustomEvent('change'));
        }

        //enable multiple values
        let single = (!this.isset(params.multiple) || params.multiple == false);

        let options = select.findAll('.kerdx-select-option');

        //search the contents
        search.onChanged(value => {
            for (let i = 0; i < options.length; i++) {
                if (!options[i].textContent.toLowerCase().includes(value.toLowerCase())) {
                    options[i].css({ display: 'none' });
                }
                else {
                    options[i].cssRemove(['display']);
                }
            }
        });

        //navigate the contents
        let navigate = event => {
            allowNavigate = false;
            if (event.key == 'ArrowDown' && scrollPosition < options.length - 1) {
                scrollPosition++;
                allowNavigate = true;
            }
            else if (event.key == 'ArrowUp' && scrollPosition > 0) {
                scrollPosition--;
                allowNavigate = true;
            }
            else if (event.key == 'Enter') {

            }

            if (allowNavigate) {
                active = contents.find('.kerdx-select-active-option');
                if (!this.isnull(active)) {
                    active.classList.remove('kerdx-select-active-option');
                }

                options[scrollPosition].classList.add('kerdx-select-active-option');
            }
        }

        //toggle the contents
        toggle.addEventListener('click', event => {
            let active = select.dataset.active == 'true';
            if (active) {
                deactivate(active);
            }
            else {
                activate(active);
            }
        });

        //show the contents
        let inView, top, bottom;
        document.body.css({ overflow: 'auto' })

        let placeContents = () => {
            top = select.position().top;
            bottom = document.body.clientHeight - select.position().top;

            if (top > bottom) {
                contents.css({ top: -contents.position().height + 'px' });
            }
            else {
                contents.css({ top: select.position().height + 'px' });
            }
        }

        //show contents
        let activate = () => {
            if (select.inView('body')) {
                input.addEventListener('keydown', navigate, false);
                search.css({ display: 'flex' });
                contents.css({ display: 'flex' });
                placeContents();
                select.dataset.active = 'true';
            }
        }

        //hide the contents
        let deactivate = () => {
            input.removeEventListener('keydown', navigate, false);
            search.cssRemove(['display']);
            contents.cssRemove(['display']);
            select.dataset.active = 'false';
        }

        //update the selected
        let update = (values) => {
            selected = [];
            values = values.split(',');
            for (let value of values) {
                value = value.trim();
                for (let i in params.contents) {
                    if (params.contents[i] == value) {
                        value = i;
                    }
                }

                selected.push(value);
            }

            select.value = selected;
            input.value = values;
        }

        //check when activated
        select.bubbledEvent('click', event => {
            if (event.target != toggle && select.dataset.active == 'false') {
                activate();
            }

            if (event.target.classList.contains('kerdx-select-option')) {
                let text = params.contents[event.target.value];
                if (params.multiple == 'single') {
                    if (input.value.includes(text)) {
                        input.value = input.value.replace(text, '');
                    }
                    else {
                        input.value += `, ${text}`;
                    }
                }
                else {
                    input.value += `, ${text}`;
                }

                input.dispatchEvent(new CustomEvent('change'));

                if (single) {
                    deactivate();
                }
            }
        });

        //check when deactivated
        select.notBubbledEvent('click', event => {
            if (select.dataset.active == 'true') {
                deactivate();
            }
        });

        //when input value changes
        input.addEventListener('change', event => {
            let values = input.value.split(',');

            values = this.array.findAll(values, value => {
                return value.trim() != '';
            });

            values = this.array.each(values, value => {
                return value.trim();
            });

            if (!single) {
                if (params.multiple == 'single') {
                    values = this.array.toSet(values);
                }
            }

            values = values.join(', ');
            update(values);
        });

        //align contents on scroll
        window.addEventListener('scroll', event => {
            if (select.inView('body')) {
                placeContents();
            }
        });

        return select;
    }

    choose(params = { note: '', options: [] }) {
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

    textEditor(params = { id: '', width: 'max-width' }) {
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
                        background-color: var(--primary-color);
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
                        color: var(--primary-color);
                        text-align: left;
                    }

                    iframe#crater-the-WYSIWYG{
                        height: 100%;
                        width: 100%;
                    }

                    div#crater-the-ribbon button{
                        color: var(--primary-color);
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

    displayData(data = {}, container) {
        let lineNumbers = [];
        let displayString = (value) => {
            return this.createElement({ element: 'span', attributes: { class: 'kerdx-data-str' }, text: `"${value}"` });
        }

        let displayLiteral = (value) => {
            return this.createElement({ element: 'span', attributes: { class: 'kerdx-data-lit' }, text: `${value}` });
        }

        let displayPunctuation = (value) => {
            return this.createElement({ element: 'span', attributes: { class: 'kerdx-data-pun' }, text: `${value}` });
        }

        let displayNewLine = () => {
            increment++;
            return this.createElement({ element: 'span', attributes: { class: 'kerdx-data-pln' } });
        }

        let displayItem = (value, params) => {
            params = params || {};
            let item = this.createElement({ element: 'span', attributes: { class: 'kerdx-data-item' } });
            lineNumbers.push(item);
            if (this.isset(params.key)) {
                item.makeElement([
                    displayString(params.key),
                    displayPunctuation(' : '),
                    chooseDisplay(value),
                ]);
            }
            else {
                item.makeElement([
                    chooseDisplay(value),
                ]);
            }
            return item;
        }

        let displayArray = (value) => {
            let array = this.createElement({ element: 'span', attributes: { class: 'kerdx-data-block' } });
            lineNumbers.push(array);

            array.makeElement(displayPunctuation('['));
            let item;
            for (let i = 0; i < value.length; i++) {
                item = array.makeElement(displayItem(value[i]));

                if (i != value.length - 1) {
                    item.makeElement(displayPunctuation(','));
                }
            }
            array.makeElement(displayPunctuation(']'));
            return array;
        }

        let displayObject = (value) => {
            let object = this.createElement({ element: 'span', attributes: { class: 'kerdx-data-block' } });
            lineNumbers.push(object);

            object.makeElement(displayPunctuation('{'));
            let item;
            let i = 0;
            for (let key in value) {
                item = object.makeElement(displayItem(value[key], { key }));
                if (i != Object.keys(value).length - 1) {
                    item.makeElement(displayPunctuation(','));
                }
                i++;
            }
            object.makeElement(displayPunctuation('}'));
            return object;
        }

        let chooseDisplay = (value) => {
            if (typeof value == "string") {
                return displayString(value);
            }
            else if (Array.isArray(value)) {
                return displayArray(value);
            }
            else if (typeof value == 'object') {
                return displayObject(value);
            }
            else {
                return displayLiteral(value);
            }
        }
        let lineHeight = '25px';
        let displayed = container.makeElement({
            element: 'pre', attributes: { class: 'kerdx-data-window' }, children: [
                {
                    element: 'span', attributes: { class: 'kerdx-data-line', style: { lineHeight } }
                },
                {
                    element: 'span', attributes: { class: 'kerdx-data-toggles' }
                },
                {
                    element: 'code', attributes: { class: 'kerdx-data-code', style: { lineHeight } }, children: [
                        chooseDisplay(data)
                    ]
                }
            ]
        });

        let code = displayed.find('.kerdx-data-code'),
            numbers,
            toggleButtons,
            height = code.position().height,
            lines = displayed.find('.kerdx-data-line'),
            toggles = displayed.find('.kerdx-data-toggles'),
            count = height / parseInt(lineHeight),
            items = code.findAll('.kerdx-data-item'),
            blocks = code.findAll('.kerdx-data-block');

        let setRange = (block) => {
            let start = Math.floor((block.position().top - code.position().top) / parseInt(lineHeight)) + 1;
            let end = Math.floor((block.position().bottom - code.position().top) / parseInt(lineHeight)) + 1;
            block.range = kerdx.range(end, start);
        }

        let setNumbers = () => {
            for (let i = 0; i < lineNumbers.length; i++) {
                lines.makeElement([
                    { element: 'a', html: `${i / 1 + 1}`, attributes: { class: 'kerdx-data-line-number' } }
                ]);
            }
        }

        let setToggles = () => {
            for (let i = 0; i < blocks.length; i++) {
                let top = blocks[i].position().top - code.position().top + 6 + 'px'
                let toggle = toggles.makeElement({ element: 'i', attributes: { class: 'kerdx-data-toggles-button fas fa-arrow-down', style: { top } } });

                toggle.block = blocks[i];
                blocks[i].toggle = toggle;
            }
        }

        let alignToggles = () => {
            for (let i = 0; i < toggleButtons.length; i++) {
                toggleButtons[i].css({
                    top: toggleButtons[i].block.position().top - code.position().top + 6 + 'px'
                });
            }
        }

        let hideNumbers = (block) => {
            for (let i = 0; i < block.range.length; i++) {
                if (!this.isset(numbers[block.range[i]].controller)) {
                    numbers[block.range[i]].css({ display: 'none' });
                    numbers[block.range[i]].controller = block;
                }
            }
        }

        let hideBlock = (block) => {
            let blockContent = block.children;
            for (let i = 0; i < blockContent.length; i++) {
                if (blockContent[i].classList.contains('kerdx-data-item')) {
                    blockContent[i].css({ display: 'none' });

                    blockContent[i].findAll('.kerdx-data-block').forEach(b => {
                        if (!this.isset(b.toggle.controller)) {
                            b.toggle.controller = block;
                            b.toggle.css({ display: 'none' });
                        }
                    });
                }
            }
        }

        let showNumbers = (block) => {
            for (let i = 0; i < block.range.length; i++) {
                if (numbers[block.range[i]].controller == block) {
                    numbers[block.range[i]].cssRemove(['display']);
                    delete numbers[block.range[i]].controller;
                }
            }
        }

        let showBlock = (block) => {
            let blockContent = block.children;
            for (let i = 0; i < blockContent.length; i++) {
                if (blockContent[i].classList.contains('kerdx-data-item')) {
                    blockContent[i].cssRemove(['display']);

                    blockContent[i].findAll('.kerdx-data-block').forEach(b => {
                        if (b.toggle.controller == block) {
                            delete b.toggle.controller;
                            b.toggle.cssRemove(['display']);
                        }
                    });
                }
            }
        }

        lineNumbers.push(undefined)

        displayed.onAdded(event => {
            setNumbers();
            setToggles();

            numbers = lines.findAll('.kerdx-data-line-number');
            toggleButtons = toggles.findAll('.kerdx-data-toggles-button');

            let blockContent, start, end;
            displayed.addEventListener('click', event => {
                let target = event.target;
                if (target.classList.contains('kerdx-data-toggles-button')) {//if toggled
                    if (!this.isset(target.block.range)) {
                        setRange(target.block);
                    }

                    if (target.classList.contains('fa-arrow-down')) {//if toggle to show
                        hideNumbers(target.block);
                        hideBlock(target.block);
                    }
                    else {
                        showNumbers(target.block);
                        showBlock(target.block);
                    }

                    target.classList.toggle('fa-arrow-up');
                    target.classList.toggle('fa-arrow-down');
                    alignToggles();
                }
            });
        });

        return displayed;
    }
}