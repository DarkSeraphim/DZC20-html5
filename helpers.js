'use strict';

window.StyleHelper = (function () {
  var select = function (selector, func) {
    document.querySelectorAll(selector).forEach(element => func(element));
  };
  var spyModeOn = false;
  return {
    hide: function (selector) {
      select(selector, element => {
        if (element.style.display === 'none') {
          return;
        }
        element.setAttribute('data-display', element.style.display);
        element.style.display = 'none';
      });
    },
    show: function (selector) {
      select(selector, element => {
        var old = element.getAttribute('data-display') || '';
        element.style.display = old;
      });
    },
    toggle: function (selector) {
      select(selector, element => {
        var show = element.style.display === 'none';
        if (show) {
         var old = element.getAttribute('data-display') || '';
         element.style.display = old;
       } else {
        element.setAttribute('data-display', element.style.display);
        element.style.display = 'none';
      }
    });
    },
    set: function (selector, key, value) {
      document.querySelectorAll(selector).forEach(element => {
        element.style[key] = value;
      });
    },
    fadeOut: function(selector, step, cb) {
      var fadeTarget = document.querySelector(selector);
      var fadeEffect = setInterval(function () {
        if (!fadeTarget.style.opacity) {
          fadeTarget.style.opacity = 1;
        }
        if (fadeTarget.style.opacity < 0.1) {
          fadeTarget.style.display = 'none';
          if (cb) {
            cb();
          }
          clearInterval(fadeEffect);
        } else {
          fadeTarget.style.opacity -= 0.05;
        }
      }, step);
    },

    isSpyMode: function(){
        return spyModeOn;
    },

    setSpyMode: function(bool){
        if (bool) {
            AudioHelper.play('hackerMusic3');
            AudioHelper.play('shortBoom');
            this.set('body', 'background-image', "url('./images/wallpaper-csi.jpg')");
            this.set('.modal-transparent', 'background', "url('./images/wallpaper-csi.jpg')");
            DOMHelper.setAttribute('.email-banner img', 'src', './images/inbox-banner-spy.png');
            document.querySelector('#spy-mode-css').removeAttribute('disabled');
            this.set('#taskbar','background',"url('./images/desktop-taskbar-spy.png')");
        } else {
            AudioHelper.stop('hackerMusic3');
            this.set('body', 'background-image', "url('./images/desktop-bg.jpg')");
            this.set('.modal-transparent', 'background', "url('./images/desktop-bg.jpg')");
            this.set('#spy-mode-css', 'disabled', 'true');
            DOMHelper.setAttribute('.email-banner img', 'src', './images/inbox-banner.png');
            DOMHelper.setAttribute('#spy-mode-css', 'disabled', true);
            this.set('#taskbar','background',"url('./images/desktop-taskbar.png')");
        }
        spyModeOn = bool;
    }
  };
}) ();

window.EventHelper = (function () {
  var select = function (selector, func) {
    document.querySelectorAll(selector).forEach(element => {
      func(element);
    });
  };
  return {
    on: function (selector, event, func) {
      select(selector, element => {
        let key = 'on' + event;
        if (typeof element[key] === 'function') {
          let first = element[key];
          let second = func;
          func = function (e) {
            try {
              first(e);
            } finally {
              second(e);
            }
          };
        }
        element[key] = func;
      });
    },
    off: function (selector, event) {
      select(selector, element => {
        delete element['on' + event];
      });
    }
  };
}) ();

window.DOMHelper = (function () {
  var select = function (selector, func) {
    document.querySelectorAll(selector).forEach(element => {
      func(element);
    });
  };
  return {
    getProperty: function (selector, key) {
      var values = [];
      select(selector, element => values.push(element[key]));
      return values.length === 1 ? values[0] : values;
    },
    setProperty: function (selector, key, value) {
      select(selector, element => element[key] = value);
    },
    getAttribute: function (selector, key) {
      var values = [];
      select(selector, element => values.push(element.getAttribute(key)));
      return values.length === 1 ? values[0] : values;
    },
    setAttribute: function (selector, key, value) {
      select(selector, element => element.setAttribute(key, value));
    }
  };
}) ();

window.AudioHelper = (function(){
  var sounds = {};
  var isMuted = false;

    //Loads a single sound
    var loadSound = function(sound, format) {
      sounds[sound] = new Audio('./audio/' + sound + '.' + format);
    };

    //Loads all the sounds in the provided array. The given format applies to all the sounds
    var loadSounds = function(sounds, format) {
      sounds.forEach(function(sound) {
        loadSound(sound, format);
      });
    };

    var soundsToLoad = [
        'boom', 
        'shortBoom', 
        'startup', 
        'buzzer', 
        'hackerMusic1',
        'hackerMusic3',
        'beatLevel',
        'email'
    ];

    loadSounds(soundsToLoad, 'mp3');

    //When it finishes, play again
    sounds['hackerMusic3'].addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);

    return {
      play: function(sound) {
        return ((function() {
          if (!isMuted) {
            return sounds[sound].play();
          }
          return Promise.resolve(undefined);
        }) ()).catch(() => {
                // console.log('Whoops');
              });
      },

      pause: function(sound) {
        sounds[sound].pause();
      },

      stop: function(sound) {
        sounds[sound].pause();
        sounds[sound].currentTime = 0;
      },

      setCurrentTime: function(sound, time) {
        sounds[sound].currentTime = time;
      },
      resetTime: function(sound) {
        this.setCurrentTime(sound, 0);
      },

      restart: function(sound) {
        this.pause(sound);
        this.resetTime(sound);
        this.play(sound);
      },

      isMuted: function(){
        return isMuted;
      }, 

      muteAll: function() {
        for (var key in sounds) {
          if (sounds.hasOwnProperty(key)) {
            sounds[key].pause();
          }
        }
      },

      stopAll: function() {
        for (var key in sounds) {
          if (sounds.hasOwnProperty(key)) {
            sounds[key].pause();
            sounds[key].currentTime = 0;
          }
        }
      },

      toggleMute: function() {
            //TODO: save the currently playing background song and resume it
            if (isMuted && StyleHelper.isSpyMode()) {         
                sounds['hackerMusic3'].play();
            } else {
                this.muteAll();
              }
              isMuted = !isMuted;
            }
          };

        }) ();

(function () {
  var queue = [];
  var isReady;

  var ready = function () {
    if (!isReady) {
      isReady = true;
      queue.forEach(func => func());
    }
  };

  var readyStateChange = function () {
    if (document.readyState === 'complete') {
      ready();
    }
  };

  if (document.addEventListener) {
    // first choice is DOMContentLoaded event
    document.addEventListener('DOMContentLoaded', ready, false);
    // backup is window load event
    window.addEventListener('load', ready, false);
  } else {
    // must be IE
    document.attachEvent('onreadystatechange', readyStateChange);
    window.attachEvent('onload', ready);
  }

  window.ready = function (func) {
    if (isReady) {
      func();
    } else {
      queue.push(func);
    }
  };
}) ();