/** 
 * What type of comment submit is this?  Set in the created function
 */
var type;
/**
 * Set input errors errors to be null
 * @return {[type]} [description]
 */
Template.commentSubmit.created = function() { 
  Session.set('inputErrors', {});
  type = this.data.squeak ? 'squeak' : 'proposal';
}
/**
 * Is the form complete?
 * @param {jQuery} $target the form element whose completeness is questionable
 * @return {Boolean}   True if the form is submittable.
 */
var isComplete = function isComplete($target) { return !!$target.val(); }
/**
 * Helpers
 * @author  moore
 */
Template.commentSubmit.helpers({
  /**
   * What input error type are we looking for with this guy
   * @return {String}
   */
  errorType: function() { 
    return type + 'SubmitComment';
  },
  /**
   * Return the type.  Not capitalized
   * @return
   */
  type: function() { 
    return type;
  },
  /**
   * Are you submitting Squeak comments or motion comments?  Capitalized for convenience
   * @return {String}
   */
  whatami: function() { 
    return type === 'squeak' ? 'Squeak' : type;
  }
});
/**
 * Helpers for the commentSubmit template (comment-submit-template.html)
 * @author moore
 */
Template.commentSubmit.events({ 
  /**
   * Form submission should submit the comment, add it to the page (this is done reactively in the template),
   *   and clear the form for further commenting.
   */
  'submit form': function(event, template) {
    event.preventDefault();
    var $body = $(event.target).find('[name=body]');
    var comment = $body.val();
    var dataId;
    var method;
    
    if (template.data.squeak) { 
      dataId = template.data.squeak._id;
      method = 'commentOnSqueak';
    } else { 
      dataId = template.data.motion._id;
      method = 'commentOnMotion'
    }

    Meteor.call(method, dataId, comment, function(error, result) {
      if (error){
        var e = {};
        e[type + 'SubmitComment'] = error.error;
        addInputError(e);
        throw(error);
      } else {
        $body.val(''); // clears the form
      }
    }); 
  },
  /**
   * Evaluate whether the comment form is complete or not on every keystroke:
   */
  'keyup .comment-submit-input': function(event) { 
    var $target = $(event.currentTarget);
    if (isComplete($target)) { 
      $target.closest('form').find('.comment-submit-button').removeClass('disabled'); 
      clearInputError(type + 'SubmitComment');
    } else { 
      $target.closest('form').find('.comment-submit-button').addClass('disabled'); 
    }
  }
});
