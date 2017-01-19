/* globals UserData,StyleHelper,EventHelper,DOMHelper */
'use strict';
if (typeof UserData === 'undefined') {
    throw new Error('game.js requires data.js'); 
}

if (typeof StyleHelper === 'undefined') {
    throw new Error('game.js requires helpers.js'); 
}

(function () {
    // Scope all the thing o/
    var user;
    var logOut = function () {
        StyleHelper.hide('#taskbar');
        StyleHelper.show('#login-modal');
        UserData.save(user.name, user);
    };
    var logIn = function (username) {
        user = UserData.load(username);
        return !!user;
    };

    window.ready(function () {
        EventHelper.on('#login-modal form', 'submit', (e) => {
            e.preventDefault();
            var username = DOMHelper.getProperty('#username', 'value');
            if (!username) {
                return false;
            }
            if (!logIn(username)) {
                UserData.save(username, {name: username});
                if (!logIn(username)) {
                    throw new Error('Failed to create new user');
                }
            }
            StyleHelper.hide('#login-modal');
            StyleHelper.show('#taskbar');
            StyleHelper.set('body', 'backgroundImage', 'url(./images/desktop-bg.jpg)');
            return false;
        });
    });
}) ();