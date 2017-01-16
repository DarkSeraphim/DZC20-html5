var UserData = (function () {
    return {
        get: function () {
            var users = [];
            for (var user in localStorage) {
                users.push(user);
            }
            return users;
        },
        load: function (username) {
            try {
                return JSON.parse(localStorage.getItem(username));
            } catch (e) {
                return undefined;
            }
        },
        save: function (username, state) {
            var save;
            try {
                save = JSON.stringify(state);
            } catch (e) {
                // Report
                return false;
            }
            localStorage.setItem(username, save);
            return true;
        }
    };
}) ();