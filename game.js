/* globals UserData,StyleHelper,EventHelper,DOMHelper,$ */
'use strict';
if (typeof UserData === 'undefined') {
  throw new Error('game.js requires data.js');
}

if (typeof StyleHelper === 'undefined') {
    throw new Error('game.js requires helpers.js'); 
}



(function () {
    // Scope all the thing o/
    // Mock-up emails and assignments

    const ASSIGNMENTS = [
      {
        title: 'App Programming',
        status: 1// 0 - disabled, 1 - enabled but not passed, 2 - passed
      }, {
        title: 'Web Technology',
        status: 0
      }, {
        title: 'Algorithms',
        status: 0
      }
    ];

    const DEFAULT_EMAILS = [{
        from: 'WhatIsLove_BabyDontHurtMe@tue.nl',
        title: 'Welcome to the Computer Science program at TU/e!',
        message: 'Welcome to our study plaplaplapal',
        read: false,
        time: (new Date()).getTime(),
        assignment: ASSIGNMENTS.map((value, index) => index)
    }];

    var user;
    var logOut = function () {
        StyleHelper.hide('#taskbar');
        StyleHelper.show('#login-modal');
        StyleHelper.show('.shortcuts');
        UserData.save(user.name, user);
        StyleHelper.set('body', 'backgroundImage', '');
        user = undefined;
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
            user.emails = user.emails || DEFAULT_EMAILS;
            updateInbox();
            StyleHelper.hide('#login-modal');
            StyleHelper.show('#taskbar');
            StyleHelper.show('.shortcuts');
            StyleHelper.set('body', 'backgroundImage', 'url(./images/desktop-bg.jpg)');
            return false;
        });
        EventHelper.on('.start', 'click', (e) => {
            e.preventDefault();
            StyleHelper.toggle('#start-menu');
        });
        EventHelper.on('#log-out', 'click', (e) => {
            e.preventDefault();
            logOut();
            return false;
        });

        EventHelper.on('.modal-closeWindowBtn', 'click', (e) => {
            var cur = (event.target || {parentElement: document.body});
            while ((cur = cur.parentElement) !== undefined || cur === document.body) {
                if (cur.classList.contains('modal')) {
                    break;
                }
            }
            if (cur && cur.id) {
                StyleHelper.hide('#' + cur.id);
            }
            e.preventDefault();
            return false;
        });

        EventHelper.on('.email-shortcut', 'click', (e) => {
            e.preventDefault();
            showInbox(true);
        });

        $('.modal').draggable({
            handle: '.modal-content-title',
            containment: 'parent'
        });

        initGameBoard();
        //initialize();
    });

    function updateInbox() {
      // Removes all mails
      var emailList = document.getElementsByClassName('email-list')[0];
      while (emailList.lastChild) {
        emailList.removeChild(emailList.lastChild);
      }
      // Adds mails
      user.emails.forEach(function (email) {
        var listitem = document.createElement('div');
        listitem.className = 'email-listitem';
        var icon = document.createElement('div');
        icon.className = 'email-icon';
        icon.className += email.read ? ' email-read' : ' email-unread';
        var title = document.createElement('div');
        title.className = 'email-title';
        title.textContent = email.title;
        listitem.appendChild(icon);
        listitem.appendChild(title);
        emailList.appendChild(listitem);
        // Registers onclick
        listitem.onclick = function () {
          email.read = true;
          showMessage(email);
          updateInbox();
        };
      });
      // Updates inbox shorcut
      updateInboxShortcut();

      // Save to storage
      UserData.save(user.name, user);
    }

    // Updates Inbox shortcut badge
    function updateInboxShortcut() {
      var hasNewMail = user.emails.some ((email) => !email.read);

      if (hasNewMail) {
        StyleHelper.show('.email-shortcut .email-newmail');
      } else {
        StyleHelper.hide('.email-shortcut .email-newmail');
      }
    }

    function addEmail(from, title, message) {
      var email = {
        from: from,
        title: title,
        message: message,
        read: false,
        time: (new Date()).getTime()
      };
      // Adds to state or storage
      // TODO
      user.emails.push(email);
      updateInbox();
    }


    function showMessage(email) {
        var title = document.querySelector('.email-item .email-title h3');
        var from = document.querySelector('.email-item .email-from');
        var message = document.querySelector('.email-item .email-message');
        console.log(title);
        title.textContent = email.title;
        from.textContent = email.from;
        message.textContent = email.message;

        // Updates game level(s)
        // Remove all game levels
        var levelList = document.getElementsByClassName('email-level-container')[0];
        while (levelList.lastChild) {
            levelList.removeChild(levelList.lastChild);
        }
        // Adds levels
        email.assignment.forEach(function (assId) {
            if(assId >= ASSIGNMENTS.length){
              throw Error('game.js assignmentId not in range');
            }
            var assignment = ASSIGNMENTS[assId];
            var level = document.createElement('div');
            level.className = 'email-level';
            if (!assignment.status){
              level.className += ' level-disabled';
            }
            var icon = document.createElement('div');
            icon.className = 'level-icon';
            var title = document.createElement('div');
            title.className = 'level-name';
            title.textContent = assignment.title;
            level.appendChild(icon);
            level.appendChild(title);
            levelList.appendChild(level);
            // Registers onclick
            icon.onclick = function () {
              if(assignment.status) {
                alert('Clicked on assignment: ' + assId);
              }
            };
          });
    }

    function initGameBoard() {
        $('.tile').draggable({
            containment: '.modal-content',
            snap: '.snap-target',
            snapMode: 'inner',
            snapTolerance: 5,
            revert: function(event) {
                // on older version of jQuery use "draggable"
                // $(this).data("draggable")
                // on 2.x versions of jQuery use "ui-draggable"
                // $(this).data("ui-draggable")
                $(this).data('uiDraggable').originalPosition = {
                    top : 0,
                    left : 0
                };
                // return boolean
                return !event;
                // that evaluate like this:
                // return event !== false ? false : true;
            }
        });

        var current = {

        };

        $('.snap-target').droppable({
            accept: function (element) {
                if (!$(element).hasClass('tile')) {
                    return false;
                }
                var slot = $(this).data('key');
                var tile = $(element).data('key');
                return current[slot] === undefined || current[slot] === tile;
            },
            drop: function (event, ui) {
                var slot = $(this).data('key');
                var tile = $(ui.draggable).data('key');
                current[slot] = tile;
                // alert(tile + ' was placed on ' + slot); 
                ui.draggable.position({of: $(this)});
                return false;
            },
            out: function (event, ui) {
                var slot = $(this).data('key');
                var tile = $(ui.draggable).data('key');
                // alert(tile + ' was dragged out of ' + slot);  
                if (current[slot] === tile) {
                    delete current[slot];
                }
            }
        });
    }

}) ();

// Adds new email


// Shows/hides mailbox
function showInbox(bool) {
    if (bool) {
        StyleHelper.show('#email-modal');
    } else {
        StyleHelper.hide('#email-modal');
    }
}