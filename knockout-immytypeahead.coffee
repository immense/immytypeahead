$ ->
  ko.bindingHandlers.immytypeahead =
    init: (element, valueAccessor, allBindingsAccessor) ->
      choices = ko.utils.unwrapObservable valueAccessor()
      options = (ko.utils.unwrapObservable allBindingsAccessor().immytypeahead_options) or {}
      options.choices = choices
      elem = $ element
      elem.immytypeahead options
      ko.utils.domNodeDisposal.addDisposeCallback element, -> $(element).immytypeahead 'destroy'

    update: (element, valueAccessor) ->
      choices = ko.utils.unwrapObservable valueAccessor()
      elem = $ element
      elem.immytypeahead 'setChoices', choices