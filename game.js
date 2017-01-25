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
        StyleHelper.set('#login-modal', 'opacity', 1);
        StyleHelper.hide('.shortcuts');
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

            StyleHelper.fadeOut('#login-modal', 15, function(){
                StyleHelper.show('#loader');
            });

            setTimeout(function(){ 
                user.emails = user.emails || DEFAULT_EMAILS;
                updateInbox();  
                StyleHelper.hide('#loader');          
                StyleHelper.show('#taskbar');
                StyleHelper.show('.shortcuts');
                StyleHelper.set('body', 'backgroundImage', 'url(./images/desktop-bg.jpg)');
                AudioHelper.play('startup');
            }, 3000);

            return false;
        });
        EventHelper.on('.start', 'click', (e) => {
            e.preventDefault();
            StyleHelper.toggle('#start-menu');
        }); 
        EventHelper.on('#log-out', 'click', (e) => {
            e.preventDefault();
            logOut();
            StyleHelper.hide('#start-menu');
            return false;
        });
        EventHelper.on('#mute-toggle-wrapper', 'click', (e) => {
            e.preventDefault();
            var isMuted = DOMHelper.getProperty('#mute-toggle', 'checked');
            AudioHelper.toggleMute();
            DOMHelper.setProperty('#mute-toggle', 'checked', !isMuted);
        });

        //This was breaking the muting sound checkbox
        // EventHelper.on('#start-menu', 'click', (e) => {
        //     e.preventDefault();
        //     e.stopPropagation();
        //     StyleHelper.hide('#start-menu');
        // });

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

        // TODO: load level?
        initGameBoard([], []);
        //initialize();
        DOMHelper.setProperty('#username', 'value', 'DarkSeraphim');
        document.querySelector('form').onsubmit({preventDefault: _=>{}});
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

    function initGameBoard(tiles, slots) {

        var tileContainer = document.querySelector('#tiles');
        var slotContainer = document.querySelector('#puzzle');
        slots.forEach(slot => {
            //<div class="snap-target" data-key="1"></div>
            var div = document.createElement('div');
            div.setAttribute('class', 'snap-target');
            div.setAttribute('data-key', slot.id);
            // TODO: set x, y to match level
            slotContainer.appendChild(div);
        });

        tiles.forEach(tile => {
            // TODO: flexbox this one, with wrap and left align
            // <div class="tile" data-key="A"><span>A</span></div>
            var div = document.createElement('div');
            div.setAttribute('class', 'tile');
            div.setAttribute('data-key', tile.id);
            var span = document.createElement('span');
            span.textContent = tile.description;
            div.appendChild(span);
            tileContainer.appendChild(div);
        });

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
                if (!event) {
                    resetDraggable(this);                    
                }
                // return boolean
                return !event;
                // that evaluate like this:
                // return event !== false ? false : true;
            }
        });

        var current = {

        };

        window.debugC = current;

        var resetDraggable = element => {
            $(element).data('uiDraggable').originalPosition = {
                top : 0,
                left : 0
            };
            let revertDuration = $(element).draggable('option', 'revertDuration') || 10;

            $(element).animate({top: 0, left: 0}, parseInt(revertDuration), function() {
                $(element).removeClass('ui-draggable-dragging');
            });

            var data = $(element).data('key');
            for (var key in current) {
                if (current.hasOwnProperty(key) && current[key] === data) {
                    delete current[key];
                    break;
                } 
            }

            StyleHelper.set('.tile[data-key=' + data + ']', 'width', '');
            StyleHelper.set('.tile[data-key=' + data + ']', 'height', '');
            document.querySelectorAll('.tile[data-key=' + data + '] > .snap-target').forEach(element => {
                resetDroppable(element);
            });
        };

        var resetDroppable = element => {
            var slot = $(element).data('key');          
            // alert(tile + ' was dragged out of ' + slot);  
            var child;
            if (current[slot]) {
                child = current[slot];
            }

            if (!$(element).hasClass('slot')) {
               $(element).droppable('option', 'disabled', true);
            }
            // $($.ui.draggable).find('.snap-target').droppable('option', 'disabled', true);

            let tile = document.querySelector('.tile[data-key=' + child + ']');
            if (tile) {
                resetDraggable(tile);
            }
        };

        $('.snap-target').droppable({
            disabled: true,
            accept: function (element) {
                if (!$(element).hasClass('tile')) {
                    return false;
                }
                var slot = $(this).data('key');
                var tile = $(element).data('key');
                var DOMSlot = document.querySelector('.snap-target[data-key="'+slot+'"]');
                while ((DOMSlot = DOMSlot.parentElement) !== document.body) {
                    if (DOMSlot.classList.contains('tile')) {
                        if (tile === DOMSlot.getAttribute('data-key')) {
                            return false;
                        }
                    }
                }
                return current[slot] === undefined || current[slot] === tile;
            },
            drop: function (event, ui) {
                var slot = $(this).data('key');
                var tile = $(ui.draggable).data('key');
                current[slot] = tile;
                var draggable = ui.draggable;
                $(draggable).css({
                    width: $(this).css('width'),
                    height: $(this).css('height')
                });
                draggable.position({of: $(this)});
                $(draggable).find('.snap-target').droppable('option', 'disabled', false);
                return false;
            }
        });

        $('.slot.snap-target').droppable('option', 'disabled', false);

        EventHelper.on('#puzzle-validate button', 'click', (e) => {
            e.preventDefault();
            // goKaput(5, 300); //Triggers explosion of the circle

            //This should only happen when the code is wrong:
            var selector = '#assignment-modal .modal-transparent';
            StyleHelper.set(selector, 'border', '2px solid red');
            AudioHelper.play('buzzer');
            $( "#assignment-modal" ).effect( "shake", {}, null, function(){
                StyleHelper.set(selector, 'border', '');
            } );

            // Use `current` to verify whether the solution is valid 
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