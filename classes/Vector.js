module.exports = class Vector {
    constructor(params) {
        Object.keys(params).map(key => {
            this[key] = params[key];
        });
    }

    scalar(params) {
        let vector = [];
        
        for (let i = 0; i < this.value.length; i++) {
            vector[i] = this.value[i] * params;
        }

        return new Vector({value: vector});
    }

    elementWise(params) {
        let vector = [];

        for (let i = 0; i < this.value.length; i++) {
            vector[i] = this.value[i] + params[i];
        }

        return new Vector({value: vector});
    }

    dot(params) {
        let product = 0;

        for (let i = 0; i < this.value.length; i++) {
            product += this.value[i] * params[i];
        }

        return product;
    }
}