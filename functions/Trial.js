function Trial() {
    let self = {};
    self.extendMultiple = function (base, ...mixins) {
        class result extends base {
            constructor(params) {
                super(params);
            }
        }

        let copyProps = (target, source) => {
            let props = Object.getOwnPropertyNames(source).concat(Object.getOwnPropertySymbols(source));
            let ignore = [
                'contructor',
                'prototype',
                'arguments',
                'caller',
                'name',
                'bind',
                'call',
                'apply',
                'toString',
                'length'
            ];

            for (let prop of props) {
                if (!ignore.includes(prop)) {
                    Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
                }
            }
        }

        for (let mixin of mixins) {
            copyProps(base.prototype, mixin.prototype);
        }

        let r = new result();
        return result;
    }

    return self;
}

export { Trial };