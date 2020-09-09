const https = require('https');
const Dom = require('jsdom').JSDOM;

module.exports = function Spider() {
    let self = {};

    self.crawl = (url, callback) => {
        https.get(url, response=>{
            console.log(response)
        })
    }

    // if (error) {
    //     callback(error);
    // }
    // else if (response.statusCode == 200) {
    //     let window = new Dom(content).window;
    //     let document = window.document;
    //     let { head, body } = document;
    //     callback(error, { window, document, head, body });
    // }
    // else {
    //     callback(`Response => ${response.statusCode}`);
    // }

    return self;
}