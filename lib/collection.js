steal('can/util', 'can/model', function(can) {
	var Collection = can.Observe.List({}, {
		add : function() {
			var self = this;
			this.push.apply(this, arguments);
			can.each(arguments, function(arg) {
				// We don't want binding on this collection
				arg.collection = self;
			});
		}
	});

	return Collection;
});