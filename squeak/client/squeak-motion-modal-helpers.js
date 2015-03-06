var $smc;
var isComplete = function isComplete() { 
  if ($smc) { 
    return !!$smc.val().trim();
  } else { 
    return false;
  }
}
/** 
 * Cache the JQuery lookup to the comment block
 */
Template.squeakMotionModal.rendered = function() { 
  $smc = $('#squeak-motion-comment'); 
  Session.set('inputErrors', {});
}
/**
 * Helpers for the squeak motion modal template
 * @author  moore
 */
Template.squeakMotionModal.helpers({
  submitButtonClass: function() { 
    return (isComplete() ? '' : 'disabled'); 
  }
  // Get rid of current dropdown
  // TEST.
});

Template.squeakMotionModal.events({
  /**
   * Only allow users to submit the form if they have text
   */
  'keyup #squeak-motion-comment': function(event) { 
    if (isComplete()) { 
      $('#submit-squeak-motion-button').removeClass('disabled');
    } else { 
      $('#submit-squeak-motion-button').addClass('disabled');
    }
  },
  'click #submit-squeak-motion-button': function(event, template) { 
    event.preventDefault();
    var motion = {};
    var state = $('#squeak-motion-modal-select').val();
    if (state === 'Greased' || state === 'Squeaky') { 
      motion.proposedState = state;
    } else {
      motion.proposedState = 'Rejected';
      motion.reason = state;
    }

    motion.comment = $smc.val();
    Meteor.call('initiateSqueakMotion', this._id, motion, function(error, success) { 
      if (error) { 
        addInputError({squeakMotionSubmit: error.error});
        throw(error);
      } else { 
        clearInputError('squeakMotionSubmit');
        $('#squeak-motion-modal').toggle();

        // bug (?) in bootsrap-3 modal requires you to remove this manually. 
        // See http://stackoverflow.com/questions/24296643/modal-closes-but-scroll-bar-doesnt-come-back
        $('body').removeClass('modal-open'); 
        $smc.val('');
      }
    });
  }
});
