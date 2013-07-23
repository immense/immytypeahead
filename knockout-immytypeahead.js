(function() {
  $(function() {
    return ko.bindingHandlers.immytypeahead = {
      init: function(element, valueAccessor, allBindingsAccessor) {
        var choices, elem, options;
        choices = ko.utils.unwrapObservable(valueAccessor());
        options = (ko.utils.unwrapObservable(allBindingsAccessor().immytypeahead_options)) || {};
        options.choices = choices;
        elem = $(element);
        elem.immytypeahead(options);
        return ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
          return $(element).immytypeahead('destroy');
        });
      },
      update: function(element, valueAccessor) {
        var choices, elem;
        choices = ko.utils.unwrapObservable(valueAccessor());
        elem = $(element);
        return elem.immytypeahead('setChoices', choices);
      }
    };
  });

}).call(this);
