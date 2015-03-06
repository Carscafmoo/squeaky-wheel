/**
 * Set up the loginButtons template (login-buttons-template.html) to spec when it's rendered
 * @author  moore
 */
Template.loginButtons.rendered = function() {
  /**
   * make sure the login form submits when enter is pressed.
   */
  $('#login-form input').keydown(function(e) {
    if (e.keyCode == 13) {
      $('#login-buttons-password').click();
    }
  });
}
/**
 * Clear all input errors
 * @author  moore
 */
Template.loginButtons.created = function() {
  Session.set('inputErrors', {});
}
/**
 * Helpers for the login request template
 * @author  moore
 */
Template.loginButtons.events({
  /**
   * Clicking the login button should log the user in and close the dialog
   */
  'click #login-buttons-password': function(event) { 
    event.preventDefault();
    var user = $('#login-username').val();
    var password = $('#login-password').val();
    // Probably do some client-side error handling?
    
    Meteor.loginWithPassword(user, password, function(error, success) { 
      if ( error ) { 
        addInputError({loginButtonsPassword: error.reason}); 
    } else { 
        clearInputError('loginButtonsPassword');
        $('#login-buttons-dropdown').click(); 
        Router.go('home'); // and when you login, just go ahead and head home
      } // get that thing to close itself up
    });
  }
});
