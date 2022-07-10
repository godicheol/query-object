(function() {
    'use strict';

    var exports = {};

    exports.isUndefined = function(arg) {
        return typeof(arg) === "undefined";
    }
    exports.isNull = function(arg) {
        return arg === null;
    }
    exports.isBoolean = function(arg) {
        return typeof(arg) === "boolean";
    }
    exports.isString = function(arg) {
        return typeof(arg) === "string";
    }
    exports.isNumber = function(arg) {
        return typeof(arg) === "number" && !Number.isNaN(arg);
    }
    exports.isNumeric = function(arg) {
        return (typeof(arg) === "string") && !Number.isNaN(parseFloat(arg)) && isFinite(arg);
    }
    exports.isObject = function(arg) {
        return (typeof(arg) === "object" && arg !== null);
    }
    exports.isFunction = function(arg) {
        return typeof(arg) === "function";
    }
    exports.isBlob = function(arg) {
        return (arg instanceof Blob);
    }
    exports.isNode = function(arg) {
        return (typeof(Node) === "object" ? (arg instanceof Node) : typeof(arg) === "object" && arg !== null && typeof(arg.nodeType) === "number" && typeof(arg.nodeName) === "string");
    }
    exports.isElement = function(arg) {
        return (typeof(HTMLElement === "object") ? (arg instanceof HTMLElement) : typeof(arg) === "object" && arg !== null  && arg.nodeType === 1 && typeof(arg.nodeName) === "string");
    }
    exports.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    }
    exports.isDate = function(arg) {
        return (arg instanceof Date) && !Number.isNaN(arg.valueOf())
    }
    exports.isOperator = function(arg) {
        return /^\$+(in|or|and|eq|ne|lte|gte|lt|gt|exists)$/.test(arg);
    }
    // a: object
    // b: query
    exports.match = function(a, b) {
        var isBoolean = this.isBoolean;
        var isString = this.isString;
        var isNumber = this.isNumber;
        var isNumeric = this.isNumeric;
        var isArray = this.isArray;
        var isObject = this.isObject;
        var isDate = this.isDate;
        var isNull = this.isNull;
        var isUndefined = this.isUndefined;
        var isOperator = this.isOperator;
        var pars;
        var calc;

        if (!isObject(a)) {
            throw new Error("Parameter must be a Object");
        }
        if (!isObject(b)) {
            b = {};
        }
        
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
            var x = obj[field];
            var y;

            if (isOperator(field) && isArray(value)) {
                len = value.length;
                if (field === "$or") {
                    for (i = 0; i < len; i++) {
                        res = pars(obj, value[i]);
                        if (res) {
                            count++;
                            break;
                        }
                    }
                    return count > 0;
                } else if (field === "$and") {
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
            } else if (!isObject(x) && isObject(value)) {
                keys = Object.keys(value);
                len = keys.length;
                for (i = 0; i < len; i++) {
                    key = keys[i];
                    y = value[key];
                    if (isNumber(x) && isNumeric(y)) {
                        y = parseInt(y, 10);
                    }
                    if (isDate(x)) {
                        x = x.getTime();
                    }
                    if (isDate(y)) {
                        y = y.getTime();
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
                            (key === "$exists") &&
                            (isBoolean(y) || isNumber(y)) &&
                            (
                                ((y === false || y <= 0) && isUndefined(x)) ||
                                ((y === true || y > 0) && !isUndefined(x))
                            )
                        ) {
                            count++;
                        } else if (
                            (key === "$in") &&
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
            } else if (isObject(x) && isObject(value)) {
                y = value;
                keys = Object.keys(y);
                len = keys.length;
                for (i = 0; i < len; i++) {
                    res = pars(x, y);
                    if (res) {
                        count++;
                    } else {
                        break;
                    }
                }
                return count === len;
            } else {
                y = value;
                if (isNumber(x) && isNumeric(y)) {
                    y = parseInt(y, 10);
                }
                if (isDate(x)) {
                    x = x.getTime();
                }
                if (isDate(y)) {
                    y = y.getTime();
                }
                return x === y;
            }
        }

        return pars(a, b);
    }

    if (typeof(window.queryObject) === "undefined") {
        window.queryObject = exports;
    }
})();