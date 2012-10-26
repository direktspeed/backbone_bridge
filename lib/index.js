steal('./events', './model', './collection', function(Events, Model, Collection) {
	window.Backbone = window.Backbone || {};
	window.Backbone = {
		Events : Events,
		Model : Model,
		Collection : Collection
	}
	return window.Backbone;
});