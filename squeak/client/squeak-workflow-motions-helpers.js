/**
 * @todo  look into efficiency of calling the open motion / motion history stuff over and over again vs. 
 *        looping through the one time and populating the arrays all at once - which requires us to cache them and
 *        manually ensure reactivity, which I think is going to be an enormous hassle.
 */
/**
 * Return an array of open motions given a Squeak.
 * @return {[Motion]}
 */
var getOpenMotions = function getOpenMotions(squeak) { 
  if (squeak) { return _.sortBy(_.where(squeak.motions, {state: 'Open'}), 'created'); }

  return [];
}
/**
 * Return an array of closed motions sorted by order in which they closed
 */
var getClosedMotions = function getClosedMotions(squeak) { 
  if (squeak) { return _.sortBy(_.reject(squeak.motions, function(mo) { return mo.state === 'Open'; }), 'resolved'); }

  return [];
}
/**
 * Return a Squeaks resolution, if it has one
 * @return {Motion}        
 */
var getResolution = function getResolution(squeak) { 
  if (squeak.state === 'Squeaky') { return null; } // If the Squeak is Squeaky, we certainly don't have a resolution

  var motions = getClosedMotions(squeak);
  var openMotions;
  if (motions.length) { // if not, return undefined
    openMotions = getOpenMotions(squeak);
    // We have a resolution if and only if there are no open motions or the only open motion is to re-open 
    if (!openMotions.length || !_.reject(openMotions, function(mo) { return mo.proposedState === 'Squeaky'}).length) { 
      // If that's the case, we need to find the last _accepted_ motion:
      return _.where(motions, {state: 'Accepted'}).pop(); // It has to be the last one by the sorting.  Returns undefined if no such motions exist
    }
  }
}
/**
 * Return an array of historical motions given a Squeak.
 * @return {[Motion]}
 */
var motionHistory = function motionHistory(squeak) { 
  var motions = getClosedMotions(squeak);
  var resolution;
  
  if (!motions.length) { return motions; } // nothin' to see here

  // Otherwise, grab the resolution and get rid of it if it exists.
  resolution = getResolution(squeak);
  if (resolution) { 
    return _.reject(motions, function(mo) { return mo._id === resolution._id; });
  } else { 
    return motions;
  }
}
/**
 * Figure out what states are possible for this user to move this Squeak into
 */
var possibleStates = function possibleStates(squeak) { 
  var vr = calculateViscosityRating(Meteor.user());
  var openMotions = getOpenMotions(squeak);
  var resolution = getResolution(squeak);
  var possibleStates = [];

  if (!squeak) { return possibleStates; }

  if (vr < 100) { 
    if(!resolution && !_.where(openMotions, {proposedState: 'Greased'}).length) { 
      possibleStates.push({state: 'Greased', rank: 1});
    } 
  } else { // Otherwise the user can propose something unless there are already motions to do whatever he or she wants to do:
    if (resolution) { 
      if (!openMotions.length) { possibleStates.push({state: 'Squeaky', rank: 2}); }
    } else { 
      // it can be anything but what's already proposed:
      if (!_.where(openMotions, {proposedState: 'Greased'}).length) { possibleStates.push({state: 'Greased', rank: 1}); }
      if (!_.where(openMotions, {proposedState: 'Rejected'}).length) { 
        possibleStates.push({state: 'Duplicate', rank: 3});
        possibleStates.push({state: 'Unproductive', rank: 4});
        possibleStates.push({state: 'Offensive', rank: 5});
      }
    }
  }
  
  if (!resolution && Meteor.userId() === squeak.author) { possibleStates.push({state: 'Withdrawn', rank: 2}); } // The author can always withdraw
  possibleStates = _.sortBy(possibleStates, 'rank');
  
  return possibleStates;
}
/**
 * Helpers for the squeak motion proposals template
 * @author moore
 */
Template.squeakWorkflowMotions.helpers({
  /**
   * Can we propose a new motion on this Squeak?
   * @return {Boolean}
   */
  canProposeNewMotion: function() { 
    return !!possibleStates(this).length;
  },
  /**
   * Return the motion whose discussion to display
   * @return {SqueakMotion} 
   */
  getDiscussionMotion: function() { 
    var moId = Session.get('discussionMotion');
    var squeak = Squeaks.findOne({'motions._id': moId});
    if (squeak) { return _.findWhere(squeak.motions, {_id: moId}); }

    return {};
  },
  /**
   * Is the Squeak resolved?
   * @return {Boolean} True if the Squeak is resolved, false else
   */
  isResolved: function() { 
    return !!getResolution(this);
  },
  /**
   * @return {[Object]} An array of any motions that are currently open
   */
  openMotions: function() { 
    return getOpenMotions(this);
  },
  /**
   * Does the Squeak have any rejected motions?
   * @return {Boolean} true if so
   */
  hasMotionHistory: function() { 
    return !!motionHistory(this).length;
  },
  /**
   * Return the motion history (all currently non-open, non-current-resolution motions)
   * @return {[SqueakMotion]}
   */
  motionHistory: function() { 
    return motionHistory(this).reverse(); // display this in reverse order
  },
  /**
   * return the list of possible next states for this Squeak to enter
   * @return {[Object]} 
   */
  possibleStates: function() { 
    return possibleStates(this);
  },
  /**
   * Return the most recently-accepted motion to resolve or close.
   * @return {Motion} 
   */
  resolution: function() { 
    return getResolution(this);
  }
});
/**
 * Event handlers.
 * @author moore
 */
Template.squeakWorkflowMotions.events({
  /**
   * Clicking the show all button should show them all
   */
  'click #show-all-motions': function(event) { 
    var $button = $('#show-all-motions');

    $('#rejected-motions').show();
    $button.attr('id', 'hide-all-motions');
    $button.text('Hide history');

  },
  /**
   * Likewise, clicking the hide button should hide them...
   */
  'click #hide-all-motions': function(event, template) { 
    var $button = $('#hide-all-motions');
    
    $('#rejected-motions').hide();
    $button.attr('id', 'show-all-motions');
    $button.text('Show history (' + motionHistory(template.data).length + ')');
  }
})