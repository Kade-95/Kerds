global.Dom = require('jsdom').JSDOM;
global.window = new Dom(`...`).window;
global.document = window.document;
global.Element = window.Element;
global.NodeList = window.NodeList;
global.HTMLCollection = window.HTMLCollection;
global.Node = window.Node;
global.HTMLElement = window.HTMLElement;
global.location = window.location;

global.os = require('os');
global.cluster = require('cluster');
global.https = require('https');
global.http = require('http');
global.fs = require('fs');
global.url = require('url');
global.mongoClient = require('mongodb').MongoClient;
global.ObjectId = require('mongodb').ObjectId;
global.util = require('util');

let Func = require('./classes/Func');
let Matrix = require('./classes/Matrix');
let NeuralNetwork = require('./classes/NeuralNetwork');
let Template = require('./classes/Template');
let SessionsManager = require('./classes/SessionsManager');
let Database = require('./classes/Database');

let func = new Func();

class Perceptor extends Template {
    constructor(params) {
        super();
        this.states = {};
        this.Matrix = Matrix;
        this.NeuralNetwork = NeuralNetwork;
        this.sessionsManager = new SessionsManager(params);
        this.allowSessions = false;
        this.mimeTypes = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.mjs': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpg',
            '.gif': 'image/gif',
            '.ico': 'image/ico',
            '.wav': 'audio/wav',
            '.mp4': 'video/mp4',
            '.woff': 'application/font-woff',
            '.ttf': 'application/font-ttf',
            '.eot': 'application/vnd.ms-fontobject',
            '.otf': 'application/font-otf',
            '.svg': 'application/image/svg+xml'
        };
        this.object.copy(params, this);
        this.db = new Database(this.server);
    }

    permit(req, res, allowed) {
        allowed = allowed || {};
        if (this.isset(allowed.origins)) {
            for (let origin of allowed.origins) {
                res.setHeader('Access-Control-Allow-Origin', origin);
            }
        }
    }

    reply(req, res, callback, allowed) {
        res.render = params => {
            var filename = `./pages/${params.page}.ejs`;
            ejs.renderFile(filename, params, (err, result) => {
                if (err) throw (err);
                callback({ request: req, response: res, filename: filename });
            });
        }
        // start http server
        this.q = url.parse(req.url);

        let filename = '.' + this.q.pathname;
        let tmp = filename.lastIndexOf('.');
        let ext = filename.slice(tmp).toLowerCase();
        let contentType = this.mimeTypes[ext] || 'application/octet-stream';
        this.permit(req, res, allowed);

        if (req.method == 'POST') {
            // on post request
            this.sessionsManager.getCookies(req);
            req.sessionId = this.sessionsManager.createNODESSID(res);
            req.res = res;
            req.handleRequests = this.handleRequests;

            req.on('data', this.onPosting).on('end', this.onPosted);
        }
        else if (filename == './' || ext == '.html' || ext == '.htm') {
            // if page is index
            this.sessionsManager.getCookies(req);
            let sessionId = this.sessionsManager.createNODESSID(res, true);
            if (this.allowSessions) {
                this.sessionsManager.store(req, res, filename, callback, sessionId);
            }
            else {
                callback({ request: req, response: res, filename: filename, sessionId: sessionId });
            }
        }
        else {
            fs.exists(filename, (exists) => {
                if (exists) {
                    res.writeHead(200, { 'Content-Type': contentType });
                    fs.createReadStream(filename).pipe(res);
                }
                else {
                    res.writeHead(404, { 'Content-Type': contentType });
                    res.end('Not Found');
                }
            });
        }
    }

    createServer(port, callback, type, allowed, options) {
        if (!cluster.isMaster) {
            let numWorkers = os.cpus().length;

            for (let i = 0; i < numWorkers; i++) {
                cluster.fork();
            }

            cluster.on('online', worker => {
                console.log('Worker ' + worker.process.pid + ' is online');
            });

            cluster.on('exit', (worker, code, signal) => {
                console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal ' + signal);
                console.log('Starting a new worker');
                cluster.fork();
            });
        }
        else {
            let server;
            if (type.toLowerCase() == 'https') {
                if (!perceptor.isset(options)) {
                    console.log('HTTPS should have SSL options');
                    return;
                }

                server = https.createServer(options, (req, res) => {
                    this.reply(req, res, callback, allowed);
                });
            }
            else {
                server = http.createServer((req, res) => {
                    this.reply(req, res, callback, allowed);
                });
            }


            server.on('error', err => {
                console.log(`Port ${port} is in use`)
            }).listen(port, '0.0.0.0', () => {
                console.log(`${type} Server Running on Port : ${port}`);
            });
        }
    }

    onPosting(data) {
        // get the post request data
        if (this.data) {
            this.data.fill(data, this.dataIndex);
            this.dataIndex += data.length;
        } else {
            var contentLength = +this.headers["content-length"];
            if (data.length === contentLength) {
                this.data = data;
            } else {
                this.data = Buffer.alloc(contentLength);
                this.data.fill(data)
                this.dataIndex = data.length;
            }
        }
    }

    onPosted() {
        // post the request
        var boundary = func.extract(this.headers['content-type'], ' boundary=');
        var form = func.parseForm(boundary, this.data);

        if (typeof this.handleRequests == 'function') {
            this.handleRequests(this, this.res, form);
        }
    }

    saveState() {
        let url = window.location.href;
        this.states[url] = document.body.outerHTML;
    }

    getState() {
        let url = window.location.href;
        return this.states[url];
    }

    recordSession(period) {
        this.allowSessions = true;
        perceptor.runParallel({
            start: this.sessionsManager.startSessions(period),
            clear: this.sessionsManager.clearOldSessions()
        }, result => {
        });
    }

    deleteRecursive(path, callback) {
        let exists = fs.existsSync(path);
        if (exists) {
            if (fs.lstatSync(path).isDirectory()) {
                fs.readdirSync(path).forEach(file => {
                    let curPath = path + '/' + file;
                    this.deleteRecursive(curPath);
                });
                fs.rmdirSync(path);
            }
            else {
                fs.unlinkSync(path);
            }
        }

        if (this.isset(callback) && typeof callback == 'function') {
            callback(exists);
        }
    }

    getCommands(start) {
        let commands = {};
        let args = process.argv.slice(2);
        let arg;
        for (let i = 0; i < args.length; i++) {
            arg = args[i];
            if (arg[0] == start) {
                commands[arg.replace(start, '')] = args[i+1];
            }
        }

        return commands;
    }
}

module.exports = {
    Perceptor,
    Func,
    NeuralNetwork,
    Matrix,
    SessionsManager,
    Database,
    Template
}
