/**
 * Helpers for the squeak-motion-dicussion modal template
 */
Template.squeakMotionDiscussionModal.helpers({
  /**
   * Return the text for the title of the modal box
   * @return {String}
   */
  getTitle: function() { 
    if (this.user) { 
      var author = getUserName(this.user);
      var text;
      if (this.proposedState === 'Greased') { 
        text = "Solution"; 
      } else if (this.reason === 'Withdrawn') { 
        text = "Proposal to withdraw"; 
      } else { 
        text = "Proposal to close as " + this.reason.toLowerCase();
      }

      return text + " from " + author + " " + dateFormat(this.created); 
    }
  }, 
  /**
   * Can we comment on this squeak motion?
   * @return {Boolean}
   */
  isCommentable: function() { 
    return this.state === 'Open';
  },
  /**
   * Return the data context for this template
   * @return {Object}
   */
  me: function() { 
    return this;
  }
});