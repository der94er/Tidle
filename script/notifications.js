/* ============================================================
   THE LAST EMBER — notifications.js
   Left-column message queue.
   Pure vanilla JS — no jQuery.
   ============================================================ */

var Notifications = {

  options: {},
  _container: null,
  notifyQueue: {},

  init: function(options) {
    Object.assign(this.options, options || {});

    var container = document.createElement('div');
    container.id = 'notifications';

    var gradient = document.createElement('div');
    gradient.id = 'notifyGradient';
    container.appendChild(gradient);

    document.getElementById('wrapper').appendChild(container);
    Notifications._container = container;
  },

  /* Show a message. If the active module isn't the target, queue it. */
  notify: function(module, text, noQueue) {
    if (typeof text === 'undefined') return;
    if (text.slice(-1) !== '.') text += '.';

    if (module !== null && Engine.activeModule !== module) {
      if (!noQueue) {
        if (!Notifications.notifyQueue[module]) {
          Notifications.notifyQueue[module] = [];
        }
        Notifications.notifyQueue[module].push(text);
      }
    } else {
      Notifications._printMessage(text);
    }
    Engine.saveGame();
  },

  /* Flush queued messages for a module when it becomes active */
  printQueue: function(module) {
    if (Notifications.notifyQueue[module]) {
      while (Notifications.notifyQueue[module].length > 0) {
        Notifications._printMessage(Notifications.notifyQueue[module].shift());
      }
    }
  },

  _printMessage: function(text) {
    var el = document.createElement('div');
    el.className = 'notification';
    el.textContent = text;

    var container = Notifications._container;
    /* Insert before gradient so new messages appear above the fade */
    var gradient = document.getElementById('notifyGradient');
    container.insertBefore(el, gradient ? gradient.nextSibling : null);

    /* Fade in via CSS transition — must happen after element is in DOM */
    requestAnimationFrame(function() {
      requestAnimationFrame(function() {
        el.classList.add('visible');
        Notifications._clearHidden();
      });
    });
  },

  /* Remove notifications that have scrolled below the gradient */
  _clearHidden: function() {
    var gradient = document.getElementById('notifyGradient');
    if (!gradient) return;
    var bottom = gradient.offsetTop + gradient.offsetHeight;
    document.querySelectorAll('.notification').forEach(function(n) {
      if (n.offsetTop > bottom) n.remove();
    });
  }

};
