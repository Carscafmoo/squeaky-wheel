/**
 * Function for determining if the create-account form is complete
 * @return {Boolean}
 * @author moore
 * @todo  include further checks
 */
var formIsComplete = function formIsComplete() { 
  return ( $('#new-username').val() && 
    $('#new-password').val() && 
    $('#confirm-password').val() === $('#new-password').val() &&
    $('#new-user-name').val() &&
    $('#new-user-email').val() &&
    validatePassword($('#new-password').val()) );
}
/**
 * Figure out the potential user's name from the form
 * @return {String}
 */
var determinePotentialUser = function determinePotentialUser() {
  var potentialUser = $('#new-username').val();
  if (potentialUser) { 
    return potentialUser; 
  } else { 
    return 'New User';
  }
}
/**
 * Determine if the passwords and confirm-password match; if not, display error
 * @return {void}]
 */
var confirmPasswordMatch = function confirmPasswordMatch() { 
  var newP = $('#new-password').val();
  var confirmP = $('#confirm-password').val();

  if (newP && confirmP && newP !== confirmP) { addInputError({confirmPassword: 'Passwords do not match'}); }
  else { clearInputError('confirmPassword'); }
}
/**
 * On account create, set errors to NULL
 */
Template.createAccount.created = function() { 
  Session.set('inputErrors', {});
}
/**
 * Helpers for the account creation
 * @author  moore
 */
Template.createAccount.helpers({
  /**
   * Return the name of the user if the user has entered it in into the box.
   * @return {String}
   */
  getPotentialUser: function() { 
    return determinePotentialUser();
  },
  /**
   * If the form is incomplete, disable the submission box
   * @return {String}
   */
  submitNewUserClass: function() { 
    return ( formIsComplete() ? '' : 'disabled' );
  }
});
/**
 * Event handlers for the account creation template (create-account-template.html)
 * @author  moore
 */
Template.createAccount.events({
  /**
   * Check and see if the user has completed the form; if so, enable the submission button
   * @FIXME This can't be the most efficient way to do this, but if you do on change you have to focus
   *   away from the input before the button re-enables.  That's, presumably, frustrating?
   */
  'keyup #new-user-form input': function() { 
    if ( formIsComplete() ) { 
      $('#submit-new-user').removeClass('disabled'); 
    } else { 
      $('#submit-new-user').addClass('disabled'); 
    }
  }, 
  /**
   * Submitting a new user sends form info to the user create function
   */
  'click #submit-new-user': function(event) { 
    event.preventDefault();
    Accounts.createUser({
      username: $('#new-username').val(),
      email: $('#new-user-email').val(),
      password: $('#new-password').val(),
      name: $('#new-user-name').val(),
    }, function(error, success) { 
      if (error) { 
        addInputError({submitNewUser: error.error});
      } else { 
        setTimeout(function() { Router.go('tutorialPage') }, 100); // wait for redirect to home, then go?
      }
    });
  },
  /**
   * Changing the user name changes the 'Create X' button to include the new username
   *   and check against the server to make sure that the user doesn't already exist!
   */
  'change #new-username': function() { 
    var $newUserInput = $('#new-username');
    if ($newUserInput.val()) { 
      // Probably want a spinner here?
      Meteor.call('userNameExists', $newUserInput.val(), function(error, success) { 
        if (success === true) { 
          addInputError({newUserUsername: $newUserInput.val() + ' already exists!  Please select another name'});
        } else { 
          addInputError({newUserUsername: null});
        }
      });

      $('#submit-new-user').text('Create ' + $newUserInput.val());
    } else { 
      $('#submit-new-user').text('Create New User');
    }
  },
  /**
   * Display an error if both PW's are filled in, but they don't match
   */
  'change #new-password': function() { 
    confirmPasswordMatch();
    if (validatePassword($('#new-password').val())) {
      clearInputError('newPassword'); // get rid of that error
    } else { 
      addInputError({newPassword: 'Password must be at least 7 characters and contain non-alphabetic characters'});
    }
  },
  /**
   * Display an error if both PW's are filled in, but they don't match
   */
  'change #confirm-password': function() { 
    confirmPasswordMatch();
  }
});
