const fs = require('fs');
const path = require('path');

class JSONDB {
    constructor(filename) {
        this.filepath = path.join(__dirname, '../../data', `${filename}.json`);
        if (!fs.existsSync(path.join(__dirname, '../../data'))) {
            fs.mkdirSync(path.join(__dirname, '../../data'));
        }
        if (!fs.existsSync(this.filepath)) {
            fs.writeFileSync(this.filepath, JSON.stringify([]));
        }
    }

    async find(query = {}) {
        const data = this._read();
        return data.filter(item => this._match(item, query));
    }

    async findOneAndUpdate(filter, update, options = {}) {
        let data = this._read();
        let index = data.findIndex(item => this._match(item, filter));
        
        let item;
        if (index !== -1) {
            item = { ...data[index], ...update };
            data[index] = item;
        } else if (options.upsert) {
            item = { ...update, _id: Date.now().toString(36) + Math.random().toString(36).substr(2) };
            data.push(item);
        }
        
        this._write(data);
        console.log(`💾 JSONDB: Updated ${this.filepath}. Total records: ${data.length}`);
        return item;
    }

    async countDocuments(query = {}) {
        const data = this._read();
        return data.filter(item => this._match(item, query)).length;
    }

    _read() {
        return JSON.parse(fs.readFileSync(this.filepath, 'utf8'));
    }

    _write(data) {
        fs.writeFileSync(this.filepath, JSON.stringify(data, null, 2));
    }

    _match(item, query) {
        return Object.entries(query).every(([key, val]) => {
            if (val && typeof val === 'object' && val.$regex) {
                return new RegExp(val.$regex, val.$options || '').test(item[key]);
            }
            if (val && typeof val === 'object' && val.$lte) {
                return new Date(item[key]) <= new Date(val.$lte);
            }
            return item[key] === val;
        });
    }
}

// Singleton for Jobs
const jobDB = new JSONDB('jobs');

module.exports = jobDB;
