/**
 * Helpers for the squeakBottom template (squeak-bottom-template.html)
 * @author moore
 */
Template.squeakBottom.helpers({
  /**
   * Return the class of the vote button (disabled)
   * @return {String}
   */
  voteClass: function() { 
    var squeak = (this.squeak ? this.squeak : this); // deal with calling from multiple contexts
    if (_.contains(squeak.voters, Meteor.userId()) || squeak.state === 'Greased') { 
      return 'disabled'; 
    } else { 
      return ''; 
    }
  },
  /**
   * Return the number of votes this Squeak has
   * @return {integer}
   */
  voteCount: function() { 
    var squeak = (this.squeak ? this.squeak : this); // deal with calling from multiple contexts

    return squeak.votes;
  },
  /**
   * Return the number of comments this Squeak has
   * @return {integer}
   */
  commentLength: function() { 
    var squeak = (this.squeak ? this.squeak : this); // deal with calling from multiple contexts
    
    return squeak.comments.length;
  }
});

/**
 * Handlers for events in the squeakBottom template
 * @author  moore
 */
Template.squeakBottom.events({
  /**
   * Event for clicking on the vote button -- send off to voteForSqueak.
   */
  'click .vote-button': function(event) {
    var squeak = (this.squeak ? this.squeak : this); // deal with calling from multiple contexts
    event.preventDefault();
    Meteor.call('voteForSqueak', squeak._id);
  }
});
