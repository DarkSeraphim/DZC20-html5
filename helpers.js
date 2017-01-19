'use strict';

window.StyleHelper = (function () {
    var select = function (selector, func) {
        document.querySelectorAll(selector).forEach(element => func(element));
    };
    return {
        hide: function (selector) {
            select(selector, element => {
                if (element.style.display === 'none') {
                    return;
                }
                element.setAttribute('data-display', element.style.display);
                element.style.display = 'none';
            });
        },
        show: function (selector) {
            select(selector, element => {
                var old = element.getAttribute('data-display') || '';
                element.style.display = old;
            });
        },
        toggle: function (selector) {
            select(selector, element => {
                var show = element.style.display === 'none';
                if (show) {
                   var old = element.getAttribute('data-display') || '';
                    element.style.display = old;
                } else {
                    element.setAttribute('data-display', element.style.display);
                    element.style.display = 'none';
                }
            });
        },
        set: function (selector, key, value) {
            document.querySelectorAll(selector).forEach(element => {
                element.style[key] = value;
            });
        },

    };
}) ();

window.EventHelper = (function () {
    var select = function (selector, func) {
        document.querySelectorAll(selector).forEach(element => {
            func(element);
        });
    };
    return {
        on: function (selector, event, func) {
            select(selector, element => {
                element['on' + event] = func;
            });
        },
        off: function (selector, event) {
            select(selector, element => {
                delete element['on' + event];
            });
        }
    };
}) ();

window.DOMHelper = (function () {
    var select = function (selector, func) {
        document.querySelectorAll(selector).forEach(element => {
            func(element);
        });
    };
    return {
        getProperty: function (selector, key) {
            var values = [];
            select(selector, element => values.push(element[key]));
            return values.length === 1 ? values[0] : values;
        },
        setProperty: function (selector, key, value) {
            select(selector, element => element[key] = value);
        },
        getAttribute: function (selector, key) {
            var values = [];
            select(selector, element => values.push(element.getAttribute(key)));
            return values.length === 1 ? values[0] : values;
        },
        setAttribute: function (selector, key, value) {
            select(selector, element => element.setAttribute(key, value));
        }
    };
}) ();

(function () {
    var queue = [];
    var isReady;

    var ready = function () {
        if (!isReady) {
            isReady = true;
            queue.forEach(func => func());
        }
    };

    var readyStateChange = function () {
        if (document.readyState === 'complete') {
            ready();
        }
    };

    if (document.addEventListener) {
        // first choice is DOMContentLoaded event
        document.addEventListener('DOMContentLoaded', ready, false);
        // backup is window load event
        window.addEventListener('load', ready, false);
    } else {
        // must be IE
        document.attachEvent('onreadystatechange', readyStateChange);
        window.attachEvent('onload', ready);
    }

    window.ready = function (func) {
        if (isReady) {
            func();
        } else {
            queue.push(func);
        }
    };
}) ();