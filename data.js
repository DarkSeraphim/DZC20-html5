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
  {
    title: 'App Programming',
    status: 1,// 0 - disabled, 1 - enabled but not passed, 2 - passed
    email: {
      from: 'WhatIsLove_BabyDontHurtMe@tue.nl',
      title: 'First assignment! App Programming course!',
      message: 'Hi, time flies even if the chicken doesn\'t',
      assignment: [0]
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
  }, {
    title: 'Hacking Wifi',
    status: 0,
    email: {
      from: 'superdeepweb@thisisthedeepestweb.onion',
      title: 'Yo yo! Wanna earn some money bro!?',
      message: 'Hey yo! Recently I got bored with my assignments. If you do it for me, I could pay you some real cash! Interested!?',
      assignment: [1],
      hidden: true
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
  }, {
    title: 'Algorithms',
    status: 0,
    email: {
      from: 'WhatIsLove_BabyDontHurtMe@tue.nl',
      title: 'Algorithms is hard! Get ready for the exam',
      message: 'You should not underestimate this course at all!',
      assignment: [2]
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
  }
];

const DEFAULT_EMAILS = [{
  from: 'WhatIsLove_BabyDontHurtMe@tue.nl',
  title: 'Welcome to the Computer Science program at TU/e!',
  message: 'Welcome to our study plaplaplapal',
  read: false,
  time: (new Date()).getTime(),
  assignment: ASSIGNMENTS.map((value, index) => index)
}, {
  from: 'WhatIsLove_BabyDontHurtMe@tue.nl',
  title: 'First assignment! App Programming course!',
  message: 'Hi, time flies even if the chicken doesn\'t',
  read: false,
  time: (new Date()).getTime(),
  assignment: [0]
}];