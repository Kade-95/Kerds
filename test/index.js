let { Kerds, Spider } = require('../index');
let kerds = new Kerds();

let s = new Spider();
s.crawl('https://tvshows4mobile.com/', (error, data) => {
    if (error) {
        console.log(error);
    }
    else {
        console.log(data.body.innerHTML);
    }
});