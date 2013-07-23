(($, window, document) ->

  pluginName = "immytypeahead"
  defaults =
    choices: []
    maxResults: 50
    filterFn: (query) ->
      # default filter function does case insensitive "contains" matching
      (choice) ->
        choice.text.toLowerCase().indexOf(query.toLowerCase()) >= 0
    formatChoice: (choice, query) ->
      i = choice.text.toLowerCase().indexOf query.toLowerCase()
      if i >= 0 # should always be since we only attempt to highlight things that passed the filterFn
        matchedText = choice.text[i...i+query.length]
        [head, tail...] = choice.text.split(matchedText)
        "#{head}<span class='highlight'>#{matchedText}</span>#{tail.join matchedText}"
      else
        choice.text

  # addCommas = (nStr) ->
  #   nStr += '';
  #   x = nStr.split '.'
  #   x1 = x[0]
  #   x2 = if x.length > 1 then '.' + x[1] else ''
  #   rgx = /(\d+)(\d{3})/
  #   while (rgx.test(x1))
  #     x1 = x1.replace rgx, '$1' + ',' + '$2'
  #   return x1 + x2

  class ImmyTypeahead

    constructor: (element, options) ->
      self = @

      @element = $ element
      @element.addClass pluginName

      @_defaults = defaults
      @_name = pluginName

      @options = $.extend {}, defaults, options
      @choices = @options.choices

      @queryResultArea = $ "<div class='#{pluginName}_results'></div>"
      @queryResultArea.scrollLock?()

      @_val = @element.val() # to keep track of what WAS in the text box

      @queryResultArea.on 'click', "li.#{pluginName}_choice", ->
        value = $(@).data 'value'
        self._val = value
        self.element.val value
        self.element.trigger 'change'
        self.hideResults()
        self.element.focus()

      @queryResultArea.on 'mouseenter', "li.#{pluginName}_choice", ->
        self.queryResultArea.find("li.#{pluginName}_choice.active").removeClass 'active'
        $(@).addClass 'active'

      @element.on 'keyup change search', @doQuery
      @element.on 'keydown', @doSelection

      $('body').on 'click', @hide
      $(window).on 'resize scroll', @reposition

    ###################
    # event listeners #
    ###################

    # @element.on 'keyup change search'
    # perform a query on the choices
    doQuery: =>
      query = @element.val()
      if @_val isnt query # user has changed input value, do a search and display the search results
        @_val = query
        if query is ''
          @hideResults()
        else
          @insertFilteredChoiceElements query

    # @element.on 'keydown'
    # select the highlighted choice
    doSelection: (e) =>
      if e.which is 27 # escape
        @hideResults()
      if @queryResultArea.is(':visible')
        switch e.which
          when 9 # tab
            @selectHighlightedChoice()
          when 13 # enter
            e.preventDefault() # prevent form from submitting (i think; test this!)
            @selectHighlightedChoice()
          when 38 # up
            e.preventDefault() # prevent cursor from moving
            @highlightPreviousChoice()
            @scroll()
          when 40 # down
            e.preventDefault() # prevent cursor from moving
            @highlightNextChoice()
            @scroll()

    # $('body').on 'click'
    # hide results after losing focus
    hide: =>
      if @queryResultArea.is(':visible')
        @hideResults()

    # $(window).on 'resize'
    # if visible, re-position the results area on window resize
    reposition: =>
      if @queryResultArea.is(':visible')
        @positionResultsArea()

    ###################
    # private methods #
    ###################

    insertFilteredChoiceElements: (query) ->
      if query is ''
        filteredChoices = @choices
      else
        filteredChoices = (@choices.filter @options.filterFn query)
      truncatedChoices = filteredChoices[0...@options.maxResults]

      format = @options.formatChoice

      results = truncatedChoices.map (choice) ->
        li = $ "<li class='#{pluginName}_choice'></li>"
        li.attr 'data-value', choice.text
        li.html format choice, query
        return li

      if results.length is 0
        @queryResultArea
          .empty()
          .detach()
      else
        results[0].addClass 'active'

        list = $('<ul></ul>')
          .append(results)

        @queryResultArea
          .empty()
          .append(list)

        @showResults()

    scroll: ->
      resultsHeight = @queryResultArea.height()
      resultsTop = @queryResultArea.scrollTop()
      resultsBottom = resultsTop + resultsHeight

      highlightedChoice = @getHighlightedChoice()
      return true if not highlightedChoice?
      highlightedChoiceHeight = highlightedChoice.outerHeight()
      highlightedChoiceTop = highlightedChoice.position().top + resultsTop
      highlightedChoiceBottom = highlightedChoiceTop + highlightedChoiceHeight

      if highlightedChoiceTop < resultsTop
        @queryResultArea.scrollTop highlightedChoiceTop
      if highlightedChoiceBottom > resultsBottom
        @queryResultArea.scrollTop highlightedChoiceBottom - resultsHeight

    positionResultsArea: ->

      # gather some info
      inputOffset = @element.offset()
      inputHeight = @element.outerHeight()
      inputWidth = @element.outerWidth()
      resultsHeight = @queryResultArea.outerHeight()
      resultsBottom = inputOffset.top + inputHeight + resultsHeight
      windowBottom = $(window).height() + $(window).scrollTop()

      # set the dimmensions and position
      @queryResultArea.outerWidth inputWidth
      @queryResultArea.css left: inputOffset.left

      if resultsBottom > windowBottom
        @queryResultArea.css top: inputOffset.top - resultsHeight
      else
        @queryResultArea.css top: inputOffset.top + inputHeight

    getHighlightedChoice: ->
      choice = @queryResultArea.find("li.#{pluginName}_choice.active")
      if choice.length is 1
        choice
      else
        null

    highlightNextChoice: ->
      highlightedChoice = @getHighlightedChoice()
      if highlightedChoice?
        nextChoice = highlightedChoice.next("li.#{pluginName}_choice")
        if nextChoice.length is 1
          highlightedChoice.removeClass 'active'
          nextChoice.addClass 'active'

    highlightPreviousChoice: ->
      highlightedChoice = @getHighlightedChoice()
      if highlightedChoice?
        previousChoice = highlightedChoice.prev("li.#{pluginName}_choice")
        if previousChoice.length is 1
          highlightedChoice.removeClass 'active'
          previousChoice.addClass 'active'

    selectHighlightedChoice: ->
      highlightedChoice = @getHighlightedChoice()
      if highlightedChoice?
        value = highlightedChoice.data 'value'
        @_val = value
        @element.val value
        @element.trigger 'change'
        @hideResults()

    # show the results area
    showResults: ->
      $('body').append @queryResultArea
      @scroll()
      @positionResultsArea()

    # hide the results area
    hideResults: ->
      @queryResultArea.detach()

    # select the first choice with matching value
    # Note: values should be unique
    selectChoiceByValue: (value) ->
      @element.val value
      @element.trigger 'change'

    ####################
    # "public" methods #
    ####################

    publicMethods: ['getChoices', 'setChoices', 'destroy']

    # return array of choices
    getChoices: ->
      @choices

    # update the array of choices
    setChoices: (newChoices) ->
      @choices = newChoices
      if @selectedChoice?
        @selectChoiceByValue @selectedChoice.value
      newChoices

    # destroy this instance of the plugin
    destroy: ->
      #remove event listeners
      @element.off 'keyup change search', @doQuery
      @element.off 'keydown', @doSelection

      $('body').off 'click', @hide
      $(window).off 'resize scroll', @reposition

      @element.removeClass pluginName

      @queryResultArea.remove() # removes query result area and all related event listeners
      $.removeData @element[0], "plugin_#{pluginName}" # remove reference to plugin instance

  $.fn[pluginName] = (options) ->
    args = Array.prototype.slice.call(arguments, 1)
    outputs = []
    @each ->
      if $.data(@, "plugin_" + pluginName)
        if options? and typeof options is 'string'
          plugin = $.data(@, "plugin_" + pluginName)
          method = options
          if method in plugin.publicMethods
            outputs.push plugin[method].apply plugin, args
          else
            throw new Error "#{pluginName} has no method '#{method}'"
      else
        outputs.push $.data @, "plugin_" + pluginName, new ImmyTypeahead @, options

    return outputs

) jQuery, window, document