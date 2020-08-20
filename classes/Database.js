let Func = require('./Func');
let func = new Func();

module.exports = class Database {
    constructor(details = { address: '', name: '', user: '', password: '' }) {
        this.mongo = 'mongodb+srv://';
        this.user = details.user || '';
        this.password = details.password || '';
        this.address = details.address;
        this.name = details.name;
        this.options = details.options;

        this.connectionString = this.getConnectionString();
        this.client = new mongoClient(this.connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
    }
    // mongodb+srv://me:<password>@test.vqusx.gcp.mongodb.net/test
    setName(name) {
        this.name = name;
        this.connectionString = this.getConnectionString();
    }

    getConnectionString() {
        let connectionString = `${this.mongo}${this.user}:${this.password}@${this.address}/${this.name}`;
        if(func.isset(this.options)){
            connectionString += `?${this.options}`;
        }
        return encodeURI(connectionString);
    }

    erase() {
        return this.open({}, db => {
            return db.db(this.name).dropDatabase();
        });
    }

    open(params = { url: '', options: { useNewUrlParser: true, useUnifiedTopology: true } }, callBack) {
        // open database for operations
        params.url = params.url || this.connectionString;
        params.options = params.options || { useNewUrlParser: true, useUnifiedTopology: true }
        if (func.isset(callBack)) {
            return new Promise((resolve, reject) => {
                mongoClient.connect(params.url, params.options, (err, db) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        callBack(db)
                            .then((result) => {
                                this.close(db);
                                resolve(result);
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

    close(db) {
        // close database 
        if (db) {
            db.close();
        }
    }

    insert(params = { collection: '', query: {}, getInserted: false }) {
        // insert into database        
        let database = null;
        let value;
        return new Promise((resolve, reject) => {
            if (!func.isset(params.collection)) {
                reject('no_collection');
            }
            if (!func.isset(params.query)) {
                reject('no_query');
            }
            this.open()
                .then((db) => {
                    database = db;
                    return db.db(this.name).collection(params.collection);
                })
                .then((collection) => {
                    if (Array.isArray(params.query)) value = collection.insertMany(params.query);
                    else value = collection.insertOne(params.query);
                    return value;
                })
                .then((result) => {
                    if (func.isset(params.getInserted)) {
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

    update(params = { collection: '', query: {}, options: {}, many: false }) {
        // update database
        let database = null;
        return new Promise((resolve, reject) => {
            if (!func.isset(params)) {
                reject('no_parameter');
            }
            if (!func.isset(params.collection)) {
                reject('no_collection');
            }
            if (!func.isset(params.query)) {
                reject('no_query');
            }
            if (!func.isset(params.options)) {
                reject('no_options');
            }

            this.open()
                .then((db) => {
                    database = db;
                    return db.db(this.name).collection(params.collection);
                })
                .then((collection) => {
                    if (func.isset(params.many)) return collection.updateMany(params.query, params.options);
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

    save(params = { collection: '', query: {}, check: {}, options: {}, many: false }) {
        // save or replace the content of a document
        return this.exists({ collection: params.collection, query: params.check })
            .then(result => {
                if (result) {
                    return this.update({ collection: params.collection, query: params.check, options: { '$set': params.query } })
                }
                else {
                    return this.insert(params);
                }
            })
            .then(result => {
                return result;
            });
    }

    replace(params = { collection: '', query: {}, new: {} }) {
        // insert or update the content of document
        let database = null;
        return new Promise((resolve, reject) => {
            if (!func.isset(params)) {
                reject('no_parameter');
            }
            if (!func.isset(params.collection)) {
                reject('no_collection');
            }
            if (!func.isset(params.query)) {
                reject('no_query');
            }
            if (!func.isset(params.new)) {
                reject('no_new');
            }
            this.open().then((db) => {
                database = db;
                return db.db(this.name).collection(params.collection);
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

    aggregate(params = { collection: '', query: {} }) {
        // perform an aggregation on database
        let database = null;
        return new Promise((resolve, reject) => {
            if (!func.isset(params)) {
                reject('no_parameter');
            }
            if (!func.isset(params.collection)) {
                reject('no_collection');
            }
            if (!func.isset(params.query)) {
                reject('no_query');
            }
            this.open().then((db) => {
                database = db;
                return db.db(this.name).collection(params.collection);
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

    join(params = { collection: '', query: { lookup: { from: '', localField: '', foreignField: '', as: '' } } }) {
        // join documents 
        let database = null;
        return new Promise((resolve, reject) => {
            if (!func.isset(params)) {
                reject('no_parameter');
            }
            if (!func.isset(params.collection)) {
                reject('no_collection');
            }
            if (!func.isset(params.query)) {
                reject('no_collection');
            }
            if (!func.isset(params.query.lookup)) {
                reject('no_lookup');
            }
            if (!func.isset(params.query.lookup.from)) {
                reject('no_from');
            }
            if (!func.isset(params.query.lookup.localField)) {
                reject('no_localField');
            }
            if (!func.isset(params.query.lookup.foreignField)) {
                reject('no_foreignField');
            }
            if (!func.isset(params.query.lookup.as)) {
                reject('no_as');
            }

            this.open()
                .then((db) => {
                    database = db;
                    return db.db(this.name).collection(params.collection);
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

    exists(params = { collection: '', query: {} }) {
        // check if document exists
        return new Promise((resolve, reject) => {
            this.find(params).then((res) => {
                if (!func.isnull(res)) resolve(true)
                else resolve(false)
            }).catch(err => {
                reject(err);
            });
        });
    }

    ifNotExist(params = { collection: '', query: {}, check: [{}], action: '' }) {
        let found = false;
        return new Promise(async (resolve, reject) => {
            for (let q of params.check) {
                found = await this.exists({ collection: params.collection, query: q });
                if (found) {
                    resolve({ found: Object.keys(q) });
                    break;
                }
            }

            if (!found) {
                this[params.action](params).then(worked => {
                    resolve(worked);
                }).catch(error => {
                    reject(error)
                });
            }
        });
    }

    ifIExist(params = { collection: '', query: {}, check: [{}], action: '' }) {
        let exists = false;
        return new Promise(async (resolve, reject) => {
            for (let i = 0; i < params.check.length; i++) {//loop through the check queries
                let query = params.check[i].query;
                let allFound = await this.find({ collection: params.collection, query, many: true });//find them all
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
                this[params.action](params).then(worked => {
                    resolve(worked);
                }).catch(error => {
                    reject(error)
                });
            }
        });
    }

    find(params = { collection: '', query: {}, many: false, options: { projection: {} } }) {
        // find in database
        let database = null;
        let value;
        return new Promise((resolve, reject) => {
            if (!func.isset(params.collection)) {
                reject('no_collection');
            }
            if (!func.isset(params.query)) {
                reject('no_query');
            }
            params.projection = params.projection || {};
            params.options = params.options || {};
            let options = { projection: params.projection };

            for (let option in params.options) {
                options[option] = params.options[option];
            }

            if (!params.collection.includes('#')) {
                this.open()
                    .then((db) => {
                        database = db;
                        return db.db(this.name).collection(params.collection);
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
                        database.close();
                    })
                    .catch((err) => {
                        database.close();
                        reject(err);
                    });
            }
            else {
                let [collection, name] = params.collection.split('#');
                this.open()
                    .then((db) => {
                        database = db;
                        return db.db(this.name).collection(collection);
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
                            if (func.isset(params.query)) {
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
                                    found = func.array.find(found.contents, item => {
                                        let flag = true;
                                        for (let n in params.query) {
                                            if (item[n] != params.query[n]) flag = false;
                                            continue;
                                        }
                                        return flag;
                                    });
                                }
                            }

                            if (func.isset(params.projection)) {
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

    delete(params = { collection: '', query: {}, many: false }) {
        // delete from database
        let database = null;

        return new Promise((resolve, reject) => {
            if (!func.isset(params.collection)) {
                reject('no_collection');
            }
            if (!func.isset(params.query)) {
                reject('no_query');
            }

            this.open()
                .then((db) => {
                    database = db;
                    return db.db(this.name).collection(params.collection);
                })
                .then((collection) => {
                    if (func.isset(params.many)) return collection.deleteMany(params.query);
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

    recycle(params = { collection: '', query: {}, many: false }) {
        //get the data to delete and insert it into recycle bin before deleting it
        return new Promise((resolve, reject) => {
            this.find(params).then(result => {
                let toInsert = { collection: 'recycle', query: { _id: result._id, collection: params.collection, query: result } };
                this.insert(toInsert).then(result => {
                    this.delete(params).then(result => {
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

    restore(params = { id: '' }) {
        //get the data from recycle bin restore it to collection then clear it from recycle bin
        return new Promise((resolve, reject) => {
            this.find({ collection: 'recycle', query: { _id: new ObjectId(params.id) }, projection: { _id: 0 } }).then(result => {
                this.insert(result).then(result => {
                    this.delete({ collection: 'recycle', query: { _id: new ObjectId(params.id) } }).then(result => {
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

    dropCollection(collection) {
        // delete database
        return this.open({}, db => {
            return db.db(this.name).dropCollection(collection)
                .then(result => {
                    return result == true;
                })
                .catch(err => {
                    return false;
                });
        });
    }

    createCollection(collection) {
        // create database
        this.open({}, db => {
            return db.db(this.name).createCollection(collection);
        });
    }

    getCollections() {
        return new Promise((resolve, reject) => {
            this.open()
                .then(db => {
                    return db.db().listCollections().toArray();
                })
                .then(collections => {
                    resolve(collections);
                });
        });
    }

    modify(params = { collection: '', query: {}, update: {} }) {
        // update database
        let database = null;
        return new Promise((resolve, reject) => {
            if (!func.isset(params)) {
                reject('no_parameter');
            }
            if (!func.isset(params.collection)) {
                reject('no_collection');
            }
            if (!func.isset(params.query)) {
                reject('no_query');
            }
            if (!func.isset(params.update)) {
                reject('no_update');
            }

            let projection = { _id: 0 }, update = {};
            for (let name in params.update) {
                projection[name] = 1;
            };
            this.find({ collection: params.collection, query: params.query, projection })
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

                    this.update({ collection: params.collection, query: params.query, options: { '$set': update } }).then(result => {
                        resolve(data);
                    })
                })
        });
    }

    work(params = { collection: '' }) {
        return new Promise((resulve, reject) => {
            this.open().then(db => {
                return db.db(this.name).collection(params.collection);
            }).then(collection => {
                params.callBack(collection);
            });
        });
    }

    say() {
        console.log(this.name);
    }
}

