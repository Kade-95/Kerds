module.exports = function RequestsLibrary() {
    let self = {};

    self.extract = (arr = '', start, end) => {
        var userIndex = typeof start === 'number',
            i,
            j;
        if (userIndex) {
            i = start;
            if (end) {
                j = arr.indexOf(end, i)
                return (j === -1) ? ['', -1] : [(i === j) ? '' : arr.slice(i, j), j + end.length];
            } else return arr.slice(i)
        } else {
            i = arr.indexOf(start)
            if (i !== -1) {
                i += start.length;
                if (end) {
                    j = arr.indexOf(end, i);
                    return (j !== -1) ? arr.slice(i, j) : ['', -1];
                } else return arr.slice(i)
            }
            return [];
        }
    }

    self.parseForm = (boundary, data) => {
        var form = {},
            delimeter = Buffer.from('\r\n--' + boundary),
            body = self.extract(data, '--' + boundary + '\r\n'),
            CR = Buffer.from('\r\n\r\n'),
            i = 0,
            head,
            name,
            filename,
            value,
            obj,
            type;
        if (body) {
            while (i !== -1) {
                [head, i] = self.extract(body, i, CR);
                name = self.extract(head, '; name="', '"').toString();
                filename = self.extract(head, '; filename="', '"').toString();
                type = self.extract(head.toString(), 'Content-Type: ');
                [value, i] = self.extract(body, i, delimeter);
                if (name) {
                    obj = { filename: filename, type: type, value: value };
                    if (form.hasOwnProperty(name)) {//avoid duplicates
                        if (Array.isArray(form[name])) {
                            form[name].push(obj);
                        } else {
                            form[name] = [form[name], obj];
                        }
                    } else {
                        form[name] = obj;
                    }
                }
                if (body[i] === 45 && body[i + 1] === 45) break;// '--'
                if (body[i] === 13 && body[i + 1] === 10) {
                    i += 2; // \r\n
                } else {
                    //error
                }
            }
        }
        return form;
    }

    self.getIp = (req) => {
        var ip = req.headers['x-forworded-for'];
        if (ip) {
            ip = ip.split(',')[0];
        } else {
            ip = req.connection.remoteAddress;
        }
        return ip;
    }

    return self;
}
