/* globals UserData */
'use strict';
if (typeof UserData === 'undefined') {
  throw new Error('game.js requires data.js');
}

$(function () {
  // Scope all the thing o/
  var user;
  var doLogin = function (username) {
    user = UserData.load(username);
    return !!user;
  };
  updateInbox();

  // Add email example
  addEmail("ahihi@yahoo.com","Ahihi","messsageeee ;) \nasdasdsa");
});

// For use after passing an assignment
function addEmail(from, title, message) {
  var email = {
    "from": from,
    "title": title,
    "message": message,
    "read": false,
    "time": (new Date()).getTime()
  }
  // Adds to state or storage
  // TODO
  emails.push(email);
  updateInbox();
}

// Mock-up emails
var emails = [
  {
    "from": "WhatIsLove_BabyDontHurtMe@tue.nl",
    "title": "Welcome to the Computer Science program at TU/e!",
    "message": "Welcome to our study plaplaplapal",
    "read": false,
    "time": (new Date()).getTime()
  }
];
function updateInbox() {
  // Gets all mails from storage
  // TODO

  // Removes all mails
  var emailList = document.getElementsByClassName('email-list')[0];
  while (emailList.lastChild) {
    emailList.removeChild(emailList.lastChild);
  }
  // Adds mails
  emails.forEach(function (email) {
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
    }
  });
}

function showMessage(email) {
  var title = document.querySelector('.email-item .email-title h3');
  var from = document.querySelector('.email-item .email-from');
  var message = document.querySelector('.email-item .email-message');
  title.textContent = email.title;
  from.textContent = email.from;
  message.textContent = email.message;
}