steal('can/control', 
	  'can/model',
	  'can/observe',
	  'can/observe/list',
	  'can/util/string')
.then(function(Control, Model){
	
	window.Backbone = {};
	window._ = {};

	// ========================== Underscore ===========================

	_.extend = can.extend;

	Backbone.noConflict = $.noConflict;

	// ============================= Events =============================

	Backbone.Events = {};
	Backbone.Events.on = null;
	Backbone.Events.off = null;
	Backbone.Events.trigger = null;

	// =========================== Collection ==========================

	Backbone.Collection = can.Observe.List;
	Backbone.Collection.prototype.add = can.Observe.List.push;

	// ============================== View =============================

	Backbone.View = can.Control;
	Backbone.View.prototype.template = can.view;

	// ============================= Model =============================

	Backbone.Model = can.Model;
	Backbone.Model.initialize = can.Model.init;
	Backbone.Model.defaults = can.Model.defaults;

	can.extend(can.Observe.prototype, {
		on:function(event,cb){
			var self = this,
				split = event.split(':');

			this.bind(split[split.length - 1], function(ev, newVal, oldVal){
				cb(self, arguments[split.length === 1 ? 3 : 1]);
			});
		}
	});

	var old = can.Model.prototype.setup;
	can.extend(can.Model.prototype, {

		setup:function(){
			this.cid = uniqueId('c');
			old.apply(this,arguments);
		},

		clear:function(attrs){
			var attrs = this.attr();
			for(var i in attrs){
				this.attr(attrs, undefined);
			}
		},

		escape:function(attr){
			return can.esc(this.attr(attr));
		},

		has:function(attr){
			return this.attr(attr) != undefined;
		},

		unset:function(attr){
			// Remove an attribute by deleting it from the internal attributes 
			// hash. Fires a "change" event unless silent is passed as an option.
		},

		toJSON:function(){
			return can.toJSON(this.attr());
		},

		parse:function(json){
			return can.parseJSON(json);
		}
	});
	
	Backbone.Model.prototype.idAttribute = can.Model.id;
	Backbone.Model.prototype.on = can.Observe.prototype.on;
	Backbone.Model.prototype.set = can.Model.prototype.attr;
	Backbone.Model.prototype.get = can.Model.prototype.attr;
	Backbone.Model.prototype.attributes = can.Model.prototype.attr;

	$.each(['isNew','clear','escape','has','unset','toJSON', 'save', 'destroy', 'cid', 'parse'],function(i,func){
		Backbone.Model.prototype[func] = can.Model.prototype[func];
	});

});