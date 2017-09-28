'use strict';

const fs = require('graceful-fs');
const _require = require('./json');
const parse = _require.parse;
const stringify = _require.stringify;

module.exports = {
    read: function read(source) {
        const deserialize = arguments.length <= 1 || arguments[1] === undefined ? parse : arguments[1];
        try {
            return deserialize(source);
        } catch(e) {
            if (e instanceof SyntaxError) {
                e.message = `Malformed JSON in file: ${source}\n${e.message}`;
            }
            throw e;
        }
    },
    write: function write(dest, obj) {
        var serialize = arguments.length <= 2 || arguments[2] === undefined ? stringify : arguments[2];

        var data = serialize(obj);
        fs.writeFileSync(dest, data);
    }
};