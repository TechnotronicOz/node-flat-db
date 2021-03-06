const steno = require('steno');
const _require = require('./json');
const stringify = _require.stringify;
const parse = _require.parse;
const lzstring = require('lz-string/libs/lz-string');
const fs = require('graceful-fs');

module.exports = {
    read: function read(source) {
        var deserialize = arguments.length <= 1 || arguments[1] === undefined ? parse : arguments[1];

        if (fs.existsSync(source)) {
            // Read database
            var data = fs.readFileSync(source, 'utf-8') || '{}';
            data = lzstring.decompressFromBase64(data);

            try {
                return deserialize(data);
            } catch (e) {
                if (e instanceof SyntaxError) {
                    e.message = 'Malformed JSON in file: ' + source + '\n' + e.message;
                }
                throw e;
            }
        } else {
            // Initialize empty database
            fs.writeFileSync(source, '{}');
            return {};
        }
    },
    write: function write(dest, obj) {
        var serialize = arguments.length <= 2 || arguments[2] === undefined ? stringify : arguments[2];

        return new Promise(function (resolve, reject) {
            var data = serialize(obj);
            data = lzstring.compressToBase64(data);
            steno.writeFile(dest, data, function (err) {
                if (err) return reject(err);
                resolve();
            });

        });
    }
};
