(function() {
    'use strict';

    var exports = {};

    exports.isOperator = function(arg) {
        return /^\$+(in|or|and|eq|ne|lte|gte|lt|gt)$/.test(arg);
    }

    exports.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    }

    exports.isNumeric = function(arg) {
        return (typeof(arg) === "string") && !isNaN(parseFloat(arg)) && isFinite(arg);
    }

    exports.match = function(obj, query) {
        if (typeof(obj) !== "object") {
            console.error("obj is not Object");
            return false;
        }
        if (typeof(query) !== "object") {
            console.error("query is not Object");
            return false;
        }

        var isOperator = this.isOperator;
        var isArray = this.isArray;
        var isNumeric = this.isNumeric;
        var pars;
        var calc;

        pars = function(obj, query) {
            var i;
            var keys;
            var field;
            var value;
            var len;
            var count = 0;
            var res;
            
            keys = Object.keys(query);
            len = keys.length;
            for (i = 0; i < len; i++) {
                field = keys[i];
                value = query[field];
                res = calc(obj, field, value);
                if (res) {
                    count++;
                } else {
                    return false;
                }
            }
            return count === len;
        }

        calc = function(obj, field, value) {
            var i;
            var keys;
            var key;
            var len;
            var count = 0;
            var res;
            var x;
            var y;

            x = obj[field];

            if (isOperator(field) && isArray(value)) {
                if (field === "$or") {
                    len = value.length;
                    for (i = 0; i < len; i++) {
                        res = pars(obj, value[i]);
                        if (res) {
                            count++;
                            break;
                        }
                    }
                    return count > 0;
                } else if (field === "$and") {
                    len = value.length;
                    for (i = 0; i < len; i++) {
                        res = pars(obj, value[i]);
                        if (res) {
                            count++;
                        } else {
                            break;
                        }
                    }
                    return count === len;
                } else {
                    return false;
                }
            } else if (typeof(value) === "object" && value !== null) {
                keys = Object.keys(value);
                len = keys.length;
                for (i = 0; i < len; i++) {
                    key = keys[i];
                    y = value[key];
                    if (typeof(x) === "number" && isNumeric(y)) {
                        y = parseInt(y, 10);
                    }
                    if (isOperator(key)) {
                        if (
                            (key === "$eq") &&
                            (x === y)
                        ) {
                            count++;
                        } else if (
                            (key === "$ne") &&
                            (x !== y)
                        ) {
                            count++;
                        } else if (
                            (key === "$in") &&
                            (typeof(x) === "string" || typeof(x) === "number") &&
                            isArray(y) &&
                            (y.indexOf(x) > -1)
                        ) {
                            count++;
                        } else if (
                            (key === "$gt") &&
                            (x > y)
                        ) {
                            count++;
                        } else if (
                            (key === "$gte") &&
                            (x >= y)
                        ) {
                            count++;
                        } else if (
                            (key === "$lt") &&
                            (x < y)
                        ) {
                            count++;
                        } else if (
                            (key === "$lte") &&
                            (x <= y)
                        ) {
                            count++;
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }
                return count === len;
            } else {
                y = value;
                if (typeof(x) === "number" && isNumeric(y)) {
                    y = parseInt(y, 10);
                }
                return x === y;
            }
        }

        return pars(obj, query);
    }

    if (typeof(window.queryObject) === "undefined") {
        window.queryObject = exports;
    }
})();