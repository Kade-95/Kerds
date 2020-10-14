import {
    Func, ObjectLibrary,
} from '@thekade/base';

import { Database } from '../functions/Database.js';
import { Sessions } from '../classes/Sessions.js';
import { PersistentSessions } from '../classes/PersistentSessions.js';

let objectLib = ObjectLibrary();
let db;
let func = new Func();
let persistence;

class SessionsManager {
    constructor() {
        this.actualSessions = {};
        this.sessions = objectLib.onChanged(this.actualSessions, (target, p, d) => {
            this.write(target.key)
                .then()
                .catch(console.log);
        });
        this.cookies = {};
    }

    startSessions(params) {
        db = Database(params.server);
        persistence = new PersistentSessions(params.server);
        this.remember = params.remember || {};

        this.period = params.period;
        if (func.isset(this.period)) {
            this.period = 60000000;
        }

        return new Promise((resolve, reject) => {
            db.find({ collection: 'sessions', query: {}, options: { projection: { _id: 0 } }, many: {} }).then(result => {//Get all the stored sessions
                for (var session of result) {
                    this.actualSessions[session.key] = new Sessions(session.key);
                    Object.keys(session).map(key => {
                        this.actualSessions[session.key][key] = session[key];
                    });
                }
                resolve('Done');
            }).catch(err => {
                reject("Error fetching existing sessions before starting=> " + err);
            });
        });
    }

    clearOldSessions() {
        let time;
        setInterval(() => {
            time = new Date().getTime();
            db.delete({ collection: 'sessions', query: { time: { $lt: time - this.period } }, many: {} }).then(result => {
                console.log('Old sessions cleared. deletedCount is ' + result.deletedCount);
            }).catch(err => {
                console.log('Error clearing old sessions=> ' + err);
            });
            for (var i in this.actualSessions) {
                if (this.actualSessions[i].time < time - this.period) delete this.actualSessions[i];
            }
        }, this.period);
    }

    createNODESSID(res, flag) {
        // sessionid generator
        let sessionId;
        if (!func.isset(this.cookies.NODESSID)) {
            sessionId = func.generateRandom(32);
            if (func.isset(flag)) {
                this.setCookie(res, { NODESSID: sessionId, httpOnly: true, path: '/' });
            }
        }
        else {
            sessionId = this.cookies.NODESSID;
        }
        if (!func.isset(this.actualSessions[sessionId])) this.actualSessions[sessionId] = new Sessions(sessionId);
        return sessionId;
    }

    getCookies(req) {
        var allCookies = req.headers.cookie;//Get all the cookies that came with the request
        if (!func.isset(allCookies)) {//Check if request has any cookie
            this.cookies = {};
        }
        else {
            allCookies = allCookies.split('; ');
            let cookie;
            for (let i = 0; i < allCookies.length; i++) {
                cookie = allCookies[i].split('=');
                this.cookies[cookie[0]] = cookie[1];//Populate the cookies with found cookies in the request
            }
        }
        return this.cookies;
    }

    setCookie(res, cookieData) {
        // cookie setter
        let arrangedCookie = '';
        let cookieLength = func.objectLength(cookieData);
        Object.keys(cookieData).map(key => {
            cookieLength--;
            arrangedCookie += key + '=' + cookieData[key];
            if (cookieLength > 0) arrangedCookie += '; ';
        });
        res.setHeader('Set-Cookie', [arrangedCookie]);
    }

    store(req, res, filename, callback) {
        let time = new Date().getTime();
        let duration = time - this.period;
        let sessionId = req.sessionId;

        this.read(sessionId).then(result => {//Fetch session from database    
            if (!func.isnull(result)) {//Sessions is found in database
                Object.keys(result).map(key => {
                    this.sessions[sessionId][key] = result[key];
                });
            }
            else {
                this.sessions[sessionId].active = false;
            }

            if (!func.isnull(result) && !func.isnull(result.time) && result.time < duration) {
                // session exists already
                // and but expired
                this.sessions[sessionId].active = false;
                if (typeof callback === 'function') callback({ request: req, response: res, filename: filename, sessionId: sessionId });
            }
            else if (func.isnull(result)) {
                // session doesn't exist
                // and not in database

                //Check if previous login was persistent
                persistence.checkCredentials(res, this.cookies).then(result => {
                    if (typeof callback === 'function') callback({ request: req, response: res, filename: filename, sessionId: sessionId });
                });
            }
            else {
                // session exists and has not expired
                if (typeof callback === 'function') callback({ request: req, response: res, filename: filename, sessionId: sessionId });
            }
        });
    }

    async read(key) {
        return await db.find({ collection: 'sessions', query: { key }, options: { projection: { _id: 0 } } });
    }

    async write(key) {
        if (func.isset(this.actualSessions[key])) {
            this.actualSessions[key].time = new Date().getTime();
            return await db.save({ collection: 'sessions', query: this.prepareSaving(key), check: { key } });
        }
    }

    prepareSaving(key) {
        let prepared = {}
        for (let i in this.actualSessions[key]) {
            if (i == 'key' || i == 'time' || i == 'active' || this.remember.includes(i)) {
                prepared[i] = this.actualSessions[key][i];
            }
        }
        return prepared;
    }

    destroy(key) {
        return db.delete({ collection: 'sessions', query: { key } }).then(result => {
            let deleted = result.result.ok == 1;
            if (deleted) {
                delete this.sessions[key];
            }
            return deleted;
        });
    }

    isExpired(key) {
        let time = new Date().getTime();
        let duration = time - this.period;
        return new Promise((resolve, reject) => {
            db.find({ collection: 'sessions', query: { key }, options: { projection: { _id: 0, time: 1 } } }).then(result => {
                if (func.isnull(result) || func.isnull(result.time)) {
                    if (func.isset(this.sessions[key].userID)) delete this.sessions[key].userID;
                    resolve(true);
                }
                else if ((result.time < (time - duration))) {
                    this.destroy(id).then(res => {
                        resolve(true)
                    }).catch(err => {
                        reject('expired_session unable to destroy=> ' + err)
                    });
                }
                else {
                    resolve(false);
                }
            }).catch(err => {
                reject('could not determine if session expired=> ' + err);
            });
        });
    }

    set(key, item) {
        this.sessions[key].set(item);
        this.write(key);
    }

    unset(key, item) {
        this.sessions[key].unset(item);
        this.write(key);
    }
}

export { SessionsManager };