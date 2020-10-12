'use strict'
import { Kerds, Database, SessionsManager } from './../index.js';
import { default as fs } from 'fs';
import { default as mongodb } from 'mongodb';
import { default as bcrypt } from 'bcrypt';

let metadata = {
    styles: [
        './fontawesome/css/all.css'
    ],
    scripts: {
        './includes/index.js': { type: 'module' },
    }
};

global.kerds = new Kerds({ server: { address: "mongodb://localhost:27017/", name: 'vend' } });
kerds.appPages = [
    'index.html',
    'dashboard.html',
    'apps.html',
    'users.html'
];

global.db = Database({ address: 'test.vqusx.gcp.mongodb.net', user: 'me', password: '.June1995', name: 'vend' });
global.ObjectId = mongodb.ObjectId;

global.sessions = kerds.sessionsManager.sessions;

function setup() {
    return new Promise((resolve, rejects) => {
        resolve(true);
    });
}

let { port, protocol } = kerds.getCommands('-');
if (!kerds.isset(port)) port = 8085;
if (!kerds.isset(protocol)) protocol = 'https';

setup().then(done => {
    kerds.createServer({
        port,
        protocol,
        domains: { origins: ['*'] },
        httpsOptions: {
            key: fs.readFileSync('../permissions/server.key'),
            cert: fs.readFileSync('../permissions/server.crt')
        },
        response: params => {
            params.response.end('Hello world');
        }
    });
});

kerds.recordSession({ period: 24 * 60 * 60 * 1000, remember: ['user'], server: { address: 'test.vqusx.gcp.mongodb.net', user: 'me', password: '.June1995', name: 'vend' } });
kerds.handleRequests = (req, res, form) => {
    res.end(JSON.stringify({word: 'Hello'}));
}
kerds.makeStatic('public');