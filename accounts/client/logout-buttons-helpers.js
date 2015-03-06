/**
 * Event handlers for logoutButtons template (logout-buttons-template.html)
 * @author  moore
 */
Template.logoutButtons.events({
  /**
   * Clicking the logout button should log the user out
   */
  'click #login-buttons-logout': function(event) { 
    event.preventDefault();
    Meteor.logout(function(error, success) { 
      if ( error ) { throw error; }
    });
  },
  /**
   * Clicking the edit profile button should take the user to the edit profile page (edit-profile-template.html)
   */
  'click #login-buttons-edit-profile': function(event) { 
    event.preventDefault();
    Router.go('editProfilePage');
  }
});