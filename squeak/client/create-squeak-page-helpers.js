/**
 * Helper function for figuring out if the submit-Squeak button should be enabled or disabled
 * @return {Boolean} false if the new squeak form is incomplete, true if complete
 */
var formIsComplete = function formIsComplete() { 
  return ($('#title').val() && $('#description').val() && $('#re-creation').val() && $('#target').val());
}
/**
 * Clear errors on page load
 */
Template.createSqueakPage.created = function() { 
  Session.set('inputErrors', {});
}
/**
 * Event handlers for the createSqueakPage template (create-squeak-page-template.html)
 * @author moore
 */
Template.createSqueakPage.events({
  /**
   * When you submit the form, create a new Squeak and head over to its page.
   */
  'submit form': function(event) {
    event.preventDefault();

    var Squeak = {
      title: $(event.target).find('[name=title]').val(),
      description: $(event.target).find('[name=description]').val(),
      reCreation: $(event.target).find('[name=re-creation]').val(),
      target: $(event.target).find('[name=target]').val()
    };
    
    Meteor.call('insertSqueak', Squeak, function(error, success) { 
      if (error) { 
        addInputError({submitSqueak: error.error});
        
        throw error; 
      }

      Router.go('squeakPage', {_id: success});  
    });
  },
  /**
   * Every time someone hits a key in the inputs, figure out if the form submission should be enabled or not
   */
  'keyup .new-squeak-input': function() { 
    if ( formIsComplete() ) { 
      $('#submit-new-squeak').removeClass('disabled'); 
    } else { 
      $('#submit-new-squeak').addClass('disabled'); 
    }
  }
});
/**
 * Helpers for the new Squeak template
 * @author  moore
 */
Template.createSqueakPage.helpers({
  /**
   * If the form is incomplete, give the submit buttont the "disabled" setting.
   * @return {String} 
   */
  submitSqueakClass: function() { 
    return formIsComplete() ? '' : 'disabled';
  }

});