let Func = require('./Func');

let func = new Func();

module.exports = class Matrix {
    constructor(params) {
        if (typeof params !== 'undefined') {
            Object.keys(params).map(key => {
                this[key] = params[key];
            });
        }

        this.rows = this.rows || 2;
        this.cols = this.cols || 2;
        this.contents = this.contents || [];
        this.setData(this.contents);
    }

    setData(contents) {
        this.contents = contents;
        this.data = [];
        for (let i = 0; i < this.rows; i++) {
            this.data[i] = [];
            for (let j = 0; j < this.rows; j++) {
                this.data[i][j] = contents.shift();
            }
        }
    }

    get structure() {
        let { rows, cols } = this;
        return { rows, cols };
    }

    add(n) {
        if (n instanceof Matrix) {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.data[i][j] += n.data[i][j];
                }
            }
        } else if (n instanceof Array) {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.data[i][j] += n[i][j];
                }
            }
        }
        else {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.data[i][j] += n;
                }
            }
        }
    }

    subtract(n) {
        if (n instanceof Matrix) {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.data[i][j] -= n.data[i][j];
                }
            }
        } else if (n instanceof Array) {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.data[i][j] -= n[i][j];
                }
            }
        }
        else {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.data[i][j] -= n;
                }
            }
        }
    }

    multiply(n) {
        if (n instanceof Matrix) {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < n.cols; j++) {
                    this.data[i][j] *= n.data[i][j];
                }
            }
        } else if (n instanceof Array) {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.data[i][j] *= n[i][j];
                }
            }
        }
        else {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.data[i][j] *= n;
                }
            }
        }
    }

    randomize() {
        this.map(value => {
            return func.random();
        });
    }

    transpose() {
        let newMatrix = new Matrix({ rows: this.cols, cols: this.rows });
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                newMatrix.data[j][i] = this.data[i][j];
            }
        }
        Object.keys(newMatrix).map(key => {
            this[key] = newMatrix[key];
        });
    }

    map(callback) {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                let value = this.data[i][j];
                this.data[i][j] = callback(value, i, j);
            }
        }
    }

    print() {
        console.table(this.data);
    }

    say() {
        console.log(this.toArray())
    }

    toArray() {
        this.contents = []
        Matrix.map(this, value => {
            this.contents.push(value);
        });
        return this.contents;
    }

    reshape(params) {
        this.toArray();
        this.rows = params.rows;
        this.cols = params.cols;
        this.setData(this.contents);
    }

    getColumns(...cols) {
        let value = [];

        for (let i in cols) {
            value.push(Array.each(this.data, row => {
                return row[cols[i]];
            }));
        }

        return value;
    }

    getRows(...rows) {
        let value = [];

        for (let r = 0; r < this.rows; r++) {
            if (rows.includes(r)) {
                value.push(this.data[r]);
            }
        }

        return value;
    }

    static toArray(matrix) {
        let array = []
        Matrix.map(matrix, value => {
            array.push(value);
        });
        return array;
    }

    static subtract(a, b) {
        let contents = [], rows = a.rows, cols = a.cols;

        if (b instanceof Matrix) {
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    contents.push(a.data[i][j] - b.data[i][j]);
                }
            }
        }
        else if (b instanceof Array) {
            for (let i = 0; i < a.rows; i++) {
                for (let j = 0; j < a.cols; j++) {
                    contents.push(a.data[i][j] - b[i][j]);
                }
            }
        }
        else {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    contents.push(a.data[i][j] - b);
                }
            }
        }

        return new Matrix({ rows, cols, contents });
    }

    static add(a, b) {
        let contents = [], rows = a.rows, cols = a.cols;

        if (b instanceof Matrix) {
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    contents.push(a.data[i][j] + b.data[i][j]);
                }
            }
        }
        else if (b instanceof Array) {
            for (let i = 0; i < a.rows; i++) {
                for (let j = 0; j < a.cols; j++) {
                    contents.push(a.data[i][j] + b[i][j]);
                }
            }
        }
        else {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    contents.push(a.data[i][j] + b);
                }
            }
        }

        return new Matrix({ rows, cols, contents });
    }

    static multiply(a, b) {
        let contents = [], rows, cols;

        if (b instanceof Matrix) {

            if (a.cols !== b.rows) {
                console.log('Columns of A must equal rows of B');
                return;
            }

            rows = a.rows;
            cols = b.cols;

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    let sum = 0;
                    for (let k = 0; k < a.cols; k++) {
                        sum += a.data[i][k] * b.data[k][j];
                    }
                    contents.push(sum);
                }
            }
        }
        else if (b instanceof Array) {

            rows = a.rows;
            cols = a.cols;

            for (let i = 0; i < a.rows; i++) {
                for (let j = 0; j < a.cols; j++) {
                    contents.push(a.data[i][j] * b[i][j]);
                }
            }
        }
        else {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    contents.push(a.data[i][j] * b);
                }
            }
        }

        return new Matrix({ rows, cols, contents });
    }

    static divide(a, b) {
        let contents = [], rows, cols;

        if (b instanceof Matrix) {

            if (a.cols !== b.rows) {
                console.log('Columns of A must equal rows of B');
                return;
            }

            rows = a.rows;
            cols = b.cols;

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    let sum = 0;
                    for (let k = 0; k < a.cols; k++) {
                        sum += (a.data[i][k] / b.data[k][j]) || 0;
                    }
                    contents.push(sum);
                }
            }
        }
        else if (b instanceof Array) {

            rows = a.rows;
            cols = a.cols;

            for (let i = 0; i < a.rows; i++) {
                for (let j = 0; j < a.cols; j++) {
                    contents.push((a.data[i][j] / b[i][j]) || 0);
                }
            }
        }
        else {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    contents.push((a.data[i][j] / b) || 0);
                }
            }
        }

        return new Matrix({ rows, cols, contents });
    }

    static randomize(matrix) {
        return Matrix.map(matrix, (value => {
            return func.random();
        }));
    }

    static transpose(matrix) {
        let newMatrix = new Matrix({ rows: matrix.cols, cols: matrix.rows });
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                newMatrix.data[j][i] = matrix.data[i][j];
            }
        }
        return newMatrix;
    }

    static map(matrix, callback) {
        let newMatrix = new Matrix({ rows: matrix.rows, cols: matrix.cols });
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                let value = matrix.data[i][j];
                newMatrix.data[i][j] = callback(value, i, j);
            }
        }
        return newMatrix;
    }

    static fromArray(contents) {
        return new Matrix({ rows: contents.length, cols: 1, contents });
    }

    static reshape(params) {
        params.contents = Matrix.toArray(params.matrix);
        delete params.matrix;
        return new Matrix(params);
    }

    static normalize(matrix) {
        let contents = Math.normalize(Matrix.toArray(matrix));
        return new Matrix({ rows: matrix.rows, cols: matrix.cols, contents });
    }

    static diagonal(array) {
        let matrix = Matrix.square(array.length);
        for (let i in matrix.data) {
            for (let j in matrix.data[i]) {
                if (i == j) {
                    matrix.data[i][j] = array[i];
                }
            }
        }
        matrix.toArray();
        return matrix;
    }

    static unit(size) {
        let matrix = Matrix.square(size);
        for (let i in matrix.data) {
            for (let j in matrix.data[i]) {
                if (i == j) {
                    matrix.data[i][j] = 1;
                }
            }
        }
        matrix.toArray();
        return matrix;
    }

    static square(size) {
        return new Matrix({ rows: size, cols: size });
    }

    static fromMatrixCols(matrix, ...cols) {
        let value = matrix.getColumns(...cols);
        let contents = Array.flatten(value);
        let newMatrix = new Matrix({ rows: value.length, cols: matrix.cols, contents });
        newMatrix.transpose();
        return newMatrix;
    }

    static deepMatrix(dimensions, contents) {
        //split the dimensions into an array of arrays of length 2
        let matrixDimensions = [];
        for (let i = 0; i < dimensions.length; i++) {
            matrixDimensions.push({ rows: dimensions[i], cols: dimensions[++i] || 1 });
        }

        let makeMatrix = (layer) => {
            let matrix = new Matrix(matrixDimensions[layer]);

            if (layer + 1 == matrixDimensions.length) {
                matrix.map(value => {
                    return contents.shift() || 0;
                });
            } else {
                matrix.map(value => {
                    return makeMatrix(layer + 1);
                });
            }
            return matrix;
        }

        return makeMatrix(0);
    }
}
