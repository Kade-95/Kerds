const mysql = require('mysql');

module.exports = function Sql(details = { host: '', user: '', password: '', database: '' }) {
    let self = {};
    self.host = details.host;
    self.user = details.user;
    self.password = details.password;
    self.database = details.database;
    self.con = mysql.createConnection({ host, user, password, database } = self);

    self.open = (callback) => {
        self.con.connect((err) => {
            if (typeof callback === 'function') {
                callback(err, self.con);
            }
        });
    };

    self.createDatabase = (name, callback) => {
        self.open((openError, con) => {
            if (openError) throw openError;
            self.con.query(`CREATE DATABASE IF NOT EXISTS ${name}`, (err, result) => {
                if (err) throw err;
                if (typeof callback === 'function');
                callback(con);
            });
        });
    };

    self.createTable = (name, rows, callback) => {
        self.open((openError, con) => {
            if (openError) throw openError;
            let sql = `CREATE TABLE IF NOT EXISTS ${name}(`;
            for (let i in rows) {
                sql += `${rows[i]}${i != rows.length - 1 ? ' ,' : ''} `
            }
            sql += ')';
            con.query(sql, (err, result) => {
                if (err) throw err;
            });
        });
    }

    return self;
}