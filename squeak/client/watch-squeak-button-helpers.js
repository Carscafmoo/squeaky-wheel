/**
 * Watch button helpers (watch-button-template.html)
 * @author moore
 */
Template.watchSqueakButton.helpers({
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
Template.watchSqueakButton.events({
  'click .watch-squeak-button': function() { 
    Meteor.call('watchSqueak', this._id, function(error) { 
      if (error) { throw error; }
    });
  },
  'click .unwatch-squeak-button': function() { 
    Meteor.call('unwatchSqueak', this._id, function(error) { 
      if (error) { throw error; }
    });
  }
});