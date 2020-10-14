import {
    ArrayLibrary,
    Func,
} from 'kerdbase';
import { default as mongodb } from 'mongodb';
const mongoClient = mongodb.MongoClient;

let func = new Func();
let arrayLib = ArrayLibrary();

function Database(details = { address: '', name: '', user: '', password: '', port: '', local: true }) {
    let self = {};
    self.mongoCloud = 'mongodb+srv://';
    self.mongoLocal = 'mongodb://';
    self.user = details.user || '';
    self.password = details.password || '';
    self.address = details.address;
    self.name = details.name;
    self.options = details.options;
    self.port = details.port;
    self.local = details.local || false;

    self.getConnectionString = function () {
        let connectionString;
        if (self.local) {
            connectionString = `${self.mongoLocal}localhost:${self.port}/${self.name}`;
        }
        else {
            connectionString = `${self.mongoCloud}${self.user}:${self.password}@${self.address}/${self.name}`;
            if (func.isString(self.options)) {
                connectionString += `?${self.options}`;
            }
        }

        return encodeURI(connectionString);
    }

    self.connectionString = self.getConnectionString();

    self.setName = function (name) {
        self.name = name;
        self.connectionString = self.getConnectionString();
    }

    self.erase = function () {
        return self.open({}, db => {
            return db.db(self.name).dropDatabase();
        });
    }

    self.open = function (params = { url: '', options: { useNewUrlParser: true, useUnifiedTopology: true } }, callBack) {
        // open database for operations
        params.url = params.url || self.connectionString;
        params.options = params.options || { useNewUrlParser: true, useUnifiedTopology: true }
        if (func.isfunction(callBack)) {
            return new Promise((resolve, reject) => {
                mongoClient.connect(params.url, params.options, (err, db) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        callBack(db)
                            .then((result) => {
                                self.close(db);
                                if (func.isnull(db)) {
                                    reject(`Error => MongoDb is not running on this system. Database is null`);
                                }
                                else {
                                    resolve(result);
                                }
                            })
                            .catch(error => {
                                reject(error);
                            })
                    }
                });
            });
        }
        else {
            return new Promise((resolve, reject) => {
                mongoClient.connect(params.url, params.options, (err, db) => {
                    if (err) reject(err);
                    else resolve(db);
                });
            });
        }
    }

    self.close = function (db) {
        // close database 
        if (db) {
            db.close();
        }
    }

    self.insert = function (params = { collection: '', query: {}, getInserted: false }) {
        // insert into database        
        let database = null;
        let value;
        return new Promise((resolve, reject) => {
            if (!func.isString(params.collection)) {
                reject('Invalid collection name');
            }
            if (!func.isObject(params.query)) {
                reject('Invalid query');
            }
            self.open()
                .then((db) => {
                    database = db;
                    return db.db(self.name).collection(params.collection);
                })
                .then((collection) => {
                    if (Array.isArray(params.query)) value = collection.insertMany(params.query);
                    else value = collection.insertOne(params.query);
                    return value;
                })
                .then((result) => {
                    if (params.getInserted == true) {
                        resolve(result.ops);
                    }
                    else resolve(result.result.ok);
                    database.close();
                })
                .catch((err) => {
                    database.close();
                    reject(err);
                });
        });
    }

    self.update = function (params = { collection: '', query: {}, options: {}, many: false }) {
        // update database
        let database = null;
        return new Promise((resolve, reject) => {
            if (!func.isObject(params)) {
                reject('Invalid parameter');
            }
            if (!func.isString(params.collection)) {
                reject('Invalid collection name');
            }
            if (!func.isObject(params.query)) {
                reject('Invalid query');
            }
            if (!func.isObject(params.options)) {
                reject('Invalid options');
            }

            self.open()
                .then((db) => {
                    database = db;
                    return db.db(self.name).collection(params.collection);
                })
                .then((collection) => {
                    if (params.many == true) return collection.updateMany(params.query, params.options);
                    else return collection.updateOne(params.query, params.options);
                })
                .then((result) => {
                    resolve(result.result.ok);
                    database.close();
                })
                .catch((err) => {
                    database.close();
                    reject(err);
                });
        });
    }

    self.save = function (params = { collection: '', query: {}, check: {}, options: {}, many: false }) {
        // save or replace the content of a document
        return self.exists({ collection: params.collection, query: params.check })
            .then(result => {
                if (result) {
                    return self.update({ collection: params.collection, query: params.check, options: { '$set': params.query } })
                }
                else {
                    return self.insert(params);
                }
            })
            .then(result => {
                return result;
            });
    }

    self.replace = function (params = { collection: '', query: {}, new: {} }) {
        // insert or update the content of document
        let database = null;
        return new Promise((resolve, reject) => {
            if (!func.isObject(params)) {
                reject('Invalid parameter');
            }
            if (!func.isString(params.collection)) {
                reject('Invalid collection name');
            }
            if (!func.isObject(params.query)) {
                reject('Invalid query');
            }
            if (!func.isObject(params.new)) {
                reject('Invalid new value');
            }
            self.open().then((db) => {
                database = db;
                return db.db(self.name).collection(params.collection);
            }).then((collection) => {
                return collection.replaceOne(params.query, params.new);
            }).then((result) => {
                resolve(result.result.ok);
                database.close();
            }).catch((err) => {
                database.close();
                reject(err);
            });
        });
    }

    self.aggregate = function (params = { collection: '', query: {} }) {
        // perform an aggregation on database
        let database = null;
        return new Promise((resolve, reject) => {
            if (!func.isObject(params)) {
                reject('Invalid parameter');
            }
            if (!func.isString(params.collection)) {
                reject('Invalid collection name');
            }
            if (!func.isObject(params.query)) {
                reject('Invalid query');
            }
            self.open().then((db) => {
                database = db;
                return db.db(self.name).collection(params.collection);
            }).then((collection) => {
                return collection.aggregate(params.query).toArray();
            }).then((result) => {
                resolve(result);
                database.close();
            }).catch((err) => {
                database.close();
                reject(err);
            });
        });
    }

    self.join = function (params = { collection: '', query: { lookup: { from: '', localField: '', foreignField: '', as: '' } } }) {
        // join documents 
        let database = null;
        return new Promise((resolve, reject) => {
            if (!func.isObject(params)) {
                reject('Invalid parameter');
            }
            if (!func.isString(params.collection)) {
                reject('Invalid collection name');
            }
            if (!func.isObject(params.query)) {
                reject('Invalid collection name');
            }
            if (!func.isObject(params.query.lookup)) {
                reject('Invalid lookup');
            }
            if (!func.isString(params.query.lookup.from)) {
                reject('Invalid lookup source');
            }
            if (!func.isString(params.query.lookup.localField)) {
                reject('Invalid lookup localfield');
            }
            if (!func.isString(params.query.lookup.foreignField)) {
                reject('Invalid lookup foreignfield');
            }
            if (!func.isString(params.query.lookup.as)) {
                reject('Invalid lookup as');
            }

            self.open()
                .then((db) => {
                    database = db;
                    return db.db(self.name).collection(params.collection);
                })
                .then((collection) => {
                    let components = [],
                        single = {};
                    for (let i in params.query) {
                        single = {};
                        single[`$${i}`] = params.query[i];
                        components.push(single);
                    }

                    return collection.aggregate(components).toArray();
                })
                .then((result) => {
                    resolve(result);
                    database.close();
                })
                .catch((err) => {
                    database.close();
                    reject(err);
                });
        });
    }

    self.exists = function (params = { collection: '', query: {} }) {
        // check if document exists
        return new Promise((resolve, reject) => {
            self.find(params).then((res) => {
                if (!func.isnull(res)) resolve(true)
                else resolve(false)
            }).catch(err => {
                reject(err);
            });
        });
    }

    self.ifNotExist = function (params = { collection: '', query: {}, check: [{}], action: '' }) {
        let found = false;
        return new Promise(async (resolve, reject) => {
            for (let q of params.check) {
                found = await self.exists({ collection: params.collection, query: q });
                if (found) {
                    resolve({ found: Object.keys(q) });
                    break;
                }
            }

            if (!found) {
                self[params.action](params).then(worked => {
                    resolve(worked);
                }).catch(error => {
                    reject(error)
                });
            }
        });
    }

    self.ifIExist = function (params = { collection: '', query: {}, check: [{}], action: '' }) {
        let exists = false;
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < params.check.length; i++) {//loop through the check queries
                let query = params.check[i].query;
                let allFound = await self.find({ collection: params.collection, query, many: true });//find them all
                if (allFound.length) {//if found
                    for (let found of allFound) {//loop through all the found items
                        for (let [key, value] of Object.entries(params.check[i].against)) {
                            if (found[key] != value) {//check it is the same
                                resolve({ found: Object.keys(query) });
                                exists = true;
                                break;
                            }
                        }
                    }
                }
            }

            if (!exists) {
                self[params.action](params).then(worked => {
                    resolve(worked);
                }).catch(error => {
                    reject(error)
                });
            }
        });
    }

    self.find = function (params = { collection: '', query: {}, many: false, options: { projection: {} } }) {
        // find in database
        let database = null;
        let value;
        return new Promise((resolve, reject) => {
            if (!func.isString(params.collection)) {
                reject('Invalid collection name');
            }
            if (!func.isObject(params.query)) {
                reject('Invalid query');
            }
            params.projection = params.projection || {};
            params.options = params.options || {};
            let options = { projection: params.projection };

            for (let option in params.options) {
                options[option] = params.options[option];
            }

            if (!params.collection.includes('#')) {
                self.open()
                    .then((db) => {
                        database = db;
                        return db.db(self.name).collection(params.collection);
                    })
                    .then((collection) => {
                        if (func.isset(params.many)) {
                            value = collection.find(params.query, options);

                            if (func.isset(params.many.limit)) value = value.limit(params.many.limit);

                            if (func.isset(params.many.sort)) value = value.sort(params.many.sort);

                            value = value.toArray();
                        } else {
                            value = collection.findOne(params.query, options);
                        }
                        return value;
                    })
                    .then((result) => {
                        resolve(result);
                    })
                    .catch((err) => {
                        reject(err);
                    })
                    .finally(() => {
                        database.close();
                    });
            }
            else {
                let [collection, name] = params.collection.split('#');
                self.open()
                    .then((db) => {
                        database = db;
                        return db.db(self.name).collection(collection);
                    })
                    .then((collection) => {
                        value = collection.findOne({ name });
                        return value;
                    })
                    .then(found => {
                        if (func.isnull(found)) {
                            return found;
                        }
                        else {
                            if (func.isObject(params.query)) {
                                if (func.isset(params.many) && params.many == true) {
                                    found = func.array.findAll(found.contents, item => {
                                        let flag = true;
                                        for (let n in params.query) {
                                            if (item[n] != params.query[n]) flag = false;
                                            continue;
                                        }
                                        return flag;
                                    });
                                }
                                else {
                                    found = arrayLib().find(found.contents, item => {
                                        let flag = true;
                                        for (let n in params.query) {
                                            if (item[n] != params.query[n]) flag = false;
                                            continue;
                                        }
                                        return flag;
                                    });
                                }
                            }

                            if (func.isObject(params.projection)) {
                                if (Array.isArray(found)) {
                                    for (let item of found) {
                                        for (let p in item) {
                                            if (p == '_id') {
                                                if (params.projection[p] == 0) {
                                                    delete item[p];
                                                }
                                            }
                                            else if (!Object.keys(params.projection).includes(p) || params.projection[p] == 0) {
                                                delete item[p];
                                            }
                                        }
                                    }
                                }
                                else if (typeof found == 'object') {
                                    for (let p in found) {
                                        if (p == '_id') {
                                            if (params.projection[p] == 0) {
                                                delete found[p];
                                            }
                                        }
                                        else if (!Object.keys(params.projection).includes(p) || params.projection[p] == 0) {
                                            delete found[p];
                                        }
                                    }
                                }
                            }
                        }
                        return found;
                    })
                    .then((result) => {
                        resolve(result);
                        database.close();
                    })
                    .catch((err) => {
                        database.close();
                        reject(err);
                    });
            }
        });
    }

    self.delete = function (params = { collection: '', query: {}, many: false }) {
        // delete from database
        let database = null;

        return new Promise((resolve, reject) => {
            if (!func.isString(params.collection)) {
                reject('Invalid collection name');
            }
            if (!func.isObject(params.query)) {
                reject('Invalid query');
            }

            self.open()
                .then((db) => {
                    database = db;
                    return db.db(self.name).collection(params.collection);
                })
                .then((collection) => {
                    if (params.many == true) return collection.deleteMany(params.query);
                    else return collection.deleteOne(params.query);
                })
                .then((result) => {
                    resolve(result);
                    database.close();
                })
                .catch((e) => {
                    database.close();
                    reject(e);
                });
        });
    }

    self.recycle = function (params = { collection: '', query: {}, many: false }) {
        //get the data to delete and insert it into recycle bin before deleting it
        return new Promise((resolve, reject) => {
            self.find(params).then(result => {
                let toInsert = { collection: 'recycle', query: { _id: result._id, collection: params.collection, query: result } };
                self.insert(toInsert).then(result => {
                    self.delete(params).then(result => {
                        resolve(result);
                    }).catch(err => {
                        resolve('Error Inserting data to recycle => ' + err);
                    });
                }).catch(err => {
                    resolve('Error Inserting data to recycle => ' + err);
                });
            }).catch(err => {
                resolve('Error Fetching data to recycle => ' + err);
            });
        });
    }

    self.restore = function (params = { id: '' }) {
        //get the data from recycle bin restore it to collection then clear it from recycle bin
        return new Promise((resolve, reject) => {
            self.find({ collection: 'recycle', query: { _id: new ObjectId(params.id) }, projection: { _id: 0 } }).then(result => {
                self.insert(result).then(result => {
                    self.delete({ collection: 'recycle', query: { _id: new ObjectId(params.id) } }).then(result => {
                        resolve(result);
                    }).catch(err => {
                        reject('Error clearing data from recylce bin=> ' + err);
                    });
                }).catch(err => {
                    reject('Error restoring data from recylce bin=> ' + err);
                });
            }).catch(err => {
                reject('Error fetching data from recylce bin=> ' + err);
            });
        });
    }

    self.dropCollection = function (collection) {
        // delete database
        return self.open({}, db => {
            return db.db(self.name).dropCollection(collection)
                .then(result => {
                    return result == true;
                })
                .catch(err => {
                    return false;
                });
        });
    }

    self.createCollection = function (collection) {
        // create database
        self.open({}, db => {
            return db.db(self.name).createCollection(collection);
        });
    }

    self.getCollections = function () {
        return new Promise((resolve, reject) => {
            self.open()
                .then(db => {
                    return db.db().listCollections().toArray();
                })
                .then(collections => {
                    resolve(collections);
                });
        });
    }

    self.modify = function (params = { collection: '', query: {}, update: {} }) {
        // update database
        let database = null;
        return new Promise((resolve, reject) => {
            if (!func.isObject(params)) {
                reject('Invalid parameter');
            }
            if (!func.isString(params.collection)) {
                reject('Invalid collection name');
            }
            if (!func.isObject(params.query)) {
                reject('Invalid query');
            }
            if (!func.isObject(params.update)) {
                reject('Invalid update');
            }

            let projection = { _id: 0 }, update = {};
            for (let name in params.update) {
                projection[name] = 1;
            };
            self.find({ collection: params.collection, query: params.query, projection })
                .then(data => {
                    for (let name in data) {
                        if (params.update[name].action.toLowerCase() == 'set') {
                            update[name] = params.update[name].value;
                        }
                        else if (params.update[name].action.toLowerCase() == 'increase') {
                            let n = new Number(params.update[name].value);
                            let c = new Number(data[name]);

                            if (isNaN(n) || isNaN(c)) {
                                update[name] = data[name] + params.update[name].value;
                            }
                            else {
                                update[name] = c + n;
                            }
                        }
                        else if (params.update[name].action.toLowerCase() == 'decrease') {
                            let n = new Number(params.update[name].value);
                            let c = new Number(data[name]);

                            if (isNaN(n) || isNaN(c)) {
                                update[name] = data[name] - params.update[name].value;
                            }
                            else {
                                update[name] = c - n;
                            }
                        }
                    }

                    self.update({ collection: params.collection, query: params.query, options: { '$set': update } }).then(result => {
                        resolve(data);
                    })
                })
        });
    }

    self.work = function (params = { collection: '' }) {
        return new Promise((resulve, reject) => {
            self.open().then(db => {
                return db.db(self.name).collection(params.collection);
            }).then(collection => {
                params.callBack(collection);
            });
        });
    }

    self.say = function () {
        console.log(self.name);
    }

    return self;
}

export { Database };