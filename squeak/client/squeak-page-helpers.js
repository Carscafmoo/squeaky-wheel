var discussionLinkText = function(squeak) { 
  if (Session.equals('showSqueakDiscussion', true)) { 
    return 'Hide discussion';
  } else { 
    return 'Show discussion (' + squeak.comments.length + ')';
  }
}
/**
 * On create, set this bad boy to false.
 */
Template.squeakPage.created = function() { 
  Session.set('showSqueakDiscussion', false); // Using a session variable is a cheap and easy way to do this, it seems.
}
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
   * The text to display on the show / hide discussion link
   */
  discussionLinkText: function() { 
    return discussionLinkText(this);
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
  },
  /**
   * Should we even bother showing the discussion box?  We shouldn't if we can't comment and there's no discussion items.
   * @return {Boolean}
   */
  showDiscussion: function() { 
    return (this.state === 'Squeaky' || this.state === 'Under inspection' || this.comments.length);
  }
});
/** 
 * Event handlers for the Squeak Page template
 */
Template.squeakPage.events({
  /**
   * Show discussion when you click on the discussion showy guy
   */
  'click #show-squeak-discussion': function(event, template) { 
    var $target = $(event.currentTarget);
    $('#squeak-comments').show();
    $target.attr('id', 'hide-squeak-discussion')
    Session.set('showSqueakDiscussion', true);
  },
  /**
   * Hide discussion when you click on the discussion hidey guy
   */
  'click #hide-squeak-discussion': function(event, template) { 
    var $target = $(event.currentTarget);
    $('#squeak-comments').hide();
    $target.attr('id', 'show-squeak-discussion')
    Session.set('showSqueakDiscussion', false);
  }
});
