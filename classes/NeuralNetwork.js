let Matrix = require('./Matrix');
let Func = require('./Func');

let func = new Func();

module.exports = class NeuralNetwork {
    constructor(params) {
        func.object.copy(params, this);
        this.ihWeights = new Matrix({ rows: this.hNodes, cols: this.iNodes });
        this.ihWeights.randomize();

        this.ihBias = new Matrix({ rows: this.hNodes, cols: 1 });
        this.ihBias.randomize();

        this.hoWeights = new Matrix({ rows: this.oNodes, cols: this.hNodes });
        this.hoWeights.randomize();

        this.hoBias = new Matrix({ rows: this.oNodes, cols: 1 });
        this.hoBias.randomize();

        this.lr = this.lr || 0.1;
    }

    feedFoward(inputArray) {
        let inputs = inputArray instanceof Matrix ? inputArray : this.prepareInputs(inputArray);

        let hiddens = Matrix.multiply(this.ihWeights, inputs);
        hiddens.add(this.ihBias);
        hiddens.map(sigmoid);

        let outputs = Matrix.multiply(this.hoWeights, hiddens);
        outputs.add(this.hoBias);
        outputs.map(sigmoid);

        return { inputs, hiddens, outputs };
    }

    queryBack(targetArray) {

    }

    predict(inputArray) {
        return this.feedFoward(inputArray).outputs;
    }

    getWeightsUpdate(inputs, outputs, errors) {
        let gradients = Matrix.map(outputs, dSigmoid);
        gradients.multiply(errors);
        gradients.multiply(this.lr);

        let inputsTransposed = Matrix.transpose(inputs);
        let change = Matrix.multiply(gradients, inputsTransposed);

        return { change, gradients };
    }

    backpropagate(inputs, targets) {
        let { hiddens, outputs } = this.feedFoward(inputs);

        let hoErrors = Matrix.subtract(targets, outputs);
        let hoUpdates = this.getWeightsUpdate(hiddens, outputs, hoErrors);
        this.hoWeights.add(hoUpdates.change);
        this.hoBias.add(hoUpdates.gradients);

        let hoWeightsTransposed = Matrix.transpose(this.hoWeights);
        let ihErrors = Matrix.multiply(hoWeightsTransposed, hoErrors);
        let ihUpdates = this.getWeightsUpdate(inputs, hiddens, ihErrors);
        this.ihWeights.add(ihUpdates.change);
        this.ihBias.add(ihUpdates.gradients);
    }

    train(params) {
        let inputArray = [], targetArray = [];
        for (let data of params.trainingData) {
            inputArray.push(data.inputs);
            targetArray.push(data.targets);
        }

        let inputs = func.array.each(inputArray, value => {
            return this.prepareInputs(value);
        });

        let targets = func.array.each(targetArray, value => {
            return this.prepareTargets(value);
        });

        let run = () => {
            for (let i = 0; i < params.period; i++) {
                for (let j in inputs) {
                    this.backpropagate(inputs[j], targets[j]);
                }
            }
        }

        if (func.isset(params.epoch)) {
            for (let p = 0; p < params.epoch; p++) {
                run();
            }
        } else {
            run();
        }
    }

    setLearningRate(lr) {
        this.lr = lr;
    }

    prepareInputs(inputArray) {
        let inputs = Matrix.fromArray(Math.normalize(inputArray));
        inputs.multiply(0.99);
        inputs.add(0.01);
        return inputs;
    }

    prepareTargets(targetArray) {
        let targets = Matrix.fromArray(targetArray);
        targets.add(0.01);
        targets.multiply(0.99);
        return targets;
    }
}