;
/**
 * Respond.to.js
 * Copyright 2014 Collin Bourdage.
 *
 * Lightweight javascript library to help facilitate javascript development
 * for responsive development. Implements simple api to call, retrieve, and
 * add callbacks to a stack of media query objects.
 *
 * Stack object looks like the following:
 * array(
 * 		'960' : array(object, object),
 *      '760' : array(object, object)
 * ));
 */
(function() {
	/** @var window */
	var root = this;
	var Respond = root.Respond = {};

	/**
	 * Pushes a new object based on a key onto the media stack
	 *
	 * @param mqString String
	 * @param obj Object
	 * @return {*}
	 * @private
	 */
	Respond._push = function(mqString, obj) {
		var key = this._purify(mqString);
		this._mediaStack || (this._mediaStack = {});
		this._mediaStack[key] || (this._mediaStack[key] = {mql : null, items : []});

		if (!this._mediaStack[key].mql) {
			if (root.matchMedia) {
				this._mediaStack[key].mql = root.matchMedia(mqString);
				this._mediaStack[key].mql.addListener(respondTo);
			} else {
				this._mediaStack[key].mql = {keyValue: null}; // ie8 fix
			}

			/**
			 * Store array key on the mql object for lookup later because of an
			 * inconsistency with how browsers handle media queries after instantiation:
			 *  	screen and (min-width: 700px) and (max-width: 900px)
			 * is converted to the following on the mql object:
			 *  	screen and (max-width: 900px) and (min-width: 700px)
			 */
			this._mediaStack[key].mql.keyValue = key;
		}

		obj.ready = true;
		this._mediaStack[key].items.push(obj);
		return this;
	};

	/**
	 * Cleans keys for object index by replacing the spaces
	 * with a more acceptable character
	 *
	 * @param key
	 * @param replacement (optional)
	 * @returns {string}
	 * @private
	 */
	Respond._purify = function (key, replacement) {
		replacement || (replacement = '_');
		return key.toLowerCase().replace(/[\s\-:()]/g, replacement).replace(/__/g, replacement).replace(/(_)$/, '');
	};

	/**
	 * Proxy function for adding listener to media query list.
	 *
	 * @param mql window.MediaQueryList
	 */
	function respondTo(mql) {
		Respond._respond(mql);
	}

	/**
	 * Responds to a given media query list object
	 *
	 * @private
	 * @param mql window.MediaQueryList
 	 * @param namespace String
	 */
	Respond._respond = function(mql, namespace) {
		var key = mql.keyValue;

		// ie9 can't store extra data on the mql object, so we purify the mql.media string
		if (navigator.userAgent.match(/MSIE 9.0/)) {
			key = this._purify(mql.media);
		}

		if (!this._mediaStack[key]) return;

		// If ie8, lets run the "default" condition - we ain't supportin' it, sorry.
		if (navigator.userAgent.match(/MSIE 8.0/)) {
			for (var i = 0; i < this._mediaStack[key].items.length; i++) {
				var _item = this._mediaStack[key].items[i],
					_fallback = _item['fallback'] || 'if';
				if (typeof _item[_fallback] === 'function') {
					if (!namespace || _item['namespace'] == namespace) {
						_item[_fallback]();
					}
				}
			}
			return this;
		}

		var _fnCallback = mql.matches ? 'if' : 'else';

		for (var i = 0; i < this._mediaStack[key].items.length; i++) {
			var _item = this._mediaStack[key].items[i];
			if (typeof _item[_fnCallback] === 'function') {
				if (!namespace || _item['namespace'] == namespace) {
					_item[_fnCallback]();
				}
			}
		}
		return this;
	};

	/**
	 * Returns a object based on a namespace and an optional
	 * media index.
	 *
	 * @param ns String
	 * @param mqString String
	 * @return {*}
	 * @private
	 */
	Respond._retrieve = function(ns, mqString) {
		if (!this._mediaStack) return;

		var _temp = [];
		if (!mqString) {
			for (var key in this._mediaStack) {
				for (var i = 0; i < this._mediaStack[key].items.length; i++) {
					_temp.push(this._mediaStack[key].items[i]);
				}
			}
		} else {
			var key = this._purify(mqString);
			if (!this._mediaStack[key]) return;
			_temp = this._mediaStack[key].items;
		}

		// find namespace
		for (var i = 0; i < _temp.length; i++) {
			if (_temp[i].namespace === ns) {
				return _temp[i];
			}
		}
	};

	/**
	 * Adds the corresponding object to the media stack
	 *
	 * @param obj Object
	 * @return {*}
	 */
	Respond.to = function(obj) {
		if (obj.length) {
			for (var i = 0; i < obj.length; i++) {
				this.to(obj[i]);
			}
		} else {
			var _temp = this._retrieve(obj.namespace, obj.media);
			if (typeof _temp === 'undefined') {
				_temp = this._push(obj.media, obj)
							._retrieve(obj.namespace, obj.media);
				if (_temp.ready) {
					this._respond(this._mediaStack[this._purify(obj.media)].mql, obj.namespace);
					_temp.ready = false;
				}
			}
		}
		return this;
	};

	/**
	 * Must be called to mark all ready and to make the initial
	 * media respond call.
	 */
	Respond.ready = function() {
		for (var key in this._mediaStack) {
			this._respond(this._mediaStack[key].mql);
		}
		return this;
	};

	/**
	 * Returns the media stack object
	 *
	 * @param mqString String
	 * @return {*}
	 */
	Respond.getStack = function(mqString) {
		return this._mediaStack[mqString] || this._mediaStack;
	};

	/**
	 * Removes a objects from the media stack
	 *
	 * @param mqString String
	 * @param ns String (optional)
	 * @return {*}
	 */
	Respond.remove = function(mqString, ns) {
		var key = this._purify(mqString);

		if (!this._mediaStack.length && !this._mediaStack[key]) return;

		if (!ns) {
			this._mediaStack[key].mql.removeListener(respondTo);
			delete this._mediaStack[key];
			return this;
		}

		for (var i = 0; i < this._mediaStack[key].items.length; i++) {
			if (this._mediaStack[key].items[i].namespace === ns) {
				delete this._mediaStack[key].items[i];
				this._mediaStack[key].items.splice(i, 1);
			}
		}
		return this;
	};

	/**
	 * Calls a specific ns, type, media reference
	 *
	 * @param ns String
	 * @param type String
 	 * @param mqString String (optional)
	 * @return {*}
	 */
	Respond.call = function(ns, type, mqString) {
		try {
			if (mqString && type) {
				(this._retrieve(ns, mqString))[type](this);
			} else if (type) {
				(this._retrieve(ns))[type](this);
			} else {
				this._respond(this._mediaStack[this._purify((this._retrieve(ns)).media)].mql, ns);
			}
		} catch (e) {
			console.error(e);
		}
		return this;
	};

}).call(this);
