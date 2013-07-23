(function() {
  var __slice = [].slice,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  (function($, window, document) {
    var ImmyTypeahead, defaults, pluginName;
    pluginName = "immytypeahead";
    defaults = {
      choices: [],
      maxResults: 50,
      filterFn: function(query) {
        return function(choice) {
          return choice.text.toLowerCase().indexOf(query.toLowerCase()) >= 0;
        };
      },
      formatChoice: function(choice, query) {
        var head, i, matchedText, tail, _ref;
        i = choice.text.toLowerCase().indexOf(query.toLowerCase());
        if (i >= 0) {
          matchedText = choice.text.slice(i, i + query.length);
          _ref = choice.text.split(matchedText), head = _ref[0], tail = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
          return "" + head + "<span class='highlight'>" + matchedText + "</span>" + (tail.join(matchedText));
        } else {
          return choice.text;
        }
      }
    };
    ImmyTypeahead = (function() {
      function ImmyTypeahead(element, options) {
        this.reposition = __bind(this.reposition, this);
        this.hide = __bind(this.hide, this);
        this.doSelection = __bind(this.doSelection, this);
        this.doQuery = __bind(this.doQuery, this);
        var self, _base;
        self = this;
        this.element = $(element);
        this.element.addClass(pluginName);
        this._defaults = defaults;
        this._name = pluginName;
        this.options = $.extend({}, defaults, options);
        this.choices = this.options.choices;
        this.queryResultArea = $("<div class='" + pluginName + "_results'></div>");
        if (typeof (_base = this.queryResultArea).scrollLock === "function") {
          _base.scrollLock();
        }
        this._val = this.element.val();
        this.queryResultArea.on('click', "li." + pluginName + "_choice", function() {
          var value;
          value = $(this).data('value');
          self._val = value;
          self.element.val(value);
          self.element.trigger('change');
          self.hideResults();
          return self.element.focus();
        });
        this.queryResultArea.on('mouseenter', "li." + pluginName + "_choice", function() {
          self.queryResultArea.find("li." + pluginName + "_choice.active").removeClass('active');
          return $(this).addClass('active');
        });
        this.element.on('keyup change search', this.doQuery);
        this.element.on('keydown', this.doSelection);
        $('body').on('click', this.hide);
        $(window).on('resize scroll', this.reposition);
      }

      ImmyTypeahead.prototype.doQuery = function() {
        var query;
        query = this.element.val();
        if (this._val !== query) {
          this._val = query;
          if (query === '') {
            return this.hideResults();
          } else {
            return this.insertFilteredChoiceElements(query);
          }
        }
      };

      ImmyTypeahead.prototype.doSelection = function(e) {
        if (e.which === 27) {
          this.hideResults();
        }
        if (this.queryResultArea.is(':visible')) {
          switch (e.which) {
            case 9:
              return this.selectHighlightedChoice();
            case 13:
              e.preventDefault();
              return this.selectHighlightedChoice();
            case 38:
              e.preventDefault();
              this.highlightPreviousChoice();
              return this.scroll();
            case 40:
              e.preventDefault();
              this.highlightNextChoice();
              return this.scroll();
          }
        }
      };

      ImmyTypeahead.prototype.hide = function() {
        if (this.queryResultArea.is(':visible')) {
          return this.hideResults();
        }
      };

      ImmyTypeahead.prototype.reposition = function() {
        if (this.queryResultArea.is(':visible')) {
          return this.positionResultsArea();
        }
      };

      ImmyTypeahead.prototype.insertFilteredChoiceElements = function(query) {
        var filteredChoices, format, list, results, truncatedChoices;
        if (query === '') {
          filteredChoices = this.choices;
        } else {
          filteredChoices = this.choices.filter(this.options.filterFn(query));
        }
        truncatedChoices = filteredChoices.slice(0, this.options.maxResults);
        format = this.options.formatChoice;
        results = truncatedChoices.map(function(choice) {
          var li;
          li = $("<li class='" + pluginName + "_choice'></li>");
          li.attr('data-value', choice.text);
          li.html(format(choice, query));
          return li;
        });
        if (results.length === 0) {
          return this.queryResultArea.empty().detach();
        } else {
          results[0].addClass('active');
          list = $('<ul></ul>').append(results);
          this.queryResultArea.empty().append(list);
          return this.showResults();
        }
      };

      ImmyTypeahead.prototype.scroll = function() {
        var highlightedChoice, highlightedChoiceBottom, highlightedChoiceHeight, highlightedChoiceTop, resultsBottom, resultsHeight, resultsTop;
        resultsHeight = this.queryResultArea.height();
        resultsTop = this.queryResultArea.scrollTop();
        resultsBottom = resultsTop + resultsHeight;
        highlightedChoice = this.getHighlightedChoice();
        if (highlightedChoice == null) {
          return true;
        }
        highlightedChoiceHeight = highlightedChoice.outerHeight();
        highlightedChoiceTop = highlightedChoice.position().top + resultsTop;
        highlightedChoiceBottom = highlightedChoiceTop + highlightedChoiceHeight;
        if (highlightedChoiceTop < resultsTop) {
          this.queryResultArea.scrollTop(highlightedChoiceTop);
        }
        if (highlightedChoiceBottom > resultsBottom) {
          return this.queryResultArea.scrollTop(highlightedChoiceBottom - resultsHeight);
        }
      };

      ImmyTypeahead.prototype.positionResultsArea = function() {
        var inputHeight, inputOffset, inputWidth, resultsBottom, resultsHeight, windowBottom;
        inputOffset = this.element.offset();
        inputHeight = this.element.outerHeight();
        inputWidth = this.element.outerWidth();
        resultsHeight = this.queryResultArea.outerHeight();
        resultsBottom = inputOffset.top + inputHeight + resultsHeight;
        windowBottom = $(window).height() + $(window).scrollTop();
        this.queryResultArea.outerWidth(inputWidth);
        this.queryResultArea.css({
          left: inputOffset.left
        });
        if (resultsBottom > windowBottom) {
          return this.queryResultArea.css({
            top: inputOffset.top - resultsHeight
          });
        } else {
          return this.queryResultArea.css({
            top: inputOffset.top + inputHeight
          });
        }
      };

      ImmyTypeahead.prototype.getHighlightedChoice = function() {
        var choice;
        choice = this.queryResultArea.find("li." + pluginName + "_choice.active");
        if (choice.length === 1) {
          return choice;
        } else {
          return null;
        }
      };

      ImmyTypeahead.prototype.highlightNextChoice = function() {
        var highlightedChoice, nextChoice;
        highlightedChoice = this.getHighlightedChoice();
        if (highlightedChoice != null) {
          nextChoice = highlightedChoice.next("li." + pluginName + "_choice");
          if (nextChoice.length === 1) {
            highlightedChoice.removeClass('active');
            return nextChoice.addClass('active');
          }
        }
      };

      ImmyTypeahead.prototype.highlightPreviousChoice = function() {
        var highlightedChoice, previousChoice;
        highlightedChoice = this.getHighlightedChoice();
        if (highlightedChoice != null) {
          previousChoice = highlightedChoice.prev("li." + pluginName + "_choice");
          if (previousChoice.length === 1) {
            highlightedChoice.removeClass('active');
            return previousChoice.addClass('active');
          }
        }
      };

      ImmyTypeahead.prototype.selectHighlightedChoice = function() {
        var highlightedChoice, value;
        highlightedChoice = this.getHighlightedChoice();
        if (highlightedChoice != null) {
          value = highlightedChoice.data('value');
          this._val = value;
          this.element.val(value);
          this.element.trigger('change');
          return this.hideResults();
        }
      };

      ImmyTypeahead.prototype.showResults = function() {
        $('body').append(this.queryResultArea);
        this.scroll();
        return this.positionResultsArea();
      };

      ImmyTypeahead.prototype.hideResults = function() {
        return this.queryResultArea.detach();
      };

      ImmyTypeahead.prototype.selectChoiceByValue = function(value) {
        this.element.val(value);
        return this.element.trigger('change');
      };

      ImmyTypeahead.prototype.publicMethods = ['getChoices', 'setChoices', 'destroy'];

      ImmyTypeahead.prototype.getChoices = function() {
        return this.choices;
      };

      ImmyTypeahead.prototype.setChoices = function(newChoices) {
        this.choices = newChoices;
        if (this.selectedChoice != null) {
          this.selectChoiceByValue(this.selectedChoice.value);
        }
        return newChoices;
      };

      ImmyTypeahead.prototype.destroy = function() {
        this.element.off('keyup change search', this.doQuery);
        this.element.off('keydown', this.doSelection);
        $('body').off('click', this.hide);
        $(window).off('resize scroll', this.reposition);
        this.element.removeClass(pluginName);
        this.queryResultArea.remove();
        return $.removeData(this.element[0], "plugin_" + pluginName);
      };

      return ImmyTypeahead;

    })();
    return $.fn[pluginName] = function(options) {
      var args, outputs;
      args = Array.prototype.slice.call(arguments, 1);
      outputs = [];
      this.each(function() {
        var method, plugin;
        if ($.data(this, "plugin_" + pluginName)) {
          if ((options != null) && typeof options === 'string') {
            plugin = $.data(this, "plugin_" + pluginName);
            method = options;
            if (__indexOf.call(plugin.publicMethods, method) >= 0) {
              return outputs.push(plugin[method].apply(plugin, args));
            } else {
              throw new Error("" + pluginName + " has no method '" + method + "'");
            }
          }
        } else {
          return outputs.push($.data(this, "plugin_" + pluginName, new ImmyTypeahead(this, options)));
        }
      });
      return outputs;
    };
  })(jQuery, window, document);

}).call(this);
