/**
 * Helpers for the squeak submission meta stuff
 */
Template.squeakSubmissionMeta.helpers({
  /**
   * Return the author of the Squeak
   * @return {User} 
   */
  getAuthor: function() { 
    return Meteor.users.findOne({_id: this.author});
  }
})