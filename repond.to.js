(function () {
	// Save reference to the global object.
	/** @var window */
	var root = this;
	var Respond = root.Respond = {};
	Respond.debug = true;
	Respond.version = '0.1.1';

	/**
	 * pushes a new object based on a key onto the media stack
	 *
	 * @param key String
	 * @param obj Object
	 * @return {*}
	 * @private
	 */
	Respond._push = function (key, obj) {
		var mqString = key;
		key = this._purify(key);
		this._mediaStack || (this._mediaStack = {});
		this._mediaStack[key] || (this._mediaStack[key] = {mql: null, items: []});

		/*if (!root.matchMedia) {
			console.log('ie?');
			return this;
		}*/

		if (!this._mediaStack[key].mql) {
			this._mediaStack[key].mql = root.matchMedia(mqString);
			this._mediaStack[key].mql.addListener(respondTo);

			/**
			 * store array key on the mql object for lookup later because of an
			 * inconsistancy with rules:
			 *      screen and (min-width: 700px) and (max-width: 900px)
			 * will get convered to
			 *      screen and (max-width: 900px) and (min-width: 700px)
			 * when instantiating the matchMedia object.
			 */
			this._mediaStack[key].mql.keyValue = key;
		}

		obj.hasMatched || (obj.hasMatched = false);
		obj.hasNotMatched || (obj.hasNotMatched = false);

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
	}

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
	 * @param mql window.MediaQueryList
	 * @private
	 */
	Respond._respond = function (mql, namespace) {
		var key = mql.keyValue;

		if (navigator.userAgent.match(/MSIE 9.0/)) {
			key = this._purify(mql.media);
		}

		if (navigator.userAgent.match(/MSIE 8.0/)) {
			for (var i = 0; i < this._mediaStack[key].items.length; i++) {
				var _item = this._mediaStack[key].items[i];
				if (typeof _item['if'] === 'function') {
					if (!namespace) {
						_item['if']();
					} else if (_item['namespace'] == namespace) {
						_item['if']();
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
					if (!namespace) {
						_item['if']();
					} else if (_item['namespace'] == namespace) {
						_item['if']();
					}
				}
			}
		} else {
			for (var i = 0; i < this._mediaStack[key].items.length; i++) {
				var _item = this._mediaStack[key].items[i];
				if (typeof _item['else'] === 'function') {
					if (!namespace) {
						_item['else']();
					} else if (_item['namespace'] == namespace) {
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
	Respond._retrieve = function (ns, key) {
		if (typeof this._mediaStack === 'undefined') {
			return;
		}

		var _temp = [];
		if (!key) {
			for (var key in this._mediaStack) {
				for (var i = 0; i < this._mediaStack[key].items.length; i++) {
					_temp.push(this._mediaStack[key].items[i]);
				}
			}
		} else {
			if (!this._mediaStack[key]) {
				return;
			}
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
	Respond.to = function (obj) {
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
	Respond.ready = function () {
		for (var key in this._mediaStack) {
			this._respond(this._mediaStack[key].mql);
		}
	}

	/**
	 * Returns the media stack object
	 *
	 * @param media String
	 * @return {*}
	 */
	Respond.getStack = function (media) {
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
	Respond.remove = function (media, ns) {
		//media = this._purify(media);
		if (!this._mediaStack.length && !this._mediaStack[media]) {
			return;
		}

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
	Respond.call = function (ns, type, media) {
		try {
			if (media) {
				(this._retrieve(ns, media))[type](this);
			} else if(type) {
				(this._retrieve(ns))[type](this);
			} else {
				console.log(this._mediaStack[(this._retrieve(ns)).media]);
				this._respond(this._mediaStack[(this._retrieve(ns)).media].mql, ns);
			}
		} catch (e) {
			console.error(e);
		}
		return this;
	};

}).call(this);
