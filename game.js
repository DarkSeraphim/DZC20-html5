/* globals UserData */
'use strict';
if (typeof UserData === 'undefined') {
    throw new Error('game.js requires data.js'); 
}

(function () {
    // Scope all the thing o/
    var user;
    var doLogin = function (username) {
        user = UserData.load(username);
        return !!user;
    };


}) ();