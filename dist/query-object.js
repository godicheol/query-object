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
    exports.isArray = function(arg) {
        return Object.prototype.toString.call(arg) === '[object Array]';
    }
    exports.isDate = function(arg) {
        return (arg instanceof Date) && !Number.isNaN(arg.valueOf())
    }
    exports.isRegExp = function(arg) {
        return (arg instanceof RegExp);
    }
    exports.isComparisionOperator = function(arg) {
        return /^\$+(eq|ne|lte|gte|lt|gt|in|exists)$/.test(arg);
    }
    exports.isLogicalOperator = function(arg) {
        return /^\$+(and|or|nor)$/.test(arg);
    }
    exports.match = function(object, query) {
        var isBoolean = this.isBoolean;
        var isString = this.isString;
        var isNumber = this.isNumber;
        var isNumeric = this.isNumeric;
        var isArray = this.isArray;
        var isObject = this.isObject;
        var isDate = this.isDate;
        var isNull = this.isNull;
        var isRegExp = this.isRegExp;
        var isUndefined = this.isUndefined;
        var isLogicalOperator = this.isLogicalOperator;
        var isComparisionOperator = this.isComparisionOperator;

        function step(obj, qry) {
            if (!isObject(obj)) {
                throw new Error("object must be a object");
            }
            if (!isObject(qry)) {
                throw new Error("query must be a object");
            }
            var queryKeys = Object.keys(qry),
                key,
                objectValue,
                queryValue,
                queryValueKeys,
                queryValueKey,
                queryValueValue,
                i,
                j,
                count = 0,
                subcount = 0;
            for (i = 0; i < queryKeys.length; i++) {
                key = queryKeys[i];
                objectValue = obj[key];
                queryValue = qry[key];
                subcount = 0;
                if (isLogicalOperator(key)) {
                    if (calc2(obj, queryValue, key)) {
                        count++;
                    } else {
                        break;
                    }
                } else {
                    if (isRegExp(queryValue)) {
                        if (calc(objectValue, queryValue, key)) {
                            count++;
                        } else {
                            break;
                        }
                    } else if (isObject(objectValue) && isObject(queryValue)) {
                        if (step(objectValue, queryValue)) {
                            count++;
                        } else {
                            break;
                        }
                    } else if (!isObject(objectValue) && isObject(queryValue)) {
                        if (hasOperator(queryValue)) {
                            queryValueKeys = Object.keys(queryValue);
                            for (j = 0; j < queryValueKeys.length; j++) {
                                queryValueKey = queryValueKeys[j];
                                queryValueValue = queryValue[queryValueKey];
                                if (calc(objectValue, queryValueValue, queryValueKey)) {
                                    subcount++;
                                } else {
                                    break;
                                }
                            }
                            if (subcount === queryValueKeys.length) {
                                count++;
                            } else {
                                break;
                            }
                        } else if (step(obj, queryValue)) {
                            count++;
                        } else {
                            break;
                        }
                    } else if (!isObject(objectValue) && calc(objectValue, queryValue, "=")) {
                        count++;
                    } else {
                        break;
                    }
                }
            }
            return count === queryKeys.length;
        }

        function calc(a, b, o) {
            if (isNumber(a) && isNumeric(b)) {
                b = parseInt(b, 10);
            }
            if (isNumber(b) && isNumeric(a)) {
                a = parseInt(a, 10);
            }
            if (isDate(a)) {
                a = a.getTime();
            }
            if (isDate(b)) {
                b = b.getTime();
            }
            if (isRegExp(a)) {
                if (isArray(b)) {
                    throw new Error("RegExp field value must not be array");
                }
                if (isObject(b)) {
                    throw new Error("RegExp field value must not be object");
                }
                return a.test(b);
            }
            if (isRegExp(b)) {
                if (isArray(a)) {
                    throw new Error("RegExp field value must not be array");
                }
                if (isObject(a)) {
                    throw new Error("RegExp field value must not be object");
                }
                return b.test(a);
            }
            switch(o) {
                case "+": return a + b;
                case "-": return a - b;
                case "*": return a * b;
                case "/": return a / b;
                case "%": return a % b;
                case ">":
                case "$gt":
                    if (!isNumber(a) || !isNumber(b)) {
                        throw new Error("$gt field value must be a number");
                    }
                    return a > b;
                case ">=":
                case "$gte":
                    if (!isNumber(a) || !isNumber(b)) {
                        throw new Error("$gte field value must be a number");
                    }
                    return a >= b;
                case "<":
                case "$lt":
                    if (!isNumber(a) || !isNumber(b)) {
                        throw new Error("$lt field value must be a number");
                    }
                    return a < b;
                case "<=":
                case "$lte":
                    if (!isNumber(a) || !isNumber(b)) {
                        throw new Error("$lte field value must be a number");
                    }
                    return a <= b;
                case "=":
                case "$eq":
                    if (isArray(a) || isArray(b)) {
                        throw new Error("$eq field value must not be array");
                    }
                    if (isObject(a) || isObject(b)) {
                        throw new Error("$eq field value must not be object");
                    }
                    return a === b;
                case "!=":
                case "$ne":
                    if (isArray(a) || isArray(b)) {
                        throw new Error("$ne field value must not be array");
                    }
                    if (isObject(a) || isObject(b)) {
                        throw new Error("$ne field value must not be object");
                    }
                    return a !== b;
                case "$in":
                    if (!isArray(b)) {
                        throw new Error("$in field value must be a array");
                    }
                    if (!isBoolean(a) && !isString(a) && !isNumber(a)) {
                        throw new Error("$in field value must be boolean or string or number");
                    }
                    return b.indexOf(a) > -1;
                case "$nin":
                    if (!isArray(b)) {
                        throw new Error("$nin field value must be a array");
                    }
                    if (!isBoolean(a) && !isString(a) && !isNumber(a)) {
                        throw new Error("$nin field value must be boolean or string or number");
                    }
                    return b.indexOf(a) === -1;
                case "$exists":
                    console.log(b)
                    return b > 0 || b === true ? typeof(a) !== "undefined" : typeof(a) === "undefined";
                default: return false;
            }
        }

        function calc2(a, b, o) {
            var i, count = 0;

            if (!isObject(a)) {
                throw new Error(o + " field value must be a object");
            }
            if (!isArray(b)) {
                throw new Error(o + " field value must be a array");
            }
            for (i = 0; i < b.length; i++) {
                if (!isObject(b[i])) {
                    throw new Error(o + " field value must be a object");
                }
                if (step(a, b[i])) {
                    count++;
                }
            }
            switch(o) {
                case "$and": return count === b.length;
                case "$or": return count > 0;
                case "$nor": return count < b.length;
                default: return false;
            }
        }

        function hasOperator(a) {
            var keys = Object.keys(a);
            var i;
            for (i = 0; i < keys.length; i++) {
                if (isComparisionOperator(keys[i])) {
                    return true;
                }
            }
            return false;
        }

        return step(object, query);
    }

    if (typeof(window.queryObject) === "undefined") {
        window.queryObject = exports;
    }
})();