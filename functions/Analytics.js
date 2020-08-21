function AnalysisLibrary() {
    let self = {};
    self.entropy = (data) => {
        let entropy = 0;//initialize entropy
        let values = Object.values(data);//get the values of the object variable
        let sum = this.math.sum(values);//get the sum of the Values
        for (let value of values) {
            entropy -= value / sum * Math.log2(value / sum); //use the formular on each item
        }
        return entropy;
    }

    self.informationGain = (targetNode, variableData) => {
        let arrangeData = (list) => {//arrange the list into an object of counts
            let data = {};
            for (let item of list) {
                data[item] = data[item] || 0;
                data[item]++;
            }

            return data;
        };

        let targetData = arrangeData(targetNode);

        let targetEntropy = self.entropy(targetData);//get the entropy of the target node
        let sumOfInformation = 0;//initialize sum of information gain

        let variableValues = Object.values(variableData);//get the values of this variable
        let variableLength = 0;

        for (let i = 0; i < variableValues.length; i++) {//get the length of the variable by the adding the values
            variableLength += variableValues[i].length;
            variableValues[i] = arrangeData(variableValues[i]);
        }

        for (let v of variableValues) {//get the entropy of each and multiply by the probability
            sumOfInformation += (this.math.sum(Object.values(v)) / variableLength) * self.entropy(v);
        }

        let informationGain = targetEntropy - sumOfInformation;
        return informationGain;
    }

    self.highestInformationGainNode = (data, nodes) => {
        let gainedInformation = {};

        for (let i in nodes) {
            gainedInformation[i] = self.informationGain(data, nodes[i]);
        }

        return this.object.max(gainedInformation);
    }

    self.quartileRange = (data) => {

        let middle = (_dt) => {//get the middle position of a list of numbers
            let middle;
            if ((_dt.length) % 2 == 0) {//if the list count is not even
                middle = [Math.ceil(_dt.length / 2) - 1, Math.ceil(_dt.length / 2)];//get the two in the middle
            }
            else {
                middle = [Math.ceil(_dt.length / 2) - 1];
            }

            return middle;
        }

        let getMiddle = (_dt) => {// get the items in the middle of a list
            let [middle1, middle2] = middle(_dt);
            let middles = [];
            middles.push(_dt[middle1]);
            if (this.isset(middle2)) middles.push(_dt[middle2]);

            return middles;
        }

        let halfs = (_dt) => {//divide a list into two equal halfs
            let [middle1, middle2] = middle(_dt);
            if (!this.isset(middle2)) middle2 = middle1;
            let half1 = _dt.slice(0, middle1);
            let half2 = _dt.slice(middle2 + 1);
            return [half1, half2];
        }

        let layers = halfs(data);//get the halfs of the list
        let [layer1, layer2] = halfs(layers[0]);//divide each half into halfs
        let [layer3, layer4] = halfs(layers[1]);

        let middle1 = getMiddle(layers[0]);//get the middle of the first layers
        let middle3 = getMiddle(layers[1]);

        let q1 = this.math.median(middle1);//get the median of the first and last layers
        let q3 = this.math.median(middle3);

        return q3 - q1;//find the range
    }

    self.normalizeData = (data) => {
        data.sort((a, b) => { return a - b });
        var max = data[data.length - 1];
        var min = data[0];
        var normalized = [];
        for (var i = 0; i < data.length; i++) {
            normalized.push((data[i] - min) / (max - min));
        }
        return normalized;
    }

    return self;
}

export { AnalysisLibrary };