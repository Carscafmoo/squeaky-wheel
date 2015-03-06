/**
 * If we're in tutorial mode, kill this input
 */
Template.axleInput.rendered = function() { 
  if (Session.equals('isTutorial', true)) { $('#axle-restriction-input').attr('disabled', true); }
  // Set up autocomplete on this bad boy
  $('#axle-restriction-input').typeahead({
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
      $('#axle-restriction-input').val(item);
      if (item) { $('#axle-restriction-form').submit(); }
    }
  });
}
/**
 * Helpers for the whichSqueaks template
 */
Template.axleInput.helpers({
  current: function() { 
    return Session.get('squeakListAxle');
  }
});
/** 
 * Event handlers
 * @author  moore
 */
Template.axleInput.events({
  /**
   * Listen for form enter if users are searching by axle
   */
  'submit #axle-restriction-form': function(event) { 
    event.preventDefault();
    var newAxle = $('#axle-restriction-input').val().trim();
    
    if (!newAxle) { Session.set('squeakListAxle', null); }
    else { Session.set('squeakListAxle', newAxle); }
  },
  /**
   * Submit the form on enter or on 
   */
});