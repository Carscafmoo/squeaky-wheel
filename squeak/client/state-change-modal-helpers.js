/**
 * Display the placeholder text for the comment box in the case where we're closing the ticket.
 * @param  {String} reason Optional, a 'reason'  for ticket close. If not provided, grabs it from #reason-select.
 * @return {String}        
 */
var greasedPlaceholder = function greasedPlaceholder(reason) { 
  var reason = (reason ? reason.reason : $('#reason-select').val());
  if (reason === 'Withdrawn') { 
    return "Objection!  Withdrawn...";
  }

  if (reason === 'Unproductive') { 
    return "This squeak is bad, and you should feel bad!";
  }

  if (reason === 'Offensive') { 
    return "You have offended my family, and you have offended the Shaolin Temple";
  }

  if (reason === 'Passed inspection') { 
    return 'Inspected by #17';
  }
}
/** 
 * Generate the list of reasons a Squeak might be Greased
 * @param {squeak} The Squeak in question
 * @return {array[Object]}  objects in the form {reason: String}
 */
var reasons = function reasons(squeak) { 
  var reasons = [{reason: 'Withdrawn'}, 
            {reason: 'Unproductive'},
            {reason: 'Offensive'}];

  if (squeak.state === 'Under inspection') { reasons.unshift({reason: 'Passed inspection'}); }

  return reasons;
}

var formIsComplete = function formIsComplete() { 
  return (Session.equals('stateChangeNextState', 'Under inspection') ? !!$('#state-change-comment').val() : true);
}
/**
 * Helpers for the state change modal dialog
 * @author  moore
 */
Template.stateChangeModal.helpers({
  /**
   * Return the title of the modal dialog
   * @return {String}
   */
  getTitle: function() { 
    return Session.get('stateChangeModalTitle');
  },
  /**
   * Is the "reason" field required?
   * @return {Boolean}
   */
  reasonRequired: function() { 
    return Session.equals('stateChangeNextState', 'Greased');
  },
  /**
   * A list of reasons
   * @return {[Object]} Objects in form {reason: String} indicating a list of possible reasons for the action.
   */
  reasons: function() { 
    return reasons(this);
  },
  /**
   * The label for the comment box -- is it required? 
   * @return String
   */
  modalComment: function() { 
    if (Session.equals('stateChangeNextState', 'Under inspection')) { 
      return "Proposed solution";
    } else { 
      return "Comment (optional)";
    }
  },
  /**
   * The comment placeholder; should give a good overview of what comment we expect here
   * @return {String}
   */
  modalCommentPlaceholder: function() { 
    var nextState = Session.get('stateChangeNextState');
    
    if (nextState ==='Squeaky') { 
      if (this.state === 'Under inspection') { 
        return "Pull out!  You're not doin' any good back there!";
      }

      if (this.state === 'In the shop') { 
        return "I tried my best, and I failed miserably!  The moral is: never try.";
      }
    }

    if (nextState === 'In the shop') { 
      if ( this.state === 'Squeaky') {
        return "All right, I'll give it a try... No!  Try not!  Do or do not.  There is no try.";
      }

      if (this.state === 'Under inspection') { 
        return "Looks good, but with some substitutions.  Instead of any of it...";
      }
    }

    if (nextState === 'Under inspection') { 
      if (this.state === 'Squeaky') { 
        return "You know, for kids.";
      }

      if (this.state === 'In the shop') { 
        return "Introducing... the double-decker couch!";
      }
    }

    if (nextState === 'Greased') { 
      return greasedPlaceholder(reasons(this).shift()); // first element in the reasons array.
    }
  },
  /**
   * If the form is incomplete, the button should be disbaled.
   * @return {String} 
   */
  submitButtonClass: function() { 
    return (formIsComplete() ? '' : 'disabled');
  }
});
/**
 * Event handlers for the modal state change form 
 */
Template.stateChangeModal.events({
  /**
   * When the reason select changes, change the placeholder for the comment
   */
  'change #reason-select': function(event) { 
    $('#state-change-comment').attr('placeholder', greasedPlaceholder());
  },
  /**
   * Don't allow users to submit a proposal without... actually submitting a proposal?
   */
  'keyup #state-change-comment': function(event) { 
    if (formIsComplete()) { 
      $('#submit-state-change-button').removeClass('disabled');  
    } else { 
      $('#submit-state-change-button').addClass('disabled');  
    }
  },
  /**
   * Clicking submit should submit the state change
   */
  'click #submit-state-change-button': function(event) { 
    event.preventDefault();
    var nextState = Session.get('stateChangeNextState');
    var command = Session.get('stateChangeAction');
    var comment = $('#state-change-comment').val();
    var _this = this;
    var extras = {}; 


    if (nextState === "Under inspection") { 
      extras.solution = comment;
    } else { 
      if (comment) { extras.comment = comment; }
    }

    if (nextState === "Greased") { 
      extras.reason = $('#reason-select').val();
    }

    Meteor.call(command, this._id, extras, function(error, success) { 
      if (error) { throw error; }
      
      // we can return this prior to waiting for the comment to come back I guess.
      $('#state-change-modal').toggle();

      // bug (?) in bootsrap-3 modal requires you to remove this manually. 
      // See http://stackoverflow.com/questions/24296643/modal-closes-but-scroll-bar-doesnt-come-back
      $('body').removeClass('modal-open'); 
      $('#state-change-comment').val('');
    });
  }
});