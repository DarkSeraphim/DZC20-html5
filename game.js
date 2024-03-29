/* globals UserData,StyleHelper,EventHelper,DOMHelper,AudioHelper,$ */
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
    StyleHelper.set('#login-modal', 'opacity', 1);
    StyleHelper.hide('.shortcuts');
    UserData.save(user.name, user);
    StyleHelper.setSpyMode(false);
    AudioHelper.stopAll();
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
        UserData.save(username, { name: username });
        if (!logIn(username)) {
          throw new Error('Failed to create new user');
        }
      }

      StyleHelper.fadeOut('#login-modal', 15, function () {
        StyleHelper.show('#loader');
      });

      setTimeout(function () {
        user.assignments = user.assignments || ASSIGNMENTS;
        user.emails = user.emails || DEFAULT_EMAILS;
        showMessage(user.emails[0]);
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
      var cur = (event.target || { parentElement: document.body });
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

    var doModalFocus = element => {
      StyleHelper.set('.modal', 'zIndex', '');
      element.style.zIndex = '1';
    };

    $('.modal').draggable({
      handle: '.modal-content-title',
      containment: 'parent',
      start: (event, ui) => {
        doModalFocus(ui.helper[0]);
      }
    });

    EventHelper.on('.modal', 'click', e => {
      doModalFocus(e.currentTarget);
    });
    //DOMHelper.setProperty('#username', 'value', 'DarkSeraphim');
    //document.querySelector('form').onsubmit({ preventDefault: _ => {} });
  });

  function updateInbox() {
    // Removes all mails
    let emailList = document.getElementsByClassName('email-list')[0];
    while (emailList.lastChild) {
      emailList.removeChild(emailList.lastChild);
    }
    // Adds mails
    user.emails.forEach((email) => {
      let listitem = document.createElement('div');
      listitem.className = 'email-listitem';
      let icon = document.createElement('div');
      icon.className = 'email-icon';
      icon.className += email.read ? ' email-read' : ' email-unread';
      let title = document.createElement('div');
      title.className = 'email-title';
      title.textContent = email.title;
      listitem.appendChild(icon);
      listitem.appendChild(title);
      emailList.appendChild(listitem);
      // Registers onclick
      listitem.onclick = () => {
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
    let hasNewMail = user.emails.some((email) => !email.read);
    if (hasNewMail) {
      StyleHelper.show('.email-shortcut .email-newmail');
    } else {
      StyleHelper.hide('.email-shortcut .email-newmail');
    }
  }

  function addEmail(from, title, message) {
    const email = {
      from,
      title,
      message,
      read: false,
      time: (new Date()).getTime()
    };
    // Adds to state or storage
    user.emails.push(email);
    updateInbox();
  }

  // Add a new email to inbox after 2 seconds and update assignment status
  function activateAssignment(assId, delay = 0) {
    if (assId >= user.assignments.length) {
      throw Error('No such assignment with that assId exist');
    }
    let assignment = user.assignments[assId];
    assignment.status = 1;
    let email = Object.assign({ read: false }, assignment.email);
    if (user.emails.find((e) => e.title == email.title)) {
      return;
    }
    user.emails.push(email);
    setTimeout(() => {
      AudioHelper.play('email');
      updateInbox();
    }, delay);
  }

  function showMessage(email) {
    let emailWindow = document.querySelector('#email-modal');
    if (emailWindow.style.display != 'none') {
      email.read = true;
    }
    let title = document.querySelector('.email-item .email-title h3');
    let from = document.querySelector('.email-item .email-from');
    let message = document.querySelector('.email-item .email-message');
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
    email.assignment.forEach((assId) => {
      if (assId >= user.assignments.length) {
        throw Error('game.js assignmentId not in range');
      }
      // Hidden assignment
      let assignment = user.assignments[assId];
      if (assignment.email.hidden && !assignment.status) {
        return;
      }
      // Draw assignment shortcuts
      let level = document.createElement('div');
      level.className = 'email-level';
      if (!assignment.status) {
        level.className += ' level-disabled';
      }
      let icon = document.createElement('div');
      icon.className = 'level-icon';
      let title = document.createElement('div');
      title.className = 'level-name';
      title.textContent = assignment.title;

      // Overview email -> show icon
      // Assignment email - show icon
      if (email.assignment.length > 1 || assignment.solution) {
        level.appendChild(icon);
        // Onclick assignment shorcut
        icon.onclick = () => {
          if (assignment.status) {
            const linkedAssignmentEmail = user.emails.find(
              (e) => email.assignment.length > 1 && e.assignment.length == 1 && e.assignment.includes(assId));
            // Show assignment email if user is currently using overview email
            if (linkedAssignmentEmail) {
              showMessage(linkedAssignmentEmail);
              updateInbox();
            } else {
              if (assignment.email.hidden) {
                StyleHelper.setSpyMode(true);
              }
              showGameBoard(assId, true);
            }
          }
        };
        // Link email -> show text
      } else if (assignment.email.assignment[0]) {
        title.style.cursor = 'pointer';
        title.onclick = () => {
          StyleHelper.setSpyMode(true);
          activateAssignment(assignment.email.assignment[0]);
        };
      }
      level.appendChild(title);
      levelList.appendChild(level);

    });
  }

  var gbuuid = 0;

  function initGameBoard(slots, tiles, solution, callback) {

    var tileContainer = document.querySelector('#tiles ul');
    var slotContainer = document.querySelector('#puzzle');
    let uuid = gbuuid++;
    while (slotContainer.lastChild) {
      slotContainer.removeChild(slotContainer.lastChild);
    }
    slots.forEach(slot => {
      //<div class="slot snap-target" data-key="1"></div>
      var div = document.createElement('div');
      div.setAttribute('class', 'slot snap-target');
      div.setAttribute('data-key', slot.id);
      // TODO: set x, y to match level
      slotContainer.appendChild(div);
    });

    while (tileContainer.lastChild) {
      tileContainer.removeChild(tileContainer.lastChild);
    }
    tiles.forEach(tile => {
      /*
       <div class="tile" data-key="A">
       <span>A</span>
       <div class="snap-target" data-key="4"></div>
       <span>B</span>
       </div>
       */
      // <div class="tile" data-key="A"><span>A</span></div>
      var li = document.createElement('li');
      var div = document.createElement('div');
      div.setAttribute('class', 'tile');
      div.setAttribute('data-key', tile.id);
      div.style.zIndex = '10';
      (tile.text || []).forEach(item => {
        var elem;
        if (typeof item === 'string') {
          elem = document.createElement('span');
          if (tile.text.length === 1) {
            elem.style.display = 'inline';
            elem.style.textAlign = 'center';
          }
          elem.textContent = item;
        } else if (typeof item === 'object' && item.id) {
          elem = document.createElement('div');
          elem.setAttribute('class', 'snap-target');
          elem.setAttribute('data-key', item.id);

          if (item.before || item.after) {
            let div = elem;
            elem = document.createElement('span');
            if (item.before) {
              let span = document.createElement('span');
              span.textContent = item.before;
              elem.appendChild(span);
            }
            elem.appendChild(div);
            if (item.after) {
              let span = document.createElement('span');
              span.textContent = item.after;
              elem.appendChild(span);
            }
          }
        }
        div.appendChild(elem);
      });
      li.appendChild(div);
      tileContainer.appendChild(li);
    });

    $('.tile').draggable({
      containment: '.modal-content',
      snap: '.snap-target',
      snapMode: 'inner',
      snapTolerance: 5,
      revert: function (event) {
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

    var current = {};

    const CHECKABLES = slots.map(slot => slot.id);
    tiles.map(tile => tile.text).filter(text => !!text)
      .forEach(text => {
        text.forEach(entry => {
          if (typeof entry === 'object' && typeof entry.id === 'string') {
            CHECKABLES.push(entry.id);
          }
        });
      });

    var validate = () => {
      return CHECKABLES.every(slot => {
        
        if (solution[slot].indexOf(current[slot]) >= 0) {
          return true;
        }
        console.log('Invalid one: ' + slot + ' => ' + current[slot]);
        return false;
      });
    };

    var findTile = tile => {
      for (var key in current) {
        if (current.hasOwnProperty(key) && current[key] === tile) {
          return key;
        }
      }
    };

    window.debugC = current;

    var resetDraggable = element => {
      $(element).data('uiDraggable').originalPosition = {
        top: 0,
        left: 0
      };
      let revertDuration = $(element).draggable('option', 'revertDuration') || 10;

      $(element).animate({ top: 0, left: 0 }, parseInt(revertDuration), function () {
        $(element).removeClass('ui-draggable-dragging');
      });

      var data = $(element).data('key');
      var key = findTile(data);
      if (key) {
        delete current[key];
      }
      /*for (var key in current) {
       if (current.hasOwnProperty(key) && current[key] === data) {
       delete current[key];
       break;
       }
       }*/

      StyleHelper.set('.tile[data-key=' + data + ']', 'width', '');
      StyleHelper.set('.tile[data-key=' + data + ']', 'height', '');
      StyleHelper.set('.tile[data-key="' + data + '"]', 'zIndex', '10');
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
        var DOMSlot = document.querySelector('.snap-target[data-key="' + slot + '"]').parentElement;
        do {
          if (DOMSlot.classList.contains('tile') && tile === DOMSlot.getAttribute('data-key')) {
            return false;
          }
        } while ((DOMSlot = DOMSlot.parentElement) !== document.body);
        return current[slot] === undefined || current[slot] === tile;
      },
      drop: function (event, ui) {
        var slot = $(this).data('key');
        var tile = $(ui.draggable).data('key');
        var key = findTile(tile);
        /*if (key) {
         console.log('Try to reset ' + key);
         resetDroppable($('.snap-target[data-key="' + key + '"]'));
         }*/
        delete current[key];
        current[slot] = tile;
        var draggable = ui.draggable;
        var size = Math.min($(this)[0].clientHeight, 16);
        $(draggable).find('.snap-target').droppable('option', 'disabled', false);

        let z = 0;
        if ($(this).hasClass('slot')) {
          z = 5;
        } else {
          z = parseInt($(this).data('z')) + 1;
        }

        $(draggable).css({
          width: $(this).css('width'),
          height: $(this).css('height'),
          zIndex: '' + z
        });
        $(draggable).find('span').css({
          fontSize: (size - 2) + 'px',
          lineHeight: Math.floor((size * 1.25)) + 'px'
        });
        draggable.position({ of: $(this) });
        $(draggable).data('z', z);

        return false;
      },
      out: function (event, ui) {
        var tile = $(ui.draggable).data('key');
        StyleHelper.set('.tile[data-key="' + tile + '"]', 'width', '');
        StyleHelper.set('.tile[data-key="' + tile + '"]', 'height', '');
        StyleHelper.set('.tile[data-key="' + tile + '"]', 'zIndex', '10');
        document.querySelectorAll('.tile[data-key="' + tile + '"] .snap-target').forEach(e => {
          resetDroppable(e);
        });
      }
    });

    $('.slot.snap-target').droppable('option', 'disabled', false);
    EventHelper.off('#puzzle-validate button', 'click');
    EventHelper.on('#puzzle-validate button', 'click', (e) => {
      e.preventDefault();
      if (validate()) {
        var delay = 2500;
        console.log('True: ' + uuid);
        try {
          AudioHelper.play('beatLevel');
          setTimeout(function () {
            goKaput(5, 300);
          }, delay);
        } finally {
          setTimeout(function () {
            callback();
          }, delay + 2500);
        }
      } else {
        console.log('False: ' + uuid);
        var selector = '#assignment-modal .modal-transparent';
        StyleHelper.set(selector, 'border', '2px solid red');
        AudioHelper.restart('buzzer');
        $('#assignment-modal').effect('shake', {}, null, function () {
          StyleHelper.set(selector, 'border', '');
        });
      }
    });
  }

  // Debuggles
  window.buildGame = function (level) {
    StyleHelper.show('#assignment-modal');
    if (level === 1) {
      initGameBoard([{id: '1'}, {id: '2'}],
      [{
        id: 'A',
        text: [
          {
            before: 'if',
            id: '3',
            after: '{'
          },
          {id: '4'},
          '} else {',
          {id: '5'},
          '}'
        ]
      }, {
        id: 'B',
        text: ['number is even']
      }, {
        id: 'C',
        text: ['count']
      }, {
        id: 'D',
        text: ['drop']
      }, {
        id: 'E',
        text: ['print count']
      }], {
        1: ['A'],
        2: ['E'],
        3: ['B'],
        4: ['C'],
        5: ['D']
      }, () => alert('Passed level 1!'));
    } else if (level === 2) {
      initGameBoard([{id: '1'}, {id: '2'}],
      [{
        id: 'A',
        text: [
          {
            before: 'if',
            id: '3',
            after: '{'
          },
          {id: '4'},
          '} else {',
          {id: '5'},
          '}'
        ]
      }, {
        id: 'B',
        text: [
          {
            before: 'if',
            id: '6',
            after: '{'
          },
          {id: '7'},
          '} else {',
          {id: '8'},
          '}'
        ]
      }, {
        id: 'C',
        text: ['number is even']
      }, {
        id: 'D',
        text: ['number < 8']
      }, {
        id: 'E',
        text: ['count']
      }, {
        id: 'F',
        text: ['drop']
      }, {
        id: 'G',
        text: ['drop']
      }, {
        id: 'H',
        text: ['print count']
      }], {
        1: ['A', 'B'],
        2: ['H'],
        3: ['C', 'D'],
        4: ['B', 'A'],
        5: ['F', 'G'],
        6: ['D', 'C'],
        7: ['E'],
        8: ['G', 'F']
      }, () => alert('Passed level 2!'));
    } else {
      initGameBoard([{id: '1'}],
        [{
          id: 'A',
          text: [
            {
              before: 'if',
              id: '2',
              after: '{'
            },
            {id: '3'},
            '} else {',
            {id: '4'},
            '}'
          ]
        }, {
          id: 'B',
          text: ['Bar']
        }, {
          id: 'C',
          text: ['Bat']
        }], {
          1: ['A'],
          2: ['B'],
          3: ['C']
        }, () => alert('Congratulations!'));
    }
  };

  function showGameBoard(assId, bool) {
    if (bool) {
      let assignment = user.assignments[assId];
      document.querySelector('#assignment-title span').textContent = assignment.theAssignment || 'Solve this!';
      initGameBoard(assignment.slots, assignment.tiles, assignment.solution, () => {
        if (assignment.status !== 2) {
          assignment.status = 2;
          activateAssignment(user.assignments.indexOf(assignment) + 1);
        }
        // TODO: Replay or Close window box here!
      });
      StyleHelper.show('#assignment-modal');

      setTimeout(() => {
        StyleHelper.set('.modal', 'zIndex', '');
        StyleHelper.set('#assignment-modal', 'zIndex', '1');
      }, 1);
    } else {
      StyleHelper.hide('#assignment-modal');
    }
  }

  function showInbox(bool) {
    if (bool) {
      StyleHelper.show('#email-modal');
      StyleHelper.set('#email-modal', 'z-index', 1);
    } else {
      StyleHelper.hide('#email-modal');
    }
  }

})();
