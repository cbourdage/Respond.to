;
/**
 * Respond.to.js
 * Copyright 2013 Collin Bourdage.
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
	 * @param key String
	 * @param obj Object
	 * @return {*}
	 * @private
	 */
	Respond._push = function(key, obj) {
		var mqString = key;
		key = this._purify(key);
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

		// If ie8, lets run the "default" condition - we ain't supportin' it, sorry.
		if (navigator.userAgent.match(/MSIE 8.0/)) {
			for (var i = 0; i < this._mediaStack[key].items.length; i++) {
				var _item = this._mediaStack[key].items[i],
					_default = _item['default'] || 'if';
				if (typeof _item[_default] === 'function') {
					if (!namespace || _item['namespace'] == namespace) {
						_item[_default]();
					}
				}
			}
			return;
		}

		if (!this._mediaStack[key]) return;

		if (mql.matches) {
			for (var i = 0; i < this._mediaStack[key].items.length; i++) {
				var _item = this._mediaStack[key].items[i];
				if (typeof _item['if'] === 'function') {
					if (!namespace || _item['namespace'] == namespace) {
						_item['if']();
					}
				}
			}
		} else {
			for (var i = 0; i < this._mediaStack[key].items.length; i++) {
				var _item = this._mediaStack[key].items[i];
				if (typeof _item['else'] === 'function') {
					if (!namespace || _item['namespace'] == namespace) {
						_item['else']();
					}
				}
			}
		}
	};

	/**
	 * Returns a object based on a namespace and an optional
	 * media index.
	 *
	 * @param ns String
	 * @param key String
	 * @return {*}
	 * @private
	 */
	Respond._retrieve = function(ns, key) {
		if (typeof this._mediaStack === 'undefined') return;

		var _temp = [];
		if (!key) {
			for (var key in this._mediaStack) {
				for (var i = 0; i < this._mediaStack[key].items.length; i++) {
					_temp.push(this._mediaStack[key].items[i]);
				}
			}
		} else {
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
			if (typeof this._retrieve(obj.namespace, obj.media) === 'undefined') {
				this._push(obj.media, obj);
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
	};

	/**
	 * Returns the media stack object
	 *
	 * @param media String
	 * @return {*}
	 */
	Respond.getStack = function(media) {
		return this._mediaStack[media] || this._mediaStack;
	};

	/**
	 * Removes a objects from the media stack
	 * @todo finish object removal
	 *
	 * @param media String
	 * @param ns String (optional)
	 * @return {*}
	 */
	Respond.remove = function(media, ns) {
		//media = this._purify(media);
		if (!this._mediaStack.length && !this._mediaStack[media]) return;

		if (!ns) {
			this._mediaStack[media].mql.removeListener(respondTo);
			delete this._mediaStack[media];
			return this;
		}

		for (var i = 0; i < this._mediaStack[media].items.length; i++) {
			if (this._mediaStack[media].items[i].namespace === ns) {
				delete this._mediaStack[media].items[i];
				this._mediaStack[media].items.splice(i, 1);
				//this._mediaStack[media].items.length--;
			}
		}
		return this;
	};

	/**
	 * @todo finish the call
	 *
	 * @param ns String
	 * @param type String
 	 * @param media String (optional)
	 * @return {*}
	 */
	Respond.call = function(ns, type, media) {
		try {
			if (media) {
				(this._retrieve(ns, media))[type](this);
			} else if(type) {
				(this._retrieve(ns))[type](this);
			} else {
				this._respond(this._mediaStack[(this._retrieve(ns)).media].mql, ns);
			}
		} catch (e) {
			console.error(e);
		}
		return this;
	};

}).call(this);
