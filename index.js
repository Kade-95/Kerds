import { default as os } from 'os';
import { default as https } from 'https';
import { default as http } from 'http';
import { default as fs } from 'fs';
import { default as url } from 'url';
import { default as mongodb } from 'mongodb';
import { default as util } from 'util';
import { default as DOM } from 'jsdom';

global.Dom = DOM.JSDOM;
global.window = new Dom(`...`).window;
global.document = window.document;
global.Element = window.Element;
global.NodeList = window.NodeList;
global.HTMLCollection = window.HTMLCollection;
global.Node = window.Node;
global.HTMLElement = window.HTMLElement;
global.location = window.location;


import {
    Base,
    Func,
    NeuralNetwork,
    Matrix,
    Template,
    Components,
    Compression,
    ColorPicker,
} from 'kerdbase';

import { SessionsManager } from './classes/SessionsManager.js';
import { Database } from './functions/Database.js';
import { RequestsLibrary } from './functions/Requests.js';

class Kerds extends Base {
    constructor() {
        super();
        this.sessionsManager = new SessionsManager();
        this.request = RequestsLibrary();
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
            '.svg': 'application/image/svg+xml',
            '.wasm': 'application/wasm'
        };
        this.appPages = [];
        this.handleRequests = () => { };
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
        // start http server
        this.q = url.parse(req.url);

        let filename = '.' + this.q.pathname;
        let tmp = filename.lastIndexOf('.');
        let ext = filename.slice(tmp).toLowerCase();
        let contentType = this.mimeTypes[ext];
        if (!this.isset(contentType)) {
            contentType = 'application/octet-stream';
        }

        this.permit(req, res, allowed);
        this.sessionsManager.getCookies(req);

        if (req.method.toLowerCase() == 'post') {
            // on post request
            req.sessionId = this.sessionsManager.createNODESSID(res);
            req.res = res;
            req.extract = this.request.extract;
            req.parseForm = this.request.parseForm;
            req.handleRequests = this.handleRequests;

            req.on('data', this.onPosting).on('end', this.onPosted);
        }
        else if (req.method.toLowerCase() == 'get') {
            req.sessionId = this.sessionsManager.createNODESSID(res, true);

            if (this.static == true) {
                if (this.allowSessions) {
                    this.sessionsManager.store(req, res);
                }

                filename = filename.replace('./', this.staticPath);
                if (filename == this.staticPath) {
                    res.writeHead(301, { 'Location': 'index.html' });
                    res.end();
                }
                else {
                    fs.stat(filename, (err, stats) => {
                        if (stats == undefined || !stats.isFile()) {
                            res.writeHead(404, { 'Content-Type': contentType });
                            res.end('404. Not Found');
                        }
                        else {
                            res.writeHead(200, { 'Content-Type': contentType });
                            fs.createReadStream(filename).pipe(res);
                        }
                    });
                }
            }
            else {
                if (this.allowSessions) {
                    this.sessionsManager.store(req, res, filename, callback);
                }
                else {
                    callback({ request: req, response: res, filename: filename, sessionId: undefined });
                }
            }
        }
    }

    createServer(params = { port: '', protocol: '', domains: [], httpsOptions: {}, response: () => { } }, callback = () => { }) {
        let server;
        if (params.protocol.toLowerCase() == 'https') {
            if (!this.isset(params.httpsOptions)) {
                console.log('HTTPS should have SSL options');
                return;
            }

            server = https.createServer(params.httpsOptions, (req, res) => {
                if (this.isset(params.response)) {
                    this.reply(req, res, params.response, params.domains);
                }
            });
        }
        else {
            server = http.createServer((req, res) => {
                if (this.isset(params.response)) {
                    this.reply(req, res, params.response, params.domains);
                }
            });
        }

        server.on('error', err => {
            console.log(`Port ${params.port} is in use`)
        }).listen(params.port, '0.0.0.0', () => {
            console.log(`${params.protocol} Server Running on Port : ${params.port}`);
            console.log('Url: ', `${params.protocol}://localhost:${params.port}`)
        });

        callback(server);
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
        var boundary = this.extract(this.headers['content-type'], ' boundary=');
        var form = this.parseForm(boundary, this.data);

        if (typeof this.handleRequests == 'function') {
            this.handleRequests(this, this.res, form);
        }
    }

    recordSession(params = { period: '', remember: '', server: { address: '', name: '', user: '', password: '', local: true } }) {
        this.allowSessions = true;

        this.runParallel({
            start: this.sessionsManager.startSessions(params),
            clear: this.sessionsManager.clearOldSessions()
        }, () => {
            console.log('Sessions are been recorded');
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
                commands[arg.replace(start, '')] = args[i + 1];
            }
        }

        return commands;
    }

    timeLog(...data) {
        let time = `[${this.time()}]:`;
        console.log(time, ...data);
    }

    makeStatic(name) {
        this.static = true;
        this.staticPath = `./${name}/`;
    }
}

export {
    Kerds,
    Func,
    NeuralNetwork,
    Matrix,
    Template,
    Components,
    Compression,
    ColorPicker,
    SessionsManager,
    Database,
}
