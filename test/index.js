let ObjectLibrary = require('../functions/Objects');
let objectLibrary = ObjectLibrary();

let a = {
    vic: { name: 'vic', age: 21, count: 3 },
    ken: { name: 'ken', age: 23, count: 5 },
    to: { name: 'to', age: 25, count: 2 },
}

console.log(objectLibrary.sort(a, {key: true}));