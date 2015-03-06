/**
 * Automatically acknowledge any activities displayed (if you're not in the tutorial)
 * @author  moore
 */
Template._activity.destroyed = function() { 
  if (!this.data.activity.ack && Meteor.userId() && !Session.equals('isTutorial', true)) { 
    Meteor.call('ackActivity', this.data.activity._id);
  }
}
/**
 * Event handlers for _activities
 */
Template._activity.events({ 
  'click .axle-link': function(event) { 
    // Set the Sesh info as necessary:
    Session.set('squeakListAxle', $(event.currentTarget).text());
  }
});