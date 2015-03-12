/**
 * The name of the search index
 * @type {String}
 */
var searchIndex = 'axles';
/**
 * The search object
 */
var axleSearch = EasySearch.getComponentInstance({index: searchIndex});
/**
 * When the template is created, go ahead and deal with setting up all the search bar Session parameters
 */
Template.axleList.created = function() {
  Session.setDefault('axleListSorting', 'p'); // set sorting to popularity by default if it hasn't been set yet
  axleSearch.on('currentValue', function (val) {
    $('.easy-search').val(val); // I don't understand why I have to do this but putting it in the autocomlete d00d doesn't work
  });
}
/**
 * If it's the tutorial, don't allow people to search or actually trigger events
 */
Template.axleList.rendered = function() { 
  if (Session.equals('isTutorial', true)) { 
    $('.easy-search').val('Automobiles');
    axleSearch.search('Automobiles');
    
    $('.easy-search').attr('disabled', true); 
    $('.axle-list-sorting-link').addClass('disabled');
  }
  
  // Add typeahead to our easysearch
  $('.easy-search').typeahead({
    /**
     * Pull our values from the server
     */
    source: function(query, process) { 
      Meteor.call('queryAxleNames', query, function(err, success) { 
        if (err) { 
          throw(err);
        }
        
        process(success); 
      });
    }, 
    /**
     * Don't start autocompleting until we get 3 characters to match against
     * @type {Number}
     */
    minLength: 3,
    /**
     * Update the search value and go ahead and run your search
     */
    updater: function(item) { 
      if (item) { axleSearch.search(item); }
    }
  });
}
/**
 * Helpers for the axleList template (axle-list-template.html)
 * @author moore
 */
Template.axleList.helpers({
  /**
   * Return the name of search index
   * @return {String} 
   */
  searchIndex: function() { return searchIndex; },
  /**
   * Are there more search results to go?  If we're in tutorial mode, we don't.
   * @return {Boolean} [description]
   */
  hasMore: function() { 
    return (axleSearch.get('total') > axleSearch.get('currentLimit') && !Session.equals('isTutorial', true));
  },
  /**
   * What gets displayed in the load more button
   * @return {Integer} 
   */
  loadMoreText: function() { 
    var total = axleSearch.get('total');
    var limit = axleSearch.get('currentLimit'); // What's the *next* one going to be
    var next = ( total > (limit + 10) ? limit + 10 : total); // Next limit

    return "More (" + (limit + 1) + " - " + next + " of " + total + ")";
  },
  /** 
   * Whats the total #
   * @return {Integer}
   */
  totalCount: function() { 
    return axleSearch.get('total');
  }
});
/**
 * Events for the axleList template
 */
Template.axleList.events({
  /**
   * Clicking the view more button should allow you to... view... more...
   */
  'click .load-more a': function(event) { 
    EasySearch.changeLimit(searchIndex, axleSearch.get('currentLimit') + 10); // Up the limit by 10 and search again
    axleSearch.triggerSearch();
  },
  /**
   * When someone triggers a *new* search, reset the limit to be 10
   */
  'keyup .easy-search': function(event) { 
    EasySearch.changeLimit(searchIndex, 10);
  },
  /**
   * When you submit the easy-search d00d, don't actually submit
   */
  'submit #axle-search-form': function(event) { 
    event.preventDefault();
  },
  /**
   * Clicking on one of the links should just set the Session var accordingly and re-trigger the search
   */
  'click .axle-list-sorting-link': function(event) { 
    var newKey = $(event.currentTarget).attr('key');
    event.preventDefault();

    Session.set('axleListSorting', newKey);
    EasySearch.changeProperty(searchIndex, 'sortKey', newKey);
    EasySearch.changeLimit(searchIndex, 10); // reset that limit if we change the sorting
    axleSearch.triggerSearch();
  }
});