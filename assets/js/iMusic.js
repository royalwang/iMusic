/**
 * *************************************
 * Create time: 2014-10-27.
 * Update time: 2014-10-28.
 * GitHub: https://github.com/simechiang.
 * Weibo: http://weibo.com/371876557.
 * Mobile: 137-1759-6953.
 * *************************************
 *                  ___           ___           ___                       ___
 *      ___        /\__\         /\__\         /\  \          ___        /\  \
 *     /\  \      /::|  |       /:/  /        /::\  \        /\  \      /::\  \
 *     \:\  \    /:|:|  |      /:/  /        /:/\ \  \       \:\  \    /:/\:\  \
 *     /::\__\  /:/|:|__|__   /:/  /  ___   _\:\~\ \  \      /::\__\  /:/  \:\  \
 *  __/:/\/__/ /:/ |::::\__\ /:/__/  /\__\ /\ \:\ \ \__\  __/:/\/__/ /:/__/ \:\__\
 * /\/:/  /    \/__/~~/:/  / \:\  \ /:/  / \:\ \:\ \/__/ /\/:/  /    \:\  \  \/__/
 * \::/__/           /:/  /   \:\  /:/  /   \:\ \:\__\   \::/__/      \:\  \
 *  \:\__\          /:/  /     \:\/:/  /     \:\/:/  /    \:\__\       \:\  \
 *   \/__/         /:/  /       \::/  /       \::/  /      \/__/        \:\__\
 *                 \/__/         \/__/         \/__/                     \/__/
 *
 */

;(function (window, undefined) {

  var toString = Object.prototype.toString;

  var inherit = function (object) {
    if (!(typeof object === "function" || typeof object === "object" && !!object)) return object;

    for (var i = 1, len = arguments.length; i < len; i++) {
      var source = arguments[i], key;
      for (key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) object[key] = source[key];
      }
    }
    return object;
  };

  var events = {
    "bind": window.addEventListener ? "addEventListener" : "attachEvent",
    "unbind": window.removeEventListener ? "removeEventListener" : "detachEvent",
    "prefix": this.bind === "attachEvent" ? "on" : "",
    "on": function(elem, type, fn, capture){
      elem[this.bind](this.prefix + type, fn, capture || false);
    },
    "off": function (elem, type, fn, capture) {
      elem[this.unbind](this.prefix + type, fn, capture || false);
    }
  };

  var iMusic = function (options) {

    var defaults = {
      "main": "player-main",
      "list": "player-list",
      "listing": [
        { "name": "你怎么能够", "singer": "阿悄", "resource": "./assets/audio/你怎么能够.mp3" , "album": "./caches/artists/你怎么能够.jpg" },
        { "name": "星月神话", "singer": "金莎", "resource": "./assets/audio/星月神话.mp3" , "album": "./caches/artists/星月神话.jpg" },
        { "name": "爱与妒忌", "singer": "阿悄", "resource": "./assets/audio/爱与妒忌.mp3" , "album": "./caches/artists/爱与妒忌.jpg" },
        { "name": "Remember the name", "singer": "Fort Minor", "resource": "./assets/audio/Remember the Name.mp3" , "album": "./caches/artists/Remember the name.jpg" },
        { "name": "梦千年之缘", "singer": "金莎", "resource": "./assets/audio/梦千年之恋.mp3" , "album": "./caches/artists/梦千年之恋.jpg" }
      ],
      "template": "<li class=\"item\"><span class=\"item-index\">#index#</span><a class=\"item-title\">#singer# - #name#</a><div class=\"item-check\"><input type=\"checkbox\"></div></li>",
      "index": 0,
      "autoplay": false,
      "audio":  "player-audio",
      "album":  "artist-avatar",
      "prev":   "button-prev",
      "next":   "button-next",
      "play":   "button-play",
      "now":    "time-current",
      "total":  "time-total",
      "title":  "player-title",
      "meta":   "player-meta"
    };

    this.options  = inherit({}, options, defaults);
    this.main     = document.getElementById(this.options.main);
    this.list     = document.getElementById(this.options.list);
    this.audio    = document.getElementById(this.options.audio);
    this.album    = document.getElementById(this.options.album);
    this.prev     = document.getElementById(this.options.prev);
    this.next     = document.getElementById(this.options.next);
    this.play     = document.getElementById(this.options.play);
    this.now      = document.getElementById(this.options.now);
    this.total    = document.getElementById(this.options.total);
    this.title    = document.getElementById(this.options.title);
    this.meta     = document.getElementById(this.options.meta);

    this.generator();
    this.setSingInfo(this.options.index);
    this.bindHandlers();
    if (this.options.autoplay) this.autoplay();
  };

  iMusic.prototype.version = "1.0.0";

  /**
   * Format number to minutes.
   * @param  {integer} number [description]
   * @return {string} "minutes:seconds"
   */
  iMusic.prototype.number2minute = function (number) {
    number = parseInt(number);
    var minute = Math.floor(number / 60), seconds = number % 60,
        totens = function (number) { return number < 10 ? "0" + number : number; };
    return totens(minute) + ":" + totens(seconds);
  };

  /**
   * Generate the data list and append to document.
   * @return void 0
   */
  iMusic.prototype.generator = function () {
    var listing = this.options.listing;
    if (listing.length === +listing.length && toString.call(listing) === "[object Array]") {
      var temp = "", template = this.options.template;

      for (var i = 0, len = listing.length; i < len; i++) {
        temp += template.replace(/#(index|name|singer)#/gi, function ($field) {
          return $field === "#index#" ? i + 1 : listing[i][$field.replace(/#/g, "")] ;
        });
      }

      this.list.innerHTML = temp;

      var tagName = template.match(/^<[a-z]+/i)[0].replace("<", ""),
          items = this.list.getElementsByTagName(tagName), _this = this;

      for (var i = 0, len = items.length; i < len; i++) {
        (function (index) {
          events.on(items[index], "dblclick", function () {
            _this.switcher.call(_this, null, index);
          });
        })(i);
      }
    }
  };

  /**
   * switch sing.
   * @param  {string} type  action: next, prev, null
   * @param  {integer} index index
   * @return void 0
   */
  iMusic.prototype.switcher = function (type, index) {
    switch (type) {
      case "prev":
        this.options.index = --this.options.index < 0 ? this.options.listing.length - 1 : this.options.index;
        break;
      case "next":
        this.options.index = ++this.options.index >= this.options.listing.length ? 0 : this.options.index;
        break;
      default:
        this.options.index = index;
        break;
    };
    this.setSingInfo(this.options.index);
    this.changeStatus();
  };

  /**
   * Bind events.
   * @return void 0
   */
  iMusic.prototype.bindHandlers = function () {
    var _this = this;

    events.on(this.prev, "click", function() {
      _this.switcher.call(_this, "prev");
    });

    events.on(this.next, "click", function() {
      _this.switcher.call(_this, "next");
    });

    events.on(this.play, "click", function() {
      _this.changeStatus.call(_this);
    });
  };

  /**
   * Change iMusic status: play, pause
   * @param  {string} status
   * @return void 0
   */
  iMusic.prototype.changeStatus = function (status) {
    status = status || (this.audio.paused ? "pause" : "play");
    this.play.className = this.play.className.replace(/-(pause|play)/g, "-" + status);
    this.audio[ this.audio.paused ? "play" : "pause" ]();
    if (!/active/gi.test(this.album.className) && !this.audio.paused) this.album.className += " active";
    if (!this.audio.paused) this.listener();
  };

  /**
   * Autoplay method.
   * @return void 0
   */
  iMusic.prototype.autoplay = function () {
    this.switcher(null, this.options.index);
  };

  /**
   * Set sing info to element.
   * @param {integer} index
   */
  iMusic.prototype.setSingInfo = function(index) {
    var singInfo = this.options.listing[index], _this = this, timer;

    this.audio.src = singInfo.resource;
    this.title.innerText = singInfo.name;
    this.meta.innerText = singInfo.name + " / " + singInfo.singer;

    if (this.album && this.album.nodeType) {
      this.album.style.backgroundImage = "url(\"" +this.options.listing[index].album + "\")";
      this.album.style.backgroundSize = "100%";
    }

    (timer = function () {
      if (_this.audio.readyState === 4) {
        _this.now.innerText   = _this.number2minute( Math.floor(_this.audio.currentTime) );
        _this.total.innerText = _this.number2minute( Math.floor(_this.audio.duration) );
        return timer = null;
      }
      setTimeout(timer, 10);
    })();
  };

  /**
   * Auto update process and seconds.
   * @return void 0
   */
  iMusic.prototype.listener = function() {
    var timer, _this = this;
    // Broswer's bug. You can not get the duration right now. So you have to wait for it ready.
    (timer = function () {
      if (_this.audio.currentTime === _this.audio.duration) {
        _this.switcher.call(_this, "next");
        return timer = null;
      }
      _this.now.innerText = _this.number2minute( Math.floor(_this.audio.currentTime) );
      setTimeout(timer, 1000);
    })();
  };

  /**
   * Get index from iMusic.
   * @return integer index.
   */
  iMusic.prototype.getIndex = function () {
    return this.options.index;
  };

  /**
   * Return current sing's infomations
   * @return {object} a json data.
   */
  iMusic.prototype.getSingInfo = function () {
    return this.options.listing[ this.options.index ];
  };

  /**
   * Hide main box.
   */
  iMusic.prototype.hide = function () {
    this.main.style.display = "none";
  };

  /**
   * Show main box.
   */
  iMusic.prototype.show = function () {
    this.main.style.display = "block";
  };

  window.iMusic = iMusic;

}(window));


