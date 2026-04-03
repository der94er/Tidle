/* ============================================================
   THE LAST EMBER — header.js
   Tab registration and navigation.
   Pure vanilla JS — no jQuery.
   ============================================================ */

var Header = {

  options: {},

  init: function(options) {
    Object.assign(this.options, options || {});
  },

  canTravel: function() {
    return document.querySelectorAll('#header .headerButton').length > 1;
  },

  /* Register a location tab.
     Returns the DOM element (used as module.tab). */
  addLocation: function(text, id, module, before) {
    var btn = document.createElement('div');
    btn.id = 'location_' + id;
    btn.className = 'headerButton';
    btn.textContent = text;
    btn.addEventListener('click', function() {
      if (Header.canTravel()) {
        Engine.travelTo(module);
      }
    });

    var header = document.getElementById('header');
    var beforeEl = before ? document.getElementById('location_' + before) : null;

    if (beforeEl) {
      header.insertBefore(btn, beforeEl);
    } else {
      header.appendChild(btn);
    }

    return btn;
  }

};
