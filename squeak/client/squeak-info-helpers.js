/**
 * Helpers for squeak-info
 * @author moore
 */
Template.squeakInfo.helpers({
  /**
   * Determine if the current user is the author of the Squeak in question
   * @return {Boolean}
   */
  isAuthor: function() { 
    return (this.author === Meteor.userId());
  },
  /**
   * Can we edit this Squeak at all (submit comments, etc) -- or, better yet, is it NOT closed?
   * @return {Boolean} 
   */
  isEditable: function() { 
    return !(this.state === 'Greased' || this.state === 'Rejected'); 
  },
  /**
   * If a particular field has been edited, display the metadata of the last edit
   */
  squeakEdited: function(field) { 
    var edited = this[field + 'Edit'];
    if (edited) { 
      return 'Edited ' + dateFormat(edited);
    } else { 
      return '';
    }
  }
});
/**
 * Event handlers for the squeakInfo template (squeak-info-template.html)
 * @author  moore
 */
Template.squeakInfo.events({
  /**
   * Clicking the edit button should send you to the edit page:
   */
  'click #edit-squeak-button': function(event) { 
    event.preventDefault();
    Router.go('editSqueakPage', {_id: this._id});
  }
});