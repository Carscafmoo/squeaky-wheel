/**
 * Helpers for the loginButtonsDropdown template (login-buttons-dropdown-template.html)
 * @author moore
 */
Template.loginButtonsDropdown.helpers({
  /**
   * Login buttons should have the name if signed in or a message inviting signing in if not
   * @return void
   */
  loginButtonText: function() { 
    var user = Meteor.user();
    if (user) {
      return user.name;
    } else { 
      return 'Sign in / up';
    }
  }
});