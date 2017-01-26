'use strict';

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
})();

// Mock-up emails and assignments
const ASSIGNMENTS = [
  {//0
    title: 'Click here please!',
    status: 1,
    email: { // If user click, send another email that links to assignment 1
      assignment: [1]
    }
  }, {//1
    // title: 'Start the attack!',
    status: 1,
    email: { // If user click, send another email that links to assignment 1
      from: 'csi@tuedeepweb.onion',
      title: 'Don\'t panic!',
      message: 'Greetings Student,\nYou have been selected to join the CSI forces. We take care of the worst ' +
               'cyber-hackers in the world and we need the best minds in university to help us. I wish we had ' +
               'the time for further explanation but we need you to get into work!\nYour first mission will be ' +
               'to take care of Dr. C Shark\'s minions (a.k.a Hack-Street Boys) who are attacking our systems. ' +
               'Our intel team discovered that their systems are vulnerable to certain values so you need to ' +
               'build a program to introduce the specific value into their system to cause a fatal error.\n',
      assignment: [2]
    }
  }, {//2
    title: 'Start the attack!',
    status: 1,
    email: {
      assignment: [3]
    }
  }, {//3
    title: 'Hack-Street Boys project',
    status: 1,// 0 - disabled, 1 - enabled but not passed, 2 - passed
    email: {
      from: 'csi@tuedeepweb.onion',
      title: 'Hack-Street Boys project',
      message: 'The Hack-Street Boys\' greatest weakness are even numbers! As you probably already know, you ' +
               'can use a an \'if-else\' statement to determine if a number fulfills a certain condition. Go ' +
               'ahead and count the number of even integers you have in your input in order to destroy ' +
               'the enemy’s system:\n',
      assignment: [3]
    },
    slots: [{
      id: '1'
    }, {
      id: '2'
    }, {
      id: '3'
    }],
    tiles: [{
      id: 'A',
      text: [
        'for (i = 0; i < 9; i++) {',
        { id: '4' },
        '}'
      ]
    }, {
      id: 'B',
      text: [
        'if (i % 2 == 0) {',
        { id: '5' },
        '} else {',
        { id: '6' },
        '}'
      ]
    }, {
      id: 'C',
      text: ['x = x + 1']
    }, {
      id: 'D',
      text: ['y = y + 1']
    }, {
      id: 'E',
      text: ['x = x + 5']
    }, {
      id: 'F',
      text: ['y = x + y']
    }],
    solution: { 1: 'A' }
  }, {//4
    status: 1,
    email: {
      from: 'csi@tuedeepweb.onion',
      title: 'We need your help again!',
      message: "Greetings agent, \nWe need your assistance once more!The henious boss of the Hack-Street Boys, " +
               "Dr. C. Shark,  has finally revealed her malevolent plan. She intends to exploit a vulnerability " +
               "in our system and steal all of our data! Luckily our undercover agents have also discovered her " +
               "weakness: similarly to the Hack-Street Boys, if you sneak in a specific value into her system, " +
               "it will cause a system overload and make it explode. However, this time you need to be more precise" +
               " than just finding out the number of even integers in your input, but also which of those are" +
               " smaller than 8.\nThere are multiple ways to build this program, but because time is of the" +
               " essence we must make it quickly, and since you already have plenty of experience with \"if-else\"" +
               " statements, you can easily build this program nesting one or more of these into another." +
               " Beware! Because of the vulnerability in our system there might be redundant pieces of code " +
               "that you actually do not need. Good luck, we count on you to save the TU/e!",
      assignment: [5]
    }
  }, {//6
    title: 'Start the attack!',
    status: 1,
    email: {
      assignment: [6]
    }
  }, {//7
    title: 'Dr. C. Shark project',
    status: 1,
    email: {
      from: 'csi@tuedeepweb.onion',
      title: 'Dr. C. Shark project',
      message: 'Help me out! I can make you great again!',
      assignment: [6]
    },
    slots: [{
      id: '1'
    }, {
      id: '2'
    }, {
      id: '3'
    }],
    tiles: [{
      id: 'A',
      text: [
        'for (i = 0; i < 9; i++) {',
        { id: '4' },
        '}'
      ]
    }, {
      id: 'B',
      text: [
        'if (i % 2 == 0) {',
        { id: '5' },
        '} else {',
        { id: '6' },
        '}'
      ]
    }, {
      id: 'C',
      text: ['x = x + 1']
    }, {
      id: 'D',
      text: ['y = y + 1']
    }, {
      id: 'E',
      text: ['x = x + 5']
    }, {
      id: 'F',
      text: ['y = x + y']
    }],
    solution: { 1: 'A' }
  }, {//8
    status: 1,
    email: {
      from: 'csi@tuedeepweb.onion',
      title: 'The end :)',
      message: "Hello again,\nYou have just finished TU/e Computer Science program. We look forward to seeing you" +
               " in one of our great Master program. \nThank you!",
      assignment: [7]
    }
  }
];

const DEFAULT_EMAILS = [{
  from: 'csi@tuedeepweb.onion',
  title: 'Welcome to the Computer Science program at TU/e!',
  message: 'Dear student, congratulations!\nYou have successfully joined the Computer Science online program at the ' +
           'Technical University of Eindhoven. There are several courses you need to complete in order to obtain ' +
           'your diploma, click on the link bellow to receive a complete list of courses you can enroll at the moment: \n',
  read: false,
  time: (new Date()).getTime(),
  assignment: [0]//ASSIGNMENTS.map((value, index) => index)
}];