/**
 * You can run into trouble if the template is destroyed (e.g., if you logged out) but the window was still open
 *   This can only really come into play if you're using JS commands to log out, since the background is unclickable.
 */
Template.squeakMotionDiscussionModal.destroyed = function() { 
  $('body').removeClass('modal-open');
}
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
      } else if (this.proposedState === 'Squeaky') { 
        text = "Proposal to re-open";
      } else if (this.reason === 'Withdrawn') { 
        text = "Proposal to withdraw"; 
      } else { 
        text = "Proposal to close as " + this.reason.toLowerCase();
      }

      return text + " from " + author + " " + dateFormat(this.created); 
    }
  }, 
  /**
   * Can we comment on this squeak motion?  It doesn't work from the activity list page for ... mysterious... reasons.  
   *   (Probably related to routing / subscription flickering)
   * @return {Boolean}
   */
  isCommentable: function() { 
    return this.state === 'Open' && Router.current().route.getName() !== 'activityList';
  },
  /**
   * Return the data context for this template
   * @return {Object}
   */
  me: function() { 
    return this;
  }
});