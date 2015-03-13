/**
 * The search object
 */
var search = EasySearch.getComponentInstance({index: 'squeaks'});
/**
 * On create, set the Session variable indicating changes to options to be false
 * See _search-field-helpers.js for more info on where this is set to true
 *
 */
Template.searchPage.created = function() { 
  Session.set('retriggerSearch', false);
  clearInputError('searchFieldOptions');

  // Disable the other search input so people aren't tempted to use it... that makes things easier for us in terms of redirection, etc.
  $('#header-search-input').attr('disabled', 'disabled'); 
  $('#submit-header-search').addClass('disabled');
}
/**
 * Set the value for the search and go ahead and trigger search if anything's there
 */
Template.searchPage.rendered = function() { 
  var query = this.data.s.trim();
  
  $('.easy-search').val(query);
  if (query) { search.search(query); }

  // If this is the tutorial, don't let anyone click stuff
  if (Session.equals('isTutorial', true)) { 
    $('#search-view button').addClass('disabled');
    $('#search-view a').addClass('disabled');
    $('.easy-search').attr('disabled', true);
    $('.search-option-checkbox').attr('disabled', true);
    $('#search-option-dropdown button').removeClass('disabled'); // let this button hang out; its links are disabled anyway
  }
  
}
/**
 * Re-enable the header search when you navigate away
 */
Template.searchPage.destroyed = function() { 
  $('#header-search-input').removeAttr('disabled');
  $('#submit-header-search').removeClass('disabled');
}

/**
 * Helpers for the search page template (search-page-template.html)
 * @author moore
 */
Template.searchPage.helpers({
  /**
   * Are there more search results to go?
   *   Auto-return false if we're in tutorial mode.
   * @return {Boolean} 
   */
  hasMore: function() { 
    return (search.get('total') > search.get('currentLimit') && !Session.equals('isTutorial', true));
  },
  /**
   * What gets displayed in the load more button
   * @return {Integer} 
   */
  loadMoreText: function() { 
    var total = search.get('total');
    var limit = search.get('currentLimit');
    var next = ( total > (limit + 10) ? limit + 10 : total);

    return 'More (' + (limit + 1) + ' - ' + next + ' of ' + total + ')';
  },
  /**
   * return a list of fields to be searched
   * @return {[String]} 
   */
  fields: function() { 
    return ['Titles', 'Descriptions', 'Comments', 'People'];
  }  

});
/**
 * Event handlers for search page template (search-page-template.html)
 * Should be combined with axle search somehow perhaps?
 * @author moore
 */
Template.searchPage.events({
  /**
   * Don't let hitting enter on the search form do anything; the search is reactive anyway.
   */
  'submit #site-search-form': function(event) { 
    event.preventDefault();
  },
  /**
   * Clicking the view more button should allow you to... view... more...
   */
  'click .load-more a': function(event) { 
    EasySearch.changeLimit('squeaks', search.get('currentLimit') + 10); // Up the limit by 10 and search again
    search.triggerSearch();
  },
  /**
   * When someone triggers a *new* search, reset the limit to be 10
   */
  'keyup .easy-search': function(event) { 
    EasySearch.changeLimit('squeaks', 10);
  },
  /**
   * Trigger search on close of the search option dropdown if anything changed
   */
  'hide.bs.dropdown #search-option-dropdown': function(event) { 
    // Read in the session vars and figure out what fields to set in the search props before searching again
    var fields = [];
    if (Session.equals('searchForTitles', true)) { 
      fields.push('title'); 
    } 

    if (Session.equals('searchForDescriptions', true)) { 
      fields.push('description');
      fields.push('reCreation');
      fields.push('target');
    }

    if (Session.equals('searchForComments', true)) { 
      fields.push('comments.comment');
      fields.push('motions.comment');
      fields.push('motions.comments.comment');
    }

    if (Session.equals('searchForPeople', true)) { 
      fields.push('author');
      fields.push('mechanic');
      fields.push('comments.author');
      fields.push('motions.user');
      fields.push('motions.comments.author');
    }
    
    if (fields.length) { 
      EasySearch.changeProperty('squeaks', 'fields', fields);
      clearInputError('searchFieldOptions');
    } else { 
      addInputError({searchFieldOptions: 'You must specify at least one field to search!'});
      Session.set('retriggerSearch', false); // don't retrigger the search on that nonsense!
    }
    
    if (search.get('currentValue') && Session.equals('retriggerSearch', true)) { 
      EasySearch.changeLimit('squeaks', 10); // reset the limit before searching
      search.triggerSearch();
      Session.set('retriggerSearch', false);
    }
  }
});