/**
 * Helpers for displaying individual comments
 * @author  moore
 */
Template._comment.helpers({
  getAuthor: function() {
    return Meteor.users.findOne({_id: this.author});
  }
});
