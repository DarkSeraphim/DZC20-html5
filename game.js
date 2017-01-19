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
    return user;
  };
  userdata = doLogin(username);

  // TODO: handle this shit!!! For now, it will just create new user.
  if (!userdata) {
    UserData.save(username, {});
    userdata = doLogin(username);
  }
  emails = userdata.emails || emails;
  initialize();
  updateInbox();
});

// Mock-up username and userdata
var username = 'ahihi';
var userdata = null;

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

// Initializes html components
function initialize() {
  // Onclick for close modal button
  var closeModalBtn = document.querySelector('#assignment-modal .closeWindowBtn');
  closeModalBtn.onclick = function () {
    showInbox(false);
  }
  // Onclick for inbox shorcut
  var inboxShorcut = document.querySelector(".email-shortcut");
  inboxShorcut.onclick = function () {
    showInbox(true);
  }

  var startBtn = document.querySelector(".start");
  startBtn.onclick = function(){
    toggleStartMenu();
  }
}

// Adds new email
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

// Shows/hides mailbox
function showInbox(bool) {
  var modal = document.getElementById("assignment-modal");
  if (bool) {
    modal.className = modal.className.replace(/\bhidden\b/, '');
  } else {
    modal.className += " hidden";
  }
}

// Updates Inbox view
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
  // Updates inbox shorcut
  updateInboxShortcut();

  // Save to storage
  userdata.emails = emails;
  UserData.save(username, userdata);
}

// Updates Inbox shortcut badge
function updateInboxShortcut() {
  var inboxShorcutBadge = document.querySelector(".email-shortcut .email-newmail");
  var hasNewMail = emails.find(function (email) {
    return email.read == false;
  });
  if (hasNewMail) {
    inboxShorcutBadge.className = inboxShorcutBadge.className.replace(/\bhidden\b/, '');
  } else {
    inboxShorcutBadge.className += " hidden";
  }
}

// Shows email message
function showMessage(email) {
  var title = document.querySelector('.email-item .email-title h3');
  var from = document.querySelector('.email-item .email-from');
  var message = document.querySelector('.email-item .email-message');
  title.textContent = email.title;
  from.textContent = email.from;
  message.textContent = email.message;
}

//Goes back to login screen
function logOut(){
  window.location.href='index.html';
}

//Shows/hides start menu
function toggleStartMenu(){
  var startMenu = document.querySelector("#start-menu");
  if(startMenu.style.display == 'block'){
    startMenu.style.display = 'none';
    return;
  } 
  startMenu.style.display = 'block';
}