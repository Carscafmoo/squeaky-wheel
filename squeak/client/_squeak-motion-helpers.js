/**
 * Helpers for the _squeakMotion template
 * @author  moore
 */
Template._squeakMotion.helpers({
  /**
   * Can the user automatically accept this motion?
   * @return {Boolean}
   */
  canAccept: function() { 
    return (this.state === 'Open' && this.proposedState === 'Greased' && Meteor.userId() === Template.parentData().author);
  },
  /**
   * Can the user automaically reject this motion?
   * @return {Boolean}
   */
  canReject: function() { 
    return (this.state === 'Open' && 
      ((Meteor.userId() === this.user) || (this.proposedState === 'Greased' && Meteor.userId() === Template.parentData().author)));
  },
  /**
   * Can the user vote on this motion?
   * @return {Boolean}
   */
  canVote: function() { 
    return this.state === 'Open' && !_.contains(_.pluck(this.voters, 'userId'), Meteor.userId());
  },
  /**
   * Reactive helper for finding comment length.
   * @return {Integer}
   */
  commentLength: function() { 
    return this.comments.length; 
  },
  /**
   * Get the user object of the user who created this Motion
   * @return {User} 
   */
  getUser: function() { 
    return Meteor.users.findOne({_id: this.user});
  },
  /**
   * Whether or not the motion has discussion items (or is discussable)
   * @return {Boolean}
   */
  hasDiscussion: function() { 
    return this.comments.length || this.state === 'Open';
  },
  /**
   * Whether or not this was accepted
   * @return {Boolean}
   */
  isAccepted: function() { 
    return this.state === 'Accepted'; 
  },
  /**
   * Whether or not this motion is open
   * @return {Boolean}
   */
  isOpen: function() { 
    return this.state === 'Open'; 
  },
  /**
   * Whether this motion was rejected
   * @return {Boolean}
   */
  isRejected: function() { 
    return this.state === 'Rejected';
  },
  /**
   * Whether the motion has been resolved
   */
  isResolved: function() { 
    return this.state !== 'Open'; 
  },
  /**
   * What type of motion is this? A textual description
   * @return {String} [description]
   */
  motionType: function() { 
    if (this.proposedState === 'Greased') { return "Solution"; }
    if (this.reason === 'Withdrawn') { return "Withdrawn"; }
    if (this.reason === 'Unproductive') { return "Motion to close as unproductive"; }
    if (this.reason === 'Offensive') { return "Motion to close as offensive"; }
    if (this.reason === 'Duplicate') { return "Motion to close as duplicate"; }
  },
  /**
   * Text for the rejection button -- namely, whether you are explicitly rejecting or withdrawing the motion
   * @return {String}
   */
  rejectionButtonText: function() { 
    if (Meteor.userId() === this.user) { return 'Withdraw'; }
    else { return 'Reject'; }
  },
  /**
   * A textual (signed) representation of the score
   * @return String
   */
  reportScore: function() { 
    return (this.score >= 0 ? '' : '-') + this.score + ' / 1000';
  },
  /**
   * Whether the resolution "passed" or was "rejected"
   * @return {String} 
   */
  resolutionStatus: function() { 
    return (this.state === 'Accepted' ? 'Passed' : 'Rejected');
  },
  /**
   * return the class for the little scorey guy
   * @return {String} 
   */
  scoreClass: function() { 
    if (this.score >= 0) { 
      return 'motion-score-positive';
    } else { 
      return 'motion-score-negative';
    }
  },
  /**
   * Return the current user's viscosity
   * @return {Integer} 
   */
  vr: function() { 
    return calculateViscosityRating(Meteor.user());
  }
});
/**
 * event handlers for squeak motions
 */
Template._squeakMotion.events({
  /**
   * Reject the motion outright if the reject motion button is clicked
   */
  'click .reject-motion-button': function(event, template) { 
    event.preventDefault();
    Meteor.call('resolveMotion', template.data._id, false, function(error, success) { 
      if (error) { throw error; }
    });
  },
  /**
   * Reject the motion outright if the reject motion button is clicked
   */
  'click .downvote-motion-button': function(event, template) { 
    event.preventDefault();
    Meteor.call('voteOnMotion', template.data._id, false, function(error, success) { 
      if (error) { throw error; }
    });
  },
  /**
   * Reject the motion outright if the reject motion button is clicked
   */
  'click .upvote-motion-button': function(event, template) { 
    event.preventDefault();
    Meteor.call('voteOnMotion', template.data._id, true, function(error, success) { 
      if (error) { throw error; }
    });
  },
  /**
   * Reject the motion outright if the reject motion button is clicked
   */
  'click .accept-motion-button': function(event, template) { 
    event.preventDefault();
    Meteor.call('resolveMotion', template.data._id, true, function(error, success) { 
      if (error) { throw error; }
    });
  }
});
