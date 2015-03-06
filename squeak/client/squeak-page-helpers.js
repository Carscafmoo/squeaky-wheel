/**
 * Helpers for the squeakPage template (squeak-page-template.html)
 * @author  moore
 */
Template.squeakPage.helpers({
  /**
   * Determine if the current user is the author of the Squeak in question
   * @return {Boolean}
   */
  isAuthor: function() { 
    return (this.author === Meteor.userId());
  },
  /**
   * Return an array of comment IDs
   * @return {[String]}
   */
  commentIds: function() { 
    return this.comments.map(function(elem) { return elem._id; }); // return only the comment Ids.
  },
  /**
   * Can we edit this Squeak at all (submit comments, etc) -- or, better yet, is it NOT closed?
   * @return {Boolean} 
   */
  isEditable: function() { 
    return !(this.state === 'Greased'); 
  },
  /**
   * return the data context for this template
   * @return {Object} 
   */
  me: function() { 
    return this; 
  }
});