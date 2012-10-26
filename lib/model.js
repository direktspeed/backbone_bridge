steal('can/util', 'can/model', './underscore.js', function (can) {
	var _result = function (object, property) {
		if (object == null) return null;
		var value = object[property];
		return can.isFunction(value) ? value.call(object) : value;
	};

	can.extend(can.Observe.prototype, {
		on : function (event, cb) {
			var self = this,
				split = event.split(':');

			this.bind(split[split.length - 1], function (ev, newVal, oldVal) {
				cb(self, arguments[split.length === 1 ? 3 : 1]);
			});
		}
	});

	var changeHandler = function (ev, attr, how, to, from) {
		var target = ev.target;
		target.changed = ev.target.changed || {};
		target.changed[attr] = to;
		target._previousAttributes[attr] = from;
		can.trigger(target, 'change:' + attr, target, to);
	}

	var Model = can.Model({}, {
		setup : function (attributes, options) {
			var attrs = attributes || {},
				args;

			if (options && options.collection) {
				this.collection = options.collection;
			}

			if (this.defaults || this.constructor.defaults) {
				attrs = _.extend({}, this.defaults || this.constructor.defaults, attrs);
			}
			if (options && options.parse) {
				attrs = this.parse(attrs);
			}

			this.bind('change', changeHandler);

			args = [attrs, options];
			this._previousAttributes = {};
			can.Model.prototype.setup.apply(this, args);
			return args;
		},

		init : function (attributes, options) {
			if (this.initialize) this.initialize.apply(this, arguments);
		},

		clear : function (options) {
			var self = this;
			this.each(function (value, name) {
				self.unset(name);
			});
			return this;
		},

		escape : function (attr) {
			return can.esc(this.attr(attr));
		},

		has : function (attr) {
			return this.attr(attr) != null;
		},

		toJSON : function () {
			return this.serialize();
		},

		parse : function (obj) {
			return obj;
		},

		clone : function () {
			return new this.constructor(this.serialize());
		},

		url : function () {
			var base = _result(this, 'urlRoot') || _result(this.collection, 'url') || urlError();
			if (this.isNew()) return base;
			return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id);
		},

		unset : function (attr, options) {
			options = _.extend({}, options, {unset : true});
			return this.set(attr, null, options);
		},

		set : function (key, val, options) {
			var attrs;
			if (key == null) return this;

			// Handle both `"key", value` and `{key: value}` -style arguments.
			if (_.isObject(key)) {
				attrs = key;
				options = val;
			} else {
				(attrs = {})[key] = val;
			}


			if (!this._validate(attrs, options)) return false;
			// TODO options
			if (options && options.unset) {
				this.removeAttr(key);
			} else {
				this.attr(attrs);
			}
			return this;
		},

		previousAttributes : function () {
			return _.clone(this._previousAttributes);
		},

		previous : function (attr) {
			if (attr == null) return null;
			return this._previousAttributes[attr];
		},

		changedAttributes : function (diff) {
			if (!diff) return this.hasChanged() ? _.clone(this.changed) : false;
			var val, changed = false, old = this._previousAttributes;
			for (var attr in diff) {
				if (_.isEqual(old[attr], (val = diff[attr]))) continue;
				(changed || (changed = {}))[attr] = val;
			}
			return changed;
		},

		hasChanged : function (attr) {
			if (attr == null) return !_.isEmpty(this.changed);
			return _.has(this.changed, attr);
		},

		validate : function () {
		},

		_validate : function (attrs, options) {
			if (options && options.silent || !this.validate) return true;
			attrs = _.extend({}, this.serialize(), attrs);
			var error = this.validate(attrs, options);
			if (!error) return true;
			if (options && options.error) options.error(this, error, options);
			can.trigger(this, 'error', this, error, options);
			return false;
		}
	});

	Model.prototype.idAttribute = can.Model.id;
	Model.prototype.on = can.Observe.prototype.on;
	Model.prototype.get = can.Model.prototype.attr;
	Model.prototype.attributes = can.Model.prototype.attr;

	var urlError = function () {
		throw new Error('A "url" property or function must be specified');
	};

	return Model;
})