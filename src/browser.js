'use strict';

/* global localStorage */

module.exports = {
    read(source) {
        const deserialize = arguments.length <= 1 || arguments[1] === undefined ? JSON.parse : arguments[1];
        const data = localStorage.getItem(source);
        if (data) {
            return deserialize(data);
        } else {
            localStorage.setItem(source, '{}');
            return {};
        }
    },
    write(dest, obj) {
        const serialize = arguments.length <= 2 || arguments[2] === undefined ? JSON.stringify : arguments[2];
        return localStorage.setItem(dest, serialize(obj));
    }
};