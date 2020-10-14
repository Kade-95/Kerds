'use strict'
import { Kerds, Database, SessionsManager } from './../index.js';
import { default as fs } from 'fs';

global.kerds = new Kerds();

let { port, protocol } = kerds.getCommands('-');
if (!kerds.isset(port)) port = 8085;
if (!kerds.isset(protocol)) protocol = 'https';

kerds.createServer({
    port,
    protocol,
    domains: { origins: ['*'] },
    httpsOptions: {
        key: fs.readFileSync('./permissions/server.key'),
        cert: fs.readFileSync('./permissions/server.crt')
    },
    response: params => {
        params.response.end('Hello world');
    }
});

// kerds.recordSession({ period: 24 * 60 * 60 * 1000, remember: ['user'], server: { address: "mongodb://localhost:27017/", name: 'vend', local: true } });
kerds.handleRequests = (req, res, form) => {
    res.end(JSON.stringify({ word: 'Hello' }));
}

kerds.makeStatic('test/public');