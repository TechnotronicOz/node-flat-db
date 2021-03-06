'use strict';

const lodash = require('lodash');
const isPromise = require('is-promise');

// Returns a lodash chain that calls .value()
// automatically after the first .method()
//
// It also returns a promise or value
//
// For example:
// lowChain(_, array, save).method()
//
// is the same as:
// _.chain(array).method().value()
function lowChain(_, array, save) {
    var chain = _.chain(array);

    _.functionsIn(chain).forEach(function (method) {
        chain[method] = _.flow(chain[method], function (arg) {
            var v = void 0;
            if (arg) {
                v = _.isFunction(arg.value) ? arg.value() : arg;
            }

            var s = save();

            if (s) return s.then(function () {
                return Promise.resolve(v);
            });
            return v;
        });
    });

    return chain;
}

function low(source) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var writeOnChange = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

    // Create a fresh copy of lodash
    var _ = lodash.runInContext();

    if (source) {
        if (options.storage) {
            (function () {
                var storage = options.storage;


                if (storage.read) {
                    db.read = function () {
                        var s = arguments.length <= 0 || arguments[0] === undefined ? source : arguments[0];

                        var res = storage.read(s, db.deserialize);

                        if (isPromise(res)) {
                            return res.then(function (obj) {
                                db.object = obj;
                                db._checksum = JSON.stringify(db.object);

                                return db;
                            });
                        }

                        db.object = res;
                        db._checksum = JSON.stringify(db.object);

                        return db;
                    };
                }

                if (storage.write) {
                    db.write = function () {
                        var dest = arguments.length <= 0 || arguments[0] === undefined ? source : arguments[0];
                        return storage.write(dest, db.object, db.serialize);
                    };
                }
            })();
        }

        if (options.format) {
            var format = options.format;

            db.serialize = format.serialize;
            db.deserialize = format.deserialize;
        }
    }

    // Modify value function to call save before returning result
    _.prototype.value = _.wrap(_.prototype.value, function (value) {
        var v = value.apply(this);
        var s = _save();

        if (s) return s.then(function () {
            return Promise.resolve(v);
        });
        return v;
    });

    // Return a promise or nothing in sync mode or if the database hasn't changed
    function _save() {
        if (db.source && db.write && writeOnChange) {
            var str = JSON.stringify(db.object);

            if (str !== db._checksum) {
                db._checksum = str;
                return db.write(db.source, db.object);
            }
        }
    }

    function db(key) {
        if (typeof db.object[key] === 'undefined') {
            db.object[key] = [];
        }
        var array = db.object[key];
        var short = lowChain(_, array, _save);
        short.chain = function () {
            return _.chain(array);
        };
        // Prevents db.write being called when just calling db('foo').value()
        short.value = function () {
            return db.object[key];
        };
        return short;
    }

    // Expose
    db._ = _;
    db.object = {};
    db.source = source;

    // Init
    if (db.read) {
        return db.read();
    } else {
        return db;
    }
}

module.exports = low;