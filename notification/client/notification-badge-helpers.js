/**
 * Helpers for the notificationBadge template (notification-badge-template.html)
 * @author  moore
 */
Template.notificationBadge.helpers({
  /**
   * Determine the number of unread notifications a user has
   * @return {String} The number of unread notifications, as a String
   */
  notificationCount: function() { 
    notificationCount = Activities.find({users: {userId: Meteor.userId(), ack: false}}).count();
    return (notificationCount > 0 ? notificationCount : '');
  }
});
