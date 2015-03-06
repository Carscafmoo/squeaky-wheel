/**
 * Watch button helpers (watch-button-template.html)
 * @author moore
 */
Template.watchAxleButton.helpers({
  /**
   * Is the current watching this Squeak?
   * @return Boolean
   */
  watching: function() { 
    var user = Meteor.userId();

    return (_.contains(this.watchers, user));
  }
})
/**
 * Clicking the watch button should sign up the user to receive Squeak notifications, and the opposite.
 * @author  moore
 */
Template.watchAxleButton.events({
  'click .watch-axle-button': function() { 
    Meteor.call('watchAxle', this._id, function(error) { 
      if (error) { throw error; }
    });
  },
  'click .unwatch-axle-button': function() { 
    Meteor.call('unwatchAxle', this._id, function(error) { 
      if (error) { throw error; }
    });
  }
});